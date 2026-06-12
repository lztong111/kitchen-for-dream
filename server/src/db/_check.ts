import { db } from "./index.js";
import { dishes, tags, categories } from "./schema.js";
import { eq, sql, isNull } from "drizzle-orm";

// 检查有多少菜品没有分类
const noCat = db.select({ count: sql<number>`count(*)` }).from(dishes).where(isNull(dishes.category_id)).get();
const total = db.select({ count: sql<number>`count(*)` }).from(dishes).get();
console.log(`无分类菜品: ${noCat?.count ?? 0} / ${total?.count ?? 0}`);

// 查看前10个菜品的分类情况
const sample = db.select().from(dishes).limit(10).all();
for (const d of sample) {
  const t = db.select().from(tags).where(eq(tags.dish_id, d.id)).all();
  console.log(`  ID=${d.id} "${d.name}" category_id=${d.category_id} tags=[${t.map(x=>x.name).join(",")}]`);
}
