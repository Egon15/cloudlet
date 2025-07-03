// Sets up a Drizzle ORM client using Neon serverless PostgreSQL.
// - `sql` is the tagged template client from Neon for executing raw queries.
// - `db` is the Drizzle ORM instance configured with your schema for type-safe queries.

import { drizzle } from "drizzle-orm/neon-http";
import { neon } from "@neondatabase/serverless";

import * as schema from "./schema";

const sql = neon(process.env.DATABASE_URL!);

export const db = drizzle(sql, { schema });
export { sql };
