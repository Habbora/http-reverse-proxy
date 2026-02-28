import { migrate } from "drizzle-orm/bun-sqlite/migrator";
import { db } from "./client";

export const runMigrations = async () => {
    console.log("Running migrations...");
    await migrate(db, { migrationsFolder: "./drizzle" });
}
