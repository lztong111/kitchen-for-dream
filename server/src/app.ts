import express from "express";
import cors from "cors";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import authRoutes from "./routes/auth.js";
import dishRoutes from "./routes/dishes.js";
import optionRoutes from "./routes/options.js";
import uploadRoutes from "./routes/upload.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = process.env.PORT || 8888;

app.use(cors());
app.use(express.json());

// 静态文件服务 - 上传的图片
app.use("/uploads", express.static(path.join(__dirname, "../uploads")));

// API 路由
app.use("/api/auth", authRoutes);
app.use("/api/dishes", dishRoutes);
app.use("/api", optionRoutes);
app.use("/api/upload", uploadRoutes);

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

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

export default app;
