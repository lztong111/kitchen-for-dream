import { db, getRawDb } from "./index.js";
import { dishes, tags } from "./schema.js";
import { eq } from "drizzle-orm";

const CATEGORY_KEYWORDS: Record<number, string[]> = {
  25: ["鸡", "鸡肉", "鸡翅", "鸡腿", "鸡胸", "鸡丁", "宫保鸡", "白切鸡", "口水鸡", "可乐鸡", "烤鸡", "炸鸡", "鸡汤"],
  26: ["鱼", "鲈鱼", "鲫鱼", "草鱼", "鳕鱼", "三文鱼", "清蒸鱼", "红烧鱼", "酸菜鱼", "水煮鱼", "糖醋鱼", "烤鱼"],
  27: ["牛", "牛肉", "牛腩", "牛排", "牛腱", "肥牛", "牛肉面", "红烧牛肉", "咖喱牛"],
  28: ["猪", "猪肉", "排骨", "五花肉", "里脊", "猪蹄", "猪耳", "红烧肉", "糖醋排骨", "回锅肉", "东坡肉", "梅菜扣肉"],
  29: ["羊", "羊肉", "羊排", "羊腿", "羊肉串", "羊肉汤", "葱爆羊肉", "涮羊肉"],
  30: ["虾", "蟹", "海鲜", "龙虾", "蛤", "蚝", "牡蛎", "扇贝", "鱿鱼", "墨鱼", "海参", "鲍鱼", "清蒸虾", "白灼虾", "油焖虾"],
  19: ["汤", "羹", "粥", "炖", "煲汤", "排骨汤", "鸡汤", "鱼汤", "蛋花汤", "紫菜汤", "酸辣汤", "味噌汤", "罗宋汤", "绿豆汤", "红豆汤"],
  21: ["面", "面条", "拉面", "拌面", "炒面", "汤面", "凉面", "刀削面", "炸酱面", "担担面", "热干面", "乌冬面", "意面", "冷面", "烩面", "油泼面", "臊子面", "焖面", "锅盖面", "奥灶面", "云吞面", "葱油拌面", "片儿川"],
  20: ["饭", "米", "炒饭", "盖饭", "拌饭", "煲仔饭", "咖喱饭", "卤肉饭", "蛋炒饭", "扬州炒饭", "饺子", "馄饨", "包子", "馒头", "饼", "煎饼", "手抓饼", "葱油饼", "馅饼", "春卷", "油条", "锅贴", "烧麦", "肠粉", "豆皮", "年糕", "米粉", "河粉", "炒粉", "糯米", "粽子"],
  17: ["凉拌", "凉菜", "沙拉", "冷盘", "皮蛋", "拍黄瓜", "凉拌黄瓜", "凉拌木耳", "蒜泥", "口水", "白斩", "白切", "凉拌豆腐", "凉拌海带", "凉拌菠菜", "凉拌豆芽", "凉拌藕", "凉拌苦瓜", "凉拌莴笋", "凉拌金针菇", "凉拌腐竹", "凉拌鸡丝", "凉拌牛肉", "老醋花生", "夫妻肺片", "红油"],
  31: ["蔬菜", "青菜", "白菜", "菠菜", "生菜", "西兰花", "花菜", "茄子", "土豆", "番茄炒蛋", "西红柿炒蛋", "青椒", "干煸", "地三鲜", "蚝油生菜", "醋溜白菜", "清炒", "素菜", "虎皮青椒", "烧茄子", "红烧茄子"],
  32: ["豆腐", "豆干", "豆皮", "腐竹", "豆浆", "麻婆豆腐", "家常豆腐", "红烧豆腐", "豆腐汤", "豆腐羹"],
  24: ["烤", "烧烤", "烤肉", "烤串", "烤翅", "烤鱼", "烤虾", "烤鸡", "烤羊", "烤牛"],
  22: ["蛋糕", "甜点", "饼干", "面包", "布丁", "冰淇淋", "慕斯", "提拉米苏", "蛋挞", "马卡龙", "曲奇", "月饼", "汤圆", "麻薯", "铜锣烧", "泡芙", "华夫饼", "松饼", "千层", "雪媚娘", "蛋黄酥", "绿豆糕", "凤梨酥", "驴打滚", "桃酥", "桂花糕", "花生糖", "芝麻糖", "糖葫芦", "青团", "雪花酥", "戚风蛋糕", "蛋糕卷"],
  23: ["茶", "咖啡", "奶茶", "果汁", "饮料", "柠檬水", "酸梅汤", "豆浆", "椰汁", "西瓜汁", "芒果汁", "橙汁", "玉米汁", "红枣茶", "菊花茶", "柚子茶", "姜茶", "百香果", "葡萄汁", "草莓奶昔", "香蕉奶昔", "抹茶", "热巧克力", "洛神花茶", "蜂蜜水", "柠檬茶", "杨梅汁", "杏仁露", "山楂汁"],
  33: ["减脂", "低卡", "低脂", "沙拉", "水煮鸡胸", "清蒸鱼", "白灼虾", "蒸蛋", "蔬菜沙拉", "鸡胸肉沙拉"],
};

function classifyDish(name: string, existingTags: string[]): number {
  const fullText = `${name} ${existingTags.join(" ")}`.toLowerCase();
  const priorities = [25, 26, 27, 28, 29, 30, 17, 19, 21, 20, 24, 31, 32, 22, 23, 33];
  for (const catId of priorities) {
    for (const kw of CATEGORY_KEYWORDS[catId] || []) {
      if (fullText.includes(kw.toLowerCase())) return catId;
    }
  }
  return 18;
}

function reclassifyDishes() {
  console.log("=== 重新分类菜品 ===\n");
  const allDishes = db.select().from(dishes).all();
  console.log(`Total dishes: ${allDishes.length}`);

  const sqlite = getRawDb();
  sqlite.pragma("foreign_keys = OFF");

  let updated = 0;
  const counts: Record<number, number> = {};

  for (const dish of allDishes) {
    const dishTags = db.select().from(tags).where(eq(tags.dish_id, dish.id)).all().map(t => t.name);
    const newCat = classifyDish(dish.name, dishTags);
    if (newCat !== dish.category_id) {
      db.update(dishes).set({ category_id: newCat }).where(eq(dishes.id, dish.id)).run();
      updated++;
    }
    counts[newCat] = (counts[newCat] || 0) + 1;
  }

  sqlite.pragma("foreign_keys = ON");
  console.log(`\nUpdated ${updated} dishes\n`);

  const names: Record<number, string> = {
    17: "凉菜", 18: "热菜", 19: "汤羹", 20: "主食", 21: "面食",
    22: "甜点", 23: "饮品", 24: "烧烤", 25: "鸡肉", 26: "鱼肉",
    27: "牛肉", 28: "猪肉", 29: "羊肉", 30: "海鲜", 31: "蔬菜",
    32: "豆制品", 33: "减脂餐",
  };

  console.log("分类统计:");
  for (const [id, count] of Object.entries(counts).sort((a, b) => Number(a[0]) - Number(b[0]))) {
    console.log(`  ${names[Number(id)] || id}: ${count} 道`);
  }
}

reclassifyDishes();
