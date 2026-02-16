import { int, sqliteTable, text } from "drizzle-orm/sqlite-core";
import { generateId } from "../utils/generateId";

export const proxyRoutesTable = sqliteTable("proxy_routes_table", {
    id: text().primaryKey().$defaultFn(() => generateId()),
    name: text().notNull().unique(),
    url: text().notNull(),
});