import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { ChefHat } from "lucide-react";
import api from "../api";
import { useAuthStore } from "../stores/auth";
import { toast } from "../components/ui/Toast";
import type { AuthResponse } from "shared/types";

export default function Register() {
  const navigate = useNavigate();
  const { setAuth } = useAuthStore();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (password !== confirmPassword) {
      setError("两次输入的密码不一致");
      return;
    }

    if (password.length < 6) {
      setError("密码至少6位");
      return;
    }

    setLoading(true);

    try {
      const res = await api.post<{ data: AuthResponse }>("/auth/register", {
        username,
        password,
      });
      setAuth(res.data.data.user, res.data.data.token);
      toast.success("注册成功");
      navigate("/");
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      setError(error.response?.data?.message || "注册失败");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[60vh] flex items-center justify-center animate-fade-in">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <ChefHat className="w-12 h-12 text-orange-500 mx-auto mb-3" />
          <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100">
            注册 Kitchan
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            创建账号，开始分享你的菜谱
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm space-y-4"
        >
          {error && (
            <div className="p-3 bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-lg text-sm animate-fade-in">
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              用户名
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="2-20个字符"
              className="w-full px-4 py-2.5 rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-100 focus:outline-none focus:border-orange-400 transition-colors"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              密码
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="至少6位"
              className="w-full px-4 py-2.5 rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-100 focus:outline-none focus:border-orange-400 transition-colors"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              确认密码
            </label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="再次输入密码"
              className="w-full px-4 py-2.5 rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-100 focus:outline-none focus:border-orange-400 transition-colors"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn-press w-full py-2.5 bg-orange-500 text-white rounded-lg hover:bg-orange-600 active:bg-orange-700 disabled:opacity-50 transition-colors"
          >
            {loading ? "注册中..." : "注册"}
          </button>

          <p className="text-center text-sm text-gray-500 dark:text-gray-400">
            已有账号？{" "}
            <Link to="/login" className="text-orange-500 hover:underline">
              登录
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}
