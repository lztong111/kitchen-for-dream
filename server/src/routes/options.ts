import { Router, Response } from "express";
import { db } from "../db/index.js";
import { categories, ingredients, tags } from "../db/schema.js";
import { sql } from "drizzle-orm";

const router = Router();

// 获取所有分类
router.get("/categories", (_req, res: Response) => {
  try {
    const result = db.select().from(categories).all();
    res.json({ success: true, data: result });
  } catch (error) {
    res.status(500).json({ success: false, message: "获取分类失败" });
  }
});

// 获取所有食材
router.get("/ingredients", (_req, res: Response) => {
  try {
    const result = db.select().from(ingredients).all();
    res.json({ success: true, data: result });
  } catch (error) {
    res.status(500).json({ success: false, message: "获取食材失败" });
  }
});

// 获取热门标签
router.get("/tags", (_req, res: Response) => {
  try {
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
