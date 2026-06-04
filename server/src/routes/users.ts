import { Router, Response } from "express";
import { db } from "../db/index.js";
import { users, dishes, tags, categories } from "../db/schema.js";
import { eq, desc, sql, inArray } from "drizzle-orm";
import { z } from "zod";
import { AuthRequest, authMiddleware } from "../middleware/auth.js";

const router = Router();

// 获取用户公开信息
router.get("/:id", (req: AuthRequest, res: Response) => {
  try {
    const id = parseInt(req.params.id);

    const user = db
      .select({
        id: users.id,
        username: users.username,
        avatar: users.avatar,
        created_at: users.created_at,
      })
      .from(users)
      .where(eq(users.id, id))
      .get();

    if (!user) {
      res.status(404).json({ success: false, message: "用户不存在" });
      return;
    }

    const dishCount = db
      .select({ count: sql<number>`count(*)` })
      .from(dishes)
      .where(eq(dishes.user_id, id))
      .get();

    res.json({
      success: true,
      data: { ...user, dish_count: dishCount?.count ?? 0 },
    });
  } catch (error) {
    console.error("Get user error:", error);
    res.status(500).json({ success: false, message: "获取用户信息失败" });
  }
});

// 获取用户的菜品列表
router.get("/:id/dishes", (req: AuthRequest, res: Response) => {
  try {
    const userId = parseInt(req.params.id);
    const page = Math.max(1, parseInt(req.query.page as string) || 1);
    const limit = Math.min(50, Math.max(1, parseInt(req.query.limit as string) || 12));

    const totalResult = db
      .select({ count: sql<number>`count(*)` })
      .from(dishes)
      .where(eq(dishes.user_id, userId))
      .get();
    const total = totalResult?.count ?? 0;

    const dishList = db
      .select()
      .from(dishes)
      .where(eq(dishes.user_id, userId))
      .orderBy(desc(dishes.created_at))
      .limit(limit)
      .offset((page - 1) * limit)
      .all();

    const dishIdsList = dishList.map((d) => d.id);

    let dishTags: typeof tags.$inferSelect[] = [];
    let dishCategories: typeof categories.$inferSelect[] = [];

    if (dishIdsList.length > 0) {
      dishTags = db
        .select()
        .from(tags)
        .where(inArray(tags.dish_id, dishIdsList))
        .all();

      const categoryIds = [
        ...new Set(dishList.map((d) => d.category_id).filter(Boolean)),
      ];
      if (categoryIds.length > 0) {
        dishCategories = db
          .select()
          .from(categories)
          .where(inArray(categories.id, categoryIds as number[]))
          .all();
      }
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
    console.error("Get user dishes error:", error);
    res.status(500).json({ success: false, message: "获取用户菜品失败" });
  }
});

// 修改密码
router.put("/password", authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const bcrypt = await import("bcryptjs");
    const schema = z.object({
      old_password: z.string().min(1),
      new_password: z.string().min(6).max(50),
    });

    const { old_password, new_password } = schema.parse(req.body);

    const user = db
      .select()
      .from(users)
      .where(eq(users.id, req.userId!))
      .get();

    if (!user) {
      res.status(404).json({ success: false, message: "用户不存在" });
      return;
    }

    const valid = await bcrypt.compare(old_password, user.password);
    if (!valid) {
      res.status(400).json({ success: false, message: "原密码错误" });
      return;
    }

    const hashedPassword = await bcrypt.hash(new_password, 10);
    db.update(users)
      .set({ password: hashedPassword })
      .where(eq(users.id, req.userId!))
      .run();

    res.json({ success: true, message: "密码修改成功" });
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ success: false, message: error.errors[0].message });
      return;
    }
    console.error("Change password error:", error);
    res.status(500).json({ success: false, message: "修改密码失败" });
  }
});

export default router;
