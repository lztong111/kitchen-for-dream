import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Clock, Users, Plus, Check } from "lucide-react";
import StarRating from "../ui/StarRating";
import { useAuthStore } from "../../stores/auth";
import api from "../../api";
import type { Dish } from "shared/types";

interface DishCardProps {
  dish: Dish;
  onMenuChange?: () => void;
}

export default function DishCard({ dish, onMenuChange }: DishCardProps) {
  const [imgLoaded, setImgLoaded] = useState(false);
  const [inMenu, setInMenu] = useState(false);
  const [toggling, setToggling] = useState(false);
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const imageUrl = dish.image_url || null;

  // 初始化时检查是否在今日菜单中
  useEffect(() => {
    if (!user) return;
    api
      .get<{ data: { added: boolean } }>(`/menu/check/${dish.id}`)
      .then((res) => setInMenu(res.data.data.added))
      .catch(() => {});
  }, [user, dish.id]);

  const handleToggleMenu = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!user) {
      navigate("/login");
      return;
    }

    if (toggling) return;
    setToggling(true);

    try {
      const res = await api.post<{ data: { added: boolean } }>(
        `/menu/${dish.id}`
      );
      setInMenu(res.data.data.added);
      onMenuChange?.();
    } catch {
      alert("操作失败");
    } finally {
      setToggling(false);
    }
  };

  return (
    <Link
      to={`/dish/${dish.id}`}
      className="dish-card block bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-lg border border-gray-100 relative"
    >
      <div className="aspect-[4/3] bg-gray-100 overflow-hidden relative">
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
          <div className="w-full h-full flex items-center justify-center text-gray-300">
            <span className="text-5xl">🍽️</span>
          </div>
        )}

        {/* 右上角 + 按钮 */}
        <button
          onClick={handleToggleMenu}
          className={`absolute top-2 right-2 w-8 h-8 rounded-full flex items-center justify-center shadow-md transition-all ${
            inMenu
              ? "bg-green-500 text-white"
              : "bg-white/90 text-orange-500 hover:bg-white border border-gray-200"
          }`}
        >
          {inMenu ? <Check size={16} /> : <Plus size={16} />}
        </button>
      </div>

      <div className="p-4">
        <h3 className="font-semibold text-gray-800 truncate">{dish.name}</h3>

        {dish.description && (
          <p className="text-sm text-gray-500 mt-1 line-clamp-2">
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

        {dish.tags && dish.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-2">
            {dish.tags.slice(0, 3).map((tag) => (
              <span
                key={tag.id}
                className="px-2 py-0.5 bg-orange-50 text-orange-600 rounded-full text-xs"
              >
                {tag.name}
              </span>
            ))}
          </div>
        )}
      </div>
    </Link>
  );
}
