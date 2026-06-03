import { getRawDb } from "./index.js";

export function migrate() {
  const db = getRawDb();

  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT NOT NULL UNIQUE,
      password TEXT NOT NULL,
      avatar TEXT,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS categories (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL UNIQUE,
      icon TEXT
    );

    CREATE TABLE IF NOT EXISTS ingredients (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL UNIQUE,
      category TEXT
    );

    CREATE TABLE IF NOT EXISTS dishes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL REFERENCES users(id),
      name TEXT NOT NULL,
      description TEXT,
      image_url TEXT,
      category_id INTEGER REFERENCES categories(id),
      cook_time INTEGER,
      difficulty INTEGER NOT NULL DEFAULT 1,
      servings INTEGER NOT NULL DEFAULT 1,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS steps (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      dish_id INTEGER NOT NULL REFERENCES dishes(id) ON DELETE CASCADE,
      step_number INTEGER NOT NULL,
      description TEXT NOT NULL,
      image_url TEXT
    );

    CREATE TABLE IF NOT EXISTS dish_ingredients (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      dish_id INTEGER NOT NULL REFERENCES dishes(id) ON DELETE CASCADE,
      ingredient_id INTEGER NOT NULL REFERENCES ingredients(id),
      amount TEXT,
      unit TEXT
    );

    CREATE TABLE IF NOT EXISTS tags (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      dish_id INTEGER NOT NULL REFERENCES dishes(id) ON DELETE CASCADE,
      name TEXT NOT NULL
    );

    CREATE INDEX IF NOT EXISTS idx_dishes_user_id ON dishes(user_id);
    CREATE INDEX IF NOT EXISTS idx_dishes_category_id ON dishes(category_id);
    CREATE INDEX IF NOT EXISTS idx_steps_dish_id ON steps(dish_id);
    CREATE INDEX IF NOT EXISTS idx_dish_ingredients_dish_id ON dish_ingredients(dish_id);
    CREATE INDEX IF NOT EXISTS idx_tags_dish_id ON tags(dish_id);
    CREATE INDEX IF NOT EXISTS idx_tags_name ON tags(name);
  `);

  console.log("Database migration completed!");
}

migrate();
