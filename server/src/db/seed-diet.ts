import { db, getRawDb } from "./index.js";
import { dishes, steps, dish_ingredients, tags, users, categories } from "./schema.js";
import { eq, sql } from "drizzle-orm";
import bcrypt from "bcryptjs";

// 减脂餐分类 ID = 17
const DIET_CAT_ID = 17;

// 获取或创建系统用户
let systemUser = db.select().from(users).where(eq(users.username, "system")).get();
if (!systemUser) {
  console.log("System user not found, creating...");
  const hashedPassword = await bcrypt.hash("system123456", 10);
  const result = db.insert(users).values({
    username: "system",
    password: hashedPassword,
    avatar: null,
  }).returning().get();
  systemUser = result;
  console.log("Created system user, id:", systemUser.id);
}
const userId = systemUser.id;

// 食材 ID 映射
const I: Record<string, number> = {
  猪肉: 1, 牛肉: 2, 鸡肉: 3, 羊肉: 4, 鱼: 5, 虾: 6, 螃蟹: 7,
  豆腐: 8, 鸡蛋: 9, 土豆: 10, 白菜: 11, 青椒: 12, 西红柿: 13,
  黄瓜: 14, 胡萝卜: 15, 洋葱: 16, 大蒜: 17, 生姜: 18, 葱: 19,
  酱油: 20, 醋: 21, 盐: 22, 糖: 23, 料酒: 24, 食用油: 25,
  大米: 26, 面粉: 27, 面条: 28,
};

const M = (id: number, amount: string, unit: string) => ({ id, amount, unit });

interface DishData {
  name: string;
  desc: string;
  time: number;
  diff: number;
  serv: number;
  steps: string[];
  ings: { id: number; amount: string; unit: string }[];
  tags: string[];
}

