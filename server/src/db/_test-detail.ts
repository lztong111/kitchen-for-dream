import { db } from "./index.js";
import { dishes, steps, dish_ingredients, tags, ingredients, categories, users } from "./schema.js";
import { eq, inArray } from "drizzle-orm";

// 模拟 GET /dishes/:id 接口
const dish = db.select().from(dishes).limit(1).get();
if (!dish) {
  console.log("No dishes found");
  process.exit(0);
}

console.log("=== Dish Detail Test ===");
console.log("Dish:", dish.name, "ID:", dish.id, "Category:", dish.category_id);

const dishSteps = db.select().from(steps).where(eq(steps.dish_id, dish.id)).orderBy(steps.step_number).all();
console.log("\nSteps:", dishSteps.length);
for (const s of dishSteps) {
  console.log(`  ${s.step_number}. ${s.description}`);
}

const dishIngs = db.select({
  id: dish_ingredients.id,
  dish_id: dish_ingredients.dish_id,
  ingredient_id: dish_ingredients.ingredient_id,
  amount: dish_ingredients.amount,
  unit: dish_ingredients.unit,
  ingredient_name: ingredients.name,
  ingredient_category: ingredients.category,
}).from(dish_ingredients)
  .leftJoin(ingredients, eq(dish_ingredients.ingredient_id, ingredients.id))
  .where(eq(dish_ingredients.dish_id, dish.id))
  .all();

console.log("\nIngredients:", dishIngs.length);
for (const di of dishIngs) {
  console.log(`  ${di.ingredient_name}: ${di.amount}${di.unit}`);
}

const dishTags = db.select().from(tags).where(eq(tags.dish_id, dish.id)).all();
console.log("\nTags:", dishTags.map(t => t.name).join(", "));

const dishUser = db.select().from(users).where(eq(users.id, dish.user_id)).get();
console.log("\nUser:", dishUser?.username);

const dishCategory = dish.category_id
  ? db.select().from(categories).where(eq(categories.id, dish.category_id)).get()
  : null;
console.log("Category:", dishCategory?.name);
