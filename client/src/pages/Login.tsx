import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { ChefHat } from "lucide-react";
import api from "../api";
import { useAuthStore } from "../stores/auth";
import type { AuthResponse } from "shared/types";

export default function Login() {
  const navigate = useNavigate();
  const { setAuth } = useAuthStore();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await api.post<{ data: AuthResponse }>("/auth/login", {
        username,
        password,
      });
      setAuth(res.data.data.user, res.data.data.token);
      navigate("/");
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      setError(error.response?.data?.message || "登录失败");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[60vh] flex items-center justify-center animate-fade-in">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <ChefHat className="w-12 h-12 text-orange-500 mx-auto mb-3" />
          <h1 className="text-2xl font-bold text-gray-800">登录 Kitchen</h1>
          <p className="text-gray-500 mt-1">登录后即可发布你的菜品</p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="bg-white rounded-xl p-6 shadow-sm space-y-4"
        >
          {error && (
            <div className="p-3 bg-red-50 text-red-600 rounded-lg text-sm animate-fade-in">
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              用户名
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:outline-none focus:border-orange-400 transition-colors"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              密码
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:outline-none focus:border-orange-400 transition-colors"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn-press w-full py-2.5 bg-orange-500 text-white rounded-lg hover:bg-orange-600 active:bg-orange-700 disabled:opacity-50 transition-colors"
          >
            {loading ? "登录中..." : "登录"}
          </button>

          <p className="text-center text-sm text-gray-500">
            还没有账号？{" "}
            <Link to="/register" className="text-orange-500 hover:underline">
              注册
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}
