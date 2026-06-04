import { Outlet, Link, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import {
  ChefHat,
  Plus,
  LogIn,
  LogOut,
  User,
  UtensilsCrossed,
  Refrigerator,
  Menu,
  X,
  Heart,
} from "lucide-react";
import { useAuthStore } from "../../stores/auth";
import ToastContainer from "../ui/Toast";

export default function Layout() {
  const { user, logout, loadFromStorage } = useAuthStore();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    loadFromStorage();
  }, [loadFromStorage]);

  const handleLogout = () => {
    logout();
    setMobileMenuOpen(false);
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <ToastContainer />

      <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-100 dark:border-gray-700 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 text-orange-500">
            <ChefHat size={28} />
            <span className="text-xl font-bold">Kitchan</span>
          </Link>

          {/* 桌面端导航 */}
          <nav className="hidden md:flex items-center gap-2">
            {user ? (
              <div className="flex items-center gap-2 animate-fade-in">
                <Link
                  to="/menu/today"
                  className="flex items-center gap-1.5 px-3 py-2 text-gray-600 dark:text-gray-300 hover:text-orange-500 hover:bg-orange-50 dark:hover:bg-gray-700 rounded-lg transition-colors"
                >
                  <UtensilsCrossed size={18} />
                  <span className="text-sm">今日菜单</span>
                </Link>
                <Link
                  to="/pantry"
                  className="flex items-center gap-1.5 px-3 py-2 text-gray-600 dark:text-gray-300 hover:text-orange-500 hover:bg-orange-50 dark:hover:bg-gray-700 rounded-lg transition-colors"
                >
                  <Refrigerator size={18} />
                  <span className="text-sm">食材库</span>
                </Link>
                <Link
                  to="/dish/new"
                  className="btn-press flex items-center gap-1.5 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 active:bg-orange-700 transition-colors"
                >
                  <Plus size={18} />
                  <span className="text-sm">发布菜品</span>
                </Link>
                <div className="w-px h-6 bg-gray-200 dark:bg-gray-600 mx-1" />
                <Link
                  to={`/user/${user.id}`}
                  className="flex items-center gap-2 px-2 py-1.5 text-gray-600 dark:text-gray-300 hover:text-orange-500 rounded-lg transition-colors"
                >
                  <div className="w-7 h-7 bg-orange-100 dark:bg-orange-900 rounded-full flex items-center justify-center">
                    <User size={14} className="text-orange-500" />
                  </div>
                  <span className="text-sm">{user.username}</span>
                </Link>
                <button
                  onClick={handleLogout}
                  className="btn-press flex items-center gap-1.5 px-2 py-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-gray-700 rounded-lg transition-colors"
                  title="退出登录"
                >
                  <LogOut size={18} />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2 animate-fade-in">
                <Link
                  to="/login"
                  className="flex items-center gap-1.5 px-4 py-2 text-gray-600 dark:text-gray-300 hover:text-orange-500 rounded-lg transition-colors"
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

          {/* 移动端汉堡按钮 */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 text-gray-600 dark:text-gray-300 hover:text-orange-500 transition-colors"
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* 移动端菜单 */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-white dark:bg-gray-800 border-t border-gray-100 dark:border-gray-700 animate-fade-in">
            <div className="px-4 py-3 space-y-1">
              {user ? (
                <>
                  <Link
                    to="/menu/today"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-3 px-3 py-2.5 text-gray-700 dark:text-gray-200 hover:bg-orange-50 dark:hover:bg-gray-700 rounded-lg transition-colors"
                  >
                    <UtensilsCrossed size={20} />
                    <span>今日菜单</span>
                  </Link>
                  <Link
                    to="/pantry"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-3 px-3 py-2.5 text-gray-700 dark:text-gray-200 hover:bg-orange-50 dark:hover:bg-gray-700 rounded-lg transition-colors"
                  >
                    <Refrigerator size={20} />
                    <span>食材库</span>
                  </Link>
                  <Link
                    to={`/user/${user.id}`}
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-3 px-3 py-2.5 text-gray-700 dark:text-gray-200 hover:bg-orange-50 dark:hover:bg-gray-700 rounded-lg transition-colors"
                  >
                    <Heart size={20} />
                    <span>我的收藏</span>
                  </Link>
                  <Link
                    to="/dish/new"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-3 px-3 py-2.5 bg-orange-500 text-white rounded-lg transition-colors"
                  >
                    <Plus size={20} />
                    <span>发布菜品</span>
                  </Link>
                  <div className="border-t border-gray-100 dark:border-gray-700 my-2" />
                  <Link
                    to={`/user/${user.id}`}
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-3 px-3 py-2.5 text-gray-700 dark:text-gray-200 hover:bg-orange-50 dark:hover:bg-gray-700 rounded-lg transition-colors"
                  >
                    <User size={20} />
                    <span>{user.username}</span>
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-3 px-3 py-2.5 text-red-500 hover:bg-red-50 dark:hover:bg-gray-700 rounded-lg transition-colors w-full"
                  >
                    <LogOut size={20} />
                    <span>退出登录</span>
                  </button>
                </>
              ) : (
                <>
                  <Link
                    to="/login"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-3 px-3 py-2.5 text-gray-700 dark:text-gray-200 hover:bg-orange-50 dark:hover:bg-gray-700 rounded-lg transition-colors"
                  >
                    <LogIn size={20} />
                    <span>登录</span>
                  </Link>
                  <Link
                    to="/register"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-3 px-3 py-2.5 bg-orange-500 text-white rounded-lg transition-colors"
                  >
                    <span>注册</span>
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </header>

      <main className="max-w-7xl mx-auto px-4 py-6">
        <Outlet />
      </main>
    </div>
  );
}
