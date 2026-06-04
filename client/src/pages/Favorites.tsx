import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Heart, ArrowLeft } from "lucide-react";
import api from "../api";
import DishCard from "../components/dish/DishCard";
import Loading from "../components/ui/Loading";
import { useAuthStore } from "../stores/auth";
import type { Dish } from "shared/types";

export default function Favorites() {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const [dishes, setDishes] = useState<Dish[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const limit = 12;

  useEffect(() => {
    if (!user) {
      navigate("/login");
      return;
    }
    setLoading(true);
    api
      .get<{ data: { dishes: Dish[]; total: number } }>("/favorites", {
        params: { page, limit },
      })
      .then((res) => {
        setDishes(res.data.data.dishes);
        setTotal(res.data.data.total);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [user, navigate, page]);

  const totalPages = Math.ceil(total / limit);

  return (
    <div className="max-w-5xl mx-auto animate-fade-in">
      <div className="flex items-center gap-4 mb-6">
        <button
          onClick={() => navigate(-1)}
          className="btn-press flex items-center gap-1 text-gray-500 hover:text-gray-700 transition-colors"
        >
          <ArrowLeft size={20} />
        </button>
        <h1 className="text-xl font-bold text-gray-800 dark:text-gray-100 flex items-center gap-2">
          <Heart size={24} className="text-red-500" />
          我的收藏
        </h1>
        <span className="text-sm text-gray-400">{total} 道菜品</span>
      </div>

      {loading ? (
        <Loading />
      ) : dishes.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <Heart size={48} className="mx-auto mb-3" />
          <p>还没有收藏任何菜品</p>
          <button
            onClick={() => navigate("/")}
            className="mt-3 text-orange-500 hover:underline"
          >
            去发现菜品 →
          </button>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {dishes.map((dish) => (
              <DishCard key={dish.id} dish={dish} />
            ))}
          </div>

          {totalPages > 1 && (
            <div className="flex justify-center items-center gap-3 mt-8">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="btn-press px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-600 disabled:opacity-40 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                上一页
              </button>
              <span className="text-sm text-gray-500 dark:text-gray-400">
                {page} / {totalPages}
              </span>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="btn-press px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-600 disabled:opacity-40 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
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
