import { Router, Response } from "express";
import { db } from "../db/index.js";
import { user_ingredients, ingredients } from "../db/schema.js";
import { eq, and } from "drizzle-orm";
import { z } from "zod";
import { AuthRequest, authMiddleware } from "../middleware/auth.js";

const router = Router();

// 获取我的食材库（按分类分组）
router.get("/", authMiddleware, (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId!;

    const list = db
      .select({
        id: user_ingredients.id,
        ingredient_id: user_ingredients.ingredient_id,
        ingredient_name: ingredients.name,
        ingredient_category: ingredients.category,
      })
      .from(user_ingredients)
      .leftJoin(
        ingredients,
        eq(user_ingredients.ingredient_id, ingredients.id)
      )
      .where(eq(user_ingredients.user_id, userId))
      .all();

    // 按分类分组
    const grouped: Record<string, typeof list> = {};
    for (const item of list) {
      const cat = item.ingredient_category || "其他";
      if (!grouped[cat]) grouped[cat] = [];
      grouped[cat].push(item);
    }

    res.json({ success: true, data: { items: list, grouped } });
  } catch (error) {
    console.error("Get user ingredients error:", error);
    res.status(500).json({ success: false, message: "获取食材库失败" });
  }
});

// 添加食材到我的库（支持 ingredient_id 或自定义 name）
router.post("/", authMiddleware, (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId!;
    const schema = z.object({
      ingredient_id: z.number().optional(),
      name: z.string().min(1).max(50).optional(),
      category: z.string().max(50).optional(),
    });

    const data = schema.parse(req.body);
    let ingredientId = data.ingredient_id;

    // 如果传了 name，先查找或创建食材
    if (!ingredientId && data.name) {
      const existing = db
        .select()
        .from(ingredients)
        .where(eq(ingredients.name, data.name))
        .get();

      if (existing) {
        ingredientId = existing.id;
      } else {
        const newIngredient = db
          .insert(ingredients)
          .values({ name: data.name, category: data.category || "自定义" })
          .returning()
          .get();
        ingredientId = newIngredient.id;
      }
    }

    if (!ingredientId) {
      res.status(400).json({ success: false, message: "请提供 ingredient_id 或 name" });
      return;
    }

    const existing = db
      .select()
      .from(user_ingredients)
      .where(
        and(
          eq(user_ingredients.user_id, userId),
          eq(user_ingredients.ingredient_id, ingredientId)
        )
      )
      .get();

    if (existing) {
      res.json({ success: true, data: existing });
      return;
    }

    const result = db
      .insert(user_ingredients)
      .values({ user_id: userId, ingredient_id: ingredientId })
      .returning()
      .get();

    const ingredient = db
      .select()
      .from(ingredients)
      .where(eq(ingredients.id, ingredientId))
      .get();

    res.json({ success: true, data: { ...result, ingredient } });
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ success: false, message: error.errors[0].message });
      return;
    }
    console.error("Add user ingredient error:", error);
    res.status(500).json({ success: false, message: "添加失败" });
  }
});

// 从我的库移除食材
router.delete("/:ingredientId", authMiddleware, (req: AuthRequest, res: Response) => {
  try {
    const ingredientId = parseInt(req.params.ingredientId);
    const userId = req.userId!;

    db.delete(user_ingredients)
      .where(
        and(
          eq(user_ingredients.user_id, userId),
          eq(user_ingredients.ingredient_id, ingredientId)
        )
      )
      .run();

    res.json({ success: true, message: "已移除" });
  } catch (error) {
    console.error("Remove user ingredient error:", error);
    res.status(500).json({ success: false, message: "移除失败" });
  }
});

export default router;
