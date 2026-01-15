import { File } from "lucide-react";

export function EmptyMenuState() {
  return (
    <div className="text-center py-8 px-4">
      <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-muted mb-3">
        <File className="h-6 w-6 text-muted-foreground" />
      </div>
      <p className="text-sm font-medium text-muted-foreground mb-1">暂无菜单</p>
      <p className="text-xs text-muted-foreground/70">
        点击上方 + 号创建新菜单
      </p>
    </div>
  );
}
