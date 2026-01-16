"use client";

import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Copy,
  Scissors,
  Trash2,
  X,
  ArrowUp,
  ArrowDown,
  ArrowLeft,
  ArrowRight,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface SelectionToolbarProps {
  selectedCount: number;
  onCopy: () => void;
  onCut: () => void;
  onDelete: () => void;
  onMove: (direction: "up" | "down" | "left" | "right") => void;
  onClear: () => void;
  className?: string;
}

export function SelectionToolbar({
  selectedCount,
  onCopy,
  onCut,
  onDelete,
  onMove,
  onClear,
  className,
}: SelectionToolbarProps) {
  if (selectedCount === 0) return null;

  return (
    <div
      className={cn(
        "fixed bottom-8 left-1/2 -translate-x-1/2",
        "bg-card rounded-lg border shadow-lg",
        "flex items-center gap-1 px-2 py-1",
        "animate-in slide-in-from-bottom-4 duration-200",
        className
      )}
    >
      {/* 选中数量 */}
      <div className="flex items-center gap-2 px-2">
        <span className="text-foreground text-sm font-medium">
          已选中 {selectedCount} 项
        </span>
      </div>

      <Separator orientation="vertical" className="h-6" />

      {/* 移动控制 */}
      <div className="flex items-center gap-0.5">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onMove("up")}
          className="h-8 w-8 p-0"
          title="向上移动"
        >
          <ArrowUp className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onMove("down")}
          className="h-8 w-8 p-0"
          title="向下移动"
        >
          <ArrowDown className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onMove("left")}
          className="h-8 w-8 p-0"
          title="向左移动"
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onMove("right")}
          className="h-8 w-8 p-0"
          title="向右移动"
        >
          <ArrowRight className="h-4 w-4" />
        </Button>
      </div>

      <Separator orientation="vertical" className="h-6" />

      {/* 编辑操作 */}
      <Button variant="ghost" size="sm" onClick={onCopy} className="h-8 px-3">
        <Copy className="mr-1.5 h-4 w-4" />
        复制
      </Button>

      <Button variant="ghost" size="sm" onClick={onCut} className="h-8 px-3">
        <Scissors className="mr-1.5 h-4 w-4" />
        剪切
      </Button>

      <Separator orientation="vertical" className="h-6" />

      {/* 删除 */}
      <Button
        variant="ghost"
        size="sm"
        onClick={onDelete}
        className="text-destructive hover:text-destructive hover:bg-destructive/10 h-8 px-3"
      >
        <Trash2 className="mr-1.5 h-4 w-4" />
        删除
      </Button>

      <Separator orientation="vertical" className="h-6" />

      {/* 取消选择 */}
      <Button
        variant="ghost"
        size="sm"
        onClick={onClear}
        className="h-8 w-8 p-0"
        title="取消选择"
      >
        <X className="h-4 w-4" />
      </Button>
    </div>
  );
}
