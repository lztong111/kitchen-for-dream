import { db, getRawDb } from "./index.js";
import { dishes } from "./schema.js";
import { eq } from "drizzle-orm";
import https from "https";
import http from "http";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const uploadsDir = path.join(__dirname, "../../uploads");

if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// 分类对应的 Unsplash 搜索关键词
const CATEGORY_SEARCH: Record<number, string[]> = {
  17: ["cold-dish", "salad", "appetizer"],
  18: ["chinese-food", "stir-fry", "wok"],
  19: ["soup", "broth", "stew"],
  20: ["rice", "noodles", "staple"],
  21: ["noodles", "pasta", "dumplings"],
  22: ["dessert", "cake", "sweet"],
  23: ["tea", "drink", "juice"],
  24: ["bbq", "grill", "roast"],
  25: ["chicken", "poultry"],
  26: ["fish", "seafood"],
  27: ["beef", "steak"],
  28: ["pork", "bacon"],
  29: ["lamb", "mutton"],
  30: ["shrimp", "lobster"],
  31: ["vegetables", "greens"],
  32: ["tofu", "bean-curd"],
  33: ["healthy-food", "diet", "salad"],
};

// 备用图片 URL（Pexels 免费图片）
const FALLBACK_IMAGES: Record<number, string[]> = {
  17: [
    "https://images.pexels.com/photos/1095550/pexels-photo-1095550.jpeg?auto=compress&cs=tinysrgb&w=800",
    "https://images.pexels.com/photos/1213710/pexels-photo-1213710.jpeg?auto=compress&cs=tinysrgb&w=800",
    "https://images.pexels.com/photos/1536868/pexels-photo-1536868.jpeg?auto=compress&cs=tinysrgb&w=800",
  ],
  18: [
    "https://images.pexels.com/photos/2641886/pexels-photo-2641886.jpeg?auto=compress&cs=tinysrgb&w=800",
    "https://images.pexels.com/photos/2347311/pexels-photo-2347311.jpeg?auto=compress&cs=tinysrgb&w=800",
    "https://images.pexels.com/photos/1624487/pexels-photo-1624487.jpeg?auto=compress&cs=tinysrgb&w=800",
  ],
  19: [
    "https://images.pexels.com/photos/539451/pexels-photo-539451.jpeg?auto=compress&cs=tinysrgb&w=800",
    "https://images.pexels.com/photos/1731535/pexels-photo-1731535.jpeg?auto=compress&cs=tinysrgb&w=800",
    "https://images.pexels.com/photos/884600/pexels-photo-884600.jpeg?auto=compress&cs=tinysrgb&w=800",
  ],
  20: [
    "https://images.pexels.com/photos/723198/pexels-photo-723198.jpeg?auto=compress&cs=tinysrgb&w=800",
    "https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg?auto=compress&cs=tinysrgb&w=800",
    "https://images.pexels.com/photos/1640774/pexels-photo-1640774.jpeg?auto=compress&cs=tinysrgb&w=800",
  ],
  21: [
    "https://images.pexels.com/photos/884600/pexels-photo-884600.jpeg?auto=compress&cs=tinysrgb&w=800",
    "https://images.pexels.com/photos/1731535/pexels-photo-1731535.jpeg?auto=compress&cs=tinysrgb&w=800",
    "https://images.pexels.com/photos/539451/pexels-photo-539451.jpeg?auto=compress&cs=tinysrgb&w=800",
  ],
  22: [
    "https://images.pexels.com/photos/291528/pexels-photo-291528.jpeg?auto=compress&cs=tinysrgb&w=800",
    "https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg?auto=compress&cs=tinysrgb&w=800",
    "https://images.pexels.com/photos/1640774/pexels-photo-1640774.jpeg?auto=compress&cs=tinysrgb&w=800",
  ],
  23: [
    "https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg?auto=compress&cs=tinysrgb&w=800",
    "https://images.pexels.com/photos/1640774/pexels-photo-1640774.jpeg?auto=compress&cs=tinysrgb&w=800",
    "https://images.pexels.com/photos/1640772/pexels-photo-1640772.jpeg?auto=compress&cs=tinysrgb&w=800",
  ],
  24: [
    "https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg?auto=compress&cs=tinysrgb&w=800",
    "https://images.pexels.com/photos/1640774/pexels-photo-1640774.jpeg?auto=compress&cs=tinysrgb&w=800",
    "https://images.pexels.com/photos/1640772/pexels-photo-1640772.jpeg?auto=compress&cs=tinysrgb&w=800",
  ],
  25: [
    "https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg?auto=compress&cs=tinysrgb&w=800",
    "https://images.pexels.com/photos/1640774/pexels-photo-1640774.jpeg?auto=compress&cs=tinysrgb&w=800",
    "https://images.pexels.com/photos/1640772/pexels-photo-1640772.jpeg?auto=compress&cs=tinysrgb&w=800",
  ],
  26: [
    "https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg?auto=compress&cs=tinysrgb&w=800",
    "https://images.pexels.com/photos/1640774/pexels-photo-1640774.jpeg?auto=compress&cs=tinysrgb&w=800",
    "https://images.pexels.com/photos/1640772/pexels-photo-1640772.jpeg?auto=compress&cs=tinysrgb&w=800",
  ],
  27: [
    "https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg?auto=compress&cs=tinysrgb&w=800",
    "https://images.pexels.com/photos/1640774/pexels-photo-1640774.jpeg?auto=compress&cs=tinysrgb&w=800",
    "https://images.pexels.com/photos/1640772/pexels-photo-1640772.jpeg?auto=compress&cs=tinysrgb&w=800",
  ],
  28: [
    "https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg?auto=compress&cs=tinysrgb&w=800",
    "https://images.pexels.com/photos/1640774/pexels-photo-1640774.jpeg?auto=compress&cs=tinysrgb&w=800",
    "https://images.pexels.com/photos/1640772/pexels-photo-1640772.jpeg?auto=compress&cs=tinysrgb&w=800",
  ],
  29: [
    "https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg?auto=compress&cs=tinysrgb&w=800",
    "https://images.pexels.com/photos/1640774/pexels-photo-1640774.jpeg?auto=compress&cs=tinysrgb&w=800",
    "https://images.pexels.com/photos/1640772/pexels-photo-1640772.jpeg?auto=compress&cs=tinysrgb&w=800",
  ],
  30: [
    "https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg?auto=compress&cs=tinysrgb&w=800",
    "https://images.pexels.com/photos/1640774/pexels-photo-1640774.jpeg?auto=compress&cs=tinysrgb&w=800",
    "https://images.pexels.com/photos/1640772/pexels-photo-1640772.jpeg?auto=compress&cs=tinysrgb&w=800",
  ],
  31: [
    "https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg?auto=compress&cs=tinysrgb&w=800",
    "https://images.pexels.com/photos/1640774/pexels-photo-1640774.jpeg?auto=compress&cs=tinysrgb&w=800",
    "https://images.pexels.com/photos/1640772/pexels-photo-1640772.jpeg?auto=compress&cs=tinysrgb&w=800",
  ],
  32: [
    "https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg?auto=compress&cs=tinysrgb&w=800",
    "https://images.pexels.com/photos/1640774/pexels-photo-1640774.jpeg?auto=compress&cs=tinysrgb&w=800",
    "https://images.pexels.com/photos/1640772/pexels-photo-1640772.jpeg?auto=compress&cs=tinysrgb&w=800",
  ],
  33: [
    "https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg?auto=compress&cs=tinysrgb&w=800",
    "https://images.pexels.com/photos/1640774/pexels-photo-1640774.jpeg?auto=compress&cs=tinysrgb&w=800",
    "https://images.pexels.com/photos/1640772/pexels-photo-1640772.jpeg?auto=compress&cs=tinysrgb&w=800",
  ],
};

