import { useState, useEffect, useCallback } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import {
  User,
  Calendar,
  ChefHat,
  Heart,
  MessageCircle,
  Settings,
  Camera,
} from "lucide-react";
import api from "../api";
import DishCard from "../components/dish/DishCard";
import StarRating from "../components/ui/StarRating";
import Loading from "../components/ui/Loading";
import { useAuthStore } from "../stores/auth";
import { toast } from "../components/ui/Toast";
import type { Dish, Comment } from "shared/types";

interface UserProfile {
  id: number;
  username: string;
  avatar: string | null;
  created_at: string;
  dish_count: number;
}

type TabKey = "dishes" | "favorites" | "comments";

export default function UserProfile() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user: currentUser } = useAuthStore();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [activeTab, setActiveTab] = useState<TabKey>("dishes");
  const [dishes, setDishes] = useState<Dish[]>([]);
  const [favorites, setFavorites] = useState<Dish[]>([]);
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const limit = 12;

  const isOwnProfile = currentUser && currentUser.id === parseInt(id || "0");

  useEffect(() => {
    api
      .get<{ data: UserProfile }>(`/users/${id}`)
      .then((res) => setProfile(res.data.data))
      .catch(console.error);
  }, [id]);

  const fetchDishes = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get<{ data: { dishes: Dish[]; total: number } }>(
        `/users/${id}/dishes`,
        { params: { page, limit } }
      );
      setDishes(res.data.data.dishes);
      setTotal(res.data.data.total);
    } catch (error) {
      console.error("Failed to fetch user dishes:", error);
    } finally {
      setLoading(false);
    }
  }, [id, page]);

  const fetchFavorites = useCallback(async () => {
    if (!isOwnProfile) return;
    setLoading(true);
    try {
      const res = await api.get<{ data: { dishes: Dish[]; total: number } }>(
        "/favorites",
        { params: { page, limit } }
      );
      setFavorites(res.data.data.dishes);
      setTotal(res.data.data.total);
    } catch (error) {
      console.error("Failed to fetch favorites:", error);
    } finally {
      setLoading(false);
    }
  }, [isOwnProfile, page]);

  const fetchComments = useCallback(async () => {
    if (!isOwnProfile) return;
    setLoading(true);
    try {
      const res = await api.get<{
        data: { comments: Comment[]; total: number };
      }>("/comments/my", { params: { page, limit } });
      setComments(res.data.data.comments);
      setTotal(res.data.data.total);
    } catch (error) {
      console.error("Failed to fetch comments:", error);
    } finally {
      setLoading(false);
    }
  }, [isOwnProfile, page]);

  useEffect(() => {
    setPage(1);
  }, [activeTab]);

  useEffect(() => {
    if (activeTab === "dishes") fetchDishes();
    else if (activeTab === "favorites") fetchFavorites();
    else if (activeTab === "comments") fetchComments();
  }, [activeTab, fetchDishes, fetchFavorites, fetchComments]);

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingAvatar(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const uploadRes = await api.post<{ data: { url: string } }>(
        "/upload",
        formData
      );
      const avatarUrl = uploadRes.data.data.url;
      // 更新用户头像 (需要后端支持，暂时用本地预览)
      setProfile((prev) => (prev ? { ...prev, avatar: avatarUrl } : prev));
      toast.success("头像上传成功");
    } catch {
      toast.error("头像上传失败");
    } finally {
      setUploadingAvatar(false);
    }
  };

  const handleDeleteComment = async (commentId: number) => {
    try {
      await api.delete(`/comments/${commentId}`);
      setComments((prev) => prev.filter((c) => c.id !== commentId));
      setTotal((prev) => prev - 1);
      toast.success("评论已删除");
    } catch {
      toast.error("删除失败");
    }
  };

  const totalPages = Math.ceil(total / limit);

  if (!profile) return <Loading />;

  const tabs: { key: TabKey; label: string; icon: typeof ChefHat }[] = [
    { key: "dishes", label: "菜品", icon: ChefHat },
    ...(isOwnProfile
      ? [
          { key: "favorites" as TabKey, label: "收藏", icon: Heart },
          { key: "comments" as TabKey, label: "评论", icon: MessageCircle },
        ]
      : []),
  ];

  return (
    <div className="max-w-4xl mx-auto animate-fade-in">
      {/* 用户信息卡片 */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm mb-6">
        <div className="flex items-center gap-4">
          <div className="relative">
            <div className="w-16 h-16 bg-orange-100 dark:bg-orange-900 rounded-full flex items-center justify-center overflow-hidden">
              {profile.avatar ? (
                <img
                  src={profile.avatar}
                  alt={profile.username}
                  className="w-16 h-16 rounded-full object-cover"
                />
              ) : (
                <User size={32} className="text-orange-500" />
              )}
            </div>
            {isOwnProfile && (
              <label className="absolute -bottom-1 -right-1 w-7 h-7 bg-orange-500 text-white rounded-full flex items-center justify-center cursor-pointer hover:bg-orange-600 transition-colors shadow-md">
                <Camera size={14} />
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarUpload}
                  className="hidden"
                  disabled={uploadingAvatar}
                />
              </label>
            )}
          </div>
          <div className="flex-1">
            <h1 className="text-xl font-bold text-gray-800 dark:text-gray-100">
              {profile.username}
            </h1>
            <div className="flex items-center gap-4 mt-1 text-sm text-gray-500 dark:text-gray-400">
              <span className="flex items-center gap-1">
                <ChefHat size={14} />
                {profile.dish_count} 道菜品
              </span>
              <span className="flex items-center gap-1">
                <Calendar size={14} />
                {new Date(profile.created_at).toLocaleDateString("zh-CN")} 加入
              </span>
            </div>
          </div>
          {isOwnProfile && (
            <Link
              to="/settings"
              className="btn-press px-4 py-2 text-sm border border-gray-200 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              <Settings size={16} />
            </Link>
          )}
        </div>
      </div>

      {/* Tab 切换 */}
      <div className="flex gap-1 mb-6 bg-gray-100 dark:bg-gray-800 rounded-xl p-1">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                activeTab === tab.key
                  ? "bg-white dark:bg-gray-700 text-orange-600 shadow-sm"
                  : "text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
              }`}
            >
              <Icon size={16} />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* 内容区 */}
      {loading ? (
        <Loading />
      ) : (
        <>
          {/* 菜品 Tab */}
          {activeTab === "dishes" && (
            <>
              {dishes.length === 0 ? (
                <div className="text-center py-16 text-gray-400">
                  <ChefHat size={48} className="mx-auto mb-3" />
                  <p>暂无菜品</p>
                  {isOwnProfile && (
                    <Link
                      to="/dish/new"
                      className="inline-block mt-3 text-orange-500 hover:underline"
                    >
                      去发布第一道菜 →
                    </Link>
                  )}
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                  {dishes.map((dish) => (
                    <DishCard key={dish.id} dish={dish} />
                  ))}
                </div>
              )}
            </>
          )}

          {/* 收藏 Tab */}
          {activeTab === "favorites" && (
            <>
              {favorites.length === 0 ? (
                <div className="text-center py-16 text-gray-400">
                  <Heart size={48} className="mx-auto mb-3" />
                  <p>还没有收藏</p>
                  <button
                    onClick={() => navigate("/")}
                    className="mt-3 text-orange-500 hover:underline"
                  >
                    去发现菜品 →
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                  {favorites.map((dish) => (
                    <DishCard key={dish.id} dish={dish} />
                  ))}
                </div>
              )}
            </>
          )}

          {/* 评论 Tab */}
          {activeTab === "comments" && (
            <>
              {comments.length === 0 ? (
                <div className="text-center py-16 text-gray-400">
                  <MessageCircle size={48} className="mx-auto mb-3" />
                  <p>还没有评论</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {comments.map((comment) => (
                    <div
                      key={comment.id}
                      className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <Link
                          to={`/dish/${comment.dish_id}`}
                          className="text-sm font-medium text-orange-500 hover:underline"
                        >
                          {comment.dish?.name || `菜品 #${comment.dish_id}`}
                        </Link>
                        {comment.rating && (
                          <StarRating rating={comment.rating} size={14} />
                        )}
                      </div>
                      <p className="text-gray-700 dark:text-gray-300 text-sm">
                        {comment.content}
                      </p>
                      <div className="flex items-center justify-between mt-2">
                        <span className="text-xs text-gray-400">
                          {new Date(comment.created_at).toLocaleDateString(
                            "zh-CN"
                          )}
                        </span>
                        {isOwnProfile && (
                          <button
                            onClick={() => handleDeleteComment(comment.id)}
                            className="text-xs text-red-400 hover:text-red-600 transition-colors"
                          >
                            删除
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}

          {/* 分页 */}
          {totalPages > 1 && (
            <div className="flex justify-center items-center gap-3 mt-8">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="btn-press px-4 py-2 rounded-lg border border-gray-200 disabled:opacity-40 hover:bg-gray-50 transition-colors"
              >
                上一页
              </button>
              <span className="text-sm text-gray-500">
                {page} / {totalPages}
              </span>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="btn-press px-4 py-2 rounded-lg border border-gray-200 disabled:opacity-40 hover:bg-gray-50 transition-colors"
              >
                下一页
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
