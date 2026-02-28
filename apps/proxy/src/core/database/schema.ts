import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";
import { generateId } from "../../shared/utils/generateId";

export const proxyRoutesTable = sqliteTable("proxy_routes_table", {
    id: text("id").primaryKey().$defaultFn(() => generateId()),
    isActive: integer("is_active", { mode: "boolean" }).notNull().default(true),
    proxyName: text("proxy_name").notNull().unique(),
    targetUrl: text("target_url").notNull(),
})