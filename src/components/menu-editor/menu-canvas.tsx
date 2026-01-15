"use client";

import { useState, useEffect, useCallback } from "react";
import type { MenuItem, MenuConfig } from "@/types";
import { Plus, Copy, Clipboard, Trash2, Files } from "lucide-react";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuTrigger,
} from "@/components/ui/context-menu";
import { MenuSlot } from "./menu-slot";
import { MenuItemDisplay } from "./menu-item";
import { SelectionToolbar } from "./selection-toolbar";
import { SelectionBox } from "./selection-box";
import { useSelection } from "@/hooks/use-selection";

interface MenuCanvasProps {
  menu: MenuConfig;
  selectedItemId: string | null;
  onSelectItem: (itemId: string | null) => void;
  onSlotClick: (slot: number) => void;
  onItemMove: (itemId: string, newSlot: number) => void;
  onItemCopy?: (item: MenuItem) => void;
  onItemPaste?: (slot: number) => void;
  onItemDelete?: (itemId: string) => void;
  onItemClone?: (item: MenuItem, targetSlot: number) => void;
  onBatchDelete?: (itemIds: string[]) => void;
  onBatchMove?: (
    slots: number[],
    direction: "up" | "down" | "left" | "right"
  ) => void;
  clipboard?: MenuItem | null;
}