const dietDishes: DishData[] = [
  {
    name: "鸡胸肉沙拉",
    desc: "高蛋白低脂的经典减脂餐",
    time: 15, diff: 1, serv: 1,
    steps: ["鸡胸肉煮熟撕成丝", "生菜黄瓜西红柿切好", "加橄榄油和柠檬汁拌匀"],
    ings: [M(I.鸡肉, "150", "g"), M(I.黄瓜, "1", "根"), M(I.西红柿, "1", "个")],
    tags: ["减脂", "高蛋白", "沙拉"],
  },
  {
    name: "水煮鸡胸肉",
    desc: "最简单的高蛋白低脂做法",
    time: 20, diff: 1, serv: 1,
    steps: ["鸡胸肉用料酒生姜腌制10分钟", "冷水下锅煮15分钟", "切片蘸酱油食用"],
    ings: [M(I.鸡肉, "200", "g"), M(I.生姜, "3", "片"), M(I.料酒, "1", "勺")],
    tags: ["减脂", "高蛋白", "简单"],
  },
  {
    name: "清蒸鱼",
    desc: "低脂高蛋白的清蒸做法",
    time: 20, diff: 1, serv: 2,
    steps: ["鱼处理干净划刀", "放姜丝葱段蒸10分钟", "淋上蒸鱼豉油"],
    ings: [M(I.鱼, "1", "条"), M(I.生姜, "5", "片"), M(I.葱, "2", "根"), M(I.酱油, "2", "勺")],
    tags: ["减脂", "清蒸", "低脂"],
  },
  {
    name: "白灼虾",
    desc: "原汁原味的低脂虾做法",
    time: 10, diff: 1, serv: 2,
    steps: ["虾去虾线洗净", "水烧开放入虾煮至变红", "蘸姜醋汁食用"],
    ings: [M(I.虾, "300", "g"), M(I.生姜, "3", "片"), M(I.醋, "2", "勺")],
    tags: ["减脂", "快手", "高蛋白"],
  },
  {
    name: "西兰花炒鸡胸",
    desc: "高纤低脂的减脂搭配",
    time: 15, diff: 1, serv: 1,
    steps: ["鸡胸肉切丁腌制", "西兰花焯水", "少油快炒"],
    ings: [M(I.鸡肉, "150", "g"), M(I.大蒜, "3", "瓣"), M(I.盐, "1", "小勺")],
    tags: ["减脂", "高蛋白", "快手"],
  },
  {
    name: "番茄鸡胸肉",
    desc: "酸甜开胃的低脂菜",
    time: 20, diff: 1, serv: 2,
    steps: ["鸡胸肉切块腌制", "番茄炒出汁", "放入鸡胸肉翻炒"],
    ings: [M(I.鸡肉, "200", "g"), M(I.西红柿, "2", "个"), M(I.大蒜, "3", "瓣")],
    tags: ["减脂", "开胃", "低脂"],
  },
  {
    name: "凉拌鸡丝黄瓜",
    desc: "清爽低脂的凉菜",
    time: 15, diff: 1, serv: 1,
    steps: ["鸡胸肉煮熟撕丝", "黄瓜切丝", "加醋和少许辣椒油拌匀"],
    ings: [M(I.鸡肉, "150", "g"), M(I.黄瓜, "1", "根"), M(I.醋, "2", "勺")],
    tags: ["减脂", "凉菜", "低脂"],
  },
  {
    name: "清炒虾仁",
    desc: "高蛋白低脂快手菜",
    time: 10, diff: 1, serv: 1,
    steps: ["虾仁去虾线", "少油热锅", "快炒虾仁加盐调味"],
    ings: [M(I.虾, "200", "g"), M(I.大蒜, "3", "瓣"), M(I.料酒, "1", "勺")],
    tags: ["减脂", "快手", "高蛋白"],
  },
  {
    name: "鸡蛋羹",
    desc: "嫩滑营养的低脂蒸蛋",
    time: 15, diff: 1, serv: 1,
    steps: ["鸡蛋打散加温水1:1.5", "过滤气泡", "蒸10分钟淋酱油"],
    ings: [M(I.鸡蛋, "2", "个"), M(I.酱油, "1", "勺"), M(I.香油, "少许", "")],
    tags: ["减脂", "蒸菜", "简单"],
  },
  {
    name: "豆腐蔬菜汤",
    desc: "低卡饱腹的蔬菜汤",
    time: 15, diff: 1, serv: 2,
    steps: ["豆腐切块", "蔬菜切丁", "煮开加盐调味"],
    ings: [M(I.豆腐, "1", "块"), M(I.白菜, "100", "g"), M(I.胡萝卜, "1", "根")],
    tags: ["减脂", "汤品", "低卡"],
  },
  {
    name: "鸡胸肉卷",
    desc: "便携的高蛋白减脂餐",
    time: 25, diff: 2, serv: 1,
    steps: ["鸡胸肉片薄", "铺上生菜和黄瓜", "卷起用牙签固定"],
    ings: [M(I.鸡肉, "200", "g"), M(I.黄瓜, "1", "根"), M(I.胡萝卜, "1", "根")],
    tags: ["减脂", "便当", "高蛋白"],
  },
  {
    name: "蒸鳕鱼",
    desc: "低脂鲜美的鳕鱼做法",
    time: 15, diff: 1, serv: 1,
    steps: ["鳕鱼放姜片", "蒸8分钟", "淋上少许酱油"],
    ings: [M(I.鱼, "150", "g"), M(I.生姜, "3", "片"), M(I.酱油, "1", "勺")],
    tags: ["减脂", "蒸菜", "低脂"],
  },
  {
    name: "牛肉西兰花",
    desc: "高蛋白高纤的减脂搭配",
    time: 20, diff: 1, serv: 2,
    steps: ["牛肉切片腌制", "西兰花焯水", "少油快炒"],
    ings: [M(I.牛肉, "150", "g"), M(I.大蒜, "3", "瓣"), M(I.酱油, "1", "勺")],
    tags: ["减脂", "高蛋白", "快手"],
  },
  {
    name: "虾仁豆腐",
    desc: "高蛋白低脂的完美搭配",
    time: 15, diff: 1, serv: 2,
    steps: ["豆腐切块", "虾仁去虾线", "一起煮5分钟"],
    ings: [M(I.虾, "150", "g"), M(I.豆腐, "1", "块"), M(I.葱, "1", "根")],
    tags: ["减脂", "高蛋白", "低卡"],
  },
  {
    name: "凉拌木耳",
    desc: "高纤低卡的凉菜",
    time: 15, diff: 1, serv: 1,
    steps: ["木耳泡发焯水", "加蒜末醋拌匀"],
    ings: [M(I.大蒜, "3", "瓣"), M(I.醋, "2", "勺"), M(I.酱油, "1", "勺")],
    tags: ["减脂", "凉菜", "低卡"],
  },
  {
    name: "鸡蛋西红柿汤",
    desc: "低卡营养的快手汤",
    time: 10, diff: 1, serv: 1,
    steps: ["西红柿切块炒出汁", "加水煮开", "淋入蛋液"],
    ings: [M(I.西红柿, "1", "个"), M(I.鸡蛋, "1", "个"), M(I.葱, "1", "根")],
    tags: ["减脂", "汤品", "快手"],
  },
  {
    name: "清蒸鸡胸肉",
    desc: "原汁原味的低脂做法",
    time: 20, diff: 1, serv: 1,
    steps: ["鸡胸肉用料酒腌制", "放姜片蒸15分钟", "撕成丝食用"],
    ings: [M(I.鸡肉, "200", "g"), M(I.生姜, "3", "片"), M(I.料酒, "1", "勺")],
    tags: ["减脂", "蒸菜", "高蛋白"],
  },
  {
    name: "虾仁蔬菜沙拉",
    desc: "清爽的高蛋白沙拉",
    time: 15, diff: 1, serv: 1,
    steps: ["虾仁煮熟", "蔬菜切好", "加橄榄油柠檬汁拌匀"],
    ings: [M(I.虾, "150", "g"), M(I.黄瓜, "1", "根"), M(I.西红柿, "1", "个")],
    tags: ["减脂", "沙拉", "高蛋白"],
  },
  {
    name: "豆腐鸡蛋羹",
    desc: "双倍蛋白的蒸蛋",
    time: 15, diff: 1, serv: 1,
    steps: ["豆腐切小块", "鸡蛋打散加水", "放入豆腐蒸12分钟"],
    ings: [M(I.鸡蛋, "2", "个"), M(I.豆腐, "100", "g"), M(I.酱油, "1", "勺")],
    tags: ["减脂", "蒸菜", "高蛋白"],
  },
  {
    name: "牛肉番茄汤",
    desc: "暖胃低脂的牛肉汤",
    time: 30, diff: 1, serv: 2,
    steps: ["牛肉切块焯水", "番茄炒出汁", "一起炖煮20分钟"],
    ings: [M(I.牛肉, "200", "g"), M(I.西红柿, "2", "个"), M(I.洋葱, "半个", "")],
    tags: ["减脂", "汤品", "暖胃"],
  },
  {
    name: "鸡胸肉炒芹菜",
    desc: "高纤低脂的快手菜",
    time: 15, diff: 1, serv: 1,
    steps: ["鸡胸肉切丁腌制", "芹菜切段", "少油快炒"],
    ings: [M(I.鸡肉, "150", "g"), M(I.大蒜, "3", "瓣"), M(I.盐, "1", "小勺")],
    tags: ["减脂", "快手", "高纤维"],
  },
  {
    name: "清蒸虾",
    desc: "原汁原味的蒸虾",
    time: 10, diff: 1, serv: 1,
    steps: ["虾去虾线摆盘", "放姜片蒸8分钟", "蘸醋食用"],
    ings: [M(I.虾, "250", "g"), M(I.生姜, "3", "片"), M(I.醋, "2", "勺")],
    tags: ["减脂", "蒸菜", "快手"],
  },
  {
    name: "凉拌豆腐",
    desc: "清爽的低脂凉菜",
    time: 5, diff: 1, serv: 1,
    steps: ["豆腐切块", "淋上酱油醋", "撒上葱花"],
    ings: [M(I.豆腐, "1", "块"), M(I.酱油, "1", "勺"), M(I.醋, "1", "勺"), M(I.葱, "1", "根")],
    tags: ["减脂", "凉菜", "简单"],
  },
  {
    name: "鸡蛋炒虾仁",
    desc: "双倍蛋白的快手菜",
    time: 10, diff: 1, serv: 1,
    steps: ["虾仁去虾线", "鸡蛋打散", "一起快炒"],
    ings: [M(I.鸡蛋, "2", "个"), M(I.虾, "100", "g"), M(I.盐, "1", "小勺")],
    tags: ["减脂", "快手", "高蛋白"],
  },
  {
    name: "牛肉蔬菜卷",
    desc: "低碳水的牛肉卷",
    time: 20, diff: 2, serv: 1,
    steps: ["牛肉片薄", "铺上蔬菜", "卷起煎熟"],
    ings: [M(I.牛肉, "200", "g"), M(I.青椒, "1", "个"), M(I.胡萝卜, "1", "根")],
    tags: ["减脂", "低碳水", "创意"],
  },
  {
    name: "鸡胸肉丸子汤",
    desc: "低脂高蛋白的丸子汤",
    time: 25, diff: 2, serv: 2,
    steps: ["鸡胸肉剁成泥", "搓成丸子", "煮汤加蔬菜"],
    ings: [M(I.鸡肉, "200", "g"), M(I.白菜, "100", "g"), M(I.葱, "1", "根")],
    tags: ["减脂", "汤品", "高蛋白"],
  },
  {
    name: "虾仁豆腐羹",
    desc: "滑嫩的高蛋白羹汤",
    time: 15, diff: 1, serv: 1,
    steps: ["豆腐切小块", "虾仁去虾线", "煮开勾芡"],
    ings: [M(I.虾, "100", "g"), M(I.豆腐, "1", "块"), M(I.鸡蛋, "1", "个")],
    tags: ["减脂", "羹汤", "高蛋白"],
  },
  {
    name: "清炒时蔬",
    desc: "少油清炒的蔬菜",
    time: 10, diff: 1, serv: 1,
    steps: ["蔬菜洗净切段", "少油热锅", "大火快炒加盐"],
    ings: [M(I.白菜, "200", "g"), M(I.大蒜, "3", "瓣"), M(I.盐, "1", "小勺")],
    tags: ["减脂", "素食", "快手"],
  },
  {
    name: "鸡蛋蔬菜饼",
    desc: "无面粉的低碳水饼",
    time: 15, diff: 1, serv: 1,
    steps: ["蔬菜切碎", "鸡蛋打散混合", "少油煎熟"],
    ings: [M(I.鸡蛋, "2", "个"), M(I.胡萝卜, "1", "根"), M(I.青椒, "1", "个")],
    tags: ["减脂", "低碳水", "早餐"],
  },
  {
    name: "牛肉清汤",
    desc: "清淡的牛肉汤",
    time: 60, diff: 1, serv: 2,
    steps: ["牛肉切块焯水", "加姜片炖煮1小时", "加盐调味"],
    ings: [M(I.牛肉, "300", "g"), M(I.生姜, "5", "片"), M(I.盐, "1", "小勺")],
    tags: ["减脂", "汤品", "炖煮"],
  },
  {
    name: "鸡胸肉炒胡萝卜",
    desc: "高蛋白高维A的搭配",
    time: 15, diff: 1, serv: 1,
    steps: ["鸡胸肉切丁腌制", "胡萝卜切丁", "少油快炒"],
    ings: [M(I.鸡肉, "150", "g"), M(I.胡萝卜, "1", "根"), M(I.大蒜, "3", "瓣")],
    tags: ["减脂", "快手", "高蛋白"],
  },
  {
    name: "虾仁炒蛋",
    desc: "经典高蛋白快手菜",
    time: 10, diff: 1, serv: 1,
    steps: ["虾仁去虾线", "鸡蛋打散", "快炒至熟"],
    ings: [M(I.鸡蛋, "2", "个"), M(I.虾, "100", "g"), M(I.葱, "1", "根")],
    tags: ["减脂", "快手", "经典"],
  },
  {
    name: "凉拌鸡胸肉",
    desc: "撕成丝的凉拌鸡胸",
    time: 20, diff: 1, serv: 1,
    steps: ["鸡胸肉煮熟撕丝", "加黄瓜丝", "拌入调料"],
    ings: [M(I.鸡肉, "200", "g"), M(I.黄瓜, "1", "根"), M(I.醋, "1", "勺")],
    tags: ["减脂", "凉菜", "高蛋白"],
  },
  {
    name: "豆腐蔬菜沙拉",
    desc: "素食减脂沙拉",
    time: 10, diff: 1, serv: 1,
    steps: ["豆腐切块", "蔬菜切好", "拌入沙拉汁"],
    ings: [M(I.豆腐, "150", "g"), M(I.黄瓜, "1", "根"), M(I.西红柿, "1", "个")],
    tags: ["减脂", "沙拉", "素食"],
  },
  {
    name: "蒸鸡胸肉配蔬菜",
    desc: "一锅蒸的减脂餐",
    time: 25, diff: 1, serv: 1,
    steps: ["鸡胸肉腌制", "蔬菜切好摆盘", "一起蒸15分钟"],
    ings: [M(I.鸡肉, "200", "g"), M(I.胡萝卜, "1", "根"), M(I.青椒, "1", "个")],
    tags: ["减脂", "蒸菜", "一锅出"],
  },
  {
    name: "牛肉炒洋葱",
    desc: "提神增肌的搭配",
    time: 15, diff: 1, serv: 1,
    steps: ["牛肉切片腌制", "洋葱切丝", "大火快炒"],
    ings: [M(I.牛肉, "150", "g"), M(I.洋葱, "1", "个"), M(I.酱油, "1", "勺")],
    tags: ["减脂", "增肌", "快手"],
  },
  {
    name: "虾仁蔬菜汤",
    desc: "低卡高蛋白汤品",
    time: 15, diff: 1, serv: 2,
    steps: ["虾仁去虾线", "蔬菜切丁", "煮开加盐调味"],
    ings: [M(I.虾, "150", "g"), M(I.白菜, "100", "g"), M(I.胡萝卜, "1", "根")],
    tags: ["减脂", "汤品", "低卡"],
  },
  {
    name: "鸡蛋豆腐",
    desc: "双倍蛋白的简单做法",
    time: 10, diff: 1, serv: 1,
    steps: ["豆腐切块", "鸡蛋打散淋上", "少油煎熟"],
    ings: [M(I.鸡蛋, "2", "个"), M(I.豆腐, "1", "块"), M(I.盐, "1", "小勺")],
    tags: ["减脂", "快手", "高蛋白"],
  },
  {
    name: "鸡胸肉炒西兰花",
    desc: "减脂增肌的经典搭配",
    time: 15, diff: 1, serv: 1,
    steps: ["鸡胸肉切丁", "西兰花焯水", "少油翻炒"],
    ings: [M(I.鸡肉, "150", "g"), M(I.大蒜, "3", "瓣"), M(I.盐, "1", "小勺")],
    tags: ["减脂", "增肌", "经典"],
  },
  {
    name: "清蒸豆腐",
    desc: "低脂嫩滑的蒸豆腐",
    time: 15, diff: 1, serv: 1,
    steps: ["豆腐切块摆盘", "放上蒜末", "蒸10分钟淋酱油"],
    ings: [M(I.豆腐, "1", "块"), M(I.大蒜, "3", "瓣"), M(I.酱油, "1", "勺")],
    tags: ["减脂", "蒸菜", "素食"],
  },
  {
    name: "牛肉鸡蛋羹",
    desc: "高蛋白的牛肉蒸蛋",
    time: 20, diff: 1, serv: 1,
    steps: ["牛肉切碎", "鸡蛋打散加水", "混合蒸15分钟"],
    ings: [M(I.牛肉, "100", "g"), M(I.鸡蛋, "2", "个"), M(I.酱油, "1", "勺")],
    tags: ["减脂", "蒸菜", "高蛋白"],
  },
  {
    name: "虾仁炒西兰花",
    desc: "高蛋白高纤的减脂菜",
    time: 15, diff: 1, serv: 1,
    steps: ["虾仁去虾线", "西兰花焯水", "少油快炒"],
    ings: [M(I.虾, "150", "g"), M(I.大蒜, "3", "瓣"), M(I.盐, "1", "小勺")],
    tags: ["减脂", "高蛋白", "快手"],
  },
  {
    name: "凉拌牛肉",
    desc: "低脂高蛋白凉菜",
    time: 30, diff: 1, serv: 2,
    steps: ["牛肉煮熟切片", "加黄瓜片", "拌入调料"],
    ings: [M(I.牛肉, "200", "g"), M(I.黄瓜, "1", "根"), M(I.醋, "1", "勺")],
    tags: ["减脂", "凉菜", "高蛋白"],
  },
  {
    name: "鸡蛋菠菜汤",
    desc: "补铁低卡的快手汤",
    time: 10, diff: 1, serv: 1,
    steps: ["菠菜洗净切段", "水烧开", "淋入蛋液"],
    ings: [M(I.鸡蛋, "1", "个"), M(I.盐, "1", "小勺"), M(I.香油, "少许", "")],
    tags: ["减脂", "汤品", "补铁"],
  },
  {
    name: "鸡胸肉土豆泥",
    desc: "高蛋白低脂的土豆泥",
    time: 25, diff: 1, serv: 1,
    steps: ["土豆蒸熟压泥", "鸡胸肉煮熟撕丝", "混合调味"],
    ings: [M(I.鸡肉, "150", "g"), M(I.土豆, "1", "个"), M(I.盐, "1", "小勺")],
    tags: ["减脂", "主食", "高蛋白"],
  },
  {
    name: "虾仁豆腐汤",
    desc: "低卡高蛋白汤品",
    time: 15, diff: 1, serv: 1,
    steps: ["豆腐切块", "虾仁去虾线", "煮开加盐"],
    ings: [M(I.虾, "100", "g"), M(I.豆腐, "1", "块"), M(I.葱, "1", "根")],
    tags: ["减脂", "汤品", "低卡"],
  },
  {
    name: "清炒豆芽",
    desc: "低卡高纤的快手菜",
    time: 5, diff: 1, serv: 1,
    steps: ["豆芽洗净", "少油热锅", "大火快炒"],
    ings: [M(I.大蒜, "3", "瓣"), M(I.醋, "1", "勺"), M(I.盐, "1", "小勺")],
    tags: ["减脂", "快手", "低卡"],
  },
  {
    name: "鸡蛋蔬菜卷",
    desc: "低碳水的蔬菜蛋卷",
    time: 15, diff: 1, serv: 1,
    steps: ["鸡蛋摊成薄饼", "铺上蔬菜丝", "卷起切段"],
    ings: [M(I.鸡蛋, "2", "个"), M(I.黄瓜, "1", "根"), M(I.胡萝卜, "1", "根")],
    tags: ["减脂", "低碳水", "创意"],
  },
  {
    name: "牛肉萝卜汤",
    desc: "暖胃低脂的牛肉汤",
    time: 60, diff: 1, serv: 2,
    steps: ["牛肉切块焯水", "萝卜切块", "一起炖煮1小时"],
    ings: [M(I.牛肉, "300", "g"), M(I.胡萝卜, "1", "根"), M(I.生姜, "3", "片")],
    tags: ["减脂", "汤品", "暖胃"],
  },
  {
    name: "鸡胸肉炒青椒",
    desc: "简单快手的减脂菜",
    time: 10, diff: 1, serv: 1,
    steps: ["鸡胸肉切丝", "青椒切丝", "少油快炒"],
    ings: [M(I.鸡肉, "150", "g"), M(I.青椒, "2", "个"), M(I.大蒜, "3", "瓣")],
    tags: ["减脂", "快手", "简单"],
  },
];

