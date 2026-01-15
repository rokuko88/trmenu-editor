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
  onSelect,
  onDragStart,
  onDragEnd,
  children,
}: MenuSlotProps) {
  return (
    <div
      className={cn(
        "relative aspect-square border transition-all",
        "hover:border-primary/50 cursor-pointer group",
        isSelected && "border-primary ring-2 ring-primary/20",
        isInSelection && !isSelected && "border-primary/70 bg-primary/5 ring-1 ring-primary/10",
        isDragOver && "border-primary bg-primary/5",
        !item && "bg-background border-border/40 hover:bg-muted/50",
        item && "bg-card border-border hover:border-border/80"
      )}
      onClick={(e) => onSelect(e)}
    >
      {item ? (
        <div
          draggable
          onDragStart={onDragStart}
          onDragEnd={onDragEnd}
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
