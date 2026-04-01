import { sql } from "drizzle-orm";
import { pgTable, varchar, timestamp, numeric, integer, text, index } from "drizzle-orm/pg-core";

// 系统健康检查表（禁止删除）
export const healthCheck = pgTable("health_check", {
  id: integer().notNull(),
  updated_at: timestamp("updated_at", { withTimezone: true, mode: 'string' }).defaultNow(),
});

// 管理员表
export const admins = pgTable(
  "admins",
  {
    id: varchar("id", { length: 36 }).primaryKey().default(sql`gen_random_uuid()`),
    username: varchar("username", { length: 50 }).notNull().unique(),
    password: varchar("password", { length: 255 }).notNull(),
    name: varchar("name", { length: 100 }).notNull(),
    role: varchar("role", { length: 20 }).notNull().default('admin'),
    created_at: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    last_login: timestamp("last_login", { withTimezone: true }),
  },
  (table) => [
    index("admins_username_idx").on(table.username),
  ]
);

// 客户表
export const customers = pgTable(
  "customers",
  {
    id: varchar("id", { length: 36 }).primaryKey().default(sql`gen_random_uuid()`),
    name: varchar("name", { length: 100 }).notNull(),
    phone: varchar("phone", { length: 50 }),
    company: varchar("company", { length: 200 }),
    status: varchar("status", { length: 20 }).notNull().default('need'),
    tags: text("tags"),
    notes: text("notes"),
    created_at: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updated_at: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
    visit_time: timestamp("visit_time", { withTimezone: true }).defaultNow().notNull(),
    loan_amount: numeric("loan_amount", { precision: 15, scale: 2 }).default('0').notNull(),
    service_fee: numeric("service_fee", { precision: 15, scale: 2 }).default('0').notNull(),
    created_by: varchar("created_by", { length: 36 }).notNull().references(() => admins.id),
    owner_id: varchar("owner_id", { length: 36 }).notNull().references(() => admins.id),
    owner_name: varchar("owner_name", { length: 100 }),
  },
  (table) => [
    index("customers_created_by_idx").on(table.created_by),
    index("customers_owner_id_idx").on(table.owner_id),
    index("customers_status_idx").on(table.status),
    index("customers_created_at_idx").on(table.created_at),
    index("customers_visit_time_idx").on(table.visit_time),
  ]
);

// 类型导出
export type Admin = typeof admins.$inferSelect;
export type Customer = typeof customers.$inferSelect;
