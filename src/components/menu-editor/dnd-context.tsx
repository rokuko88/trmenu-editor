"use client";

import { createContext, useContext, useState, ReactNode } from "react";
import {
  DndContext,
  DragOverlay,
  DragStartEvent,
  DragEndEvent,
  DragOverEvent,
  useSensor,
  useSensors,
  PointerSensor,
  KeyboardSensor,
  closestCenter,
} from "@dnd-kit/core";
import type { MenuItem } from "@/types";
import { MenuItemDisplay } from "./menu-item";
import { cn } from "@/lib/utils";

interface DndMenuContextValue {
  draggedItem: MenuItem | null;
  draggedSlots: Set<number>;
  isDragging: boolean;
  dragOverSlot: number | null;
}

const DndMenuContext = createContext<DndMenuContextValue>({
  draggedItem: null,
  draggedSlots: new Set(),
  isDragging: false,
  dragOverSlot: null,
});

export const useDndMenu = () => useContext(DndMenuContext);

interface DndMenuProviderProps {
  children: ReactNode;
  menuItems: MenuItem[];
  selectedSlots: Set<number>;
  cols: number;
  rows: number;
  onItemMove: (itemId: string, newSlot: number) => void;
  onBatchMove?: (slotMap: Map<number, number>) => void;
}

