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
}

export function useSelection({ onSelectionChange }: UseSelectionOptions = {}) {
  const [selectedSlots, setSelectedSlots] = useState<Set<number>>(new Set());
  const [isSelecting, setIsSelecting] = useState(false);
  const [selectionRect, setSelectionRect] = useState<SelectionRect | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const startPosRef = useRef<{ x: number; y: number } | null>(null);

  const handleMouseDown = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    // 只在按下鼠标左键且不是在槽位上时开始选择
    if (e.button !== 0) return;
    
    const target = e.target as HTMLElement;
    // 如果点击的是槽位或其子元素，不启动框选
    if (target.closest("[data-slot]")) return;

    const container = containerRef.current;
    if (!container) return;

    const rect = container.getBoundingClientRect();
    const startX = e.clientX - rect.left;
    const startY = e.clientY - rect.top;

    startPosRef.current = { x: startX, y: startY };
    setIsSelecting(true);
    setSelectionRect({
      startX,
      startY,
      endX: startX,
      endY: startY,
    });

    // 如果没有按 Ctrl/Cmd，清空之前的选择
    if (!e.ctrlKey && !e.metaKey) {
      setSelectedSlots(new Set());
    }
  }, []);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isSelecting || !startPosRef.current) return;

    const container = containerRef.current;
    if (!container) return;

    const rect = container.getBoundingClientRect();
    const currentX = e.clientX - rect.left;
    const currentY = e.clientY - rect.top;

    setSelectionRect({
      startX: startPosRef.current.x,
      startY: startPosRef.current.y,
      endX: currentX,
      endY: currentY,
    });

    // 计算选中的槽位
    updateSelectedSlots(container, startPosRef.current.x, startPosRef.current.y, currentX, currentY);
  }, [isSelecting]);

  const handleMouseUp = useCallback(() => {
    setIsSelecting(false);
    startPosRef.current = null;
  }, []);

  const updateSelectedSlots = useCallback((
    container: HTMLElement,
    startX: number,
    startY: number,
    endX: number,
    endY: number
  ) => {
    const minX = Math.min(startX, endX);
    const maxX = Math.max(startX, endX);
    const minY = Math.min(startY, endY);
    const maxY = Math.max(startY, endY);

    const slots = container.querySelectorAll("[data-slot]");
    const newSelectedSlots = new Set<number>();

    slots.forEach((slotElement) => {
      const slotRect = slotElement.getBoundingClientRect();
      const containerRect = container.getBoundingClientRect();

      const slotX = slotRect.left - containerRect.left;
      const slotY = slotRect.top - containerRect.top;
      const slotWidth = slotRect.width;
      const slotHeight = slotRect.height;

      // 检查槽位是否与选择区域相交
      if (
        slotX + slotWidth > minX &&
        slotX < maxX &&
        slotY + slotHeight > minY &&
        slotY < maxY
      ) {
        const slotNumber = parseInt(slotElement.getAttribute("data-slot") || "0");
        newSelectedSlots.add(slotNumber);
      }
    });

    setSelectedSlots(newSelectedSlots);
    onSelectionChange?.(Array.from(newSelectedSlots));
  }, [onSelectionChange]);

  useEffect(() => {
    if (isSelecting) {
      window.addEventListener("mousemove", handleMouseMove);
      window.addEventListener("mouseup", handleMouseUp);

      return () => {
        window.removeEventListener("mousemove", handleMouseMove);
        window.removeEventListener("mouseup", handleMouseUp);
      };
    }
  }, [isSelecting, handleMouseMove, handleMouseUp]);

  const clearSelection = useCallback(() => {
    setSelectedSlots(new Set());
    setSelectionRect(null);
    onSelectionChange?.([]);
  }, [onSelectionChange]);

  const toggleSlot = useCallback((slot: number, ctrlKey: boolean) => {
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
  }, [onSelectionChange]);

  return {
    selectedSlots,
    isSelecting,
    selectionRect,
    containerRef,
    handleMouseDown,
    clearSelection,
    toggleSlot,
  };
}
