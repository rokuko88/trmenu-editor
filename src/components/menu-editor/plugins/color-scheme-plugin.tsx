"use client";

import { PluginComponentProps } from "@/types/plugin";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Palette, Download } from "lucide-react";

interface ColorScheme {
  id: string;
  name: string;
  description: string;
  colors: string[];
  preview: string[];
  theme: "light" | "dark" | "colorful";
}

const COLOR_SCHEMES: ColorScheme[] = [
  {
    id: "ocean",
    name: "海洋",
    description: "深邃的海洋蓝色主题",
    colors: ["LIGHT_BLUE", "CYAN", "BLUE", "PURPLE"],
    preview: ["#87CEEB", "#00CED1", "#0000FF", "#800080"],
    theme: "dark",
  },
  {
    id: "forest",
    name: "森林",
    description: "清新的绿色自然主题",
    colors: ["LIME", "GREEN", "DARK_GREEN", "BROWN"],
    preview: ["#7FFF00", "#00FF00", "#006400", "#8B4513"],
    theme: "light",
  },
  {
    id: "sunset",
    name: "日落",
    description: "温暖的日落色调",
    colors: ["ORANGE", "RED", "PINK", "MAGENTA"],
    preview: ["#FFA500", "#FF0000", "#FFC0CB", "#FF00FF"],
    theme: "colorful",
  },
  {
    id: "monochrome",
    name: "黑白",
    description: "简约的黑白灰主题",
    colors: ["WHITE", "LIGHT_GRAY", "GRAY", "BLACK"],
    preview: ["#FFFFFF", "#D3D3D3", "#808080", "#000000"],
    theme: "light",
  },
  {
    id: "neon",
    name: "霓虹",
    description: "鲜艳的霓虹灯效果",
    colors: ["PINK", "MAGENTA", "PURPLE", "CYAN"],
    preview: ["#FFC0CB", "#FF00FF", "#800080", "#00CED1"],
    theme: "colorful",
  },
  {
    id: "earth",
    name: "大地",
    description: "沉稳的大地色系",
    colors: ["BROWN", "ORANGE", "YELLOW", "GREEN"],
    preview: ["#8B4513", "#FFA500", "#FFFF00", "#00FF00"],
    theme: "light",
  },
  {
    id: "ice",
    name: "冰霜",
    description: "冷酷的冰蓝色调",
    colors: ["WHITE", "LIGHT_BLUE", "CYAN", "BLUE"],
    preview: ["#FFFFFF", "#87CEEB", "#00CED1", "#0000FF"],
    theme: "light",
  },
  {
    id: "fire",
    name: "烈焰",
    description: "炽热的火焰色彩",
    colors: ["YELLOW", "ORANGE", "RED", "BLACK"],
    preview: ["#FFFF00", "#FFA500", "#FF0000", "#000000"],
    theme: "dark",
  },
];

