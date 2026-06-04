import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  ChefHat,
  Clock,
  Trash2,
  ArrowLeft,
  Utensils,
} from "lucide-react";
import api from "../api";
import Loading from "../components/ui/Loading";
import LoginPrompt from "../components/ui/LoginPrompt";
import ConfirmDialog from "../components/ui/ConfirmDialog";
import { useAuthStore } from "../stores/auth";
import type { Dish, DailyMenuResponse } from "shared/types";

export default function TodayMenu() {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const [data, setData] = useState<DailyMenuResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);
  const [showClearConfirm, setShowClearConfirm] = useState(false);

  const fetchMenu = async () => {
    setLoading(true);
    try {
      const res = await api.get<{ data: DailyMenuResponse }>("/menu/today");
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
  }, [user]);

  const handleRemove = async (dishId: number) => {
    try {
      await api.post(`/menu/${dishId}`);
      fetchMenu();
    } catch {
      alert("移除失败");
    }
  };

  const handleClear = async () => {
    try {
      await api.delete("/menu/today");
      fetchMenu();
    } catch {
      alert("清空失败");
    }
  };

  if (loading) return <Loading />;

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
        <h1 className="text-xl font-bold text-gray-800 flex items-center gap-2">
          <ChefHat size={24} className="text-orange-500" />
          今日菜单
        </h1>
        {data && data.count > 0 ? (
          <button
            onClick={() => setShowClearConfirm(true)}
            className="btn-press text-sm text-red-500 hover:text-red-600 transition-colors"
          >
            清空
          </button>
        ) : (
          <div />
        )}
      </div>

      {/* 日期 */}
      <p className="text-sm text-gray-400 text-center mb-6">
        {new Date().toLocaleDateString("zh-CN", {
          year: "numeric",
          month: "long",
          day: "numeric",
          weekday: "long",
        })}
      </p>

      {!data || data.count === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <ChefHat size={48} className="mx-auto mb-3" />
          <p>今日菜单还是空的</p>
          <Link
            to="/"
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
                className="bg-white rounded-xl p-4 shadow-sm flex items-center gap-4"
              >
                <Link
                  to={`/dish/${dish.id}`}
                  className="w-16 h-16 rounded-lg overflow-hidden bg-gray-100 shrink-0"
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
                    className="font-medium text-gray-800 hover:text-orange-500 transition-colors"
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
          <div className="bg-white rounded-xl p-6 mb-6 shadow-sm">
            <h2 className="text-lg font-semibold text-gray-800 mb-3 flex items-center gap-2">
              <Clock size={20} />
              统计
            </h2>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-orange-50 rounded-lg p-4 text-center">
                <p className="text-2xl font-bold text-orange-600">
                  {data.count}
                </p>
                <p className="text-sm text-gray-500">道菜品</p>
              </div>
              <div className="bg-blue-50 rounded-lg p-4 text-center">
                <p className="text-2xl font-bold text-blue-600">
                  {data.total_cook_time}
                </p>
                <p className="text-sm text-gray-500">分钟预计时间</p>
              </div>
            </div>
          </div>

          {/* 食材汇总 */}
          {data.ingredients_summary.length > 0 && (
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <Utensils size={20} />
                食材汇总
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {data.ingredients_summary.map((item) => (
                  <div
                    key={item.name}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                  >
                    <span className="text-gray-700">{item.name}</span>
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
        title="清空今日菜单"
        message="确定清空今日菜单？清空后无法恢复。"
        confirmText="清空"
        cancelText="取消"
        danger
        onConfirm={handleClear}
        onClose={() => setShowClearConfirm(false)}
      />
    </div>
  );
}
