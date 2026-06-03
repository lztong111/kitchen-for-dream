import { Loader2 } from "lucide-react";

interface LoadingProps {
  text?: string;
}

export default function Loading({ text = "加载中..." }: LoadingProps) {
  return (
    <div className="flex flex-col items-center justify-center py-20">
      <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
      <span className="mt-3 text-gray-500">{text}</span>
    </div>
  );
}
