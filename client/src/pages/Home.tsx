import { useState, useEffect, useCallback } from "react";
import { Search, SlidersHorizontal } from "lucide-react";
import api from "../api";
import DishCard from "../components/dish/DishCard";
import Loading from "../components/ui/Loading";
import type { Dish, Category, DishListResponse } from "shared/types";

export default function Home() {
  const [dishes, setDishes] = useState<Dish[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [categoryId, setCategoryId] = useState<number | undefined>();
  const [difficulty, setDifficulty] = useState<number | undefined>();
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const limit = 12;

  const fetchDishes = useCallback(async () => {
    setLoading(true);
    try {
      const params: Record<string, string | number> = { page, limit };
      if (search) params.search = search;
      if (categoryId) params.category_id = categoryId;
      if (difficulty) params.difficulty = difficulty;

      const res = await api.get<{ data: DishListResponse }>("/dishes", {
        params,
      });
      setDishes(res.data.data.dishes);
      setTotal(res.data.data.total);
    } catch (error) {
      console.error("Failed to fetch dishes:", error);
    } finally {
      setLoading(false);
    }
  }, [page, search, categoryId, difficulty]);

  useEffect(() => {
    fetchDishes();
  }, [fetchDishes]);

  useEffect(() => {
    api
      .get<{ data: Category[] }>("/categories")
      .then((res) => setCategories(res.data.data))
      .catch(console.error);
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchDishes();
  };

  const totalPages = Math.ceil(total / limit);

  return (
    <div>
      {/* 搜索栏 */}
      <form onSubmit={handleSearch} className="mb-6">
        <div className="flex gap-2">
          <div className="flex-1 relative">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              size={20}
            />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="搜索菜品..."
              className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-200 focus:outline-none focus:border-orange-400 bg-white"
            />
          </div>
          <button
            type="submit"
            className="px-6 py-2.5 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
          >
            搜索
          </button>
        </div>
      </form>

      {/* 筛选栏 */}
      <div className="flex flex-wrap gap-2 mb-6">
        <button
          onClick={() => {
            setCategoryId(undefined);
            setDifficulty(undefined);
            setPage(1);
          }}
          className={`px-3 py-1.5 rounded-full text-sm transition-colors ${
            !categoryId && !difficulty
              ? "bg-orange-500 text-white"
              : "bg-white text-gray-600 border border-gray-200 hover:border-orange-300"
          }`}
        >
          全部
        </button>

        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => {
              setCategoryId(cat.id === categoryId ? undefined : cat.id);
              setPage(1);
            }}
            className={`px-3 py-1.5 rounded-full text-sm transition-colors ${
              categoryId === cat.id
                ? "bg-orange-500 text-white"
                : "bg-white text-gray-600 border border-gray-200 hover:border-orange-300"
            }`}
          >
            {cat.icon} {cat.name}
          </button>
        ))}

        <div className="w-px bg-gray-200 mx-1" />

        <div className="flex items-center gap-1 text-sm text-gray-500">
          <SlidersHorizontal size={14} />
          <span>难度:</span>
        </div>
        {[1, 2, 3, 4, 5].map((d) => (
          <button
            key={d}
            onClick={() => {
              setDifficulty(d === difficulty ? undefined : d);
              setPage(1);
            }}
            className={`px-2.5 py-1.5 rounded-full text-sm transition-colors ${
              difficulty === d
                ? "bg-yellow-400 text-white"
                : "bg-white text-gray-600 border border-gray-200 hover:border-yellow-300"
            }`}
          >
            {"★".repeat(d)}
          </button>
        ))}
      </div>

      {/* 菜品列表 */}
      {loading ? (
        <Loading />
      ) : dishes.length === 0 ? (
        <div className="text-center py-20 text-gray-400">
          <span className="text-5xl">🍽️</span>
          <p className="mt-4">暂无菜品</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {dishes.map((dish) => (
              <DishCard key={dish.id} dish={dish} />
            ))}
          </div>

          {/* 分页 */}
          {totalPages > 1 && (
            <div className="flex justify-center gap-2 mt-8">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-3 py-2 rounded-lg border border-gray-200 disabled:opacity-50 hover:bg-gray-50"
              >
                上一页
              </button>
              <span className="px-3 py-2 text-sm text-gray-500">
                {page} / {totalPages}
              </span>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="px-3 py-2 rounded-lg border border-gray-200 disabled:opacity-50 hover:bg-gray-50"
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