export function DndMenuProvider({
  children,
  menuItems,
  selectedSlots,
  cols,
  rows,
  onItemMove,
  onBatchMove,
}: DndMenuProviderProps) {
  const [draggedItem, setDraggedItem] = useState<MenuItem | null>(null);
  const [draggedSlots, setDraggedSlots] = useState<Set<number>>(new Set());
  const [isDragging, setIsDragging] = useState(false);
  const [dragOverSlot, setDragOverSlot] = useState<number | null>(null);
  const [dragStartSlot, setDragStartSlot] = useState<number | null>(null);

  // 配置传感器
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5, // 移动5px后才激活拖动
      },
    }),
    useSensor(KeyboardSensor)
  );

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    const slot = parseInt(active.id as string);

    setDragStartSlot(slot);
    setIsDragging(true);

    // 如果拖动的槽位在选中集合中，拖动整个选区
    if (selectedSlots.has(slot) && selectedSlots.size > 1) {
      // 多个槽位拖动
      setDraggedSlots(new Set(selectedSlots));
      setDraggedItem(null); // 清除单个物品状态
    } else {
      // 单个物品拖动
      const item = menuItems.find((i) => i.slot === slot);
      if (item) {
        setDraggedItem(item);
        setDraggedSlots(new Set([slot]));
      }
    }
  };

  const handleDragOver = (event: DragOverEvent) => {
    const { over } = event;
    if (over) {
      setDragOverSlot(parseInt(over.id as string));
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { over } = event;

    if (!over || dragStartSlot === null) {
      resetDragState();
      return;
    }

    const targetSlot = parseInt(over.id as string);

    // 批量移动
    if (draggedSlots.size > 1 && onBatchMove) {
      const startRow = Math.floor(dragStartSlot / cols);
      const startCol = dragStartSlot % cols;
      const targetRow = Math.floor(targetSlot / cols);
      const targetCol = targetSlot % cols;
      const rowOffset = targetRow - startRow;
      const colOffset = targetCol - startCol;

      const slotMap = new Map<number, number>();
      const newSlots = new Set<number>();

      draggedSlots.forEach((slot) => {
        const row = Math.floor(slot / cols);
        const col = slot % cols;
        const newRow = row + rowOffset;
        const newCol = col + colOffset;

        // 检查边界
        if (newRow >= 0 && newRow < rows && newCol >= 0 && newCol < cols) {
          const newSlot = newRow * cols + newCol;
          slotMap.set(slot, newSlot);
          newSlots.add(newSlot);
        }
      });

      // 检查冲突
      const hasConflict = Array.from(slotMap.values()).some((newSlot) => {
        const item = menuItems.find((i) => i.slot === newSlot);
        return item && !draggedSlots.has(item.slot);
      });

      if (!hasConflict) {
        onBatchMove(slotMap);
      } else {
        import("sonner").then(({ toast }) => {
          toast.error("目标位置有物品，无法移动");
        });
      }
    }
    // 单个物品移动
    else if (draggedItem && draggedItem.slot !== targetSlot) {
      onItemMove(draggedItem.id, targetSlot);
    }

    resetDragState();
  };

  const handleDragCancel = () => {
    resetDragState();
  };

  const resetDragState = () => {
    setDraggedItem(null);
    setDraggedSlots(new Set());
    setIsDragging(false);
    setDragOverSlot(null);
    setDragStartSlot(null);
  };

  // 渲染拖动预览
  const renderDragOverlay = () => {
    if (draggedSlots.size === 0) return null;

    // 单个物品拖动
    if (draggedSlots.size === 1) {
      const slot = Array.from(draggedSlots)[0];
      const item = menuItems.find((i) => i.slot === slot);
      if (item) {
        return (
          <div className="bg-card border-primary flex h-14 w-14 scale-110 rotate-3 items-center justify-center rounded-md border-2 shadow-2xl transition-transform">
            <MenuItemDisplay item={item} />
          </div>
        );
      }
    }

    // 多个物品拖动 - 显示实际布局（整个网格跟随鼠标）
    const selectedArray = Array.from(draggedSlots);
    const minRow = Math.min(...selectedArray.map((s) => Math.floor(s / cols)));
    const maxRow = Math.max(...selectedArray.map((s) => Math.floor(s / cols)));
    const minCol = Math.min(...selectedArray.map((s) => s % cols));
    const maxCol = Math.max(...selectedArray.map((s) => s % cols));

    const previewRows = maxRow - minRow + 1;
    const previewCols = maxCol - minCol + 1;

    return (
      <div
        className="bg-card/95 border-primary scale-105 rotate-2 rounded-lg border-3 p-2 shadow-2xl backdrop-blur-sm transition-all"
        style={{
          display: "grid",
          gridTemplateColumns: `repeat(${previewCols}, 56px)`,
          gridTemplateRows: `repeat(${previewRows}, 56px)`,
          gap: "4px",
        }}
      >
        {Array.from({ length: previewRows * previewCols }, (_, i) => {
          const r = Math.floor(i / previewCols);
          const c = i % previewCols;
          const actualSlot = (minRow + r) * cols + (minCol + c);
          const isSelected = draggedSlots.has(actualSlot);
          const item = menuItems.find((item) => item.slot === actualSlot);

          return (
            <div
              key={i}
              className={cn(
                "relative rounded-md transition-all",
                isSelected
                  ? item
                    ? "bg-background border-border border-2 shadow-sm"
                    : "bg-primary/25 border-primary/50 border-2 border-dashed"
                  : "bg-transparent opacity-20"
              )}
            >
              {item && isSelected && (
                <div className="absolute inset-0 flex items-center justify-center p-1">
                  <MenuItemDisplay item={item} />
                </div>
              )}
            </div>
          );
        })}

        {/* 数量徽章 */}
        <div className="bg-primary text-primary-foreground absolute -top-2 -right-2 rounded-full px-2 py-1 text-xs font-bold shadow-lg">
          {draggedSlots.size}
        </div>
      </div>
    );
  };

  const contextValue: DndMenuContextValue = {
    draggedItem,
    draggedSlots,
    isDragging,
    dragOverSlot,
  };

  return (
    <DndMenuContext.Provider value={contextValue}>
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDragEnd={handleDragEnd}
        onDragCancel={handleDragCancel}
      >
        {children}
        <DragOverlay dropAnimation={null}>
          {isDragging && renderDragOverlay()}
        </DragOverlay>
      </DndContext>
    </DndMenuContext.Provider>
  );
}
