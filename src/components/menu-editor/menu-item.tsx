"use client";

import type { MenuItem } from "@/types";
import { Box } from "lucide-react";

interface MenuItemDisplayProps {
  item: MenuItem;
}

export function MenuItemDisplay({ item }: MenuItemDisplayProps) {
  return (
    <div className="w-full h-full flex flex-col items-center justify-center p-2">
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
  );
}

// 获取简短的材质名称
function getShortMaterial(material: string): string {
  const parts = material.split("_");
  if (parts.length > 2) {
    return parts.slice(-2).join("_");
  }
  if (parts.length > 1) {
    return parts.join("_");
  }
  return material.slice(0, 8);
}
