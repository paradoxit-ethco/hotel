import { and, desc, eq, gte, lte, ne, or, sql } from "drizzle-orm";
import { guestProfiles, reservations, rooms, type InsertUser, users } from "../drizzle/schema";
import { getDb } from "./db";

export const publicRoomFallback = [
  { id: 1, code: "H-101", nameEn: "Coffee Garden Room", nameAm: "የቡና ገነት ክፍል", descriptionEn: "A tranquil king room shaped by warm wood and garden light.", descriptionAm: "በሞቅ ያለ እንጨትና በአትክልት ብርሃን የተቀረጸ ጸጥ ያለ የንጉሥ መኝታ ክፍል።", type: "deluxe", status: "available" as const, capacity: 2, bedType: "King bed", priceNight: 6800, isFeatured: true },
  { id: 2, code: "H-202", nameEn: "Highland Suite", nameAm: "የደጋ ስዊት", descriptionEn: "A generous suite with a lounge, handcrafted textiles, and wide city views.", descriptionAm: "ሰፊ መቀመጫ፣ በእጅ የተሠሩ ጨርቃ ጨርቆችና ሰፊ የከተማ እይታ ያለው ስዊት።", type: "suite", status: "available" as const, capacity: 3, bedType: "King bed", priceNight: 11200, isFeatured: true },
  { id: 3, code: "H-305", nameEn: "Lalibela Family Residence", nameAm: "የላሊበላ የቤተሰብ መኖሪያ", descriptionEn: "A connected family residence with calm spaces for every generation.", descriptionAm: "ለእያንዳንዱ ትውልድ ጸጥ ያሉ ስፍራዎችን የሚያቀርብ የተገናኘ የቤተሰብ መኖሪያ።", type: "family", status: "available" as const, capacity: 5, bedType: "Two queen beds", priceNight: 14800, isFeatured: false },
];

export function datesOverlap(existingCheckIn: Date, existingCheckOut: Date, requestedCheckIn: Date, requestedCheckOut: Date) {
  return existingCheckIn <= requestedCheckOut && existingCheckOut >= requestedCheckIn;
}

export async function listPublicRooms() {
  const db = await getDb();
  if (!db) return publicRoomFallback;
  const result = await db.select().from(rooms).where(eq(rooms.status, "available")).orderBy(desc(rooms.isFeatured));
  return result.length ? result : publicRoomFallback;
}

export async function getAvailability(input: { checkIn: Date; checkOut: Date; guests: number }) {
  const db = await getDb();
  if (!db) return publicRoomFallback.filter((room) => room.capacity >= input.guests);
  const busyRooms = await db.select({ roomId: reservations.roomId }).from(reservations).where(and(lte(reservations.checkIn, input.checkOut), gte(reservations.checkOut, input.checkIn), ne(reservations.status, "cancelled")));
  const busyIds = new Set(busyRooms.map((item) => item.roomId));
  const result = await db.select().from(rooms).where(eq(rooms.status, "available"));
  return result.filter((room) => room.capacity >= input.guests && !busyIds.has(room.id));
}

export async function createHotelReservation(input: { hotelId: number; roomId: number; guestId: number; checkIn: Date; checkOut: Date; guests: number; totalAmount: number; paymentStatus: "unpaid" | "partial"; notes?: string }) {
  const db = await getDb();
  if (!db) throw new Error("Database is not available for reservations.");
  const reference = `HH-${Date.now().toString(36).toUpperCase()}`;
  await db.insert(reservations).values({ ...input, reference, status: "pending" });
  return { reference };
}

export async function getGuestReservations(guestId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(reservations).where(eq(reservations.guestId, guestId)).orderBy(desc(reservations.createdAt));
}

export async function getGuestProfile(userId: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(guestProfiles).where(eq(guestProfiles.userId, userId)).limit(1);
  return result[0];
}

