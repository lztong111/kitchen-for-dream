import rateLimit from "express-rate-limit";

export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: { success: false, message: "请求过于频繁，请15分钟后再试" },
  standardHeaders: true,
  legacyHeaders: false,
});

export const uploadLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 10,
  message: { success: false, message: "上传过于频繁，请稍后再试" },
  standardHeaders: true,
  legacyHeaders: false,
});
