import { db } from "./index.js";
import { categories, ingredients } from "./schema.js";

const defaultCategories = [
  { name: "家常菜", icon: "🏠" },
  { name: "川菜", icon: "🌶️" },
  { name: "粤菜", icon: "🥘" },
  { name: "湘菜", icon: "🔥" },
  { name: "鲁菜", icon: "🍳" },
  { name: "苏菜", icon: "🥢" },
  { name: "浙菜", icon: "🐟" },
  { name: "闽菜", icon: "🦐" },
  { name: "徽菜", icon: "🍖" },
  { name: "西餐", icon: "🥩" },
  { name: "日料", icon: "🍣" },
  { name: "韩餐", icon: "🍜" },
  { name: "甜点", icon: "🍰" },
  { name: "饮品", icon: "🧋" },
  { name: "早餐", icon: "🥞" },
  { name: "汤品", icon: "🍲" },
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

  const existingCategories = db.select().from(categories).all();
  if (existingCategories.length === 0) {
    db.insert(categories).values(defaultCategories).run();
    console.log(`Seeded ${defaultCategories.length} categories`);
  }

  const existingIngredients = db.select().from(ingredients).all();
  if (existingIngredients.length === 0) {
    db.insert(ingredients).values(defaultIngredients).run();
    console.log(`Seeded ${defaultIngredients.length} ingredients`);
  }

  console.log("Database seeding completed!");
}

seed();
