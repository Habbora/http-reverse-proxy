import { migrate } from "drizzle-orm/bun-sqlite/migrator";
import { db } from "../db";

export const runMigrations = async () => {
    await migrate(db, { migrationsFolder: "drizzle" });
}
