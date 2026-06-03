import { useState, useEffect, useCallback } from "react";
import { useParams, Link } from "react-router-dom";
import { User, Calendar, ChefHat } from "lucide-react";
import api from "../api";
import DishCard from "../components/dish/DishCard";
import Loading from "../components/ui/Loading";
import { useAuthStore } from "../stores/auth";
import type { Dish, DishListResponse } from "shared/types";

interface UserProfile {
  id: number;
  username: string;
  avatar: string | null;
  created_at: string;
  dish_count: number;
}

export default function UserProfile() {
  const { id } = useParams<{ id: string }>();
  const { user: currentUser } = useAuthStore();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [dishes, setDishes] = useState<Dish[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
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
      const res = await api.get<{ data: DishListResponse }>(
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

  useEffect(() => {
    fetchDishes();
  }, [fetchDishes]);

  const totalPages = Math.ceil(total / limit);

  if (!profile) return <Loading />;

  return (
    <div className="max-w-4xl mx-auto animate-fade-in">
      {/* 用户信息卡片 */}
      <div className="bg-white rounded-xl p-6 shadow-sm mb-6">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center">
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
          <div className="flex-1">
            <h1 className="text-xl font-bold text-gray-800">
              {profile.username}
            </h1>
            <div className="flex items-center gap-4 mt-1 text-sm text-gray-500">
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
              className="btn-press px-4 py-2 text-sm border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              编辑资料
            </Link>
          )}
        </div>
      </div>

      {/* 用户的菜品 */}
      <h2 className="text-lg font-semibold text-gray-800 mb-4">
        {isOwnProfile ? "我的菜品" : `${profile.username} 的菜品`}
      </h2>

      {loading ? (
        <Loading />
      ) : dishes.length === 0 ? (
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
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {dishes.map((dish) => (
              <DishCard key={dish.id} dish={dish} />
            ))}
          </div>

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
