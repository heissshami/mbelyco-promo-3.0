import { pgTable, text, timestamp, boolean, integer } from "drizzle-orm/pg-core"
import { index, uniqueIndex } from "drizzle-orm/pg-core"

// Core Better Auth tables (minimal set used by email/password sessions)
export const user = pgTable("user", {
  id: text("id").primaryKey(),
  name: text("name"),
  email: text("email").notNull().unique(),
  emailVerified: boolean("email_verified").notNull().default(false),
  image: text("image"),
  password: text("password"),
  role: text("role").notNull().default("user"),
  createdAt: timestamp("created_at", { withTimezone: false }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: false }).defaultNow().notNull(),
})

export const session = pgTable("session", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull(),
  expiresAt: timestamp("expires_at", { withTimezone: false }).notNull(),
  token: text("token").notNull().unique(),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  createdAt: timestamp("created_at", { withTimezone: false }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: false }).defaultNow().notNull(),
})

// optional accounts table for social providers (not used now but included)
export const account = pgTable("account", {
  id: text("id").primaryKey(),
  providerId: text("provider_id").notNull(),
  accountId: text("account_id").notNull(),
  userId: text("user_id").notNull(),
  accessToken: text("access_token"),
  refreshToken: text("refresh_token"),
  idToken: text("id_token"),
  accessTokenExpiresAt: timestamp("access_token_expires_at", {
    withTimezone: false,
  }),
  refreshTokenExpiresAt: timestamp("refresh_token_expires_at", {
    withTimezone: false,
  }),
  scope: text("scope"),
  password: text("password"),
  createdAt: timestamp("created_at", { withTimezone: false }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: false }).defaultNow().notNull(),
})

// Promo batches table: groups generated or imported codes
export const batch = pgTable(
  "batch",
  {
    id: text("id").primaryKey(),
    name: text("name").notNull(),
    description: text("description"),
    createdBy: text("created_by").notNull(),
    status: text("status").notNull().default("pending"), // pending | completed | failed | archived
    codeLength: integer("code_length"),
    quantity: integer("quantity"),
    prefix: text("prefix"),
    suffix: text("suffix"),
    createdAt: timestamp("created_at", { withTimezone: false }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: false }).defaultNow().notNull(),
  },
  (table) => ({
    nameIdx: index("batch_name_idx").on(table.name),
  })
)

// Legacy/alternate table name mapping to support existing data
export const legacyBatch = pgTable(
  "batches",
  {
    id: text("id").primaryKey(),
    name: text("name").notNull(),
    description: text("description"),
    totalCodes: integer("total_codes"),
    amountPerCode: text("amount_per_code"),
    currency: text("currency"),
    expirationDate: timestamp("expiration_date", { withTimezone: false }),
    assignedUser: text("assigned_user"),
    status: text("status").notNull().default("pending"),
    createdAt: timestamp("created_at", { withTimezone: false }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: false }).defaultNow().notNull(),
    redeemedCount: integer("redeemed_count"),
  },
  (table) => ({
    nameIdx: index("batches_name_idx").on(table.name),
  })
)

// Promo codes table: stores individual codes
export const promoCode = pgTable(
  "promo_code",
  {
    id: text("id").primaryKey(),
    code: text("code").notNull(),
    batchId: text("batch_id").notNull(),
    status: text("status").notNull().default("new"), // new | issued | redeemed | invalid
    metadata: text("metadata"),
    createdAt: timestamp("created_at", { withTimezone: false }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: false }).defaultNow().notNull(),
    redeemedAt: timestamp("redeemed_at", { withTimezone: false }),
    verifiedAt: timestamp("verified_at", { withTimezone: false }),
  },
  (table) => ({
    codeUnique: uniqueIndex("promo_code_code_unique").on(table.code),
    codeIdx: index("promo_code_code_idx").on(table.code),
    batchIdx: index("promo_code_batch_idx").on(table.batchId),
  })
)