export function MenuCanvas({
  menu,
  selectedItemId,
  onSelectItem,
  onSlotClick,
  onItemMove,
  onItemCopy,
  onItemPaste,
  onItemDelete,
  onItemClone,
  onBatchDelete,
  onBatchMove,
  clipboard,
}: MenuCanvasProps) {
  const [draggedItem, setDraggedItem] = useState<MenuItem | null>(null);
  const [dragOverSlot, setDragOverSlot] = useState<number | null>(null);
  // const [batchClipboard, setBatchClipboard] = useState<{ items: MenuItem[]; mode: "copy" | "cut" } | null>(null);

  // 使用框选 hook
  const {
    selectedSlots,
    isSelecting,
    selectionRect,
    containerRef,
    handleMouseDown,
    clearSelection,
    toggleSlot,
  } = useSelection();

  // 批量操作：复制
  const handleBatchCopy = useCallback(() => {
    const items = menu.items.filter((item) => selectedSlots.has(item.slot));
    if (items.length > 0) {
      // setBatchClipboard({ items, mode: "copy" });
      // TODO: 实现批量复制到剪贴板
      console.log("批量复制:", items);
    }
  }, [menu.items, selectedSlots]);

  // 批量操作：剪切
  const handleBatchCut = useCallback(() => {
    const items = menu.items.filter((item) => selectedSlots.has(item.slot));
    if (items.length > 0) {
      // setBatchClipboard({ items, mode: "cut" });
      // TODO: 实现批量剪切到剪贴板
      console.log("批量剪切:", items);
    }
  }, [menu.items, selectedSlots]);

  // 批量操作：删除
  const handleBatchDelete = useCallback(() => {
    const itemIds = menu.items
      .filter((item) => selectedSlots.has(item.slot))
      .map((item) => item.id);
    if (itemIds.length > 0 && onBatchDelete) {
      onBatchDelete(itemIds);
      clearSelection();
    }
  }, [menu.items, selectedSlots, onBatchDelete, clearSelection]);

  // 批量操作：移动
  const handleBatchMove = useCallback(
    (direction: "up" | "down" | "left" | "right") => {
      if (selectedSlots.size > 0 && onBatchMove) {
        onBatchMove(Array.from(selectedSlots), direction);
      }
    },
    [selectedSlots, onBatchMove]
  );

  // 快捷键支持
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // 批量选择模式
      if (selectedSlots.size > 0) {
        // Ctrl/Cmd + C - 复制选中的项
        if ((e.ctrlKey || e.metaKey) && e.key === "c") {
          e.preventDefault();
          handleBatchCopy();
          return;
        }

        // Ctrl/Cmd + X - 剪切选中的项
        if ((e.ctrlKey || e.metaKey) && e.key === "x") {
          e.preventDefault();
          handleBatchCut();
          return;
        }

        // Delete - 删除选中的项
        if (e.key === "Delete") {
          e.preventDefault();
          handleBatchDelete();
          return;
        }

        // Escape - 取消选择
        if (e.key === "Escape") {
          e.preventDefault();
          clearSelection();
          return;
        }
      }

      // 单个物品操作
      if (selectedItemId && selectedSlots.size === 0) {
        // Ctrl/Cmd + C - 复制
        if ((e.ctrlKey || e.metaKey) && e.key === "c") {
          const item = menu.items.find((i) => i.id === selectedItemId);
          if (item && onItemCopy) {
            e.preventDefault();
            onItemCopy(item);
          }
        }

        // Ctrl/Cmd + V - 粘贴
        if ((e.ctrlKey || e.metaKey) && e.key === "v") {
          if (clipboard && onItemPaste) {
            e.preventDefault();
            const item = menu.items.find((i) => i.id === selectedItemId);
            const targetSlot = item?.slot ?? 0;
            onItemPaste(targetSlot);
          }
        }

        // Delete - 删除
        if (e.key === "Delete") {
          if (onItemDelete) {
            e.preventDefault();
            onItemDelete(selectedItemId);
          }
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [
    selectedItemId,
    selectedSlots,
    clipboard,
    menu.items,
    onItemCopy,
    onItemPaste,
    onItemDelete,
    handleBatchCopy,
    handleBatchCut,
    handleBatchDelete,
    clearSelection,
  ]);

  // 计算行数和列数
  const rows = menu.size / 9;
  const cols = 9;

  // 获取指定槽位的物品
  const getItemAtSlot = (slot: number): MenuItem | undefined => {
    return menu.items.find((item) => item.slot === slot);
  };

  // 处理拖拽开始
  const handleDragStart = (e: React.DragEvent, item: MenuItem) => {
    setDraggedItem(item);
    e.dataTransfer.effectAllowed = "move";
  };

  // 处理拖拽结束
  const handleDragEnd = () => {
    setDraggedItem(null);
    setDragOverSlot(null);
  };

  // 处理拖拽悬停
  const handleDragOver = (e: React.DragEvent, slot: number) => {
    e.preventDefault();
    setDragOverSlot(slot);
  };

  // 处理放置
  const handleDrop = (e: React.DragEvent, slot: number) => {
    e.preventDefault();
    if (draggedItem) {
      onItemMove(draggedItem.id, slot);
    }
    setDraggedItem(null);
    setDragOverSlot(null);
  };

  // 渲染槽位
  const renderSlot = (slot: number) => {
    const item = getItemAtSlot(slot);
    const isDragOver = dragOverSlot === slot;
    const isSelected = Boolean(item && item.id === selectedItemId);
    const isDragging = Boolean(draggedItem?.id === item?.id);
    const isInSelection = selectedSlots.has(slot);

    return (
      <ContextMenu key={slot}>
        <ContextMenuTrigger>
          <div
            data-slot={slot}
            onDragOver={(e) => handleDragOver(e, slot)}
            onDrop={(e) => handleDrop(e, slot)}
          >
            <MenuSlot
              slot={slot}
              item={item}
              isSelected={isSelected}
              isDragOver={isDragOver}
              isDragging={isDragging}
              isInSelection={Boolean(isInSelection)}
              onSelect={(e?: React.MouseEvent) => {
                if (e) {
                  e.stopPropagation();
                  if (e.ctrlKey || e.metaKey) {
                    toggleSlot(slot, true);
                    return;
                  }
                }
                if (item) {
                  onSelectItem(item.id);
                  clearSelection();
                } else {
                  onSlotClick(slot);
                  clearSelection();
                }
              }}
              onDragStart={(e) => item && handleDragStart(e, item)}
              onDragEnd={handleDragEnd}
            >
              {item && <MenuItemDisplay item={item} />}
            </MenuSlot>
          </div>
        </ContextMenuTrigger>

        {/* 右键菜单 */}
        <ContextMenuContent className="w-48">
          {item ? (
            <>
              <ContextMenuItem
                onClick={() => item && onItemCopy?.(item)}
                disabled={!onItemCopy}
              >
                <Copy className="mr-2 h-4 w-4" />
                <span>复制</span>
                <span className="ml-auto text-xs text-muted-foreground">
                  Ctrl+C
                </span>
              </ContextMenuItem>
              <ContextMenuItem
                onClick={() => onItemPaste?.(slot)}
                disabled={!clipboard || !onItemPaste}
              >
                <Clipboard className="mr-2 h-4 w-4" />
                <span>粘贴到此</span>
                <span className="ml-auto text-xs text-muted-foreground">
                  Ctrl+V
                </span>
              </ContextMenuItem>
              <ContextMenuItem
                onClick={() => item && onItemClone?.(item, slot)}
                disabled={!onItemClone}
              >
                <Files className="mr-2 h-4 w-4" />
                <span>克隆到...</span>
              </ContextMenuItem>
              <ContextMenuSeparator />
              <ContextMenuItem
                onClick={() => item && onItemDelete?.(item.id)}
                disabled={!onItemDelete}
                className="text-destructive focus:text-destructive"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                <span>删除</span>
                <span className="ml-auto text-xs text-muted-foreground">
                  Del
                </span>
              </ContextMenuItem>
            </>
          ) : (
            <>
              <ContextMenuItem
                onClick={() => onItemPaste?.(slot)}
                disabled={!clipboard || !onItemPaste}
              >
                <Clipboard className="mr-2 h-4 w-4" />
                <span>粘贴</span>
                <span className="ml-auto text-xs text-muted-foreground">
                  Ctrl+V
                </span>
              </ContextMenuItem>
              <ContextMenuItem onClick={() => onSlotClick(slot)}>
                <Plus className="mr-2 h-4 w-4" />
                <span>添加物品</span>
              </ContextMenuItem>
            </>
          )}
        </ContextMenuContent>
      </ContextMenu>
    );
  };

  return (
    <div className="flex-1 flex flex-col items-center justify-center p-8 bg-background relative">
      <div className="w-full max-w-3xl space-y-4">
        {/* 菜单标题栏 */}
        <div className="flex items-center justify-between px-1">
          <div>
            <h2 className="text-sm font-medium">{menu.title}</h2>
            <p className="text-xs text-muted-foreground">
              {menu.type} • {menu.size} 槽位 • {menu.items.length} 项
            </p>
          </div>
        </div>

        {/* 菜单网格容器 */}
        <div
          ref={containerRef}
          className="relative bg-muted/30 rounded-lg p-3 border select-none"
          onMouseDown={handleMouseDown}
          style={{
            display: "grid",
            gridTemplateColumns: `repeat(${cols}, 1fr)`,
            gridTemplateRows: `repeat(${rows}, 1fr)`,
            gap: "2px",
          }}
        >
          {Array.from({ length: menu.size }, (_, i) => renderSlot(i))}

          {/* 框选矩形 */}
          {isSelecting && selectionRect && (
            <SelectionBox
              startX={selectionRect.startX}
              startY={selectionRect.startY}
              endX={selectionRect.endX}
              endY={selectionRect.endY}
            />
          )}
        </div>
      </div>

      {/* 批量操作工具栏 */}
      <SelectionToolbar
        selectedCount={selectedSlots.size}
        onCopy={handleBatchCopy}
        onCut={handleBatchCut}
        onDelete={handleBatchDelete}
        onMove={handleBatchMove}
        onClear={clearSelection}
      />
    </div>
  );
}
