import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Clock, Users, Plus, Check, User } from "lucide-react";
import StarRating from "../ui/StarRating";
import LoginPrompt from "../ui/LoginPrompt";
import { useAuthStore } from "../../stores/auth";
import api from "../../api";
import { toast } from "../ui/Toast";
import type { Dish } from "shared/types";

interface DishCardProps {
  dish: Dish;
  menuDate?: string;
  onMenuChange?: () => void;
}

export default function DishCard({ dish, menuDate, onMenuChange }: DishCardProps) {
  const [imgLoaded, setImgLoaded] = useState(false);
  const [inMenu, setInMenu] = useState(false);
  const [toggling, setToggling] = useState(false);
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);
  const { user } = useAuthStore();
  const imageUrl = dish.image_url || null;

  useEffect(() => {
    if (!user) {
      setInMenu(false);
      return;
    }
    const params = menuDate ? `?date=${menuDate}` : "";
    api
      .get<{ data: { added: boolean } }>(`/menu/check/${dish.id}${params}`)
      .then((res) => setInMenu(res.data.data.added))
      .catch(() => {});
  }, [user, dish.id, menuDate]);

  const handleToggleMenu = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!user) {
      setShowLoginPrompt(true);
      return;
    }

    if (toggling) return;
    setToggling(true);

    try {
      const res = await api.post<{ data: { added: boolean } }>(
        `/menu/${dish.id}`,
        menuDate ? { date: menuDate } : undefined
      );
      setInMenu(res.data.data.added);
      toast.success(res.data.data.added ? "已加入菜单" : "已从菜单移除");
      onMenuChange?.();
    } catch {
      toast.error("操作失败");
    } finally {
      setToggling(false);
    }
  };

  return (
    <>
      <Link
        to={`/dish/${dish.id}${menuDate ? `?date=${menuDate}` : ""}`}
        className="dish-card block bg-white dark:bg-gray-800 rounded-xl overflow-hidden shadow-sm hover:shadow-lg border border-gray-100 dark:border-gray-700 relative"
      >
        <div className="aspect-[4/3] bg-gray-100 dark:bg-gray-700 overflow-hidden relative">
          {imageUrl ? (
            <>
              {!imgLoaded && <div className="absolute inset-0 skeleton" />}
              <img
                src={imageUrl}
                alt={dish.name}
                loading="lazy"
                decoding="async"
                className={`w-full h-full object-cover transition-opacity duration-300 ${
                  imgLoaded ? "opacity-100" : "opacity-0"
                }`}
                onLoad={() => setImgLoaded(true)}
              />
            </>
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-300 dark:text-gray-600">
              <span className="text-5xl">🍽️</span>
            </div>
          )}

          <button
            onClick={handleToggleMenu}
            className={`absolute top-2 right-2 w-8 h-8 rounded-full flex items-center justify-center shadow-md transition-all ${
              inMenu
                ? "bg-green-500 text-white"
                : "bg-white/90 dark:bg-gray-800/90 text-orange-500 hover:bg-white dark:hover:bg-gray-800 border border-gray-200 dark:border-gray-600"
            }`}
          >
            {inMenu ? <Check size={16} /> : <Plus size={16} />}
          </button>
        </div>

        <div className="p-4">
          <h3 className="font-semibold text-gray-800 dark:text-gray-100 truncate">
            {dish.name}
          </h3>

          {dish.description && (
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 line-clamp-2">
              {dish.description}
            </p>
          )}

          <div className="flex items-center justify-between mt-3">
            <StarRating rating={dish.difficulty} size={14} />

            <div className="flex items-center gap-3 text-xs text-gray-400">
              {dish.cook_time && (
                <span className="flex items-center gap-1">
                  <Clock size={12} />
                  {dish.cook_time}分钟
                </span>
              )}
              <span className="flex items-center gap-1">
                <Users size={12} />
                {dish.servings}人份
              </span>
            </div>
          </div>

          <div className="flex items-center justify-between mt-2">
            {dish.user && (
              <span className="flex items-center gap-1 text-xs text-gray-400">
                <User size={10} />
                {dish.user.username}
              </span>
            )}
            {dish.tags && dish.tags.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {dish.tags.slice(0, 2).map((tag) => (
                  <span
                    key={tag.id}
                    className="px-1.5 py-0.5 bg-orange-50 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 rounded text-xs"
                  >
                    {tag.name}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
      </Link>

      <LoginPrompt
        open={showLoginPrompt}
        onClose={() => setShowLoginPrompt(false)}
      />
    </>
  );
}