function downloadImage(url: string, filepath: string): Promise<boolean> {
  return new Promise((resolve) => {
    const doRequest = (requestUrl: string, depth = 0) => {
      if (depth > 5) return resolve(false);
      const mod = requestUrl.startsWith("https") ? https : http;
      mod.get(requestUrl, { timeout: 10000 }, (response) => {
        if (response.statusCode === 301 || response.statusCode === 302) {
          doRequest(response.headers.location!, depth + 1);
          return;
        }
        if (response.statusCode !== 200) return resolve(false);
        const chunks: Buffer[] = [];
        response.on("data", (chunk) => chunks.push(chunk));
        response.on("end", () => {
          const buffer = Buffer.concat(chunks);
          if (buffer.length > 1000) {
            fs.writeFileSync(filepath, buffer);
            resolve(true);
          } else {
            resolve(false);
          }
        });
        response.on("error", () => resolve(false));
      }).on("error", () => resolve(false));
    };
    doRequest(url);
  });
}

async function downloadAllImages() {
  console.log("=== 下载菜品封面图 ===\n");
  const allDishes = db.select().from(dishes).all();
  console.log(`Total dishes: ${allDishes.length}`);

  let downloaded = 0;
  let skipped = 0;
  let failed = 0;

  for (const dish of allDishes) {
    const filename = `dish-${dish.id}.jpg`;
    const filepath = path.join(uploadsDir, filename);

    if (fs.existsSync(filepath) && fs.statSync(filepath).size > 1000) {
      skipped++;
      continue;
    }

    const categoryId = dish.category_id || 17;
    const searchTerms = CATEGORY_SEARCH[categoryId] || ["chinese-food"];
    const searchTerm = searchTerms[dish.id % searchTerms.length];
    const unsplashUrl = `https://source.unsplash.com/800x600/?${encodeURIComponent(searchTerm)}`;

    let success = await downloadImage(unsplashUrl, filepath);
    if (!success) {
      const fallbacks = FALLBACK_IMAGES[categoryId] || FALLBACK_IMAGES[17];
      success = await downloadImage(fallbacks[dish.id % fallbacks.length], filepath);
    }

    if (success) {
      db.update(dishes).set({ image_url: `/uploads/${filename}` }).where(eq(dishes.id, dish.id)).run();
      downloaded++;
    } else {
      failed++;
    }

    const total = downloaded + skipped + failed;
    if (total % 50 === 0) {
      console.log(`Progress: ${total}/${allDishes.length} (downloaded: ${downloaded}, skipped: ${skipped}, failed: ${failed})`);
    }

    await new Promise((r) => setTimeout(r, 200));
  }

  console.log(`\n=== 完成 ===`);
  console.log(`  已下载: ${downloaded}`);
  console.log(`  已跳过: ${skipped}`);
  console.log(`  失败: ${failed}`);
}

downloadAllImages().catch(console.error);
