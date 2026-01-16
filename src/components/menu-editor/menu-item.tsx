"use client";

import type { MenuItem } from "@/types";
import { Box } from "lucide-react";

interface MenuItemDisplayProps {
  item: MenuItem;
}

export function MenuItemDisplay({ item }: MenuItemDisplayProps) {
  return (
    <div className="flex h-full w-full flex-col items-center justify-center p-2">
      {/* 物品图标 */}
      <div className="flex items-center justify-center">
        <Box strokeWidth={3} className="text-foreground/70 h-4 w-4" />
      </div>

      {/* 物品材质名称（简短显示） */}
      <div className="text-muted-foreground mt-1 max-w-full truncate font-mono text-[9px]">
        {getShortMaterial(item.material)}
      </div>

      {/* 物品数量 */}
      {item.amount && item.amount > 1 && (
        <span className="text-foreground/80 bg-background/80 absolute right-1 bottom-1 rounded px-1 text-[10px] leading-none font-medium">
          {item.amount}
        </span>
      )}

      {/* 自定义模型数据标识 */}
      {item.customModelData && (
        <span className="text-muted-foreground/70 bg-background/80 absolute top-1 right-1 rounded px-1 font-mono text-[9px] leading-none">
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
