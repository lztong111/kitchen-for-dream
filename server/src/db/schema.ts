import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";

export const users = sqliteTable("users", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  avatar: text("avatar"),
  created_at: text("created_at")
    .notNull()
    .$defaultFn(() => new Date().toISOString()),
});

export const categories = sqliteTable("categories", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull().unique(),
  icon: text("icon"),
});

export const ingredients = sqliteTable("ingredients", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull().unique(),
  category: text("category"),
});

export const dishes = sqliteTable("dishes", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  user_id: integer("user_id")
    .notNull()
    .references(() => users.id),
  name: text("name").notNull(),
  description: text("description"),
  image_url: text("image_url"),
  category_id: integer("category_id").references(() => categories.id),
  cook_time: integer("cook_time"),
  difficulty: integer("difficulty").notNull().default(1),
  servings: integer("servings").notNull().default(1),
  created_at: text("created_at")
    .notNull()
    .$defaultFn(() => new Date().toISOString()),
  updated_at: text("updated_at")
    .notNull()
    .$defaultFn(() => new Date().toISOString()),
});

export const steps = sqliteTable("steps", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  dish_id: integer("dish_id")
    .notNull()
    .references(() => dishes.id, { onDelete: "cascade" }),
  step_number: integer("step_number").notNull(),
  description: text("description").notNull(),
  image_url: text("image_url"),
});

export const dish_ingredients = sqliteTable("dish_ingredients", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  dish_id: integer("dish_id")
    .notNull()
    .references(() => dishes.id, { onDelete: "cascade" }),
  ingredient_id: integer("ingredient_id")
    .notNull()
    .references(() => ingredients.id),
  amount: text("amount"),
  unit: text("unit"),
});

export const tags = sqliteTable("tags", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  dish_id: integer("dish_id")
    .notNull()
    .references(() => dishes.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
});
