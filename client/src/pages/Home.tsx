import { useState, useEffect, useCallback, useRef } from "react";
import {
  Search,
  SlidersHorizontal,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
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
  const [expanded, setExpanded] = useState(true);
  const limit = 12;

  const filterRef = useRef<HTMLDivElement>(null);
  const [isSticky, setIsSticky] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (filterRef.current) {
        const rect = filterRef.current.getBoundingClientRect();
        setIsSticky(rect.top <= 0);
      }
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

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
  };

  const totalPages = Math.ceil(total / limit);

  return (
    <div className="animate-fade-in">
      {/* 搜索栏 */}
      <form onSubmit={handleSearch} className="mb-4">
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
              className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-200 focus:outline-none focus:border-orange-400 bg-white transition-colors"
            />
          </div>
          <button
            type="submit"
            className="btn-press px-6 py-2.5 bg-orange-500 text-white rounded-lg hover:bg-orange-600 active:bg-orange-700 transition-colors"
          >
            搜索
          </button>
        </div>
      </form>

      {/* 筛选栏 - 吸顶 */}
      <div ref={filterRef}>
        <div
          className={`transition-all duration-200 ${
            isSticky
              ? "fixed top-0 left-0 right-0 z-40 bg-gray-50/95 backdrop-blur-sm shadow-sm"
              : ""
          }`}
        >
          <div
            className={`${
              isSticky ? "max-w-7xl mx-auto px-4 py-2" : ""
            }`}
          >
            {/* 难度筛选 + 折叠按钮 */}
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2 flex-wrap">
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
                    className={`btn-press px-2.5 py-1 rounded-full text-sm transition-all ${
                      difficulty === d
                        ? "bg-yellow-400 text-white shadow-sm"
                        : "bg-white text-gray-600 border border-gray-200 hover:border-yellow-300"
                    }`}
                  >
                    {"★".repeat(d)}
                  </button>
                ))}

                {(categoryId || difficulty) && (
                  <button
                    onClick={() => {
                      setCategoryId(undefined);
                      setDifficulty(undefined);
                      setPage(1);
                    }}
                    className="btn-press px-2.5 py-1 rounded-full text-sm text-red-500 bg-red-50 hover:bg-red-100 transition-colors"
                  >
                    清除筛选
                  </button>
                )}
              </div>

              <button
                onClick={() => setExpanded(!expanded)}
                className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 transition-colors shrink-0 ml-2"
              >
                {expanded ? (
                  <>
                    收起分类 <ChevronUp size={16} />
                  </>
                ) : (
                  <>
                    展开分类 <ChevronDown size={16} />
                  </>
                )}
              </button>
            </div>

            {/* 分类筛选 - 可折叠 */}
            <div
              className={`overflow-hidden transition-all duration-300 ${
                expanded ? "max-h-40 opacity-100" : "max-h-0 opacity-0"
              }`}
            >
              <div className="flex flex-wrap gap-2 pb-2">
                <button
                  onClick={() => {
                    setCategoryId(undefined);
                    setPage(1);
                  }}
                  className={`btn-press px-3 py-1.5 rounded-full text-sm transition-all ${
                    !categoryId
                      ? "bg-orange-500 text-white shadow-sm"
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
                    className={`btn-press px-3 py-1.5 rounded-full text-sm transition-all ${
                      categoryId === cat.id
                        ? "bg-orange-500 text-white shadow-sm"
                        : "bg-white text-gray-600 border border-gray-200 hover:border-orange-300"
                    }`}
                  >
                    {cat.icon} {cat.name}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* 吸顶占位 */}
        {isSticky && <div className="h-20" />}
      </div>

      {/* 菜品列表 */}
      {loading ? (
        <Loading />
      ) : dishes.length === 0 ? (
        <div className="text-center py-20 text-gray-400 animate-fade-in">
          <span className="text-5xl">🍽️</span>
          <p className="mt-4">暂无菜品</p>
        </div>
      ) : (
        <div className="animate-fade-in">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {dishes.map((dish, i) => (
              <div
                key={dish.id}
                style={{ animationDelay: `${i * 50}ms` }}
                className="animate-fade-in"
              >
                <DishCard dish={dish} />
              </div>
            ))}
          </div>

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
        </div>
      )}
    </div>
  );
}
