import { TRPCError } from "@trpc/server";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { contentEntries, rooms } from "../drizzle/schema";
import { getDb } from "./db";
import { createHotelReservation, getAvailability, getGuestProfile, getGuestReservations, getOperationsOverview, listGuests, listHotelReservations, listPublicRooms, updateReservationLifecycle, updateReservationPaymentStatus, updateRoomStatus, upsertGuestProfile } from "./hotelData";
import { protectedProcedure, publicProcedure, router } from "./_core/trpc";

const adminProcedure = protectedProcedure.use(({ ctx, next }) => {
  if (ctx.user.role !== "admin") throw new TRPCError({ code: "FORBIDDEN", message: "Administrator access is required." });
  return next({ ctx });
});

const developerProcedure = protectedProcedure.use(({ ctx, next }) => {
  if (ctx.user.role !== "developer") throw new TRPCError({ code: "FORBIDDEN", message: "Developer access is required." });
  return next({ ctx });
});

const dateInput = z.coerce.date();

export const hotelRouter = router({
  rooms: publicProcedure.query(() => listPublicRooms()),
  availability: publicProcedure
    .input(z.object({ checkIn: dateInput, checkOut: dateInput, guests: z.number().min(1).max(8) }))
    .query(({ input }) => getAvailability(input)),
  reserve: protectedProcedure
    .input(z.object({ hotelId: z.number().default(1), roomId: z.number().positive(), checkIn: dateInput, checkOut: dateInput, guests: z.number().min(1).max(8), totalAmount: z.number().positive(), paymentStatus: z.enum(["unpaid", "partial"]).default("unpaid"), phone: z.string().max(48).optional(), nationality: z.string().max(80).optional(), notes: z.string().max(800).optional() }))
    .mutation(async ({ ctx, input }) => {
      const { phone, nationality, ...reservation } = input;
      if (phone || nationality) await upsertGuestProfile({ userId: ctx.user.id, phone, nationality, language: "en" });
      return createHotelReservation({ ...reservation, guestId: ctx.user.id });
    }),
  myReservations: protectedProcedure.query(({ ctx }) => getGuestReservations(ctx.user.id)),
  myProfile: protectedProcedure.query(({ ctx }) => getGuestProfile(ctx.user.id)),
  updateMyProfile: protectedProcedure
    .input(z.object({ phone: z.string().max(48).optional(), nationality: z.string().max(80).optional(), language: z.enum(["en", "am"]), specialNotes: z.string().max(800).optional() }))
    .mutation(({ ctx, input }) => upsertGuestProfile({ ...input, userId: ctx.user.id })),
  operations: adminProcedure.query(() => getOperationsOverview()),
  guests: adminProcedure.query(() => listGuests()),
  reservations: adminProcedure.query(() => listHotelReservations()),
  reservationLifecycle: adminProcedure
    .input(z.object({ reservationId: z.number().positive(), status: z.enum(["pending", "confirmed", "checked_in", "checked_out", "cancelled"]) }))
    .mutation(({ input }) => updateReservationLifecycle(input.reservationId, input.status)),
  reservationPayment: adminProcedure
    .input(z.object({ reservationId: z.number().positive(), paymentStatus: z.enum(["unpaid", "partial", "paid", "refunded"]) }))
    .mutation(({ input }) => updateReservationPaymentStatus(input.reservationId, input.paymentStatus)),
  developerOverview: developerProcedure.query(async () => ({ ...(await getOperationsOverview()), modules: 7, health: "healthy" as const })),
  roomStatus: adminProcedure
    .input(z.object({ roomId: z.number().positive(), status: z.enum(["available", "occupied", "cleaning", "maintenance", "reserved"]) }))
    .mutation(({ input }) => updateRoomStatus(input.roomId, input.status)),
  content: publicProcedure.query(async () => {
    const db = await getDb();
    if (!db) return [];
    return db.select().from(contentEntries).where(eq(contentEntries.isPublished, true));
  }),
  updateContent: adminProcedure
    .input(z.object({ contentKey: z.string().min(2).max(120), scope: z.enum(["landing", "room", "amenity", "promotion", "navigation"]), valueEn: z.string().min(1), valueAm: z.string().min(1), isPublished: z.boolean().default(true) }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database is unavailable." });
      await db.insert(contentEntries).values({ ...input, updatedBy: ctx.user.id }).onDuplicateKeyUpdate({ set: { ...input, updatedBy: ctx.user.id } });
      return { success: true };
    }),
  allRooms: adminProcedure.query(async () => {
    const db = await getDb();
    if (!db) return listPublicRooms();
    return db.select().from(rooms);
  }),
});
