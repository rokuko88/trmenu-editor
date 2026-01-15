"use client";

import { cn } from "@/lib/utils";
import { Plus } from "lucide-react";
import type { MenuItem } from "@/types";

interface MenuSlotProps {
  slot: number;
  item?: MenuItem;
  isSelected: boolean;
  isDragOver: boolean;
  isDragging: boolean;
  isInSelection: boolean;
  slotBorders?: {
    borderTop?: boolean;
    borderRight?: boolean;
    borderBottom?: boolean;
    borderLeft?: boolean;
  };
  onSelect: (e?: React.MouseEvent) => void;
  onDragStart?: (e: React.DragEvent) => void;
  onDragEnd?: () => void;
  children?: React.ReactNode;
}

export function MenuSlot({
  slot,
  item,
  isSelected,
  isDragOver,
  isDragging,
  isInSelection,
  slotBorders,
  onSelect,
  onDragStart,
  onDragEnd,
  children,
}: MenuSlotProps) {
  return (
    <div
      className={cn(
        "relative aspect-square transition-colors",
        "hover:border-primary/40 cursor-pointer group",
        // 基础边框和圆角
        "border border-border/40",
        // 选中态 - 移除圆角，避免边框断开
        isInSelection && "rounded-none",
        // 单独选中的物品
        isSelected &&
          !isInSelection &&
          "border-primary ring-2 ring-primary/20 bg-primary/10 rounded-sm",
        // 在选区内
        isInSelection && "bg-primary/8",
        // 拖拽悬停
        isDragOver && "border-primary bg-primary/5",
        // 物品状态
        !item && "bg-background hover:bg-muted/50",
        item && "bg-card hover:border-border/80"
      )}
      style={
        isInSelection && slotBorders
          ? {
              borderTopColor: slotBorders.borderTop
                ? "hsl(var(--primary) / 0.6)"
                : "transparent",
              borderRightColor: slotBorders.borderRight
                ? "hsl(var(--primary) / 0.6)"
                : "transparent",
              borderBottomColor: slotBorders.borderBottom
                ? "hsl(var(--primary) / 0.6)"
                : "transparent",
              borderLeftColor: slotBorders.borderLeft
                ? "hsl(var(--primary) / 0.6)"
                : "transparent",
              borderWidth: "2px",
            }
          : undefined
      }
      onClick={(e) => {
        e.stopPropagation();
        onSelect(e);
      }}
    >
      {item ? (
        <div
          draggable
          onDragStart={(e) => {
            e.stopPropagation();
            onDragStart?.(e);
          }}
          onDragEnd={onDragEnd}
          onMouseDown={(e) => {
            // 阻止物品拖拽时触发框选
            e.stopPropagation();
          }}
          className={cn(
            "w-full h-full",
            isDragging && "opacity-40 cursor-grabbing",
            "cursor-grab active:cursor-grabbing"
          )}
        >
          {children}
        </div>
      ) : (
        <div className="w-full h-full flex items-center justify-center text-muted-foreground/20 group-hover:text-muted-foreground/40 transition-colors">
          <Plus className="h-4 w-4" />
        </div>
      )}

      {/* 槽位号 */}
      <span className="absolute top-1 left-1 text-[9px] text-muted-foreground/40 font-mono leading-none pointer-events-none">
        {slot}
      </span>
    </div>
  );
}
