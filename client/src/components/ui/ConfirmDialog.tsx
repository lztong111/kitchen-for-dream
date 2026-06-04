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
          <div
            className={`w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-3 ${
              danger ? "bg-red-100" : "bg-orange-100"
            }`}
          >
            <AlertTriangle
              size={28}
              className={danger ? "text-red-500" : "text-orange-500"}
            />
          </div>
          <h3 className="text-lg font-semibold text-gray-800 mb-1">{title}</h3>
          <p className="text-sm text-gray-500">{message}</p>
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
            className="btn-press w-full py-2.5 border border-gray-200 text-gray-600 rounded-lg hover:bg-gray-50 transition-colors"
          >
            {cancelText}
          </button>
        </div>
      </div>
    </div>
  );
}
