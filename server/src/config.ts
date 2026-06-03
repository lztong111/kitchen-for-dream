import "dotenv/config";

const requiredEnvVars = ["JWT_SECRET"] as const;

for (const envVar of requiredEnvVars) {
  if (!process.env[envVar]) {
    console.error(`错误: 缺少必需的环境变量 ${envVar}`);
    process.exit(1);
  }
}

export const config = {
  jwtSecret: process.env.JWT_SECRET!,
  port: parseInt(process.env.PORT || "8888", 10),
  dbPath: process.env.DB_PATH || undefined,
} as const;
