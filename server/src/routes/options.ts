import { Router, Response } from "express";
import { db } from "../db/index.js";
import { categories, ingredients, tags } from "../db/schema.js";
import { eq, sql } from "drizzle-orm";
import { z } from "zod";
import { AuthRequest, authMiddleware } from "../middleware/auth.js";

const router = Router();

// 获取所有分类 (缓存1小时)
router.get("/categories", (_req, res: Response) => {
  try {
    res.set("Cache-Control", "public, max-age=3600");
    const result = db.select().from(categories).all();
    res.json({ success: true, data: result });
  } catch (error) {
    res.status(500).json({ success: false, message: "获取分类失败" });
  }
});

// 获取所有食材 (缓存1小时)
router.get("/ingredients", (_req, res: Response) => {
  try {
    res.set("Cache-Control", "public, max-age=3600");
    const result = db.select().from(ingredients).all();
    res.json({ success: true, data: result });
  } catch (error) {
    res.status(500).json({ success: false, message: "获取食材失败" });
  }
});

// 添加新食材 (需登录)
router.post("/ingredients", authMiddleware, (req: AuthRequest, res: Response) => {
  try {
    const schema = z.object({
      name: z.string().min(1).max(50),
      category: z.string().max(50).optional(),
    });

    const { name, category } = schema.parse(req.body);

    const existing = db
      .select()
      .from(ingredients)
      .where(eq(ingredients.name, name))
      .get();

    if (existing) {
      res.json({ success: true, data: existing });
      return;
    }

    const result = db
      .insert(ingredients)
      .values({ name, category })
      .returning()
      .get();

    res.json({ success: true, data: result });
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ success: false, message: error.errors[0].message });
      return;
    }
    console.error("Add ingredient error:", error);
    res.status(500).json({ success: false, message: "添加食材失败" });
  }
});

// 获取热门标签 (缓存5分钟)
router.get("/tags", (_req, res: Response) => {
  try {
    res.set("Cache-Control", "public, max-age=300");
    const result = db
      .select({
        name: tags.name,
        count: sql<number>`count(*)`,
      })
      .from(tags)
      .groupBy(tags.name)
      .orderBy(sql`count(*) desc`)
      .limit(20)
      .all();
    res.json({ success: true, data: result });
  } catch (error) {
    res.status(500).json({ success: false, message: "获取标签失败" });
  }
});

export default router;
