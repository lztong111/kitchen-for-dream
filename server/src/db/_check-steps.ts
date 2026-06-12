import { db } from "./index.js";
import { dishes, steps } from "./schema.js";
import { sql, eq } from "drizzle-orm";

const totalDishes = db.select({ count: sql<number>`count(*)` }).from(dishes).get();
const totalSteps = db.select({ count: sql<number>`count(*)` }).from(steps).get();

console.log("Total dishes:", totalDishes?.count);
console.log("Total steps:", totalSteps?.count);

// 检查前5个菜品的步骤
const sampleDishes = db.select().from(dishes).limit(5).all();
for (const dish of sampleDishes) {
  const dishSteps = db.select().from(steps).where(eq(steps.dish_id, dish.id)).all();
  console.log(`\nDish ${dish.id}: ${dish.name} - ${dishSteps.length} steps`);
  for (const step of dishSteps) {
    console.log(`  Step ${step.step_number}: ${step.description}`);
  }
}
