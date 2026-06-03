import { Router, Response } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { db } from "../db/index.js";
import { users } from "../db/schema.js";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { AuthRequest, authMiddleware } from "../middleware/auth.js";

const router = Router();
const JWT_SECRET = process.env.JWT_SECRET || "kitchan-secret-key";

const registerSchema = z.object({
  username: z.string().min(2).max(20),
  password: z.string().min(6).max(50),
});

const loginSchema = z.object({
  username: z.string(),
  password: z.string(),
});

router.post("/register", async (req: AuthRequest, res: Response) => {
  try {
    const { username, password } = registerSchema.parse(req.body);

    const existing = db
      .select()
      .from(users)
      .where(eq(users.username, username))
      .get();

    if (existing) {
      res.status(400).json({ success: false, message: "用户名已存在" });
      return;
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const result = db
      .insert(users)
      .values({
        username,
        password: hashedPassword,
      })
      .returning()
      .get();

    const token = jwt.sign({ userId: result.id }, JWT_SECRET, {
      expiresIn: "7d",
    });

    res.json({
      success: true,
      data: {
        token,
        user: {
          id: result.id,
          username: result.username,
          avatar: result.avatar,
          created_at: result.created_at,
        },
      },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      res
        .status(400)
        .json({ success: false, message: error.errors[0].message });
      return;
    }
    res.status(500).json({ success: false, message: "注册失败" });
  }
});

router.post("/login", async (req: AuthRequest, res: Response) => {
  try {
    const { username, password } = loginSchema.parse(req.body);

    const user = db
      .select()
      .from(users)
      .where(eq(users.username, username))
      .get();

    if (!user) {
      res.status(401).json({ success: false, message: "用户名或密码错误" });
      return;
    }

    const valid = await bcrypt.compare(password, user.password);

    if (!valid) {
      res.status(401).json({ success: false, message: "用户名或密码错误" });
      return;
    }

    const token = jwt.sign({ userId: user.id }, JWT_SECRET, {
      expiresIn: "7d",
    });

    res.json({
      success: true,
      data: {
        token,
        user: {
          id: user.id,
          username: user.username,
          avatar: user.avatar,
          created_at: user.created_at,
        },
      },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      res
        .status(400)
        .json({ success: false, message: error.errors[0].message });
      return;
    }
    res.status(500).json({ success: false, message: "登录失败" });
  }
});

router.get("/me", authMiddleware, (req: AuthRequest, res: Response) => {
  const user = db
    .select()
    .from(users)
    .where(eq(users.id, req.userId!))
    .get();

  if (!user) {
    res.status(404).json({ success: false, message: "用户不存在" });
    return;
  }

  res.json({
    success: true,
    data: {
      id: user.id,
      username: user.username,
      avatar: user.avatar,
      created_at: user.created_at,
    },
  });
});

export default router;
