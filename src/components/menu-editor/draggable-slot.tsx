"use client";

import { ReactNode } from "react";
import { useDraggable, useDroppable } from "@dnd-kit/core";
import { cn } from "@/lib/utils";
import { useDndMenu } from "./dnd-context";

interface DraggableSlotProps {
  slot: number;
  children?: ReactNode;
  isSelected: boolean;
  isInSelection: boolean;
  slotBorders?: {
    borderTop: boolean;
    borderRight: boolean;
    borderBottom: boolean;
    borderLeft: boolean;
  };
  onSelect?: (e?: React.MouseEvent) => void;
  className?: string;
}

export function DraggableSlot({
  slot,
  children,
  isSelected,
  isInSelection,
  slotBorders,
  onSelect,
  className,
}: DraggableSlotProps) {
  const { draggedSlots, dragOverSlot } = useDndMenu();

  // 使用 dnd-kit 的 draggable 和 droppable
  const {
    attributes,
    listeners,
    setNodeRef: setDraggableRef,
  } = useDraggable({
    id: slot.toString(),
    disabled: !children, // 空槽位不可拖动
  });

  const { setNodeRef: setDroppableRef, isOver } = useDroppable({
    id: slot.toString(),
  });

  // 合并 refs
  const setRefs = (element: HTMLDivElement | null) => {
    setDraggableRef(element);
    setDroppableRef(element);
  };

  const isBeingDragged = draggedSlots.has(slot);
  const isDragOver = isOver || dragOverSlot === slot;

  // 根据是否有智能边框来决定样式
  const hasSmartBorders = slotBorders && isInSelection;

  return (
    <div
      ref={setRefs}
      data-slot={slot}
      className={cn(
        "relative aspect-square bg-background",
        // 只对背景色和边框色应用过渡，opacity 立即变化
        "transition-[background-color,border-color] duration-150",
        // 默认边框（没有智能边框时）
        !hasSmartBorders && "border",
        // 选中状态（单独选中，不在选区中）- 提升 z-index 避免被遮挡
        isSelected &&
          !isInSelection &&
          "ring-2 ring-primary ring-offset-1 z-10",
        // 框选状态 - 也需要提升 z-index
        isInSelection && "z-10",
        // 拖动悬停状态 - 更高的 z-index，带脉冲动画
        isDragOver &&
          "border-primary bg-primary/10 ring-2 ring-primary ring-offset-1 z-20 animate-pulse",
        // 正在被拖动 - 立即变化，不使用过渡
        isBeingDragged && "opacity-40! transition-none!",
        // 可拖动光标
        children && "cursor-move",
        // 默认状态边框颜色（没有被选中也没有在选区中）
        !isSelected &&
          !isInSelection &&
          !isDragOver &&
          "border-border/40 hover:border-border hover:bg-accent/50 hover:z-5",
        // 外部传入的自定义样式
        className
      )}
      style={{
        // 智能边框（选区内相邻槽位的边缘才显示边框）
        ...(hasSmartBorders && {
          borderStyle: "solid",
          borderColor: "hsl(var(--primary))",
          borderTopWidth: slotBorders.borderTop ? "2px" : "0",
          borderRightWidth: slotBorders.borderRight ? "2px" : "0",
          borderBottomWidth: slotBorders.borderBottom ? "2px" : "0",
          borderLeftWidth: slotBorders.borderLeft ? "2px" : "0",
          // 确保智能边框不会被 ring-offset 覆盖
          boxSizing: "border-box",
        }),
      }}
      onClick={onSelect}
      {...attributes}
      {...listeners}
    >
      {/* 槽位编号 */}
      <span className="absolute top-0.5 left-0.5 text-[8px] text-muted-foreground/30 font-mono leading-none pointer-events-none select-none">
        {slot}
      </span>

      {/* 物品内容 */}
      {children && (
        <div className="absolute inset-0 flex items-center justify-center p-1 pointer-events-none">
          {children}
        </div>
      )}
    </div>
  );
}
