import { useState, useEffect } from "react";
import { MessageCircle, Star, Trash2, Send } from "lucide-react";
import { useAuthStore } from "../../stores/auth";
import LoginPrompt from "../ui/LoginPrompt";
import api from "../../api";
import type { Comment } from "shared/types";

interface CommentSectionProps {
  dishId: number;
}

export default function CommentSection({ dishId }: CommentSectionProps) {
  const { user } = useAuthStore();
  const [comments, setComments] = useState<Comment[]>([]);
  const [total, setTotal] = useState(0);
  const [content, setContent] = useState("");
  const [rating, setRating] = useState<number>(0);
  const [submitting, setSubmitting] = useState(false);
  const [page, setPage] = useState(1);
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);
  const limit = 10;

  const fetchComments = async () => {
    try {
      const res = await api.get<{ data: { comments: Comment[]; total: number } }>(
        `/comments/dish/${dishId}`,
        { params: { page, limit } }
      );
      setComments(res.data.data.comments);
      setTotal(res.data.data.total);
    } catch {
      console.error("Failed to fetch comments");
    }
  };

  useEffect(() => {
    fetchComments();
  }, [dishId, page]);

  const handleSubmit = async () => {
    if (!user) {
      setShowLoginPrompt(true);
      return;
    }

    if (!content.trim()) return;

    setSubmitting(true);
    try {
      const res = await api.post<{ data: Comment }>(`/comments/${dishId}`, {
        content: content.trim(),
        rating: rating > 0 ? rating : undefined,
      });
      setComments((prev) => [res.data.data, ...prev]);
      setTotal((prev) => prev + 1);
      setContent("");
      setRating(0);
    } catch {
      alert("评论失败");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("确定删除这条评论？")) return;
    try {
      await api.delete(`/comments/${id}`);
      setComments((prev) => prev.filter((c) => c.id !== id));
      setTotal((prev) => prev - 1);
    } catch {
      alert("删除失败");
    }
  };

  const totalPages = Math.ceil(total / limit);

  return (
    <>
    <div className="bg-white rounded-xl p-6 shadow-sm">
      <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
        <MessageCircle size={20} />
        评论 ({total})
      </h2>

      {/* 发表评论 */}
      <div className="mb-6">
        <div className="flex gap-2 mb-2">
          <div className="flex items-center gap-1">
            {[1, 2, 3, 4, 5].map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => setRating(s === rating ? 0 : s)}
                className="transition-colors"
              >
                <Star
                  size={18}
                  className={
                    s <= rating
                      ? "fill-yellow-400 text-yellow-400"
                      : "text-gray-300 hover:text-yellow-300"
                  }
                />
              </button>
            ))}
            {rating > 0 && (
              <span className="text-xs text-gray-400 ml-1">{rating}分</span>
            )}
          </div>
        </div>
        <div className="flex gap-2">
          <input
            type="text"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
            placeholder={user ? "说说你的看法..." : "登录后评论"}
            className="flex-1 px-4 py-2.5 rounded-lg border border-gray-200 focus:outline-none focus:border-orange-400 transition-colors text-sm"
            maxLength={500}
            disabled={!user}
          />
          <button
            onClick={handleSubmit}
            disabled={submitting || !content.trim()}
            className="btn-press px-4 py-2.5 bg-orange-500 text-white rounded-lg hover:bg-orange-600 active:bg-orange-700 disabled:opacity-50 transition-colors"
          >
            <Send size={16} />
          </button>
        </div>
      </div>

      {/* 评论列表 */}
      {comments.length === 0 ? (
        <p className="text-center text-gray-400 py-6">暂无评论</p>
      ) : (
        <div className="space-y-4">
          {comments.map((comment) => (
            <div
              key={comment.id}
              className="flex gap-3 p-3 bg-gray-50 rounded-lg"
            >
              <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center text-orange-500 text-sm font-semibold shrink-0">
                {comment.user?.username?.[0] || "?"}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-gray-700">
                      {comment.user?.username || "匿名"}
                    </span>
                    {comment.rating && (
                      <div className="flex items-center gap-0.5">
                        {[1, 2, 3, 4, 5].map((s) => (
                          <Star
                            key={s}
                            size={12}
                            className={
                              s <= comment.rating!
                                ? "fill-yellow-400 text-yellow-400"
                                : "text-gray-200"
                            }
                          />
                        ))}
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-400">
                      {new Date(comment.created_at).toLocaleDateString("zh-CN")}
                    </span>
                    {user && user.id === comment.user_id && (
                      <button
                        onClick={() => handleDelete(comment.id)}
                        className="text-gray-400 hover:text-red-500 transition-colors"
                      >
                        <Trash2 size={14} />
                      </button>
                    )}
                  </div>
                </div>
                <p className="text-sm text-gray-600 mt-1">{comment.content}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 分页 */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-3 mt-4">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="text-sm text-gray-500 disabled:opacity-40"
          >
            上一页
          </button>
          <span className="text-xs text-gray-400">
            {page}/{totalPages}
          </span>
          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="text-sm text-gray-500 disabled:opacity-40"
          >
            下一页
          </button>
        </div>
      )}
    </div>

    <LoginPrompt
      open={showLoginPrompt}
      onClose={() => setShowLoginPrompt(false)}
    />
    </>
  );
}
