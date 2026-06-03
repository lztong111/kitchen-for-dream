import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import {
  Clock,
  Users,
  ArrowLeft,
  Edit,
  Trash2,
  UtensilsCrossed,
} from "lucide-react";
import api from "../api";
import StarRating from "../components/ui/StarRating";
import Loading from "../components/ui/Loading";
import { useAuthStore } from "../stores/auth";
import type { Dish } from "shared/types";

export default function DishDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [dish, setDish] = useState<Dish | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get<{ data: Dish }>(`/dishes/${id}`)
      .then((res) => setDish(res.data.data))
      .catch(() => navigate("/"))
      .finally(() => setLoading(false));
  }, [id, navigate]);

  const handleDelete = async () => {
    if (!confirm("确定要删除这个菜品吗？")) return;
    try {
      await api.delete(`/dishes/${id}`);
      navigate("/");
    } catch {
      alert("删除失败");
    }
  };

  if (loading) return <Loading />;
  if (!dish) return null;

  const isOwner = user && user.id === dish.user_id;

  return (
    <div className="max-w-4xl mx-auto">
      {/* 顶部操作栏 */}
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-1 text-gray-500 hover:text-gray-700"
        >
          <ArrowLeft size={20} />
          <span>返回</span>
        </button>

        {isOwner && (
          <div className="flex gap-2">
            <Link
              to={`/dish/${id}/edit`}
              className="flex items-center gap-1.5 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
            >
              <Edit size={16} />
              <span>编辑</span>
            </Link>
            <button
              onClick={handleDelete}
              className="flex items-center gap-1.5 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
            >
              <Trash2 size={16} />
              <span>删除</span>
            </button>
          </div>
        )}
      </div>

      {/* 菜品图片 */}
      {dish.image_url && (
        <div className="rounded-xl overflow-hidden mb-6 aspect-video bg-gray-100">
          <img
            src={dish.image_url}
            alt={dish.name}
            className="w-full h-full object-cover"
          />
        </div>
      )}

      {/* 菜品基本信息 */}
      <div className="bg-white rounded-xl p-6 mb-6 shadow-sm">
        <h1 className="text-2xl font-bold text-gray-800 mb-2">{dish.name}</h1>

        {dish.description && (
          <p className="text-gray-600 mb-4">{dish.description}</p>
        )}

        <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
          <StarRating rating={dish.difficulty} />

          {dish.cook_time && (
            <span className="flex items-center gap-1">
              <Clock size={16} />
              {dish.cook_time}分钟
            </span>
          )}

          <span className="flex items-center gap-1">
            <Users size={16} />
            {dish.servings}人份
          </span>

          {dish.category && (
            <span className="px-2.5 py-1 bg-orange-50 text-orange-600 rounded-full">
              {dish.category.icon} {dish.category.name}
            </span>
          )}
        </div>

        {dish.tags && dish.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-4">
            {dish.tags.map((tag) => (
              <span
                key={tag.id}
                className="px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-sm"
              >
                #{tag.name}
              </span>
            ))}
          </div>
        )}

        {dish.user && (
          <div className="mt-4 pt-4 border-t border-gray-100 text-sm text-gray-400">
            发布者: {dish.user.username}
          </div>
        )}
      </div>

      {/* 食材清单 */}
      {dish.dish_ingredients && dish.dish_ingredients.length > 0 && (
        <div className="bg-white rounded-xl p-6 mb-6 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <UtensilsCrossed size={20} />
            所需食材
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {dish.dish_ingredients.map((di) => (
              <div
                key={di.id}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
              >
                <span className="text-gray-700">
                  {di.ingredient?.name}
                </span>
                <span className="text-sm text-gray-400">
                  {di.amount}
                  {di.unit}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 制作步骤 */}
      {dish.steps && dish.steps.length > 0 && (
        <div className="bg-white rounded-xl p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">
            制作步骤
          </h2>
          <div className="space-y-4">
            {dish.steps.map((step) => (
              <div key={step.id} className="flex gap-4">
                <div className="flex-shrink-0 w-8 h-8 bg-orange-500 text-white rounded-full flex items-center justify-center font-semibold text-sm">
                  {step.step_number}
                </div>
                <div className="flex-1">
                  <p className="text-gray-700 leading-relaxed">
                    {step.description}
                  </p>
                  {step.image_url && (
                    <img
                      src={step.image_url}
                      alt={`步骤${step.step_number}`}
                      className="mt-2 rounded-lg max-w-xs"
                    />
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
