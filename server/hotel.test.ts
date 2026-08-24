import { describe, expect, it } from "vitest";
import { appRouter } from "./routers";
import { datesOverlap, publicRoomFallback, roomStatusForLifecycle } from "./hotelData";
import type { TrpcContext } from "./_core/context";

function createContext(role: "user" | "guest" | "admin" | "developer"): TrpcContext {
  return {
    user: {
      id: 17,
      openId: "hotel-test-user",
      name: "Hotel Tester",
      email: "hotel@example.com",
      loginMethod: "manus",
      role,
      createdAt: new Date(),
      updatedAt: new Date(),
      lastSignedIn: new Date(),
    },
    req: { protocol: "https", headers: {} } as TrpcContext["req"],
    res: { clearCookie: () => undefined } as TrpcContext["res"],
  };
}

describe("hotel platform rules", () => {
  it("maps reservation stages to the correct room operations state", () => {
    expect(roomStatusForLifecycle("confirmed")).toBe("reserved");
    expect(roomStatusForLifecycle("checked_in")).toBe("occupied");
    expect(roomStatusForLifecycle("checked_out")).toBe("cleaning");
    expect(roomStatusForLifecycle("cancelled")).toBe("available");
  });

  it("exposes capacity-aware public fallback rooms", () => {
    expect(publicRoomFallback.filter((room) => room.capacity >= 3)).toHaveLength(2);
    expect(publicRoomFallback.every((room) => room.status === "available")).toBe(true);
  });

  it("treats intersecting and boundary-touching stays as unavailable", () => {
    const existingStart = new Date("2026-08-10T00:00:00.000Z");
    const existingEnd = new Date("2026-08-14T00:00:00.000Z");
    expect(datesOverlap(existingStart, existingEnd, new Date("2026-08-12T00:00:00.000Z"), new Date("2026-08-16T00:00:00.000Z"))).toBe(true);
    expect(datesOverlap(existingStart, existingEnd, new Date("2026-08-14T00:00:00.000Z"), new Date("2026-08-15T00:00:00.000Z"))).toBe(true);
    expect(datesOverlap(existingStart, existingEnd, new Date("2026-08-15T00:00:00.000Z"), new Date("2026-08-16T00:00:00.000Z"))).toBe(false);
  });

  it("blocks guests from hotel administration", async () => {
    const caller = appRouter.createCaller(createContext("guest"));
    await expect(caller.hotel.operations()).rejects.toMatchObject({ code: "FORBIDDEN" });
  });

  it("blocks guests from the developer workspace procedures", async () => {
    const caller = appRouter.createCaller(createContext("guest"));
    await expect(caller.hotel.developerOverview()).rejects.toMatchObject({ code: "FORBIDDEN" });
  });
});
