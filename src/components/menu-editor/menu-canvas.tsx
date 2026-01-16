"use client";

import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import type { MenuItem, MenuConfig, MenuSize } from "@/types";
import {
  Plus,
  Copy,
  Clipboard,
  Trash2,
  Files,
  ChevronDown,
  ChevronUp,
  GripVertical,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuTrigger,
} from "@/components/ui/context-menu";
import { DndMenuProvider } from "./dnd-context";
import { DraggableSlot } from "./draggable-slot";
import { MenuItemDisplay } from "./menu-item";
import { SelectionToolbar } from "./selection-toolbar";
import { SelectionBox } from "./selection-box";
import { CanvasToolbar } from "./canvas-toolbar";
import { CodeEditor } from "./code-editor";
import { useSelection } from "@/hooks/use-selection";
import { useConfirm } from "@/hooks/use-confirm";
import { cn } from "@/lib/utils";

type ViewMode = "visual" | "code";

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
  onMenuUpdate?: (updates: Partial<MenuConfig>) => void;
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
  onMenuUpdate,
  clipboard,
}: MenuCanvasProps) {
  const [showPlayerInventory, setShowPlayerInventory] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>("visual");
  const [showGrid, setShowGrid] = useState(false);
  const [isResizingMenu, setIsResizingMenu] = useState(false);
  const [previewRows, setPreviewRows] = useState<number | null>(null);
  const resizeStartRef = useRef<{ y: number; initialRows: number } | null>(
    null
  );
  const { confirm, ConfirmDialog } = useConfirm();

  // 使用框选 hook
  const {
    selectedSlots,
    isSelecting,
    selectionRect,
    containerRef,
    handleMouseDown,
    clearSelection,
    toggleSlot,
    updateSelectedSlots,
  } = useSelection();

  // 处理画布点击，用于取消选中
  const handleCanvasMouseDown = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      const target = e.target as HTMLElement;

      // 检查是否点击在菜单容器外（空白区域）
      // 只有点击画布背景本身时才取消选中
      const isCanvasBackground = target === e.currentTarget;
      const isInsideInventoryContainer = containerRef.current?.contains(target);

      // 如果点击在画布空白区域（不在物品栏容器内）
      if (
        isCanvasBackground ||
        (!isInsideInventoryContainer && !target.closest("[data-slot]"))
      ) {
        // 取消单个物品选中
        onSelectItem(null);
        // 取消选区
        clearSelection();
      }

      // 调用框选的 mouseDown 处理
      handleMouseDown(e);
    },
    [handleMouseDown, onSelectItem, clearSelection, containerRef]
  );

  // 计算行数和列数（提前计算，供后续使用）
  const rows = menu.size / 9;
  const cols = 9;

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

  // 批量拖动移动处理（新版本）
  const handleBatchDragMove = useCallback(
    (slotMap: Map<number, number>) => {
      // 执行移动
      slotMap.forEach((newSlot, oldSlot) => {
        const item = menu.items.find((i) => i.slot === oldSlot);
        if (item) {
          onItemMove(item.id, newSlot);
        }
      });

      // 更新选区
      const newSelectedSlots = new Set(slotMap.values());
      updateSelectedSlots(newSelectedSlots);
    },
    [menu.items, onItemMove, updateSelectedSlots]
  );

  // 批量操作：移动（键盘快捷键）
  const handleBatchMove = useCallback(
    (direction: "up" | "down" | "left" | "right") => {
      if (selectedSlots.size > 0 && onBatchMove) {
        onBatchMove(Array.from(selectedSlots), direction);

        // 移动后更新选区到新位置
        const newSelectedSlots = new Set<number>();
        selectedSlots.forEach((slot) => {
          const row = Math.floor(slot / cols);
          const col = slot % cols;
          let newSlot = slot;

          switch (direction) {
            case "up":
              if (row > 0) newSlot = slot - cols;
              break;
            case "down":
              if (row < rows - 1) newSlot = slot + cols;
              break;
            case "left":
              if (col > 0) newSlot = slot - 1;
              break;
            case "right":
              if (col < cols - 1) newSlot = slot + 1;
              break;
          }

          newSelectedSlots.add(newSlot);
        });

        updateSelectedSlots(newSelectedSlots);
      }
    },
    [selectedSlots, onBatchMove, cols, rows, updateSelectedSlots]
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

      // Escape - 取消单个物品选中
      if (e.key === "Escape" && selectedItemId) {
        e.preventDefault();
        onSelectItem(null);
        return;
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
    onSelectItem,
    handleBatchCopy,
    handleBatchCut,
    handleBatchDelete,
    clearSelection,
  ]);

  // 计算所有槽位的智能边框（使用 useMemo 缓存）
  const slotBordersMap = useMemo(() => {
    const map = new Map<
      number,
      {
        borderTop: boolean;
        borderRight: boolean;
        borderBottom: boolean;
        borderLeft: boolean;
      }
    >();

    selectedSlots.forEach((slot) => {
      const row = Math.floor(slot / cols);
      const col = slot % cols;

      const borders = {
        borderTop: true,
        borderRight: true,
        borderBottom: true,
        borderLeft: true,
      };

      // 检查上方槽位
      if (row > 0) {
        const topSlot = slot - cols;
        if (selectedSlots.has(topSlot)) borders.borderTop = false;
      }

      // 检查右方槽位
      if (col < cols - 1) {
        const rightSlot = slot + 1;
        if (selectedSlots.has(rightSlot)) borders.borderRight = false;
      }

      // 检查下方槽位
      if (row < rows - 1) {
        const bottomSlot = slot + cols;
        if (selectedSlots.has(bottomSlot)) borders.borderBottom = false;
      }

      // 检查左方槽位
      if (col > 0) {
        const leftSlot = slot - 1;
        if (selectedSlots.has(leftSlot)) borders.borderLeft = false;
      }

      map.set(slot, borders);
    });

    return map;
  }, [selectedSlots, cols, rows]);

  // 获取指定槽位的物品
  const getItemAtSlot = useCallback(
    (slot: number): MenuItem | undefined => {
      return menu.items.find((item) => item.slot === slot);
    },
    [menu.items]
  );

  // 渲染槽位
  const renderSlot = (slot: number) => {
    const item = getItemAtSlot(slot);
    const isSelected = Boolean(item && item.id === selectedItemId);
    const isInSelection = selectedSlots.has(slot);
    const slotBorders = isInSelection ? slotBordersMap.get(slot) : undefined;

    // 检查槽位是否会在调整大小时被删除
    const willBeRemoved =
      isResizingMenu &&
      previewRows !== null &&
      previewRows < rows &&
      slot >= previewRows * 9;

    return (
      <ContextMenu key={slot}>
        <ContextMenuTrigger>
          <DraggableSlot
            slot={slot}
            isSelected={isSelected}
            isInSelection={isInSelection}
            slotBorders={slotBorders}
            className={cn(willBeRemoved && "bg-destructive/20 opacity-60")}
            onSelect={(e?: React.MouseEvent) => {
              // 阻止事件冒泡，避免触发画布的取消选中逻辑
              e?.stopPropagation();

              if (e && (e.ctrlKey || e.metaKey)) {
                // Ctrl+点击：添加或移除槽位
                // 如果当前有单独选中的物品，先将其槽位添加到选区
                if (selectedItemId && !selectedSlots.size) {
                  const currentItem = menu.items.find(
                    (i) => i.id === selectedItemId
                  );
                  if (currentItem) {
                    updateSelectedSlots(new Set([currentItem.slot, slot]));
                    onSelectItem(null);
                    return;
                  }
                }
                toggleSlot(slot, true);
                // 如果添加到选区，清除单独选中的物品
                if (item) {
                  onSelectItem(null);
                }
                return;
              }
              if (item) {
                onSelectItem(item.id);
                clearSelection();
              } else {
                onSlotClick(slot);
                clearSelection();
              }
            }}
          >
            {item && <MenuItemDisplay item={item} />}
          </DraggableSlot>
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
                <span className="text-muted-foreground ml-auto text-xs">
                  Ctrl+C
                </span>
              </ContextMenuItem>
              <ContextMenuItem
                onClick={() => onItemPaste?.(slot)}
                disabled={!clipboard || !onItemPaste}
              >
                <Clipboard className="mr-2 h-4 w-4" />
                <span>粘贴到此</span>
                <span className="text-muted-foreground ml-auto text-xs">
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
                <span className="text-muted-foreground ml-auto text-xs">
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
                <span className="text-muted-foreground ml-auto text-xs">
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

  // 检查是否可以调整尺寸（仅 CHEST 类型支持）
  const canResize = menu.type === "CHEST";

  // 开始拖拽调整尺寸
  const handleResizeMouseDown = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsResizingMenu(true);
      resizeStartRef.current = {
        y: e.clientY,
        initialRows: rows,
      };
    },
    [rows]
  );

  // 拖拽调整尺寸
  useEffect(() => {
    if (!isResizingMenu || !resizeStartRef.current) return;

    const handleMouseMove = (e: MouseEvent) => {
      if (!resizeStartRef.current) return;

      const deltaY = e.clientY - resizeStartRef.current.y;
      // 每50px约等于一行的高度，使拖拽更灵敏
      const rowHeight = 50;
      const deltaRows = Math.round(deltaY / rowHeight);
      const targetRows = Math.max(
        1,
        Math.min(9, resizeStartRef.current.initialRows + deltaRows)
      );

      setPreviewRows(targetRows);
    };

    const handleMouseUp = async () => {
      if (previewRows !== null && previewRows !== rows && onMenuUpdate) {
        // 检查是否会删除物品
        const itemsToRemove = menu.items.filter(
          (item) => item.slot >= previewRows * 9
        );

        let shouldProceed = true;

        if (itemsToRemove.length > 0) {
          // 显示确认对话框
          shouldProceed = await confirm({
            title: "确认缩小菜单",
            description: `缩小菜单将删除 ${itemsToRemove.length} 个物品。此操作不可撤销，确定要继续吗？`,
            confirmText: "确认删除",
            cancelText: "取消",
            variant: "destructive",
          });
        }

        if (shouldProceed) {
          const newSize = (previewRows * 9) as MenuSize;
          onMenuUpdate({ size: newSize });
        }
      }
      setIsResizingMenu(false);
      setPreviewRows(null);
      resizeStartRef.current = null;
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isResizingMenu, previewRows, rows, onMenuUpdate, menu.items, confirm]);

  return (
    <DndMenuProvider
      menuItems={menu.items}
      selectedSlots={selectedSlots}
      cols={cols}
      rows={rows}
      onItemMove={onItemMove}
      onBatchMove={handleBatchDragMove}
    >
      {ConfirmDialog}
      <div className="bg-accent relative flex flex-1 flex-col">
        {/* Canvas 工具栏 */}
        <CanvasToolbar
          viewMode={viewMode}
          onViewModeChange={setViewMode}
          showGrid={showGrid}
          onToggleGrid={() => setShowGrid(!showGrid)}
          showPlayerInventory={showPlayerInventory}
          onTogglePlayerInventory={() =>
            setShowPlayerInventory(!showPlayerInventory)
          }
        />

        {/* 画布区域 */}
        {viewMode === "code" ? (
          <div className="flex-1 overflow-hidden">
            <CodeEditor menu={menu} />
          </div>
        ) : (
          <div
            className="relative flex flex-1 flex-col items-center justify-center p-8 select-none"
            onMouseDown={handleCanvasMouseDown}
            style={{
              ...(showGrid && {
                backgroundImage:
                  "linear-gradient(rgba(0,0,0,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(0,0,0,0.05) 1px, transparent 1px)",
                backgroundSize: "20px 20px",
                backgroundPosition: "center center",
              }),
            }}
          >
            <div className="pointer-events-none relative z-10 w-full max-w-xl space-y-4">
              {/* 菜单标题栏 */}
              <div className="flex items-center justify-between px-1">
                <div>
                  <h2 className="text-sm font-medium">{menu.title}</h2>
                  <p className="text-muted-foreground text-xs">
                    {menu.type} • {menu.size} 槽位 ({rows} 行) •{" "}
                    {menu.items.length} 项
                  </p>
                </div>
              </div>

              {/* Inventory 容器 */}
              <div className="pointer-events-auto space-y-0">
                <div
                  ref={containerRef}
                  className={cn(
                    "bg-card relative border p-2 transition-all",
                    canResize ? "rounded-t-sm" : "rounded-sm",
                    !isResizingMenu && "transition-all duration-200"
                  )}
                  style={{
                    display: "grid",
                    gridTemplateColumns: `repeat(${cols}, 1fr)`,
                    gridTemplateRows: `repeat(${
                      isResizingMenu && previewRows !== null
                        ? previewRows
                        : rows
                    }, 1fr)`,
                  }}
                >
                  {/* 渲染当前的槽位 */}
                  {Array.from({ length: menu.size }, (_, i) => renderSlot(i))}

                  {/* 拖拽预览：显示额外的空槽位 */}
                  {isResizingMenu &&
                    previewRows !== null &&
                    previewRows > rows &&
                    Array.from({ length: (previewRows - rows) * 9 }, (_, i) => {
                      const slot = menu.size + i;
                      return (
                        <div
                          key={`preview-${slot}`}
                          className="bg-primary/5 border-primary/50 relative aspect-square animate-pulse border-2 border-dashed"
                        >
                          <span className="text-primary/70 absolute top-0.5 left-0.5 font-mono text-[8px] leading-none">
                            {slot}
                          </span>
                          <div className="absolute inset-0 flex items-center justify-center">
                            <Plus className="text-primary/40 h-4 w-4" />
                          </div>
                        </div>
                      );
                    })}

                  {/* 缩小预览：删除行提示 */}
                  {isResizingMenu &&
                    previewRows !== null &&
                    previewRows < rows && (
                      <div
                        className="pointer-events-none absolute right-0 left-0 z-30 flex items-center justify-center"
                        style={{
                          top: `calc(${
                            (previewRows / (previewRows || 1)) * 100
                          }%)`,
                        }}
                      >
                        <div className="bg-destructive text-destructive-foreground -mt-3 rounded-full px-3 py-1 text-xs font-medium shadow-lg">
                          删除 {rows - previewRows} 行
                        </div>
                      </div>
                    )}

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

                {/* 拖拽调整尺寸条 */}
                {canResize && !showPlayerInventory && (
                  <div
                    className={cn(
                      "border-border bg-card relative h-10 w-full rounded-t-none border border-t-0",
                      "flex items-center justify-center gap-2",
                      "text-muted-foreground text-xs",
                      "cursor-ns-resize select-none",
                      "hover:bg-accent/50 hover:text-foreground transition-colors",
                      isResizingMenu &&
                        previewRows !== null &&
                        previewRows < rows
                        ? "bg-destructive/10 text-destructive border-destructive/30"
                        : isResizingMenu && "bg-primary/10 text-primary"
                    )}
                    onMouseDown={handleResizeMouseDown}
                  >
                    <GripVertical className="h-4 w-4" />
                    <span>
                      {isResizingMenu && previewRows !== null ? (
                        previewRows < rows ? (
                          <>
                            调整为 {previewRows} 行 (删除{" "}
                            {
                              menu.items.filter(
                                (item) => item.slot >= previewRows * 9
                              ).length
                            }{" "}
                            个物品)
                          </>
                        ) : (
                          `调整为 ${previewRows} 行 (${previewRows * 9} 槽位)`
                        )
                      ) : (
                        `拖拽调整大小 (${rows} 行)`
                      )}
                    </span>
                    <GripVertical className="h-4 w-4" />
                  </div>
                )}

                {/* 玩家物品栏切换按钮 */}
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-muted-foreground hover:text-foreground h-8 w-full rounded-t-none text-xs"
                  onClick={() => setShowPlayerInventory(!showPlayerInventory)}
                >
                  {showPlayerInventory ? (
                    <>
                      <ChevronUp className="mr-1.5 h-3.5 w-3.5" />
                      隐藏玩家物品栏
                    </>
                  ) : (
                    <>
                      <ChevronDown className="mr-1.5 h-3.5 w-3.5" />
                      显示玩家物品栏
                    </>
                  )}
                </Button>

                {/* 玩家物品栏 */}
                {showPlayerInventory && (
                  <div className="space-y-2">
                    <div className="px-1">
                      <p className="text-muted-foreground text-xs">
                        玩家物品栏（仅预览）
                      </p>
                    </div>

                    {/* 主物品栏 (3行9列) */}
                    <div
                      className="bg-card rounded-sm border p-2 opacity-50"
                      style={{
                        display: "grid",
                        gridTemplateColumns: `repeat(9, 1fr)`,
                        gridTemplateRows: `repeat(3, 1fr)`,
                      }}
                    >
                      {Array.from({ length: 27 }, (_, i) => (
                        <div
                          key={`player-${i}`}
                          className="border-border/40 bg-background relative aspect-square border"
                        >
                          <span className="text-muted-foreground/40 absolute top-1 left-1 font-mono text-[9px] leading-none">
                            {i}
                          </span>
                        </div>
                      ))}
                    </div>

                    {/* 快捷栏 (1行9列) */}
                    <div
                      className="bg-card rounded-sm border p-2 opacity-50"
                      style={{
                        display: "grid",
                        gridTemplateColumns: `repeat(9, 1fr)`,
                        gridTemplateRows: `repeat(1, 1fr)`,
                      }}
                    >
                      {Array.from({ length: 9 }, (_, i) => (
                        <div
                          key={`hotbar-${i}`}
                          className="border-border/40 bg-background relative aspect-square border"
                        >
                          <span className="text-muted-foreground/40 absolute top-1 left-1 font-mono text-[9px] leading-none">
                            {i}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* 批量操作工具栏 */}
            {viewMode === "visual" && (
              <SelectionToolbar
                selectedCount={selectedSlots.size}
                onCopy={handleBatchCopy}
                onCut={handleBatchCut}
                onDelete={handleBatchDelete}
                onMove={handleBatchMove}
                onClear={clearSelection}
              />
            )}
          </div>
        )}
      </div>
    </DndMenuProvider>
  );
}
