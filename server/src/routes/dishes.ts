import { Router, Response } from "express";
import { db, getRawDb } from "../db/index.js";
import {
  dishes,
  steps,
  dish_ingredients,
  tags,
  ingredients,
  categories,
  users,
} from "../db/schema.js";
import { eq, like, and, desc, sql, inArray } from "drizzle-orm";
import { z } from "zod";
import { AuthRequest, authMiddleware } from "../middleware/auth.js";

const router = Router();

const dishSchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().max(1000).optional(),
  image_url: z.string().optional(),
  category_id: z.number().optional(),
  cook_time: z.number().optional(),
  difficulty: z.number().min(1).max(5).default(1),
  servings: z.number().min(1).default(1),
  steps: z
    .array(
      z.object({
        description: z.string().min(1),
        image_url: z.string().optional(),
      })
    )
    .optional(),
  ingredient_ids: z
    .array(
      z.object({
        ingredient_id: z.number(),
        amount: z.string().optional(),
        unit: z.string().optional(),
      })
    )
    .optional(),
  tag_names: z.array(z.string()).optional(),
});

// 获取菜品列表 (公开)
router.get("/", (req: AuthRequest, res: Response) => {
  try {
    const page = Math.max(1, parseInt(req.query.page as string) || 1);
    const limit = Math.min(50, Math.max(1, parseInt(req.query.limit as string) || 12));
    const search = req.query.search as string | undefined;
    const category_id = req.query.category_id
      ? parseInt(req.query.category_id as string)
      : undefined;
    const difficulty = req.query.difficulty
      ? parseInt(req.query.difficulty as string)
      : undefined;
    const tag = req.query.tag as string | undefined;

    const conditions = [];

    if (search) {
      conditions.push(like(dishes.name, `%${search}%`));
    }
    if (category_id) {
      conditions.push(eq(dishes.category_id, category_id));
    }
    if (difficulty) {
      conditions.push(eq(dishes.difficulty, difficulty));
    }

    let dishIds: number[] | undefined;

    if (tag) {
      const tagResults = db
        .select({ dish_id: tags.dish_id })
        .from(tags)
        .where(like(tags.name, `%${tag}%`))
        .all();
      dishIds = tagResults.map((t) => t.dish_id);
      if (dishIds.length === 0) {
        res.json({
          success: true,
          data: { dishes: [], total: 0, page, limit },
        });
        return;
      }
      conditions.push(inArray(dishes.id, dishIds));
    }

    const where = conditions.length > 0 ? and(...conditions) : undefined;

    const totalResult = db
      .select({ count: sql<number>`count(*)` })
      .from(dishes)
      .where(where)
      .get();
    const total = totalResult?.count ?? 0;

    const dishList = db
      .select()
      .from(dishes)
      .where(where)
      .orderBy(desc(dishes.created_at))
      .limit(limit)
      .offset((page - 1) * limit)
      .all();

    const dishIdsList = dishList.map((d) => d.id);

    let dishTags: typeof tags.$inferSelect[] = [];
    let dishCategories: typeof categories.$inferSelect[] = [];
    let dishUsers: typeof users.$inferSelect[] = [];

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
          .where(
            inArray(
              categories.id,
              categoryIds as number[]
            )
          )
          .all();
      }

      const userIds = [...new Set(dishList.map((d) => d.user_id))];
      dishUsers = db
        .select()
        .from(users)
        .where(inArray(users.id, userIds))
        .all();
    }

    const enrichedDishes = dishList.map((dish) => ({
      ...dish,
      user: dishUsers.find((u) => u.id === dish.user_id),
      category: dishCategories.find((c) => c.id === dish.category_id),
      tags: dishTags.filter((t) => t.dish_id === dish.id),
    }));

    res.json({
      success: true,
      data: { dishes: enrichedDishes, total, page, limit },
    });
  } catch (error) {
    console.error("Get dishes error:", error);
    res.status(500).json({ success: false, message: "获取菜品列表失败" });
  }
});

