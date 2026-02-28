import { ENV } from "../config/env";
import { drizzle } from 'drizzle-orm/bun-sqlite';

export const db = drizzle(ENV.DB_FILE_NAME);