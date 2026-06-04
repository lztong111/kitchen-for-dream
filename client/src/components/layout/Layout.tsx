import { Outlet, Link, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { ChefHat, Plus, LogIn, LogOut, User, UtensilsCrossed, Refrigerator } from "lucide-react";
import { useAuthStore } from "../../stores/auth";

export default function Layout() {
  const { user, logout, loadFromStorage } = useAuthStore();
  const navigate = useNavigate();

  useEffect(() => {
    loadFromStorage();
  }, [loadFromStorage]);

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 text-orange-500">
            <ChefHat size={28} />
            <span className="text-xl font-bold">Kitchan</span>
          </Link>

          <nav className="flex items-center gap-2">
            {user ? (
              <div className="flex items-center gap-2 animate-fade-in">
                <Link
                  to="/menu/today"
                  className="flex items-center gap-1.5 px-3 py-2 text-gray-600 hover:text-orange-500 hover:bg-orange-50 rounded-lg transition-colors"
                >
                  <UtensilsCrossed size={18} />
                  <span className="text-sm hidden sm:inline">今日菜单</span>
                </Link>
                <Link
                  to="/pantry"
                  className="flex items-center gap-1.5 px-3 py-2 text-gray-600 hover:text-orange-500 hover:bg-orange-50 rounded-lg transition-colors"
                >
                  <Refrigerator size={18} />
                  <span className="text-sm hidden sm:inline">食材库</span>
                </Link>
                <Link
                  to="/dish/new"
                  className="btn-press flex items-center gap-1.5 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 active:bg-orange-700 transition-colors"
                >
                  <Plus size={18} />
                  <span className="text-sm">发布菜品</span>
                </Link>
                <div className="w-px h-6 bg-gray-200 mx-1" />
                <Link
                  to={`/user/${user.id}`}
                  className="flex items-center gap-2 px-2 py-1.5 text-gray-600 hover:text-orange-500 rounded-lg transition-colors"
                >
                  <div className="w-7 h-7 bg-orange-100 rounded-full flex items-center justify-center">
                    <User size={14} className="text-orange-500" />
                  </div>
                  <span className="text-sm hidden sm:inline">{user.username}</span>
                </Link>
                <button
                  onClick={handleLogout}
                  className="btn-press flex items-center gap-1.5 px-2 py-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                  title="退出登录"
                >
                  <LogOut size={18} />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2 animate-fade-in">
                <Link
                  to="/login"
                  className="flex items-center gap-1.5 px-4 py-2 text-gray-600 hover:text-orange-500 rounded-lg transition-colors"
                >
                  <LogIn size={18} />
                  <span className="text-sm">登录</span>
                </Link>
                <Link
                  to="/register"
                  className="btn-press flex items-center gap-1.5 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 active:bg-orange-700 transition-colors"
                >
                  <span className="text-sm">注册</span>
                </Link>
              </div>
            )}
          </nav>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-6">
        <Outlet />
      </main>
    </div>
  );
}
