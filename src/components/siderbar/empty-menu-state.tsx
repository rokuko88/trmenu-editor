import { File } from "lucide-react";

export function EmptyMenuState() {
  return (
    <div className="px-4 py-8 text-center">
      <div className="bg-muted mb-3 inline-flex h-12 w-12 items-center justify-center rounded-full">
        <File className="text-muted-foreground h-6 w-6" />
      </div>
      <p className="text-muted-foreground mb-1 text-sm font-medium">暂无菜单</p>
      <p className="text-muted-foreground/70 text-xs">
        点击上方 + 号创建新菜单
      </p>
    </div>
  );
}