function addDietDishes() {
  console.log(`Adding ${dietDishes.length} diet dishes...`);

  // 查询减脂餐分类的实际 ID
  const dietCategory = db.select().from(categories).where(eq(categories.name, "减脂餐")).get();
  if (!dietCategory) {
    console.error("减脂餐分类不存在，请先运行 seed.ts");
    process.exit(1);
  }
  const categoryId = dietCategory.id;
  console.log(`减脂餐分类 ID: ${categoryId}`);

  const sqlite = getRawDb();
  sqlite.pragma("foreign_keys = OFF");

  // 清除已有的减脂餐菜品
  const existingCount = db.select({ count: sql`count(*)` }).from(dishes).where(eq(dishes.category_id, categoryId)).get();
  if (existingCount && existingCount.count > 0) {
    console.log(`清除已有的 ${existingCount.count} 道减脂餐...`);
    const existingDishes = db.select({ id: dishes.id }).from(dishes).where(eq(dishes.category_id, categoryId)).all();
    for (const d of existingDishes) {
      db.delete(tags).where(eq(tags.dish_id, d.id)).run();
      db.delete(dish_ingredients).where(eq(dish_ingredients.dish_id, d.id)).run();
      db.delete(steps).where(eq(steps.dish_id, d.id)).run();
    }
    db.delete(dishes).where(eq(dishes.category_id, categoryId)).run();
  }

  let inserted = 0;
  for (const dish of dietDishes) {
    const result = db.insert(dishes).values({
      user_id: userId,
      name: dish.name,
      description: dish.desc,
      image_url: null,
      category_id: categoryId,
      cook_time: dish.time,
      difficulty: dish.diff,
      servings: dish.serv,
    }).run();
    const dishId = Number(result.lastInsertRowid);

    for (let i = 0; i < dish.steps.length; i++) {
      db.insert(steps).values({
        dish_id: dishId,
        step_number: i + 1,
        description: dish.steps[i],
        image_url: null,
      }).run();
    }

    for (const ing of dish.ings) {
      if (ing.id > 0) {
        db.insert(dish_ingredients).values({
          dish_id: dishId,
          ingredient_id: ing.id,
          amount: ing.amount,
          unit: ing.unit,
        }).run();
      }
    }

    for (const tagName of dish.tags) {
      db.insert(tags).values({
        dish_id: dishId,
        name: tagName,
      }).run();
    }

    inserted++;
  }

  sqlite.pragma("foreign_keys = ON");
  console.log(`Done! Added ${inserted} diet dishes.`);
}

addDietDishes();
