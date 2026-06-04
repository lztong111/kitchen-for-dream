import { useState, useEffect, useCallback, useRef } from "react";
import {
  Search,
  SlidersHorizontal,
  ChevronDown,
  ChevronUp,
  ArrowUpDown,
  Hash,
} from "lucide-react";
import api from "../api";
import DishCard from "../components/dish/DishCard";
import Loading from "../components/ui/Loading";
import type { Dish, Category, DishListResponse } from "shared/types";

type SortKey = "newest" | "cook_time" | "difficulty";

export default function Home() {
  const [dishes, setDishes] = useState<Dish[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [popularTags, setPopularTags] = useState<{ name: string; count: number }[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [categoryId, setCategoryId] = useState<number | undefined>();
  const [difficulty, setDifficulty] = useState<number | undefined>();
  const [tag, setTag] = useState<string | undefined>();
  const [sort, setSort] = useState<SortKey>("newest");
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [expanded, setExpanded] = useState(true);
  const limit = 12;

  const filterRef = useRef<HTMLDivElement>(null);
  const [isSticky, setIsSticky] = useState(false);

  // 防抖搜索
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, 300);
    return () => clearTimeout(timer);
  }, [search]);

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
      if (debouncedSearch) params.search = debouncedSearch;
      if (categoryId) params.category_id = categoryId;
      if (difficulty) params.difficulty = difficulty;
      if (tag) params.tag = tag;

      const res = await api.get<{ data: DishListResponse }>("/dishes", {
        params,
      });

      let sorted = res.data.data.dishes;
      if (sort === "cook_time") {
        sorted = [...sorted].sort((a, b) => (a.cook_time || 0) - (b.cook_time || 0));
      } else if (sort === "difficulty") {
        sorted = [...sorted].sort((a, b) => a.difficulty - b.difficulty);
      }

      setDishes(sorted);
      setTotal(res.data.data.total);
    } catch (error) {
      console.error("Failed to fetch dishes:", error);
    } finally {
      setLoading(false);
    }
  }, [page, debouncedSearch, categoryId, difficulty, tag, sort]);

  useEffect(() => {
    fetchDishes();
  }, [fetchDishes]);

  useEffect(() => {
    Promise.all([
      api.get<{ data: Category[] }>("/categories"),
      api.get<{ data: { name: string; count: number }[] }>("/tags"),
    ])
      .then(([catRes, tagRes]) => {
        setCategories(catRes.data.data);
        setPopularTags(tagRes.data.data);
      })
      .catch(console.error);
  }, []);

  const totalPages = Math.ceil(total / limit);

  const clearFilters = () => {
    setCategoryId(undefined);
    setDifficulty(undefined);
    setTag(undefined);
    setSearch("");
    setPage(1);
  };

  const hasFilters = categoryId || difficulty || tag || debouncedSearch;

  // 骨架屏组件
  const SkeletonCard = () => (
    <div className="bg-white dark:bg-gray-800 rounded-xl overflow-hidden shadow-sm border border-gray-100 dark:border-gray-700">
      <div className="aspect-[4/3] skeleton" />
      <div className="p-4 space-y-2">
        <div className="h-4 skeleton rounded w-3/4" />
        <div className="h-3 skeleton rounded w-full" />
        <div className="h-3 skeleton rounded w-1/2" />
      </div>
    </div>
  );

  return (
    <div className="animate-fade-in">
      {/* 搜索栏 */}
      <div className="mb-4">
        <div className="relative">
          <Search
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            size={20}
          />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="搜索菜品名称..."
            className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-200 dark:border-gray-600 focus:outline-none focus:border-orange-400 bg-white dark:bg-gray-800 dark:text-gray-100 transition-colors"
          />
        </div>
      </div>

      {/* 筛选栏 - 吸顶 */}
      <div ref={filterRef}>
        <div
          className={`transition-all duration-200 ${
            isSticky
              ? "fixed top-0 left-0 right-0 z-40 bg-gray-50/95 dark:bg-gray-900/95 backdrop-blur-sm shadow-sm"
              : ""
          }`}
        >
          <div className={`${isSticky ? "max-w-7xl mx-auto px-4 py-2" : ""}`}>
            {/* 排序 + 难度 + 清除 */}
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2 flex-wrap">
                {/* 排序 */}
                <div className="flex items-center gap-1 text-sm text-gray-500">
                  <ArrowUpDown size={14} />
                  <select
                    value={sort}
                    onChange={(e) => {
                      setSort(e.target.value as SortKey);
                      setPage(1);
                    }}
                    className="bg-transparent text-sm focus:outline-none cursor-pointer dark:text-gray-300"
                  >
                    <option value="newest">最新</option>
                    <option value="cook_time">时间短</option>
                    <option value="difficulty">难度低</option>
                  </select>
                </div>

                <div className="w-px h-4 bg-gray-200 dark:bg-gray-600" />

                {/* 难度 */}
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
                    className={`btn-press px-2 py-0.5 rounded-full text-xs transition-all ${
                      difficulty === d
                        ? "bg-yellow-400 text-white shadow-sm"
                        : "bg-white dark:bg-gray-700 text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-gray-600 hover:border-yellow-300"
                    }`}
                  >
                    {"★".repeat(d)}
                  </button>
                ))}

                {hasFilters && (
                  <button
                    onClick={clearFilters}
                    className="btn-press px-2.5 py-0.5 rounded-full text-xs text-red-500 bg-red-50 dark:bg-red-900/30 hover:bg-red-100 transition-colors"
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
                    收起 <ChevronUp size={16} />
                  </>
                ) : (
                  <>
                    展开 <ChevronDown size={16} />
                  </>
                )}
              </button>
            </div>

            {/* 分类 + 标签 - 可折叠 */}
            <div
              className={`overflow-hidden transition-all duration-300 ${
                expanded ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
              }`}
            >
              {/* 分类 */}
              <div className="flex flex-wrap gap-2 pb-2">
                <button
                  onClick={() => {
                    setCategoryId(undefined);
                    setPage(1);
                  }}
                  className={`btn-press px-3 py-1.5 rounded-full text-sm transition-all ${
                    !categoryId
                      ? "bg-orange-500 text-white shadow-sm"
                      : "bg-white dark:bg-gray-700 text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-gray-600 hover:border-orange-300"
                  }`}
                >
                  全部
                </button>

                {categories.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => {
                      setCategoryId(cat.id === categoryId ? undefined : cat.id);
                      setTag(undefined);
                      setPage(1);
                    }}
                    className={`btn-press px-3 py-1.5 rounded-full text-sm transition-all ${
                      categoryId === cat.id
                        ? "bg-orange-500 text-white shadow-sm"
                        : "bg-white dark:bg-gray-700 text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-gray-600 hover:border-orange-300"
                    }`}
                  >
                    {cat.icon} {cat.name}
                  </button>
                ))}
              </div>

              {/* 热门标签 */}
              {popularTags.length > 0 && (
                <div className="flex flex-wrap gap-2 pb-2">
                  <div className="flex items-center gap-1 text-sm text-gray-400 mr-1">
                    <Hash size={14} />
                    <span>标签:</span>
                  </div>
                  {popularTags.slice(0, 10).map((t) => (
                    <button
                      key={t.name}
                      onClick={() => {
                        setTag(t.name === tag ? undefined : t.name);
                        setCategoryId(undefined);
                        setPage(1);
                      }}
                      className={`btn-press px-2.5 py-1 rounded-full text-xs transition-all ${
                        tag === t.name
                          ? "bg-blue-500 text-white shadow-sm"
                          : "bg-white dark:bg-gray-700 text-gray-500 dark:text-gray-400 border border-gray-200 dark:border-gray-600 hover:border-blue-300"
                      }`}
                    >
                      #{t.name}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* 吸顶占位 */}
        {isSticky && <div className="h-24" />}
      </div>

      {/* 菜品列表 */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      ) : dishes.length === 0 ? (
        <div className="text-center py-20 text-gray-400 animate-fade-in">
          <span className="text-5xl">🍽️</span>
          <p className="mt-4">暂无菜品</p>
          {hasFilters && (
            <button
              onClick={clearFilters}
              className="mt-3 text-orange-500 hover:underline"
            >
              清除筛选条件
            </button>
          )}
        </div>
      ) : (
        <div className="animate-fade-in">
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm text-gray-400">共 {total} 道菜品</p>
          </div>
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
