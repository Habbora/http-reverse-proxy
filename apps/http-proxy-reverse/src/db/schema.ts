import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";
import { generateId } from "../utils/generateId";

export const proxyRoutesTable = sqliteTable("proxy_routes_table", {
    id: text().primaryKey().$defaultFn(() => generateId()),
    isActive: integer().notNull().default(1),
    name: text().notNull().unique(),
    url: text().notNull(),
});
