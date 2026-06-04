import { Link } from "react-router-dom";
import { ChefHat, Home } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center animate-fade-in">
      <div className="text-center">
        <ChefHat size={64} className="text-gray-300 dark:text-gray-600 mx-auto mb-4" />
        <h1 className="text-6xl font-bold text-gray-300 dark:text-gray-600 mb-4">
          404
        </h1>
        <p className="text-gray-500 dark:text-gray-400 mb-6">页面不存在</p>
        <Link
          to="/"
          className="btn-press inline-flex items-center gap-2 px-6 py-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
        >
          <Home size={18} />
          <span>回到首页</span>
        </Link>
      </div>
    </div>
  );
}
