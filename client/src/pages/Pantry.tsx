import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Refrigerator,
  Plus,
  X,
  ArrowLeft,
  Search,
} from "lucide-react";
import api from "../api";
import Loading from "../components/ui/Loading";
import { useAuthStore } from "../stores/auth";
import type { Ingredient, UserIngredientItem } from "shared/types";

interface GroupedItems {
  [category: string]: UserIngredientItem[];
}

export default function Pantry() {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const [items, setItems] = useState<UserIngredientItem[]>([]);
  const [grouped, setGrouped] = useState<GroupedItems>({});
  const [allIngredients, setAllIngredients] = useState<Ingredient[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [search, setSearch] = useState("");

  const fetchPantry = async () => {
    try {
      const res = await api.get<{ data: { items: UserIngredientItem[]; grouped: GroupedItems } }>(
        "/user-ingredients"
      );
      setItems(res.data.data.items);
      setGrouped(res.data.data.grouped);
    } catch {
      console.error("Failed to fetch pantry");
    }
  };

  useEffect(() => {
    if (!user) {
      navigate("/login");
      return;
    }

    Promise.all([
      fetchPantry(),
      api.get<{ data: Ingredient[] }>("/ingredients").then((res) => setAllIngredients(res.data.data)),
    ]).finally(() => setLoading(false));
  }, [user, navigate]);

  const handleAdd = async (ingredientId: number) => {
    try {
      await api.post("/user-ingredients", { ingredient_id: ingredientId });
      fetchPantry();
    } catch {
      alert("添加失败");
    }
  };

  const handleRemove = async (ingredientId: number) => {
    try {
      await api.delete(`/user-ingredients/${ingredientId}`);
      fetchPantry();
    } catch {
      alert("移除失败");
    }
  };

  const existingIds = new Set(items.map((i) => i.ingredient_id));

  const filteredIngredients = allIngredients.filter(
    (i) =>
      !existingIds.has(i.id) &&
      (search === "" || i.name.includes(search))
  );

  const groupedFiltered: Record<string, Ingredient[]> = {};
  for (const ing of filteredIngredients) {
    const cat = ing.category || "其他";
    if (!groupedFiltered[cat]) groupedFiltered[cat] = [];
    groupedFiltered[cat].push(ing);
  }

  if (loading) return <Loading />;

  return (
    <div className="max-w-3xl mx-auto animate-fade-in">
      {/* 顶部 */}
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={() => navigate(-1)}
          className="btn-press flex items-center gap-1 text-gray-500 hover:text-gray-700 transition-colors"
        >
          <ArrowLeft size={20} />
          <span>返回</span>
        </button>
        <h1 className="text-xl font-bold text-gray-800 flex items-center gap-2">
          <Refrigerator size={24} className="text-orange-500" />
          我的食材库
        </h1>
        <button
          onClick={() => setShowAdd(!showAdd)}
          className="btn-press flex items-center gap-1 px-3 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors text-sm"
        >
          <Plus size={16} />
          添加
        </button>
      </div>

      {/* 添加食材面板 */}
      {showAdd && (
        <div className="bg-white rounded-xl p-4 mb-6 shadow-sm">
          <div className="relative mb-3">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              size={16}
            />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="搜索食材..."
              className="w-full pl-9 pr-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:border-orange-400 text-sm"
            />
          </div>
          <div className="max-h-60 overflow-y-auto space-y-3">
            {Object.entries(groupedFiltered).map(([cat, ings]) => (
              <div key={cat}>
                <p className="text-xs font-medium text-gray-400 mb-1">{cat}</p>
                <div className="flex flex-wrap gap-2">
                  {ings.map((ing) => (
                    <button
                      key={ing.id}
                      onClick={() => handleAdd(ing.id)}
                      className="px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-sm hover:bg-orange-100 hover:text-orange-600 transition-colors"
                    >
                      + {ing.name}
                    </button>
                  ))}
                </div>
              </div>
            ))}
            {Object.keys(groupedFiltered).length === 0 && (
              <p className="text-center text-gray-400 text-sm py-4">
                {search ? "没有匹配的食材" : "所有食材都已添加"}
              </p>
            )}
          </div>
        </div>
      )}

      {/* 我的食材列表 */}
      {items.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <Refrigerator size={48} className="mx-auto mb-3" />
          <p>食材库还是空的</p>
          <button
            onClick={() => setShowAdd(true)}
            className="mt-3 text-orange-500 hover:underline"
          >
            添加食材 →
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {Object.entries(grouped).map(([cat, catItems]) => (
            <div key={cat} className="bg-white rounded-xl p-4 shadow-sm">
              <h3 className="text-sm font-medium text-gray-500 mb-3">
                {cat}
              </h3>
              <div className="flex flex-wrap gap-2">
                {catItems.map((item) => (
                  <span
                    key={item.id}
                    className="flex items-center gap-1 px-3 py-1.5 bg-green-50 text-green-700 rounded-full text-sm"
                  >
                    {item.ingredient_name}
                    <button
                      onClick={() => handleRemove(item.ingredient_id)}
                      className="ml-1 hover:text-red-500 transition-colors"
                    >
                      <X size={14} />
                    </button>
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
