import multer from "multer";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";
import sharp from "sharp";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const uploadDir = path.join(__dirname, "../../uploads");

if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.memoryStorage();

const fileFilter = (
  _req: Express.Request,
  file: Express.Multer.File,
  cb: multer.FileFilterCallback
) => {
  const allowedTypes = ["image/jpeg", "image/png", "image/gif", "image/webp"];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("只允许上传图片文件 (jpg, png, gif, webp)"));
  }
};

export const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024,
  },
});

export async function compressAndSave(
  file: Express.Multer.File
): Promise<string> {
  const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
  const filename = `${uniqueSuffix}.webp`;
  const filepath = path.join(uploadDir, filename);

  await sharp(file.buffer)
    .resize(1920, 1080, { fit: "inside", withoutEnlargement: true })
    .webp({ quality: 80 })
    .toFile(filepath);

  return filename;
}
