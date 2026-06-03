import { Link } from "react-router-dom";
import { Clock, Users } from "lucide-react";
import StarRating from "../ui/StarRating";
import type { Dish } from "shared/types";

interface DishCardProps {
  dish: Dish;
}

export default function DishCard({ dish }: DishCardProps) {
  const imageUrl = dish.image_url
    ? dish.image_url.startsWith("http")
      ? dish.image_url
      : dish.image_url
    : null;

  return (
    <Link
      to={`/dish/${dish.id}`}
      className="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow border border-gray-100"
    >
      <div className="aspect-[4/3] bg-gray-100 overflow-hidden">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={dish.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-300">
            <span className="text-5xl">🍽️</span>
          </div>
        )}
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
