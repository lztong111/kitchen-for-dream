import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  ChefHat,
  Clock,
  Trash2,
  ArrowLeft,
  Utensils,
  Calendar,
  ChevronLeft,
  ChevronRight,
  Copy,
  AlertCircle,
} from "lucide-react";
import api from "../api";
import Loading from "../components/ui/Loading";
import LoginPrompt from "../components/ui/LoginPrompt";
import ConfirmDialog from "../components/ui/ConfirmDialog";
import { useAuthStore } from "../stores/auth";
import { toast } from "../components/ui/Toast";
import type { Dish, DailyMenuResponse, UserIngredientItem } from "shared/types";

export default function TodayMenu() {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const [data, setData] = useState<DailyMenuResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [userIngredients, setUserIngredients] = useState<UserIngredientItem[]>([]);

  const isToday = selectedDate === new Date().toISOString().split("T")[0];

  const fetchMenu = async () => {
    setLoading(true);
    try {
      const res = await api.get<{ data: DailyMenuResponse }>("/menu/today", {
        params: { date: selectedDate },
      });
      setData(res.data.data);
    } catch {
      console.error("Failed to fetch menu");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!user) {
      setShowLoginPrompt(true);
      setLoading(false);
      return;
    }
    fetchMenu();
    api
      .get<{ data: { items: UserIngredientItem[] } }>("/user-ingredients")
      .then((res) => setUserIngredients(res.data.data.items))
      .catch(() => {});
  }, [user, selectedDate]);

  const handleRemove = async (dishId: number) => {
    try {
      await api.post(`/menu/${dishId}`, { date: selectedDate });
      fetchMenu();
      toast.success("已移除");
    } catch {
      toast.error("移除失败");
    }
  };

  const handleClear = async () => {
    try {
      await api.delete("/menu/today", { params: { date: selectedDate } });
      fetchMenu();
      toast.success("已清空");
    } catch {
      toast.error("清空失败");
    }
  };

  const changeDate = (offset: number) => {
    const d = new Date(selectedDate);
    d.setDate(d.getDate() + offset);
    setSelectedDate(d.toISOString().split("T")[0]);
  };

  const copyShoppingList = () => {
    if (!missingIngredients.length) return;
    const text = missingIngredients
      .map((item) => `${item.name}: ${item.amounts.join(" + ")}`)
      .join("\n");
    navigator.clipboard.writeText(`购物清单（${selectedDate}）\n\n${text}`);
    toast.success("购物清单已复制到剪贴板");
  };

  // 计算缺少的食材
  const userIngredientIds = new Set(userIngredients.map((i) => i.ingredient_id));
  const missingIngredients =
    data?.ingredients_summary.filter((item) => {
      // 通过名称匹配（简化处理）
      const matchingIngredient = userIngredients.find(
        (ui) => ui.ingredient_name === item.name
      );
      return !matchingIngredient;
    }) || [];

  if (loading) return <Loading />;

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString("zh-CN", {
      month: "long",
      day: "numeric",
      weekday: "long",
    });
  };

  return (
    <div className="max-w-3xl mx-auto animate-fade-in">
      {/* 顶部 */}
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={() => navigate(-1)}
          className="btn-press flex items-center gap-1 text-gray-500 hover:text-gray-700 transition-colors"
        >
          <ArrowLeft size={20} />
          <span>返回</span>
        </button>
        <h1 className="text-xl font-bold text-gray-800 dark:text-gray-100 flex items-center gap-2">
          <ChefHat size={24} className="text-orange-500" />
          菜单
        </h1>
        <div className="flex items-center gap-2">
          <Link
            to={`/?date=${selectedDate}`}
            className="btn-press text-sm text-orange-500 hover:text-orange-600 transition-colors"
          >
            添加菜品
          </Link>
          {data && data.count > 0 && (
            <button
              onClick={() => setShowClearConfirm(true)}
              className="btn-press text-sm text-red-500 hover:text-red-600 transition-colors"
            >
              清空
            </button>
          )}
        </div>
      </div>

      {/* 日期选择器 */}
      <div className="flex items-center justify-center gap-4 mb-6">
        <button
          onClick={() => changeDate(-1)}
          className="btn-press p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
        >
          <ChevronLeft size={20} />
        </button>
        <div className="flex items-center gap-2">
          <Calendar size={18} className="text-orange-500" />
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="bg-transparent text-gray-700 dark:text-gray-200 font-medium focus:outline-none cursor-pointer"
          />
          <span className="text-sm text-gray-400">{formatDate(selectedDate)}</span>
          {!isToday && (
            <button
              onClick={() => setSelectedDate(new Date().toISOString().split("T")[0])}
              className="text-xs text-orange-500 hover:underline ml-1"
            >
              回到今天
            </button>
          )}
        </div>
        <button
          onClick={() => changeDate(1)}
          className="btn-press p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
        >
          <ChevronRight size={20} />
        </button>
      </div>

      {!data || data.count === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <ChefHat size={48} className="mx-auto mb-3" />
          <p>{isToday ? "今日菜单还是空的" : "这天没有菜单"}</p>
          <Link
            to={`/?date=${selectedDate}`}
            className="inline-block mt-3 text-orange-500 hover:underline"
          >
            去挑选菜品 →
          </Link>
        </div>
      ) : (
        <>
          {/* 菜品列表 */}
          <div className="space-y-3 mb-6">
            {data.dishes.map((dish: Dish) => (
              <div
                key={dish.id}
                className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm flex items-center gap-4"
              >
                <Link
                  to={`/dish/${dish.id}`}
                  className="w-16 h-16 rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-700 shrink-0"
                >
                  {dish.image_url ? (
                    <img
                      src={dish.image_url}
                      alt={dish.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-300">
                      <span className="text-2xl">🍽️</span>
                    </div>
                  )}
                </Link>
                <div className="flex-1 min-w-0">
                  <Link
                    to={`/dish/${dish.id}`}
                    className="font-medium text-gray-800 dark:text-gray-100 hover:text-orange-500 transition-colors"
                  >
                    {dish.name}
                  </Link>
                  <div className="flex items-center gap-3 mt-1 text-xs text-gray-400">
                    {dish.difficulty && (
                      <span>{"★".repeat(dish.difficulty)}</span>
                    )}
                    {dish.cook_time && (
                      <span className="flex items-center gap-1">
                        <Clock size={12} />
                        {dish.cook_time}分钟
                      </span>
                    )}
                    {dish.category && (
                      <span>
                        {dish.category.icon} {dish.category.name}
                      </span>
                    )}
                  </div>
                </div>
                <button
                  onClick={() => handleRemove(dish.id)}
                  className="btn-press p-2 text-gray-400 hover:text-red-500 transition-colors"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            ))}
          </div>

          {/* 统计 */}
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 mb-6 shadow-sm">
            <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-3 flex items-center gap-2">
              <Clock size={20} />
              统计
            </h2>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-orange-50 dark:bg-orange-900/20 rounded-lg p-4 text-center">
                <p className="text-2xl font-bold text-orange-600">{data.count}</p>
                <p className="text-sm text-gray-500">道菜品</p>
              </div>
              <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 text-center">
                <p className="text-2xl font-bold text-blue-600">
                  {data.total_cook_time}
                </p>
                <p className="text-sm text-gray-500">分钟预计时间</p>
              </div>
            </div>
          </div>

          {/* 食材汇总 */}
          {data.ingredients_summary.length > 0 && (
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 mb-6 shadow-sm">
              <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-4 flex items-center gap-2">
                <Utensils size={20} />
                食材汇总
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {data.ingredients_summary.map((item) => {
                  const hasIt = userIngredients.some(
                    (ui) => ui.ingredient_name === item.name
                  );
                  return (
                    <div
                      key={item.name}
                      className={`flex items-center justify-between p-3 rounded-lg ${
                        user
                          ? hasIt
                            ? "bg-green-50 dark:bg-green-900/20"
                            : "bg-red-50 dark:bg-red-900/20"
                          : "bg-gray-50 dark:bg-gray-700"
                      }`}
                    >
                      <span className="text-gray-700 dark:text-gray-200">
                        {item.name}
                      </span>
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-gray-400">
                          {item.amounts.join(" + ")}
                        </span>
                        {user && (
                          <span
                            className={`text-xs ${
                              hasIt ? "text-green-600" : "text-red-400"
                            }`}
                          >
                            {hasIt ? "已有" : "缺少"}
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* 缺少食材 - 购物清单 */}
          {user && missingIngredients.length > 0 && (
            <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-xl p-6 shadow-sm">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100 flex items-center gap-2">
                  <AlertCircle size={20} className="text-yellow-500" />
                  缺少食材（{missingIngredients.length}）
                </h2>
                <button
                  onClick={copyShoppingList}
                  className="btn-press flex items-center gap-1 px-3 py-1.5 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 text-sm transition-colors"
                >
                  <Copy size={14} />
                  复制购物清单
                </button>
              </div>
              <div className="space-y-2">
                {missingIngredients.map((item) => (
                  <div
                    key={item.name}
                    className="flex items-center justify-between p-2 bg-white dark:bg-gray-800 rounded-lg"
                  >
                    <span className="text-gray-700 dark:text-gray-200">
                      {item.name}
                    </span>
                    <span className="text-sm text-gray-400">
                      {item.amounts.join(" + ")}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}

      <LoginPrompt
        open={showLoginPrompt}
        onClose={() => {
          setShowLoginPrompt(false);
          if (!user) navigate("/");
        }}
      />

      <ConfirmDialog
        open={showClearConfirm}
        title="清空菜单"
        message={`确定清空${isToday ? "今日" : formatDate(selectedDate)}的菜单？清空后无法恢复。`}
        confirmText="清空"
        cancelText="取消"
        danger
        onConfirm={handleClear}
        onClose={() => setShowClearConfirm(false)}
      />
    </div>
  );
}
