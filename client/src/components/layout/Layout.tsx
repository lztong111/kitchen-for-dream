import { Outlet, Link, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { ChefHat, Plus, LogIn, LogOut, User } from "lucide-react";
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

          <nav className="flex items-center gap-3">
            {user ? (
              <>
                <Link
                  to="/dish/new"
                  className="btn-press flex items-center gap-1.5 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 active:bg-orange-700 transition-colors"
                >
                  <Plus size={18} />
                  <span>发布菜品</span>
                </Link>
                <Link
                  to={`/user/${user.id}`}
                  className="flex items-center gap-2 text-gray-600 hover:text-orange-500 transition-colors"
                >
                  <User size={18} />
                  <span className="text-sm">{user.username}</span>
                </Link>
                <button
                  onClick={handleLogout}
                  className="btn-press flex items-center gap-1.5 px-3 py-2 text-gray-500 hover:text-red-500 transition-colors"
                >
                  <LogOut size={18} />
                </button>
              </>
            ) : (
              <Link
                to="/login"
                className="btn-press flex items-center gap-1.5 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 active:bg-orange-700 transition-colors"
              >
                <LogIn size={18} />
                <span>登录</span>
              </Link>
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
