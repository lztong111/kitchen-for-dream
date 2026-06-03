import { Router, Response } from "express";
import { db } from "../db/index.js";
import { favorites, dishes, tags, categories, users } from "../db/schema.js";
import { eq, and, desc, sql } from "drizzle-orm";
import { AuthRequest, authMiddleware } from "../middleware/auth.js";

const router = Router();

// 收藏/取消收藏
router.post("/:dishId", authMiddleware, (req: AuthRequest, res: Response) => {
  try {
    const dishId = parseInt(req.params.dishId);
    const userId = req.userId!;

    const dish = db.select().from(dishes).where(eq(dishes.id, dishId)).get();
    if (!dish) {
      res.status(404).json({ success: false, message: "菜品不存在" });
      return;
    }

    const existing = db
      .select()
      .from(favorites)
      .where(and(eq(favorites.user_id, userId), eq(favorites.dish_id, dishId)))
      .get();

    if (existing) {
      db.delete(favorites)
        .where(and(eq(favorites.user_id, userId), eq(favorites.dish_id, dishId)))
        .run();
      res.json({ success: true, data: { favorited: false } });
    } else {
      db.insert(favorites).values({ user_id: userId, dish_id: dishId }).run();
      res.json({ success: true, data: { favorited: true } });
    }
  } catch (error) {
    console.error("Toggle favorite error:", error);
    res.status(500).json({ success: false, message: "操作失败" });
  }
});

// 获取用户的收藏列表
router.get("/", authMiddleware, (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId!;
    const page = Math.max(1, parseInt(req.query.page as string) || 1);
    const limit = Math.min(50, Math.max(1, parseInt(req.query.limit as string) || 12));

    const totalResult = db
      .select({ count: sql<number>`count(*)` })
      .from(favorites)
      .where(eq(favorites.user_id, userId))
      .get();
    const total = totalResult?.count ?? 0;

    const favList = db
      .select({
        dish_id: favorites.dish_id,
        created_at: favorites.created_at,
      })
      .from(favorites)
      .where(eq(favorites.user_id, userId))
      .orderBy(desc(favorites.created_at))
      .limit(limit)
      .offset((page - 1) * limit)
      .all();

    const dishIds = favList.map((f) => f.dish_id);

    if (dishIds.length === 0) {
      res.json({ success: true, data: { dishes: [], total, page, limit } });
      return;
    }

    const dishList = db.select().from(dishes).where(eq(dishes.id, dishIds[0])).all();

    const dishTags = db.select().from(tags).where(eq(tags.dish_id, dishIds[0])).all();

    const categoryIds = [...new Set(dishList.map((d) => d.category_id).filter(Boolean))];
    let dishCategories: typeof categories.$inferSelect[] = [];
    if (categoryIds.length > 0) {
      dishCategories = db.select().from(categories).where(eq(categories.id, categoryIds[0] as number)).all();
    }

    const enrichedDishes = dishList.map((dish) => ({
      ...dish,
      category: dishCategories.find((c) => c.id === dish.category_id),
      tags: dishTags.filter((t) => t.dish_id === dish.id),
    }));

    res.json({
      success: true,
      data: { dishes: enrichedDishes, total, page, limit },
    });
  } catch (error) {
    console.error("Get favorites error:", error);
    res.status(500).json({ success: false, message: "获取收藏失败" });
  }
});

// 检查是否已收藏
router.get("/check/:dishId", authMiddleware, (req: AuthRequest, res: Response) => {
  try {
    const dishId = parseInt(req.params.dishId);
    const userId = req.userId!;

    const existing = db
      .select()
      .from(favorites)
      .where(and(eq(favorites.user_id, userId), eq(favorites.dish_id, dishId)))
      .get();

    res.json({ success: true, data: { favorited: !!existing } });
  } catch (error) {
    console.error("Check favorite error:", error);
    res.status(500).json({ success: false, message: "检查失败" });
  }
});

// 获取菜品的收藏数
router.get("/count/:dishId", (req: AuthRequest, res: Response) => {
  try {
    const dishId = parseInt(req.params.dishId);

    const result = db
      .select({ count: sql<number>`count(*)` })
      .from(favorites)
      .where(eq(favorites.dish_id, dishId))
      .get();

    res.json({ success: true, data: { count: result?.count ?? 0 } });
  } catch (error) {
    console.error("Get favorite count error:", error);
    res.status(500).json({ success: false, message: "获取收藏数失败" });
  }
});

export default router;
