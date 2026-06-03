import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Lock, ArrowLeft } from "lucide-react";
import api from "../api";

export default function Settings() {
  const navigate = useNavigate();
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (newPassword !== confirmPassword) {
      setError("两次输入的新密码不一致");
      return;
    }

    if (newPassword.length < 6) {
      setError("新密码至少6位");
      return;
    }

    setLoading(true);
    try {
      await api.put("/users/password", {
        old_password: oldPassword,
        new_password: newPassword,
      });
      setSuccess("密码修改成功");
      setOldPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      setError(error.response?.data?.message || "修改失败");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto animate-fade-in">
      <button
        onClick={() => navigate(-1)}
        className="btn-press flex items-center gap-1 text-gray-500 hover:text-gray-700 mb-4 transition-colors"
      >
        <ArrowLeft size={20} />
        <span>返回</span>
      </button>

      <div className="bg-white rounded-xl p-6 shadow-sm">
        <h1 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
          <Lock size={20} />
          修改密码
        </h1>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="p-3 bg-red-50 text-red-600 rounded-lg text-sm animate-fade-in">
              {error}
            </div>
          )}
          {success && (
            <div className="p-3 bg-green-50 text-green-600 rounded-lg text-sm animate-fade-in">
              {success}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              原密码
            </label>
            <input
              type="password"
              value={oldPassword}
              onChange={(e) => setOldPassword(e.target.value)}
              className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:outline-none focus:border-orange-400 transition-colors"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              新密码
            </label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="至少6位"
              className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:outline-none focus:border-orange-400 transition-colors"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              确认新密码
            </label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="再次输入新密码"
              className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:outline-none focus:border-orange-400 transition-colors"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn-press w-full py-2.5 bg-orange-500 text-white rounded-lg hover:bg-orange-600 active:bg-orange-700 disabled:opacity-50 transition-colors"
          >
            {loading ? "修改中..." : "修改密码"}
          </button>
        </form>
      </div>
    </div>
  );
}