// 获取菜品详情 (公开)
router.get("/:id", (req: AuthRequest, res: Response) => {
  try {
    const id = parseInt(req.params.id);

    const dish = db
      .select()
      .from(dishes)
      .where(eq(dishes.id, id))
      .get();

    if (!dish) {
      res.status(404).json({ success: false, message: "菜品不存在" });
      return;
    }

    const dishSteps = db
      .select()
      .from(steps)
      .where(eq(steps.dish_id, id))
      .orderBy(steps.step_number)
      .all();

    const dishIngredients = db
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
      .leftJoin(
        ingredients,
        eq(dish_ingredients.ingredient_id, ingredients.id)
      )
      .where(eq(dish_ingredients.dish_id, id))
      .all();

    const dishTags = db
      .select()
      .from(tags)
      .where(eq(tags.dish_id, id))
      .all();

    const dishUser = db
      .select()
      .from(users)
      .where(eq(users.id, dish.user_id))
      .get();

    const dishCategory = dish.category_id
      ? db
          .select()
          .from(categories)
          .where(eq(categories.id, dish.category_id))
          .get()
      : null;

    res.json({
      success: true,
      data: {
        ...dish,
        steps: dishSteps,
        dish_ingredients: dishIngredients.map((di) => ({
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
        tags: dishTags,
        user: dishUser
          ? {
              id: dishUser.id,
              username: dishUser.username,
              avatar: dishUser.avatar,
            }
          : null,
        category: dishCategory,
      },
    });
  } catch (error) {
    console.error("Get dish detail error:", error);
    res.status(500).json({ success: false, message: "获取菜品详情失败" });
  }
});

// 创建菜品 (需登录，事务保护)
router.post("/", authMiddleware, (req: AuthRequest, res: Response) => {
  try {
    const data = dishSchema.parse(req.body);
    const sqlite = getRawDb();

    const createDish = sqlite.transaction(() => {
      const result = db
        .insert(dishes)
        .values({
          user_id: req.userId!,
          name: data.name,
          description: data.description,
          image_url: data.image_url,
          category_id: data.category_id,
          cook_time: data.cook_time,
          difficulty: data.difficulty,
          servings: data.servings,
        })
        .returning()
        .get();

      if (data.steps && data.steps.length > 0) {
        db.insert(steps)
          .values(
            data.steps.map((step, index) => ({
              dish_id: result.id,
              step_number: index + 1,
              description: step.description,
              image_url: step.image_url,
            }))
          )
          .run();
      }

      if (data.ingredient_ids && data.ingredient_ids.length > 0) {
        db.insert(dish_ingredients)
          .values(
            data.ingredient_ids.map((ing) => ({
              dish_id: result.id,
              ingredient_id: ing.ingredient_id,
              amount: ing.amount,
              unit: ing.unit,
            }))
          )
          .run();
      }

      if (data.tag_names && data.tag_names.length > 0) {
        db.insert(tags)
          .values(
            data.tag_names.map((name) => ({
              dish_id: result.id,
              name,
            }))
          )
          .run();
      }

      return result;
    });

    const result = createDish();
    res.json({ success: true, data: result });
  } catch (error) {
    if (error instanceof z.ZodError) {
      res
        .status(400)
        .json({ success: false, message: error.errors[0].message });
      return;
    }
    console.error("Create dish error:", error);
    res.status(500).json({ success: false, message: "创建菜品失败" });
  }
});

// 更新菜品 (需登录，事务保护)
router.put("/:id", authMiddleware, (req: AuthRequest, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    const data = dishSchema.parse(req.body);

    const existing = db
      .select()
      .from(dishes)
      .where(eq(dishes.id, id))
      .get();

    if (!existing) {
      res.status(404).json({ success: false, message: "菜品不存在" });
      return;
    }

    if (existing.user_id !== req.userId) {
      res.status(403).json({ success: false, message: "只能修改自己发布的菜品" });
      return;
    }

    const sqlite = getRawDb();

    const updateDish = sqlite.transaction(() => {
      db.update(dishes)
        .set({
          name: data.name,
          description: data.description,
          image_url: data.image_url,
          category_id: data.category_id,
          cook_time: data.cook_time,
          difficulty: data.difficulty,
          servings: data.servings,
          updated_at: new Date().toISOString(),
        })
        .where(eq(dishes.id, id))
        .run();

      db.delete(steps).where(eq(steps.dish_id, id)).run();
      if (data.steps && data.steps.length > 0) {
        db.insert(steps)
          .values(
            data.steps.map((step, index) => ({
              dish_id: id,
              step_number: index + 1,
              description: step.description,
              image_url: step.image_url,
            }))
          )
          .run();
      }

      db.delete(dish_ingredients)
        .where(eq(dish_ingredients.dish_id, id))
        .run();
      if (data.ingredient_ids && data.ingredient_ids.length > 0) {
        db.insert(dish_ingredients)
          .values(
            data.ingredient_ids.map((ing) => ({
              dish_id: id,
              ingredient_id: ing.ingredient_id,
              amount: ing.amount,
              unit: ing.unit,
            }))
          )
          .run();
      }

      db.delete(tags).where(eq(tags.dish_id, id)).run();
      if (data.tag_names && data.tag_names.length > 0) {
        db.insert(tags)
          .values(
            data.tag_names.map((name) => ({
              dish_id: id,
              name,
            }))
          )
          .run();
      }
    });

    updateDish();
    res.json({ success: true, data: { id } });
  } catch (error) {
    if (error instanceof z.ZodError) {
      res
        .status(400)
        .json({ success: false, message: error.errors[0].message });
      return;
    }
    console.error("Update dish error:", error);
    res.status(500).json({ success: false, message: "更新菜品失败" });
  }
});

// 删除菜品 (需登录，只能删除自己的)
router.delete("/:id", authMiddleware, (req: AuthRequest, res: Response) => {
  try {
    const id = parseInt(req.params.id);

    const existing = db
      .select()
      .from(dishes)
      .where(eq(dishes.id, id))
      .get();

    if (!existing) {
      res.status(404).json({ success: false, message: "菜品不存在" });
      return;
    }

    if (existing.user_id !== req.userId) {
      res.status(403).json({ success: false, message: "只能删除自己发布的菜品" });
      return;
    }

    db.delete(dishes).where(eq(dishes.id, id)).run();

    res.json({ success: true, message: "删除成功" });
  } catch (error) {
    console.error("Delete dish error:", error);
    res.status(500).json({ success: false, message: "删除菜品失败" });
  }
});

export default router;
