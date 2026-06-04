import express from "express";
import cors from "cors";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import { config } from "./config.js";
import { authLimiter, uploadLimiter } from "./middleware/rateLimit.js";
import authRoutes from "./routes/auth.js";
import dishRoutes from "./routes/dishes.js";
import userRoutes from "./routes/users.js";
import favoriteRoutes from "./routes/favorites.js";
import menuRoutes from "./routes/menu.js";
import commentRoutes from "./routes/comments.js";
import userIngredientRoutes from "./routes/userIngredients.js";
import optionRoutes from "./routes/options.js";
import uploadRoutes from "./routes/upload.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();

app.use(cors());
app.use(express.json());

// 静态文件服务 - 上传的图片
app.use("/uploads", express.static(path.join(__dirname, "../uploads")));

// API 路由
app.use("/api/auth", authLimiter, authRoutes);
app.use("/api/dishes", dishRoutes);
app.use("/api/users", userRoutes);
app.use("/api/favorites", favoriteRoutes);
app.use("/api/menu", menuRoutes);
app.use("/api/comments", commentRoutes);
app.use("/api/user-ingredients", userIngredientRoutes);
app.use("/api", optionRoutes);
app.use("/api/upload", uploadLimiter, uploadRoutes);

// 健康检查
app.get("/api/health", (_req, res) => {
  res.json({ success: true, data: { status: "ok", timestamp: new Date().toISOString() } });
});

// 生产模式下托管前端静态文件
const clientDist = path.join(__dirname, "../../client/dist");
if (fs.existsSync(clientDist)) {
  app.use(express.static(clientDist));
  app.get("*", (_req, res) => {
    res.sendFile(path.join(clientDist, "index.html"));
  });
}

// 错误处理
app.use(
  (
    err: Error,
    _req: express.Request,
    res: express.Response,
    _next: express.NextFunction
  ) => {
    console.error("Unhandled error:", err);
    res.status(500).json({ success: false, message: "服务器内部错误" });
  }
);

app.listen(config.port, () => {
  console.log(`Server running on http://localhost:${config.port}`);
});

export default app;
