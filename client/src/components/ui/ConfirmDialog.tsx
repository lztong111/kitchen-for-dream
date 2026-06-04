import { AlertTriangle, X } from "lucide-react";

interface ConfirmDialogProps {
  open: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  danger?: boolean;
  onConfirm: () => void;
  onClose: () => void;
}

export default function ConfirmDialog({
  open,
  title,
  message,
  confirmText = "确定",
  cancelText = "取消",
  danger = false,
  onConfirm,
  onClose,
}: ConfirmDialogProps) {
  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40"
      onClick={onClose}
    >
      <div
        className="bg-white dark:bg-gray-800 rounded-2xl p-6 w-80 shadow-xl animate-fade-in"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-end">
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <div className="text-center mb-6">
          <div
            className={`w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-3 ${
              danger
                ? "bg-red-100 dark:bg-red-900/30"
                : "bg-orange-100 dark:bg-orange-900/30"
            }`}
          >
            <AlertTriangle
              size={28}
              className={danger ? "text-red-500" : "text-orange-500"}
            />
          </div>
          <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-1">
            {title}
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">{message}</p>
        </div>

        <div className="flex flex-col gap-2">
          <button
            onClick={() => {
              onConfirm();
              onClose();
            }}
            className={`btn-press w-full py-2.5 text-white rounded-lg transition-colors ${
              danger
                ? "bg-red-500 hover:bg-red-600 active:bg-red-700"
                : "bg-orange-500 hover:bg-orange-600 active:bg-orange-700"
            }`}
          >
            {confirmText}
          </button>
          <button
            onClick={onClose}
            className="btn-press w-full py-2.5 border border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          >
            {cancelText}
          </button>
        </div>
      </div>
    </div>
  );
}
