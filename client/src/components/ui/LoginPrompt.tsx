import { useNavigate } from "react-router-dom";
import { LogIn, X } from "lucide-react";

interface LoginPromptProps {
  open: boolean;
  onClose: () => void;
}

export default function LoginPrompt({ open, onClose }: LoginPromptProps) {
  const navigate = useNavigate();

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl p-6 w-80 shadow-xl animate-fade-in"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-end">
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <div className="text-center mb-6">
          <div className="w-14 h-14 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-3">
            <LogIn size={28} className="text-orange-500" />
          </div>
          <h3 className="text-lg font-semibold text-gray-800 mb-1">
            需要登录
          </h3>
          <p className="text-sm text-gray-500">
            登录后即可使用此功能
          </p>
        </div>

        <div className="flex flex-col gap-2">
          <button
            onClick={() => {
              onClose();
              navigate("/login");
            }}
            className="btn-press w-full py-2.5 bg-orange-500 text-white rounded-lg hover:bg-orange-600 active:bg-orange-700 transition-colors"
          >
            去登录
          </button>
          <button
            onClick={() => {
              onClose();
              navigate("/register");
            }}
            className="btn-press w-full py-2.5 border border-gray-200 text-gray-600 rounded-lg hover:bg-gray-50 transition-colors"
          >
            注册账号
          </button>
        </div>
      </div>
    </div>
  );
}
