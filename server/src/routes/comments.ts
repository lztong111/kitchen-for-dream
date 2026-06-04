import { Router, Response } from "express";
import { db } from "../db/index.js";
import { comments, dishes, users } from "../db/schema.js";
import { eq, and, desc, sql } from "drizzle-orm";
import { z } from "zod";
import { AuthRequest, authMiddleware } from "../middleware/auth.js";

const router = Router();

const commentSchema = z.object({
  content: z.string().min(1).max(500),
  rating: z.number().min(1).max(5).optional(),
});

// 发表评论
router.post("/:dishId", authMiddleware, (req: AuthRequest, res: Response) => {
  try {
    const dishId = parseInt(req.params.dishId);
    const userId = req.userId!;
    const { content, rating } = commentSchema.parse(req.body);

    const dish = db.select().from(dishes).where(eq(dishes.id, dishId)).get();
    if (!dish) {
      res.status(404).json({ success: false, message: "菜品不存在" });
      return;
    }

    const result = db
      .insert(comments)
      .values({ user_id: userId, dish_id: dishId, content, rating })
      .returning()
      .get();

    const user = db
      .select({ id: users.id, username: users.username, avatar: users.avatar })
      .from(users)
      .where(eq(users.id, userId))
      .get();

    res.json({
      success: true,
      data: { ...result, user },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ success: false, message: error.errors[0].message });
      return;
    }
    console.error("Create comment error:", error);
    res.status(500).json({ success: false, message: "评论失败" });
  }
});

// 获取某菜品的评论（分页）
router.get("/dish/:dishId", (req: AuthRequest, res: Response) => {
  try {
    const dishId = parseInt(req.params.dishId);
    const page = Math.max(1, parseInt(req.query.page as string) || 1);
    const limit = Math.min(50, Math.max(1, parseInt(req.query.limit as string) || 20));

    const totalResult = db
      .select({ count: sql<number>`count(*)` })
      .from(comments)
      .where(eq(comments.dish_id, dishId))
      .get();
    const total = totalResult?.count ?? 0;

    const commentList = db
      .select()
      .from(comments)
      .where(eq(comments.dish_id, dishId))
      .orderBy(desc(comments.created_at))
      .limit(limit)
      .offset((page - 1) * limit)
      .all();

    // 获取评论用户信息
    const userIds = [...new Set(commentList.map((c) => c.user_id))];
    const commentUsers = userIds.length > 0
      ? db
          .select({ id: users.id, username: users.username, avatar: users.avatar })
          .from(users)
          .where(eq(users.id, userIds[0]))
          .all()
      : [];

    const enrichedComments = commentList.map((c) => ({
      ...c,
      user: commentUsers.find((u) => u.id === c.user_id),
    }));

    res.json({
      success: true,
      data: { comments: enrichedComments, total, page, limit },
    });
  } catch (error) {
    console.error("Get comments error:", error);
    res.status(500).json({ success: false, message: "获取评论失败" });
  }
});

// 获取我的评论（分页）
router.get("/my", authMiddleware, (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId!;
    const page = Math.max(1, parseInt(req.query.page as string) || 1);
    const limit = Math.min(50, Math.max(1, parseInt(req.query.limit as string) || 20));

    const totalResult = db
      .select({ count: sql<number>`count(*)` })
      .from(comments)
      .where(eq(comments.user_id, userId))
      .get();
    const total = totalResult?.count ?? 0;

    const commentList = db
      .select()
      .from(comments)
      .where(eq(comments.user_id, userId))
      .orderBy(desc(comments.created_at))
      .limit(limit)
      .offset((page - 1) * limit)
      .all();

    // 获取关联菜品信息
    const dishIds = [...new Set(commentList.map((c) => c.dish_id))];
    const commentDishes = dishIds.length > 0
      ? db
          .select({ id: dishes.id, name: dishes.name, image_url: dishes.image_url })
          .from(dishes)
          .where(eq(dishes.id, dishIds[0]))
          .all()
      : [];

    const enrichedComments = commentList.map((c) => ({
      ...c,
      dish: commentDishes.find((d) => d.id === c.dish_id),
    }));

    res.json({
      success: true,
      data: { comments: enrichedComments, total, page, limit },
    });
  } catch (error) {
    console.error("Get my comments error:", error);
    res.status(500).json({ success: false, message: "获取评论失败" });
  }
});

// 删除自己的评论
router.delete("/:id", authMiddleware, (req: AuthRequest, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    const userId = req.userId!;

    const comment = db
      .select()
      .from(comments)
      .where(eq(comments.id, id))
      .get();

    if (!comment) {
      res.status(404).json({ success: false, message: "评论不存在" });
      return;
    }

    if (comment.user_id !== userId) {
      res.status(403).json({ success: false, message: "只能删除自己的评论" });
      return;
    }

    db.delete(comments).where(eq(comments.id, id)).run();

    res.json({ success: true, message: "删除成功" });
  } catch (error) {
    console.error("Delete comment error:", error);
    res.status(500).json({ success: false, message: "删除失败" });
  }
});

export default router;
