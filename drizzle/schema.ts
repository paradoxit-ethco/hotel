import {
  boolean,
  int,
  mysqlEnum,
  mysqlTable,
  text,
  timestamp,
  varchar,
} from "drizzle-orm/mysql-core";

export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "guest", "admin", "developer"]).default("guest").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export const hotels = mysqlTable("hotels", {
  id: int("id").autoincrement().primaryKey(),
  nameEn: varchar("nameEn", { length: 160 }).notNull(),
  nameAm: varchar("nameAm", { length: 160 }).notNull(),
  cityEn: varchar("cityEn", { length: 120 }).notNull(),
  cityAm: varchar("cityAm", { length: 120 }).notNull(),
  addressEn: text("addressEn"),
  addressAm: text("addressAm"),
  coverImage: text("coverImage"),
  isPublished: boolean("isPublished").default(true).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export const rooms = mysqlTable("rooms", {
  id: int("id").autoincrement().primaryKey(),
  hotelId: int("hotelId").notNull(),
  code: varchar("code", { length: 24 }).notNull().unique(),
  nameEn: varchar("nameEn", { length: 160 }).notNull(),
  nameAm: varchar("nameAm", { length: 160 }).notNull(),
  descriptionEn: text("descriptionEn"),
  descriptionAm: text("descriptionAm"),
  type: mysqlEnum("type", ["standard", "deluxe", "suite", "family"]).default("standard").notNull(),
  status: mysqlEnum("status", ["available", "occupied", "cleaning", "maintenance", "reserved"]).default("available").notNull(),
  capacity: int("capacity").default(2).notNull(),
  bedType: varchar("bedType", { length: 80 }).default("King bed"),
  priceNight: int("priceNight").notNull(),
  imageUrl: text("imageUrl"),
  isFeatured: boolean("isFeatured").default(false).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export const guestProfiles = mysqlTable("guestProfiles", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull().unique(),
  phone: varchar("phone", { length: 48 }),
  nationality: varchar("nationality", { length: 80 }),
  language: mysqlEnum("language", ["en", "am"]).default("en").notNull(),
  specialNotes: text("specialNotes"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export const reservations = mysqlTable("reservations", {
  id: int("id").autoincrement().primaryKey(),
  reference: varchar("reference", { length: 40 }).notNull().unique(),
  hotelId: int("hotelId").notNull(),
  roomId: int("roomId").notNull(),
  guestId: int("guestId").notNull(),
  checkIn: timestamp("checkIn").notNull(),
  checkOut: timestamp("checkOut").notNull(),
  guests: int("guests").default(1).notNull(),
  totalAmount: int("totalAmount").notNull(),
  status: mysqlEnum("status", ["pending", "confirmed", "checked_in", "checked_out", "cancelled"]).default("pending").notNull(),
  paymentStatus: mysqlEnum("paymentStatus", ["unpaid", "partial", "paid", "refunded"]).default("unpaid").notNull(),
  notes: text("notes"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export const payments = mysqlTable("payments", {
  id: int("id").autoincrement().primaryKey(),
  reservationId: int("reservationId").notNull(),
  amount: int("amount").notNull(),
  method: mysqlEnum("method", ["cash", "card", "bank", "mobile_money"]).default("card").notNull(),
  status: mysqlEnum("status", ["pending", "completed", "failed", "refunded"]).default("pending").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export const amenities = mysqlTable("amenities", {
  id: int("id").autoincrement().primaryKey(),
  hotelId: int("hotelId").notNull(),
  titleEn: varchar("titleEn", { length: 120 }).notNull(),
  titleAm: varchar("titleAm", { length: 120 }).notNull(),
  descriptionEn: text("descriptionEn"),
  descriptionAm: text("descriptionAm"),
  icon: varchar("icon", { length: 48 }),
  displayOrder: int("displayOrder").default(0).notNull(),
  isActive: boolean("isActive").default(true).notNull(),
});

export const promotions = mysqlTable("promotions", {
  id: int("id").autoincrement().primaryKey(),
  hotelId: int("hotelId").notNull(),
  titleEn: varchar("titleEn", { length: 160 }).notNull(),
  titleAm: varchar("titleAm", { length: 160 }).notNull(),
  bodyEn: text("bodyEn"),
  bodyAm: text("bodyAm"),
  ctaEn: varchar("ctaEn", { length: 80 }),
  ctaAm: varchar("ctaAm", { length: 80 }),
  isActive: boolean("isActive").default(true).notNull(),
  startsAt: timestamp("startsAt"),
  endsAt: timestamp("endsAt"),
});

export const contentEntries = mysqlTable("contentEntries", {
  id: int("id").autoincrement().primaryKey(),
  scope: mysqlEnum("scope", ["landing", "room", "amenity", "promotion", "navigation"]).notNull(),
  contentKey: varchar("contentKey", { length: 120 }).notNull().unique(),
  valueEn: text("valueEn").notNull(),
  valueAm: text("valueAm").notNull(),
  isPublished: boolean("isPublished").default(true).notNull(),
  updatedBy: int("updatedBy"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;
export type Room = typeof rooms.$inferSelect;
export type Reservation = typeof reservations.$inferSelect;