export function ColorSchemePlugin({ onItemCreate }: PluginComponentProps) {
  const applyScheme = (scheme: ColorScheme) => {
    if (
      !confirm(
        `确定要应用"${scheme.name}"配色方案吗？\n这将在顶部行应用该配色。`
      )
    ) {
      return;
    }

    // 在顶部行应用配色
    for (let i = 0; i < 9; i++) {
      const colorIndex = Math.floor((i / 9) * scheme.colors.length);
      const color =
        scheme.colors[Math.min(colorIndex, scheme.colors.length - 1)];

      onItemCreate?.({
        slot: i,
        material: `${color}_STAINED_GLASS_PANE`,
        displayName: " ",
      });
    }

    alert(`已应用"${scheme.name}"配色方案！`);
  };

  const applyFullScheme = (scheme: ColorScheme) => {
    if (
      !confirm(
        `确定要完整应用"${scheme.name}"配色吗？\n这将用该配色填充所有边框。`
      )
    ) {
      return;
    }

    // 顶部边框
    for (let i = 0; i < 9; i++) {
      const colorIndex = Math.floor((i / 9) * scheme.colors.length);
      const color =
        scheme.colors[Math.min(colorIndex, scheme.colors.length - 1)];
      onItemCreate?.({
        slot: i,
        material: `${color}_STAINED_GLASS_PANE`,
        displayName: " ",
      });
    }

    // 底部边框
    for (let i = 45; i < 54; i++) {
      const colorIndex = Math.floor(((i - 45) / 9) * scheme.colors.length);
      const color =
        scheme.colors[Math.min(colorIndex, scheme.colors.length - 1)];
      onItemCreate?.({
        slot: i,
        material: `${color}_STAINED_GLASS_PANE`,
        displayName: " ",
      });
    }

    // 左右边框
    for (let row = 1; row < 5; row++) {
      const colorIndex = Math.floor((row / 5) * scheme.colors.length);
      const color =
        scheme.colors[Math.min(colorIndex, scheme.colors.length - 1)];

      // 左边
      onItemCreate?.({
        slot: row * 9,
        material: `${color}_STAINED_GLASS_PANE`,
        displayName: " ",
      });

      // 右边
      onItemCreate?.({
        slot: row * 9 + 8,
        material: `${color}_STAINED_GLASS_PANE`,
        displayName: " ",
      });
    }

    alert(`已完整应用"${scheme.name}"配色方案！`);
  };

  const groupedSchemes = {
    light: COLOR_SCHEMES.filter((s) => s.theme === "light"),
    dark: COLOR_SCHEMES.filter((s) => s.theme === "dark"),
    colorful: COLOR_SCHEMES.filter((s) => s.theme === "colorful"),
  };

  return (
    <ScrollArea className="h-full">
      <div className="p-3 space-y-3">
        <div className="space-y-1">
          <div className="flex items-center gap-1.5">
            <Palette className="h-3.5 w-3.5 text-pink-500" />
            <h3 className="font-semibold text-xs">配色方案</h3>
          </div>
          <p className="text-muted-foreground leading-tight">
            快速应用预设的配色方案美化菜单
          </p>
        </div>

        {/* 明亮主题 */}
        <div className="space-y-1.5">
          <h4 className="font-medium text-muted-foreground uppercase tracking-wider">
            明亮主题
          </h4>
          {groupedSchemes.light.map((scheme) => (
            <SchemeCard
              key={scheme.id}
              scheme={scheme}
              onApply={applyScheme}
              onApplyFull={applyFullScheme}
            />
          ))}
        </div>

        {/* 深色主题 */}
        <div className="space-y-1.5">
          <h4 className="font-medium text-muted-foreground uppercase tracking-wider">
            深色主题
          </h4>
          {groupedSchemes.dark.map((scheme) => (
            <SchemeCard
              key={scheme.id}
              scheme={scheme}
              onApply={applyScheme}
              onApplyFull={applyFullScheme}
            />
          ))}
        </div>

        {/* 彩色主题 */}
        <div className="space-y-1.5">
          <h4 className="font-medium text-muted-foreground uppercase tracking-wider">
            彩色主题
          </h4>
          {groupedSchemes.colorful.map((scheme) => (
            <SchemeCard
              key={scheme.id}
              scheme={scheme}
              onApply={applyScheme}
              onApplyFull={applyFullScheme}
            />
          ))}
        </div>
      </div>
    </ScrollArea>
  );
}

function SchemeCard({
  scheme,
  onApply,
  onApplyFull,
}: {
  scheme: ColorScheme;
  onApply: (scheme: ColorScheme) => void;
  onApplyFull: (scheme: ColorScheme) => void;
}) {
  return (
    <div className="group p-2 border rounded-md hover:bg-accent/50 transition-colors">
      <div className="flex items-start gap-2">
        {/* 颜色预览 */}
        <div className="flex gap-0.5 shrink-0">
          {scheme.preview.map((color, idx) => (
            <div
              key={idx}
              className="w-2 h-8 rounded-sm"
              style={{ backgroundColor: color }}
            />
          ))}
        </div>

        {/* 信息 */}
        <div className="flex-1 min-w-0">
          <h4 className="font-medium text-xs">{scheme.name}</h4>
          <p className="text-muted-foreground mt-0.5 leading-tight">
            {scheme.description}
          </p>

          {/* 操作按钮 */}
          <div className="flex gap-1 mt-1.5">
            <Button
              variant="outline"
              size="sm"
              className="h-6 flex-1 px-1.5"
              onClick={() => onApply(scheme)}
            >
              <Download className="h-2.5 w-2.5 mr-0.5" />
              应用顶部
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="h-6 flex-1 px-1.5"
              onClick={() => onApplyFull(scheme)}
            >
              <Palette className="h-2.5 w-2.5 mr-0.5" />
              完整应用
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
