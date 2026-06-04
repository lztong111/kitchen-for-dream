import { Router, Response } from "express";
import { db } from "../db/index.js";
import {
  daily_menus,
  dishes,
  steps,
  dish_ingredients,
  ingredients,
  tags,
  categories,
} from "../db/schema.js";
import { eq, and, desc, sql } from "drizzle-orm";
import { AuthRequest, authMiddleware } from "../middleware/auth.js";

const router = Router();

function getTodayDate(): string {
  return new Date().toISOString().split("T")[0];
}

// Toggle 今日菜单（加入/移除）
router.post("/:dishId", authMiddleware, (req: AuthRequest, res: Response) => {
  try {
    const dishId = parseInt(req.params.dishId);
    const userId = req.userId!;
    const today = getTodayDate();

    const dish = db.select().from(dishes).where(eq(dishes.id, dishId)).get();
    if (!dish) {
      res.status(404).json({ success: false, message: "菜品不存在" });
      return;
    }

    const existing = db
      .select()
      .from(daily_menus)
      .where(
        and(
          eq(daily_menus.user_id, userId),
          eq(daily_menus.dish_id, dishId),
          eq(daily_menus.date, today)
        )
      )
      .get();

    if (existing) {
      db.delete(daily_menus)
        .where(
          and(
            eq(daily_menus.user_id, userId),
            eq(daily_menus.dish_id, dishId),
            eq(daily_menus.date, today)
          )
        )
        .run();
      res.json({ success: true, data: { added: false } });
    } else {
      db.insert(daily_menus)
        .values({ user_id: userId, dish_id: dishId, date: today })
        .run();
      res.json({ success: true, data: { added: true } });
    }
  } catch (error) {
    console.error("Toggle daily menu error:", error);
    res.status(500).json({ success: false, message: "操作失败" });
  }
});

// 获取今日菜单（含食材汇总 + 总时间）
router.get("/today", authMiddleware, (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId!;
    const today = getTodayDate();

    const menuItems = db
      .select()
      .from(daily_menus)
      .where(
        and(eq(daily_menus.user_id, userId), eq(daily_menus.date, today))
      )
      .orderBy(desc(daily_menus.created_at))
      .all();

    const dishIds = menuItems.map((m) => m.dish_id);

    if (dishIds.length === 0) {
      res.json({
        success: true,
        data: { dishes: [], total_cook_time: 0, ingredients_summary: [], count: 0 },
      });
      return;
    }

    // 获取菜品详情
    const dishList = db.select().from(dishes).where(eq(dishes.id, dishIds[0])).all();

    // 获取步骤
    const allSteps = db.select().from(steps).where(eq(steps.dish_id, dishIds[0])).all();

    // 获取食材
    const allDishIngredients = db
      .select({
        id: dish_ingredients.id,
        dish_id: dish_ingredients.dish_id,
        ingredient_id: dish_ingredients.ingredient_id,
        amount: dish_ingredients.amount,
        unit: dish_ingredients.unit,
        ingredient_name: ingredients.name,
        ingredient_category: ingredients.category,
      })
      .from(dish_ingredients)
      .leftJoin(ingredients, eq(dish_ingredients.ingredient_id, ingredients.id))
      .where(eq(dish_ingredients.dish_id, dishIds[0]))
      .all();

    // 获取标签
    const allTags = db.select().from(tags).where(eq(tags.dish_id, dishIds[0])).all();

    // 获取分类
    const categoryIds = [...new Set(dishList.map((d) => d.category_id).filter(Boolean))];
    let dishCategories: typeof categories.$inferSelect[] = [];
    if (categoryIds.length > 0) {
      dishCategories = db
        .select()
        .from(categories)
        .where(eq(categories.id, categoryIds[0] as number))
        .all();
    }

    // 组装菜品数据
    const enrichedDishes = dishList.map((dish) => ({
      ...dish,
      category: dishCategories.find((c) => c.id === dish.category_id),
      tags: allTags.filter((t) => t.dish_id === dish.id),
      steps: allSteps
        .filter((s) => s.dish_id === dish.id)
        .sort((a, b) => a.step_number - b.step_number),
      dish_ingredients: allDishIngredients
        .filter((di) => di.dish_id === dish.id)
        .map((di) => ({
          id: di.id,
          dish_id: di.dish_id,
          ingredient_id: di.ingredient_id,
          amount: di.amount,
          unit: di.unit,
          ingredient: {
            id: di.ingredient_id,
            name: di.ingredient_name,
            category: di.ingredient_category,
          },
        })),
    }));

    // 计算总烹饪时间
    const total_cook_time = dishList.reduce(
      (sum, d) => sum + (d.cook_time || 0),
      0
    );

    // 食材汇总（合并同名食材）
    const ingredientMap = new Map<string, string[]>();
    for (const di of allDishIngredients) {
      const name = di.ingredient_name || "未知食材";
      const amountStr = `${di.amount || ""}${di.unit || ""}`.trim();
      if (!ingredientMap.has(name)) {
        ingredientMap.set(name, []);
      }
      if (amountStr) {
        ingredientMap.get(name)!.push(amountStr);
      }
    }

    const ingredients_summary = Array.from(ingredientMap.entries()).map(
      ([name, amounts]) => ({ name, amounts })
    );

    res.json({
      success: true,
      data: {
        dishes: enrichedDishes,
        total_cook_time,
        ingredients_summary,
        count: dishList.length,
      },
    });
  } catch (error) {
    console.error("Get daily menu error:", error);
    res.status(500).json({ success: false, message: "获取今日菜单失败" });
  }
});

// 检查菜品是否在今日菜单
router.get("/check/:dishId", authMiddleware, (req: AuthRequest, res: Response) => {
  try {
    const dishId = parseInt(req.params.dishId);
    const userId = req.userId!;
    const today = getTodayDate();

    const existing = db
      .select()
      .from(daily_menus)
      .where(
        and(
          eq(daily_menus.user_id, userId),
          eq(daily_menus.dish_id, dishId),
          eq(daily_menus.date, today)
        )
      )
      .get();

    res.json({ success: true, data: { added: !!existing } });
  } catch (error) {
    console.error("Check daily menu error:", error);
    res.status(500).json({ success: false, message: "检查失败" });
  }
});

// 清空今日菜单
router.delete("/today", authMiddleware, (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId!;
    const today = getTodayDate();

    db.delete(daily_menus)
      .where(
        and(eq(daily_menus.user_id, userId), eq(daily_menus.date, today))
      )
      .run();

    res.json({ success: true, message: "已清空今日菜单" });
  } catch (error) {
    console.error("Clear daily menu error:", error);
    res.status(500).json({ success: false, message: "清空失败" });
  }
});

export default router;
