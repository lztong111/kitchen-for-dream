import { Router, Response } from "express";
import { upload } from "../middleware/upload.js";
import { authMiddleware, AuthRequest } from "../middleware/auth.js";

const router = Router();

router.post(
  "/",
  authMiddleware,
  upload.single("file"),
  (req: AuthRequest, res: Response) => {
    try {
      if (!req.file) {
        res.status(400).json({ success: false, message: "请选择要上传的文件" });
        return;
      }

      const url = `/uploads/${req.file.filename}`;

      res.json({
        success: true,
        data: { url, filename: req.file.filename },
      });
    } catch (error) {
      console.error("Upload error:", error);
      res.status(500).json({ success: false, message: "上传失败" });
    }
  }
);

export default router;
