import { db, getRawDb } from "./index.js";
import { categories, ingredients } from "./schema.js";

const defaultCategories = [
  { name: "凉菜", icon: "🥒" },
  { name: "热菜", icon: "🍳" },
  { name: "汤羹", icon: "🍲" },
  { name: "主食", icon: "🍚" },
  { name: "面食", icon: "🍜" },
  { name: "甜点", icon: "🍰" },
  { name: "饮品", icon: "🧋" },
  { name: "烧烤", icon: "🔥" },
  { name: "鸡肉", icon: "🍗" },
  { name: "鱼肉", icon: "🐟" },
  { name: "牛肉", icon: "🥩" },
  { name: "猪肉", icon: "🥓" },
  { name: "羊肉", icon: "🍖" },
  { name: "海鲜", icon: "🦐" },
  { name: "蔬菜", icon: "🥬" },
  { name: "豆制品", icon: "🧈" },
  { name: "减脂餐", icon: "🥗" },
];

const defaultIngredients = [
  { name: "猪肉", category: "肉类" },
  { name: "牛肉", category: "肉类" },
  { name: "鸡肉", category: "肉类" },
  { name: "羊肉", category: "肉类" },
  { name: "鱼", category: "海鲜" },
  { name: "虾", category: "海鲜" },
  { name: "螃蟹", category: "海鲜" },
  { name: "豆腐", category: "豆制品" },
  { name: "鸡蛋", category: "蛋类" },
  { name: "土豆", category: "蔬菜" },
  { name: "白菜", category: "蔬菜" },
  { name: "青椒", category: "蔬菜" },
  { name: "西红柿", category: "蔬菜" },
  { name: "黄瓜", category: "蔬菜" },
  { name: "胡萝卜", category: "蔬菜" },
  { name: "洋葱", category: "蔬菜" },
  { name: "大蒜", category: "调味品" },
  { name: "生姜", category: "调味品" },
  { name: "葱", category: "调味品" },
  { name: "酱油", category: "调味品" },
  { name: "醋", category: "调味品" },
  { name: "盐", category: "调味品" },
  { name: "糖", category: "调味品" },
  { name: "料酒", category: "调味品" },
  { name: "食用油", category: "调味品" },
  { name: "大米", category: "主食" },
  { name: "面粉", category: "主食" },
  { name: "面条", category: "主食" },
];

export function seed() {
  console.log("Seeding database...");
  const sqlite = getRawDb();

  // 刷新分类（临时关闭外键约束）
  const existingCategories = db.select().from(categories).all();
  if (existingCategories.length === 0) {
    db.insert(categories).values(defaultCategories).run();
    console.log(`Seeded ${defaultCategories.length} categories`);
  } else {
    sqlite.pragma("foreign_keys = OFF");
    db.delete(categories).run();
    sqlite.pragma("foreign_keys = ON");
    db.insert(categories).values(defaultCategories).run();
    console.log(`Updated ${defaultCategories.length} categories`);
  }

  const existingIngredients = db.select().from(ingredients).all();
  if (existingIngredients.length === 0) {
    db.insert(ingredients).values(defaultIngredients).run();
    console.log(`Seeded ${defaultIngredients.length} ingredients`);
  }

  console.log("Database seeding completed!");
}

seed();
