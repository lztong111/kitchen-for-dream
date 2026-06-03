import { Router, Response } from "express";
import { upload, compressAndSave } from "../middleware/upload.js";
import { authMiddleware, AuthRequest } from "../middleware/auth.js";

const router = Router();

router.post(
  "/",
  authMiddleware,
  upload.single("file"),
  async (req: AuthRequest, res: Response) => {
    try {
      if (!req.file) {
        res.status(400).json({ success: false, message: "请选择要上传的文件" });
        return;
      }

      const filename = await compressAndSave(req.file);
      const url = `/uploads/${filename}`;

      res.json({
        success: true,
        data: { url, filename },
      });
    } catch (error) {
      console.error("Upload error:", error);
      res.status(500).json({ success: false, message: "上传失败" });
    }
  }
);

export default router;