export async function upsertGuestProfile(input: { userId: number; phone?: string; nationality?: string; language: "en" | "am"; specialNotes?: string }) {
  const db = await getDb();
  if (!db) throw new Error("Database is not available.");
  await db.insert(guestProfiles).values(input).onDuplicateKeyUpdate({ set: { phone: input.phone, nationality: input.nationality, language: input.language, specialNotes: input.specialNotes } });
  return { success: true };
}

export async function listGuests() {
  const db = await getDb();
  if (!db) return [];
  return db.select({ id: users.id, name: users.name, email: users.email, lastSignedIn: users.lastSignedIn, phone: guestProfiles.phone, nationality: guestProfiles.nationality, language: guestProfiles.language }).from(users).leftJoin(guestProfiles, eq(users.id, guestProfiles.userId)).where(or(eq(users.role, "guest"), eq(users.role, "user"))).orderBy(desc(users.lastSignedIn));
}

export async function listHotelReservations() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(reservations).orderBy(desc(reservations.createdAt));
}

export function roomStatusForLifecycle(status: "pending" | "confirmed" | "checked_in" | "checked_out" | "cancelled") {
  return status === "checked_in" ? "occupied" : status === "checked_out" ? "cleaning" : status === "confirmed" ? "reserved" : "available";
}

export async function updateReservationLifecycle(reservationId: number, status: "pending" | "confirmed" | "checked_in" | "checked_out" | "cancelled") {
  const db = await getDb();
  if (!db) throw new Error("Database is not available.");
  const reservation = await db.select({ roomId: reservations.roomId }).from(reservations).where(eq(reservations.id, reservationId)).limit(1);
  if (!reservation[0]) throw new Error("Reservation was not found.");
  await db.update(reservations).set({ status }).where(eq(reservations.id, reservationId));
  const roomStatus = roomStatusForLifecycle(status);
  await db.update(rooms).set({ status: roomStatus }).where(eq(rooms.id, reservation[0].roomId));
  return { success: true, status, roomStatus };
}

export async function updateReservationPaymentStatus(reservationId: number, paymentStatus: "unpaid" | "partial" | "paid" | "refunded") {
  const db = await getDb();
  if (!db) throw new Error("Database is not available.");
  await db.update(reservations).set({ paymentStatus }).where(eq(reservations.id, reservationId));
  return { success: true, paymentStatus };
}

export async function getOperationsOverview() {
  const db = await getDb();
  if (!db) return { rooms: 24, available: 16, arrivals: 4, inHouse: 18, revenue: 284000 };
  const [roomCount] = await db.select({ count: sql<number>`count(*)` }).from(rooms);
  const [available] = await db.select({ count: sql<number>`count(*)` }).from(rooms).where(eq(rooms.status, "available"));
  const [inHouse] = await db.select({ count: sql<number>`count(*)` }).from(reservations).where(eq(reservations.status, "checked_in"));
  const [arrivals] = await db.select({ count: sql<number>`count(*)` }).from(reservations).where(eq(reservations.status, "confirmed"));
  const [revenue] = await db.select({ total: sql<number>`coalesce(sum(${reservations.totalAmount}), 0)` }).from(reservations).where(eq(reservations.paymentStatus, "paid"));
  return { rooms: roomCount?.count ?? 0, available: available?.count ?? 0, arrivals: arrivals?.count ?? 0, inHouse: inHouse?.count ?? 0, revenue: revenue?.total ?? 0 };
}

export async function updateRoomStatus(roomId: number, status: "available" | "occupied" | "cleaning" | "maintenance" | "reserved") {
  const db = await getDb();
  if (!db) throw new Error("Database is not available.");
  await db.update(rooms).set({ status }).where(eq(rooms.id, roomId));
  return { success: true };
}

export async function ensureGuestProfile(user: InsertUser) {
  const db = await getDb();
  if (!db) return;
  await db.insert(users).values(user).onDuplicateKeyUpdate({ set: { lastSignedIn: new Date() } });
}
