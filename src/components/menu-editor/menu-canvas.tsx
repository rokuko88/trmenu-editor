"use client";

import { useState } from "react";
import type { MenuItem, MenuConfig } from "@/types";
import { cn } from "@/lib/utils";
import { Plus } from "lucide-react";

interface MenuCanvasProps {
  menu: MenuConfig;
  selectedItemId: string | null;
  onSelectItem: (itemId: string | null) => void;
  onSlotClick: (slot: number) => void;
  onItemMove: (itemId: string, newSlot: number) => void;
}

export function MenuCanvas({
  menu,
  selectedItemId,
  onSelectItem,
  onSlotClick,
  onItemMove,
}: MenuCanvasProps) {
  const [draggedItem, setDraggedItem] = useState<MenuItem | null>(null);
  const [dragOverSlot, setDragOverSlot] = useState<number | null>(null);

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
      <div
        key={slot}
        className={cn(
          "relative aspect-square border-2 rounded-md transition-all",
          "hover:border-primary/50 cursor-pointer",
          isSelected && "border-primary ring-2 ring-primary/20",
          isDragOver && "border-primary bg-primary/10",
          !item && "border-border bg-muted/30",
          item && "border-border bg-card"
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
              isDragging && "opacity-50"
            )}
          >
            {/* 物品图标 - 这里暂时用文字表示材质 */}
            <div className="text-2xl mb-1">{getItemIcon(item.material)}</div>
            {/* 物品数量 */}
            {item.amount && item.amount > 1 && (
              <span className="absolute bottom-1 right-1 text-xs font-bold text-foreground">
                {item.amount}
              </span>
            )}
            {/* 自定义模型数据标识 */}
            {item.customModelData && (
              <span className="absolute top-1 right-1 text-[10px] text-muted-foreground">
                #{item.customModelData}
              </span>
            )}
          </div>
        ) : (
          <div className="w-full h-full flex items-center justify-center text-muted-foreground/30">
            <Plus className="h-4 w-4" />
          </div>
        )}

        {/* 槽位号 */}
        <span className="absolute top-0.5 left-1 text-[10px] text-muted-foreground/50">
          {slot}
        </span>
      </div>
    );
  };

  return (
    <div className="flex-1 flex flex-col items-center justify-center p-8 bg-muted/20">
      <div className="w-full max-w-4xl">
        {/* 菜单标题 */}
        <div className="mb-6 text-center">
          <h2 className="text-2xl font-bold mb-2">{menu.title}</h2>
          <p className="text-sm text-muted-foreground">
            {menu.size} 格 • {menu.type} • {menu.items.length} 个物品
          </p>
        </div>

        {/* 菜单网格 */}
        <div
          className="bg-background/80 backdrop-blur-sm rounded-lg p-4 shadow-xl border"
          style={{
            display: "grid",
            gridTemplateColumns: `repeat(${cols}, 1fr)`,
            gridTemplateRows: `repeat(${rows}, 1fr)`,
            gap: "8px",
          }}
        >
          {Array.from({ length: menu.size }, (_, i) => renderSlot(i))}
        </div>

        {/* 提示信息 */}
        <div className="mt-4 text-center text-xs text-muted-foreground">
          点击空槽位添加物品 • 拖拽物品重新排列 • 点击物品查看属性
        </div>
      </div>
    </div>
  );
}

// 根据材质名称返回对应的图标（emoji）
function getItemIcon(material: string): string {
  const iconMap: Record<string, string> = {
    // 常用物品
    DIAMOND: "💎",
    EMERALD: "💚",
    GOLD_INGOT: "🪙",
    IRON_INGOT: "⚙️",
    COAL: "🪨",
    STONE: "🪨",
    DIRT: "🟫",
    GRASS_BLOCK: "🟩",
    OAK_LOG: "🪵",
    STICK: "🥢",
    // 工具
    DIAMOND_SWORD: "⚔️",
    DIAMOND_PICKAXE: "⛏️",
    DIAMOND_AXE: "🪓",
    BOW: "🏹",
    FISHING_ROD: "🎣",
    // 食物
    APPLE: "🍎",
    BREAD: "🍞",
    COOKED_BEEF: "🥩",
    GOLDEN_APPLE: "🍏",
    // 方块
    CHEST: "📦",
    CRAFTING_TABLE: "🔨",
    FURNACE: "🔥",
    ENCHANTING_TABLE: "📕",
    ANVIL: "🔧",
    // 装饰
    GLASS: "🪟",
    WOOL: "🧶",
    CONCRETE: "🧱",
    TERRACOTTA: "🏺",
    // 红石
    REDSTONE: "🔴",
    REPEATER: "🔁",
    COMPARATOR: "⚡",
    LEVER: "🎚️",
    BUTTON: "🔘",
    // 其他
    BARRIER: "🚫",
    COMMAND_BLOCK: "📜",
    PLAYER_HEAD: "👤",
    BOOK: "📖",
    MAP: "🗺️",
  };

  return iconMap[material] || "📦";
}
