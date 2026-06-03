import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Plus, Trash2, Upload, ArrowLeft } from "lucide-react";
import api from "../api";
import StarRating from "../components/ui/StarRating";
import { useAuthStore } from "../stores/auth";
import type { Category, Ingredient } from "shared/types";

interface StepForm {
  description: string;
  image_url: string;
}

interface IngredientForm {
  ingredient_id: number;
  amount: string;
  unit: string;
}

export default function DishEditor() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const isEdit = !!id;

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [categoryId, setCategoryId] = useState<number | undefined>();
  const [cookTime, setCookTime] = useState<number | undefined>();
  const [difficulty, setDifficulty] = useState(1);
  const [servings, setServings] = useState(1);
  const [steps, setSteps] = useState<StepForm[]>([{ description: "", image_url: "" }]);
  const [ingredientForms, setIngredientForms] = useState<IngredientForm[]>([]);
  const [tagInput, setTagInput] = useState("");
  const [tags, setTags] = useState<string[]>([]);

  const [categories, setCategories] = useState<Category[]>([]);
  const [allIngredients, setAllIngredients] = useState<Ingredient[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (!user) {
      navigate("/login");
      return;
    }

    // 加载选项数据
    Promise.all([
      api.get<{ data: Category[] }>("/categories"),
      api.get<{ data: Ingredient[] }>("/ingredients"),
    ]).then(([catRes, ingRes]) => {
      setCategories(catRes.data.data);
      setAllIngredients(ingRes.data.data);
    });

    // 编辑模式：加载菜品数据
    if (isEdit) {
      api.get(`/dishes/${id}`).then((res) => {
        const dish = res.data.data;
        setName(dish.name);
        setDescription(dish.description || "");
        setImageUrl(dish.image_url || "");
        setCategoryId(dish.category_id);
        setCookTime(dish.cook_time);
        setDifficulty(dish.difficulty);
        setServings(dish.servings);
        setSteps(
          dish.steps?.length > 0
            ? dish.steps.map((s: { description: string; image_url: string | null }) => ({
                description: s.description,
                image_url: s.image_url || "",
              }))
            : [{ description: "", image_url: "" }]
        );
        setIngredientForms(
          dish.dish_ingredients?.map((di: { ingredient_id: number; amount: string | null; unit: string | null }) => ({
            ingredient_id: di.ingredient_id,
            amount: di.amount || "",
            unit: di.unit || "",
          })) || []
        );
        setTags(dish.tags?.map((t: { name: string }) => t.name) || []);
      });
    }
  }, [id, isEdit, user, navigate]);

  const handleImageUpload = async (file: File): Promise<string | null> => {
    const formData = new FormData();
    formData.append("file", file);
    setUploading(true);
    try {
      const res = await api.post<{ data: { url: string } }>(
        "/upload",
        formData,
        { headers: { "Content-Type": "multipart/form-data" } }
      );
      return res.data.data.url;
    } catch {
      alert("图片上传失败");
      return null;
    } finally {
      setUploading(false);
    }
  };

  const handleMainImageChange = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = await handleImageUpload(file);
      if (url) setImageUrl(url);
    }
  };

  const handleStepImageChange = async (
    index: number,
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = await handleImageUpload(file);
      if (url) {
        const newSteps = [...steps];
        newSteps[index].image_url = url;
        setSteps(newSteps);
      }
    }
  };

  const addStep = () => {
    setSteps([...steps, { description: "", image_url: "" }]);
  };

  const removeStep = (index: number) => {
    if (steps.length > 1) {
      setSteps(steps.filter((_, i) => i !== index));
    }
  };

  const updateStep = (index: number, field: keyof StepForm, value: string) => {
    const newSteps = [...steps];
    newSteps[index][field] = value;
    setSteps(newSteps);
  };

  const addIngredient = () => {
    setIngredientForms([
      ...ingredientForms,
      { ingredient_id: 0, amount: "", unit: "" },
    ]);
  };

  const removeIngredient = (index: number) => {
    setIngredientForms(ingredientForms.filter((_, i) => i !== index));
  };

  const updateIngredient = (
    index: number,
    field: keyof IngredientForm,
    value: string | number
  ) => {
    const newForms = [...ingredientForms];
    newForms[index][field as "amount" | "unit" | "ingredient_id"] = value as never;
    setIngredientForms(newForms);
  };

  const addTag = () => {
    const trimmed = tagInput.trim();
    if (trimmed && !tags.includes(trimmed)) {
      setTags([...tags, trimmed]);
    }
    setTagInput("");
  };

  const removeTag = (tag: string) => {
    setTags(tags.filter((t) => t !== tag));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      alert("请输入菜品名称");
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        name: name.trim(),
        description: description.trim() || undefined,
        image_url: imageUrl || undefined,
        category_id: categoryId,
        cook_time: cookTime,
        difficulty,
        servings,
        steps: steps
          .filter((s) => s.description.trim())
          .map((s) => ({
            description: s.description.trim(),
            image_url: s.image_url || undefined,
          })),
        ingredient_ids: ingredientForms
          .filter((i) => i.ingredient_id > 0)
          .map((i) => ({
            ingredient_id: i.ingredient_id,
            amount: i.amount || undefined,
            unit: i.unit || undefined,
          })),
        tag_names: tags,
      };

      if (isEdit) {
        await api.put(`/dishes/${id}`, payload);
      } else {
        await api.post("/dishes", payload);
      }

      navigate("/");
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      alert(err.response?.data?.message || "保存失败");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto">
      <div className="flex items-center gap-4 mb-6">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-1 text-gray-500 hover:text-gray-700"
        >
          <ArrowLeft size={20} />
        </button>
        <h1 className="text-2xl font-bold text-gray-800">
          {isEdit ? "编辑菜品" : "发布新菜品"}
        </h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* 基本信息 */}
        <div className="bg-white rounded-xl p-6 shadow-sm">
          <h2 className="text-lg font-semibold mb-4">基本信息</h2>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                菜品名称 *
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="例如：红烧肉"
                className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:outline-none focus:border-orange-400"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                菜品描述
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="简单介绍一下这道菜..."
                rows={3}
                className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:outline-none focus:border-orange-400 resize-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                菜品图片
              </label>
              <div className="flex items-center gap-4">
                {imageUrl && (
                  <img
                    src={imageUrl}
                    alt="预览"
                    className="w-24 h-24 object-cover rounded-lg"
                  />
                )}
                <label className="flex items-center gap-2 px-4 py-2.5 border border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-orange-400 transition-colors">
                  <Upload size={18} className="text-gray-400" />
                  <span className="text-sm text-gray-500">
                    {uploading ? "上传中..." : "选择图片"}
                  </span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleMainImageChange}
                    className="hidden"
                    disabled={uploading}
                  />
                </label>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  分类
                </label>
                <select
                  value={categoryId || ""}
                  onChange={(e) =>
                    setCategoryId(
                      e.target.value ? Number(e.target.value) : undefined
                    )
                  }
                  className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:outline-none focus:border-orange-400 bg-white"
                >
                  <option value="">选择分类</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.icon} {cat.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  烹饪时间 (分钟)
                </label>
                <input
                  type="number"
                  value={cookTime || ""}
                  onChange={(e) =>
                    setCookTime(
                      e.target.value ? Number(e.target.value) : undefined
                    )
                  }
                  placeholder="例如：30"
                  min="1"
                  className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:outline-none focus:border-orange-400"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  难度
                </label>
                <div className="flex items-center gap-2 py-2">
                  <StarRating rating={difficulty} size={24} />
                  <select
                    value={difficulty}
                    onChange={(e) => setDifficulty(Number(e.target.value))}
                    className="ml-2 px-2 py-1 rounded border border-gray-200 text-sm"
                  >
                    {[1, 2, 3, 4, 5].map((d) => (
                      <option key={d} value={d}>
                        {d}星
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  份数
                </label>
                <input
                  type="number"
                  value={servings}
                  onChange={(e) => setServings(Number(e.target.value))}
                  min="1"
                  className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:outline-none focus:border-orange-400"
                />
              </div>
            </div>
          </div>
        </div>

        {/* 食材 */}
        <div className="bg-white rounded-xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">食材清单</h2>
            <button
              type="button"
              onClick={addIngredient}
              className="flex items-center gap-1 text-sm text-orange-500 hover:text-orange-600"
            >
              <Plus size={16} />
              添加食材
            </button>
          </div>

          <div className="space-y-3">
            {ingredientForms.map((form, index) => (
              <div key={index} className="flex gap-2 items-center">
                <select
                  value={form.ingredient_id}
                  onChange={(e) =>
                    updateIngredient(index, "ingredient_id", Number(e.target.value))
                  }
                  className="flex-1 px-3 py-2 rounded-lg border border-gray-200 focus:outline-none focus:border-orange-400 bg-white text-sm"
                >
                  <option value={0}>选择食材</option>
                  {allIngredients.map((ing) => (
                    <option key={ing.id} value={ing.id}>
                      {ing.name}
                    </option>
                  ))}
                </select>
                <input
                  type="text"
                  value={form.amount}
                  onChange={(e) =>
                    updateIngredient(index, "amount", e.target.value)
                  }
                  placeholder="用量"
                  className="w-20 px-3 py-2 rounded-lg border border-gray-200 focus:outline-none focus:border-orange-400 text-sm"
                />
                <input
                  type="text"
                  value={form.unit}
                  onChange={(e) =>
                    updateIngredient(index, "unit", e.target.value)
                  }
                  placeholder="单位"
                  className="w-16 px-3 py-2 rounded-lg border border-gray-200 focus:outline-none focus:border-orange-400 text-sm"
                />
                <button
                  type="button"
                  onClick={() => removeIngredient(index)}
                  className="p-2 text-gray-400 hover:text-red-500"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* 步骤 */}
        <div className="bg-white rounded-xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">制作步骤</h2>
            <button
              type="button"
              onClick={addStep}
              className="flex items-center gap-1 text-sm text-orange-500 hover:text-orange-600"
            >
              <Plus size={16} />
              添加步骤
            </button>
          </div>

          <div className="space-y-4">
            {steps.map((step, index) => (
              <div
                key={index}
                className="flex gap-3 p-4 bg-gray-50 rounded-lg"
              >
                <div className="flex-shrink-0 w-8 h-8 bg-orange-500 text-white rounded-full flex items-center justify-center font-semibold text-sm">
                  {index + 1}
                </div>
                <div className="flex-1 space-y-2">
                  <textarea
                    value={step.description}
                    onChange={(e) =>
                      updateStep(index, "description", e.target.value)
                    }
                    placeholder={`描述第${index + 1}步...`}
                    rows={2}
                    className="w-full px-3 py-2 rounded-lg border border-gray-200 focus:outline-none focus:border-orange-400 resize-none text-sm"
                  />
                  <div className="flex items-center gap-2">
                    {step.image_url && (
                      <img
                        src={step.image_url}
                        alt={`步骤${index + 1}`}
                        className="w-16 h-16 object-cover rounded"
                      />
                    )}
                    <label className="flex items-center gap-1 text-xs text-gray-400 cursor-pointer hover:text-orange-500">
                      <Upload size={14} />
                      <span>添加图片</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleStepImageChange(index, e)}
                        className="hidden"
                      />
                    </label>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => removeStep(index)}
                  className="p-1 text-gray-400 hover:text-red-500 self-start"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* 标签 */}
        <div className="bg-white rounded-xl p-6 shadow-sm">
          <h2 className="text-lg font-semibold mb-4">标签</h2>

          <div className="flex gap-2 mb-3">
            <input
              type="text"
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  addTag();
                }
              }}
              placeholder="输入标签后按回车"
              className="flex-1 px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:border-orange-400 text-sm"
            />
            <button
              type="button"
              onClick={addTag}
              className="px-4 py-2 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 text-sm"
            >
              添加
            </button>
          </div>

          {tags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {tags.map((tag) => (
                <span
                  key={tag}
                  className="flex items-center gap-1 px-3 py-1 bg-orange-50 text-orange-600 rounded-full text-sm"
                >
                  #{tag}
                  <button
                    type="button"
                    onClick={() => removeTag(tag)}
                    className="ml-1 hover:text-red-500"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>

        {/* 提交按钮 */}
        <div className="flex justify-end gap-3">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="px-6 py-2.5 border border-gray-200 text-gray-600 rounded-lg hover:bg-gray-50"
          >
            取消
          </button>
          <button
            type="submit"
            disabled={submitting}
            className="px-6 py-2.5 bg-orange-500 text-white rounded-lg hover:bg-orange-600 disabled:opacity-50 transition-colors"
          >
            {submitting ? "保存中..." : isEdit ? "保存修改" : "发布菜品"}
          </button>
        </div>
      </form>
    </div>
  );
}
