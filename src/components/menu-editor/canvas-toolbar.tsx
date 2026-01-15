"use client";

import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Code2,
  Eye,
  Grid3x3,
  Layers,
  ZoomIn,
  ZoomOut,
  Maximize2,
} from "lucide-react";
import { cn } from "@/lib/utils";

type ViewMode = "visual" | "code";

interface CanvasToolbarProps {
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
  showGrid?: boolean;
  onToggleGrid?: () => void;
  showPlayerInventory?: boolean;
  onTogglePlayerInventory?: () => void;
}

export function CanvasToolbar({
  viewMode,
  onViewModeChange,
  showGrid = false,
  onToggleGrid,
  showPlayerInventory = false,
  onTogglePlayerInventory,
}: CanvasToolbarProps) {
  return (
    <div className="h-10 border-b bg-background/95 backdrop-blur">
      <div className="flex items-center justify-between h-full px-4">
        {/* 左侧：视图切换 - 使用 Segmented Control 风格 */}
        <div className="inline-flex items-center rounded-md bg-muted p-0.5">
          <button
            className={cn(
              "inline-flex items-center justify-center rounded-sm px-3 h-7 text-xs font-medium transition-all",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
              viewMode === "visual"
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            )}
            onClick={() => onViewModeChange("visual")}
          >
            <Eye className="h-3.5 w-3.5 mr-1.5" />
            可视化
          </button>
          <button
            className={cn(
              "inline-flex items-center justify-center rounded-sm px-3 h-7 text-xs font-medium transition-all",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
              viewMode === "code"
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            )}
            onClick={() => onViewModeChange("code")}
          >
            <Code2 className="h-3.5 w-3.5 mr-1.5" />
            配置文件
          </button>
        </div>

        {/* 右侧：辅助功能 */}
        <div className="flex items-center gap-1">
          {/* 网格显示 */}
          {onToggleGrid && (
            <>
              <Button
                variant="ghost"
                size="sm"
                className={cn("h-8 w-8 p-0", showGrid && "bg-secondary")}
                onClick={onToggleGrid}
                title="切换网格显示"
              >
                <Grid3x3 className="h-4 w-4" />
              </Button>
              <Separator orientation="vertical" className="h-5" />
            </>
          )}

          {/* 玩家物品栏 */}
          {onTogglePlayerInventory && (
            <>
              <Button
                variant="ghost"
                size="sm"
                className={cn(
                  "h-8 w-8 p-0",
                  showPlayerInventory && "bg-secondary"
                )}
                onClick={onTogglePlayerInventory}
                title="切换玩家物品栏"
              >
                <Layers className="h-4 w-4" />
              </Button>
              <Separator orientation="vertical" className="h-5" />
            </>
          )}

          {/* 缩放控制 */}
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0"
            title="缩小"
            disabled
          >
            <ZoomOut className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0"
            title="放大"
            disabled
          >
            <ZoomIn className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0"
            title="适应窗口"
            disabled
          >
            <Maximize2 className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
