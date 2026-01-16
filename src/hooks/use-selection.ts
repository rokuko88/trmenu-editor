"use client";

import { useState, useCallback, useRef, useEffect } from "react";

interface SelectionRect {
  startX: number;
  startY: number;
  endX: number;
  endY: number;
}

interface UseSelectionOptions {
  onSelectionChange?: (selectedSlots: number[]) => void;
  scale?: number;
}

export function useSelection({
  onSelectionChange,
  scale = 1,
}: UseSelectionOptions = {}) {
  const [selectedSlots, setSelectedSlots] = useState<Set<number>>(new Set());
  const [isSelecting, setIsSelecting] = useState(false);
  const [selectionRect, setSelectionRect] = useState<SelectionRect | null>(
    null
  );
  const containerRef = useRef<HTMLDivElement>(null);
  const startPosRef = useRef<{ x: number; y: number } | null>(null);
  const isDraggingRef = useRef(false);
  const effectiveScale = Math.max(0.01, scale);

  const handleMouseDown = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      // 只在按下鼠标左键时开始
      if (e.button !== 0) return;

      // 检查点击的目标元素
      const target = e.target as HTMLElement;

      // 如果点击的是可拖动的槽位（带有 cursor-move 类），不启动框选
      const slotElement = target.closest("[data-slot]") as HTMLElement;
      if (slotElement && slotElement.classList.contains("cursor-move")) {
        // 这是有物品的槽位，不启动框选，让拖动逻辑处理
        return;
      }

      const container = containerRef.current;
      if (!container) return;

      const rect = container.getBoundingClientRect();
      const startX = (e.clientX - rect.left) / effectiveScale;
      const startY = (e.clientY - rect.top) / effectiveScale;

      startPosRef.current = { x: startX, y: startY };
      isDraggingRef.current = false;

      // 暂时不设置 isSelecting，等到真正开始拖拽时再设置
      setSelectionRect({
        startX,
        startY,
        endX: startX,
        endY: startY,
      });
    },
    [effectiveScale]
  );

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (!startPosRef.current) return;

      const container = containerRef.current;
      if (!container) return;

      const rect = container.getBoundingClientRect();
      const currentX = (e.clientX - rect.left) / effectiveScale;
      const currentY = (e.clientY - rect.top) / effectiveScale;

      // 计算移动距离，如果超过阈值（3px）则认为是拖拽
      const deltaX = Math.abs(currentX - startPosRef.current.x);
      const deltaY = Math.abs(currentY - startPosRef.current.y);
      const dragThreshold = 3 / effectiveScale;

      if (
        !isDraggingRef.current &&
        (deltaX > dragThreshold || deltaY > dragThreshold)
      ) {
        isDraggingRef.current = true;
        setIsSelecting(true);
        // 开始拖拽时，如果没有按 Ctrl/Cmd，清空之前的选择
        if (!(e.ctrlKey || e.metaKey)) {
          setSelectedSlots(new Set());
        }
      }

      if (isDraggingRef.current) {
        setSelectionRect({
          startX: startPosRef.current.x,
          startY: startPosRef.current.y,
          endX: currentX,
          endY: currentY,
        });

        // 直接调用，不通过依赖
        const minX = Math.min(startPosRef.current.x, currentX);
        const maxX = Math.max(startPosRef.current.x, currentX);
        const minY = Math.min(startPosRef.current.y, currentY);
        const maxY = Math.max(startPosRef.current.y, currentY);

        const slots = container.querySelectorAll("[data-slot]");
        const newSelectedSlots = new Set<number>();

        slots.forEach((slotElement) => {
          const slotRect = slotElement.getBoundingClientRect();
          const containerRect = container.getBoundingClientRect();

          const slotX = (slotRect.left - containerRect.left) / effectiveScale;
          const slotY = (slotRect.top - containerRect.top) / effectiveScale;
          const slotWidth = slotRect.width / effectiveScale;
          const slotHeight = slotRect.height / effectiveScale;

          // 检查槽位是否与选择区域相交
          if (
            slotX + slotWidth > minX &&
            slotX < maxX &&
            slotY + slotHeight > minY &&
            slotY < maxY
          ) {
            const slotNumber = parseInt(
              slotElement.getAttribute("data-slot") || "0"
            );
            newSelectedSlots.add(slotNumber);
          }
        });

        setSelectedSlots(newSelectedSlots);
        onSelectionChange?.(Array.from(newSelectedSlots));
      }
    },
    [onSelectionChange, effectiveScale]
  );

  const handleMouseUp = useCallback(() => {
    setIsSelecting(false);
    startPosRef.current = null;
    isDraggingRef.current = false;
  }, []);

  useEffect(() => {
    // 只要按下了鼠标就监听移动和松开
    const handleMove = (e: MouseEvent) => handleMouseMove(e);
    const handleUp = () => handleMouseUp();

    window.addEventListener("mousemove", handleMove);
    window.addEventListener("mouseup", handleUp);

    return () => {
      window.removeEventListener("mousemove", handleMove);
      window.removeEventListener("mouseup", handleUp);
    };
  }, [handleMouseMove, handleMouseUp]);

  const clearSelection = useCallback(() => {
    setSelectedSlots(new Set());
    setSelectionRect(null);
    onSelectionChange?.([]);
  }, [onSelectionChange]);

  const toggleSlot = useCallback(
    (slot: number, ctrlKey: boolean) => {
      setSelectedSlots((prev) => {
        const newSet = new Set(prev);
        if (ctrlKey) {
          if (newSet.has(slot)) {
            newSet.delete(slot);
          } else {
            newSet.add(slot);
          }
        } else {
          newSet.clear();
          newSet.add(slot);
        }
        onSelectionChange?.(Array.from(newSet));
        return newSet;
      });
    },
    [onSelectionChange]
  );

  // 更新选中的槽位（用于移动后更新选区）
  const updateSelectedSlots = useCallback(
    (newSlots: Set<number>) => {
      setSelectedSlots(newSlots);
      onSelectionChange?.(Array.from(newSlots));
    },
    [onSelectionChange]
  );

  return {
    selectedSlots,
    isSelecting,
    selectionRect,
    containerRef,
    handleMouseDown,
    clearSelection,
    toggleSlot,
    updateSelectedSlots,
  };
}
