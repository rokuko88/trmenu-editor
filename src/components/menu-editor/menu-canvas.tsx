"use client";

import { useState, useEffect } from "react";
import type { MenuItem, MenuConfig } from "@/types";
import { cn } from "@/lib/utils";
import { Plus, Copy, Clipboard, Trash2, Files, Box } from "lucide-react";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuTrigger,
} from "@/components/ui/context-menu";

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
  clipboard,
}: MenuCanvasProps) {
  const [draggedItem, setDraggedItem] = useState<MenuItem | null>(null);
  const [dragOverSlot, setDragOverSlot] = useState<number | null>(null);

  // 快捷键支持
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
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
        if (selectedItemId && onItemDelete) {
          e.preventDefault();
          onItemDelete(selectedItemId);
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [
    selectedItemId,
    clipboard,
    menu.items,
    onItemCopy,
    onItemPaste,
    onItemDelete,
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
    const isSelected = item && item.id === selectedItemId;
    const isDragging = draggedItem?.id === item?.id;

    return (
      <ContextMenu key={slot}>
        <ContextMenuTrigger>
          <div
            className={cn(
              "relative aspect-square border transition-all",
              "hover:border-primary/50 cursor-pointer group",
              isSelected && "border-primary ring-2 ring-primary/20",
              isDragOver && "border-primary bg-primary/5",
              !item && "bg-background border-border/40 hover:bg-muted/50",
              item && "bg-card border-border hover:border-border/80"
            )}
            onClick={() => {
              if (item) {
                onSelectItem(item.id);
              } else {
                onSlotClick(slot);
              }
            }}
            onDragOver={(e) => handleDragOver(e, slot)}
            onDrop={(e) => handleDrop(e, slot)}
          >
            {item ? (
              <div
                draggable
                onDragStart={(e) => handleDragStart(e, item)}
                onDragEnd={handleDragEnd}
                className={cn(
                  "w-full h-full flex flex-col items-center justify-center p-2",
                  isDragging && "opacity-40 cursor-grabbing",
                  "cursor-grab active:cursor-grabbing"
                )}
              >
                {/* 物品图标 */}
                <div className="flex items-center justify-center">
                  <Box strokeWidth={3} className="h-4 w-4 text-foreground/70" />
                </div>

                {/* 物品材质名称（简短显示） */}
                <div className="text-[9px] text-muted-foreground font-mono mt-1 truncate max-w-full">
                  {getShortMaterial(item.material)}
                </div>

                {/* 物品数量 */}
                {item.amount && item.amount > 1 && (
                  <span className="absolute bottom-1 right-1 text-[10px] font-medium text-foreground/80 bg-background/80 rounded px-1 leading-none">
                    {item.amount}
                  </span>
                )}

                {/* 自定义模型数据标识 */}
                {item.customModelData && (
                  <span className="absolute top-1 right-1 text-[9px] text-muted-foreground/70 bg-background/80 rounded px-1 leading-none font-mono">
                    #{item.customModelData}
                  </span>
                )}
              </div>
            ) : (
              <div className="w-full h-full flex items-center justify-center text-muted-foreground/20 group-hover:text-muted-foreground/40 transition-colors">
                <Plus className="h-4 w-4" />
              </div>
            )}

            {/* 槽位号 */}
            <span className="absolute top-1 left-1 text-[9px] text-muted-foreground/40 font-mono leading-none">
              {slot}
            </span>
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

        {/* 菜单网格 */}
        <div
          className="bg-muted/30 rounded-lg p-3 border"
          style={{
            display: "grid",
            gridTemplateColumns: `repeat(${cols}, 1fr)`,
            gridTemplateRows: `repeat(${rows}, 1fr)`,
            gap: "2px",
          }}
        >
          {Array.from({ length: menu.size }, (_, i) => renderSlot(i))}
        </div>
      </div>
    </div>
  );
}

// 获取简短的材质名称
function getShortMaterial(material: string): string {
  // 移除常见前缀，让名称更简短
  const parts = material.split("_");
  if (parts.length > 2) {
    return parts.slice(-2).join("_");
  }
  if (parts.length > 1) {
    return parts.join("_");
  }
  return material.slice(0, 8);
}
