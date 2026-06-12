import { db } from "./index.js";
import { categories } from "./schema.js";

const cats = db.select().from(categories).all();
console.log("Categories:", cats.length);
for (const c of cats) {
  console.log(`  ID=${c.id} ${c.icon} ${c.name}`);
}
