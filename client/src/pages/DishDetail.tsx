import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import {
  Clock,
  Users,
  ArrowLeft,
  Edit,
  Trash2,
  UtensilsCrossed,
  Heart,
  ChefHat,
  Check,
  X,
  Star,
  Share2,
} from "lucide-react";
import api from "../api";
import StarRating from "../components/ui/StarRating";
import Loading from "../components/ui/Loading";
import LoginPrompt from "../components/ui/LoginPrompt";
import ConfirmDialog from "../components/ui/ConfirmDialog";
import CommentSection from "../components/dish/CommentSection";
import DishCard from "../components/dish/DishCard";
import { useAuthStore } from "../stores/auth";
import { toast } from "../components/ui/Toast";
import type { Dish, UserIngredientItem, Comment } from "shared/types";

export default function DishDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [dish, setDish] = useState<Dish | null>(null);
  const [loading, setLoading] = useState(true);
  const [favorited, setFavorited] = useState(false);
  const [favCount, setFavCount] = useState(0);
  const [inMenu, setInMenu] = useState(false);
  const [userIngredients, setUserIngredients] = useState<UserIngredientItem[]>([]);
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [avgRating, setAvgRating] = useState<number>(0);
  const [commentCount, setCommentCount] = useState(0);
  const [relatedDishes, setRelatedDishes] = useState<Dish[]>([]);

  useEffect(() => {
    // 获取菜品详情
    api
      .get<{ data: Dish }>(`/dishes/${id}`)
      .then((res) => {
        setDish(res.data.data);
        // 获取相关推荐（同分类）
        if (res.data.data.category_id) {
          api
            .get<{ data: { dishes: Dish[] } }>("/dishes", {
              params: { category_id: res.data.data.category_id, limit: 4 },
            })
            .then((r) =>
              setRelatedDishes(
                r.data.data.dishes.filter((d) => d.id !== parseInt(id!)).slice(0, 3)
              )
            )
            .catch(() => {});
        }
      })
      .catch(() => navigate("/"))
      .finally(() => setLoading(false));

    // 获取收藏数
    api
      .get<{ data: { count: number } }>(`/favorites/count/${id}`)
      .then((res) => setFavCount(res.data.data.count))
      .catch(() => {});

    // 获取评论统计
    api
      .get<{ data: { comments: Comment[]; total: number } }>(
        `/comments/dish/${id}`,
        { params: { limit: 100 } }
      )
      .then((res) => {
        const comments = res.data.data.comments;
        setCommentCount(res.data.data.total);
        if (comments.length > 0) {
          const ratings = comments.filter((c) => c.rating).map((c) => c.rating!);
          if (ratings.length > 0) {
            setAvgRating(
              Math.round(
                (ratings.reduce((a, b) => a + b, 0) / ratings.length) * 10
              ) / 10
            );
          }
        }
      })
      .catch(() => {});

    if (user) {
      api
        .get<{ data: { favorited: boolean } }>(`/favorites/check/${id}`)
        .then((res) => setFavorited(res.data.data.favorited))
        .catch(() => {});
      api
        .get<{ data: { added: boolean } }>(`/menu/check/${id}`)
        .then((res) => setInMenu(res.data.data.added))
        .catch(() => {});
      api
        .get<{ data: { items: UserIngredientItem[] } }>(`/user-ingredients`)
        .then((res) => setUserIngredients(res.data.data.items))
        .catch(() => {});
    } else {
      setFavorited(false);
      setInMenu(false);
      setUserIngredients([]);
    }
  }, [id, navigate, user]);

  const handleDelete = async () => {
    try {
      await api.delete(`/dishes/${id}`);
      toast.success("菜品已删除");
      navigate("/");
    } catch {
      toast.error("删除失败");
    }
  };

  const handleToggleFavorite = async () => {
    if (!user) {
      setShowLoginPrompt(true);
      return;
    }
    try {
      const res = await api.post<{ data: { favorited: boolean } }>(
        `/favorites/${id}`
      );
      setFavorited(res.data.data.favorited);
      setFavCount((prev) => (res.data.data.favorited ? prev + 1 : prev - 1));
      toast.success(res.data.data.favorited ? "已收藏" : "已取消收藏");
    } catch {
      toast.error("操作失败");
    }
  };

  const handleToggleMenu = async () => {
    if (!user) {
      setShowLoginPrompt(true);
      return;
    }
    try {
      const res = await api.post<{ data: { added: boolean } }>(
        `/menu/${id}`
      );
      setInMenu(res.data.data.added);
      toast.success(res.data.data.added ? "已加入今日菜单" : "已从今日菜单移除");
    } catch {
      toast.error("操作失败");
    }
  };

  const handleShare = async () => {
    const url = window.location.href;
    if (navigator.share) {
      try {
        await navigator.share({ title: dish?.name, url });
      } catch {}
    } else {
      await navigator.clipboard.writeText(url);
      toast.success("链接已复制");
    }
  };

  if (loading) return <Loading />;
  if (!dish) return null;

  const isOwner = user && user.id === dish.user_id;
  const userIngredientIds = new Set(userIngredients.map((i) => i.ingredient_id));

  return (
    <div className="max-w-4xl mx-auto animate-fade-in">
      {/* 顶部操作栏 */}
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={() => navigate(-1)}
          className="btn-press flex items-center gap-1 text-gray-500 hover:text-gray-700 transition-colors"
        >
          <ArrowLeft size={20} />
          <span>返回</span>
        </button>

        <div className="flex gap-2">
          <button
            onClick={handleShare}
            className="btn-press flex items-center gap-1.5 px-3 py-2 text-gray-500 border border-gray-200 dark:border-gray-600 rounded-lg hover:text-blue-500 transition-colors"
          >
            <Share2 size={16} />
          </button>
          <button
            onClick={handleToggleFavorite}
            className={`btn-press flex items-center gap-1.5 px-4 py-2 rounded-lg transition-colors ${
              favorited
                ? "bg-red-50 dark:bg-red-900/30 text-red-500 border border-red-200 dark:border-red-800"
                : "bg-gray-50 dark:bg-gray-700 text-gray-500 border border-gray-200 dark:border-gray-600 hover:text-red-500"
            }`}
          >
            <Heart size={16} fill={favorited ? "currentColor" : "none"} />
            <span>{favCount > 0 ? favCount : "收藏"}</span>
          </button>
          <button
            onClick={handleToggleMenu}
            className={`btn-press flex items-center gap-1.5 px-4 py-2 rounded-lg transition-colors ${
              inMenu
                ? "bg-green-50 dark:bg-green-900/30 text-green-600 border border-green-200 dark:border-green-800"
                : "bg-gray-50 dark:bg-gray-700 text-gray-500 border border-gray-200 dark:border-gray-600 hover:text-orange-500"
            }`}
          >
            {inMenu ? <Check size={16} /> : <ChefHat size={16} />}
            <span>{inMenu ? "已加入今日菜单" : "加入今日菜单"}</span>
          </button>
          {isOwner && (
            <>
              <Link
                to={`/dish/${id}/edit`}
                className="btn-press flex items-center gap-1.5 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 active:bg-blue-700 transition-colors"
              >
                <Edit size={16} />
                <span>编辑</span>
              </Link>
              <button
                onClick={() => setShowDeleteConfirm(true)}
                className="btn-press flex items-center gap-1.5 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 active:bg-red-700 transition-colors"
              >
                <Trash2 size={16} />
                <span>删除</span>
              </button>
            </>
          )}
        </div>
      </div>

      {/* 菜品图片 */}
      {dish.image_url && (
        <div className="rounded-xl overflow-hidden mb-6 aspect-video bg-gray-100 dark:bg-gray-700">
          <img
            src={dish.image_url}
            alt={dish.name}
            className="w-full h-full object-cover"
          />
        </div>
      )}

      {/* 菜品基本信息 */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 mb-6 shadow-sm">
        <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-2">
          {dish.name}
        </h1>

        {dish.description && (
          <p className="text-gray-600 dark:text-gray-300 mb-4">
            {dish.description}
          </p>
        )}

        <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
          <StarRating rating={dish.difficulty} />

          {/* 平均评分 */}
          {avgRating > 0 && (
            <span className="flex items-center gap-1">
              <Star size={16} className="fill-yellow-400 text-yellow-400" />
              {avgRating}
              <span className="text-gray-400">({commentCount}条评论)</span>
            </span>
          )}

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
            <span className="px-2.5 py-1 bg-orange-50 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 rounded-full">
              {dish.category.icon} {dish.category.name}
            </span>
          )}
        </div>

        {dish.tags && dish.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-4">
            {dish.tags.map((tag) => (
              <span
                key={tag.id}
                className="px-3 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded-full text-sm"
              >
                #{tag.name}
              </span>
            ))}
          </div>
        )}

        {dish.user && (
          <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-700 text-sm text-gray-400">
            发布者:{" "}
            <Link
              to={`/user/${dish.user.id}`}
              className="text-orange-500 hover:underline"
            >
              {dish.user.username}
            </Link>
          </div>
        )}
      </div>

      {/* 食材清单 */}
      {dish.dish_ingredients && dish.dish_ingredients.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 mb-6 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-4 flex items-center gap-2">
            <UtensilsCrossed size={20} />
            所需食材
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {dish.dish_ingredients.map((di) => {
              const hasIt = userIngredientIds.has(di.ingredient_id);
              return (
                <div
                  key={di.id}
                  className={`flex items-center justify-between p-3 rounded-lg ${
                    user
                      ? hasIt
                        ? "bg-green-50 dark:bg-green-900/20"
                        : "bg-red-50 dark:bg-red-900/20"
                      : "bg-gray-50 dark:bg-gray-700"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    {user &&
                      (hasIt ? (
                        <Check size={16} className="text-green-500" />
                      ) : (
                        <X size={16} className="text-red-400" />
                      ))}
                    <span className="text-gray-700 dark:text-gray-200">
                      {di.ingredient?.name}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-400">
                      {di.amount}
                      {di.unit}
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

      {/* 制作步骤 */}
      {dish.steps && dish.steps.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 mb-6 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-4">
            制作步骤
          </h2>
          <div className="space-y-4">
            {dish.steps.map((step) => (
              <div key={step.id} className="flex gap-4">
                <div className="flex-shrink-0 w-8 h-8 bg-orange-500 text-white rounded-full flex items-center justify-center font-semibold text-sm">
                  {step.step_number}
                </div>
                <div className="flex-1">
                  <p className="text-gray-700 dark:text-gray-200 leading-relaxed">
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

      {/* 评论区 */}
      <CommentSection dishId={parseInt(id!)} />

      {/* 相关推荐 */}
      {relatedDishes.length > 0 && (
        <div className="mt-8">
          <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-4">
            相关推荐
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {relatedDishes.map((d) => (
              <DishCard key={d.id} dish={d} />
            ))}
          </div>
        </div>
      )}

      <LoginPrompt
        open={showLoginPrompt}
        onClose={() => setShowLoginPrompt(false)}
      />

      <ConfirmDialog
        open={showDeleteConfirm}
        title="删除菜品"
        message="确定要删除这个菜品吗？删除后无法恢复。"
        confirmText="删除"
        cancelText="取消"
        danger
        onConfirm={handleDelete}
        onClose={() => setShowDeleteConfirm(false)}
      />
    </div>
  );
}
