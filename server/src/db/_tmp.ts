import { db } from "./index.js";
import { dishes } from "./schema.js";
import { sql } from "drizzle-orm";

const r = db.select({ count: sql<number>`count(*)` }).from(dishes).get();
console.log("Total dishes in DB:", r?.count);
