"use client";

import { useState } from "react";
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
  Variable,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { VariablesManager } from "./variables-manager";

type ViewMode = "visual" | "code";

interface CanvasToolbarProps {
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
  showGrid?: boolean;
  onToggleGrid?: () => void;
  showPlayerInventory?: boolean;
  onTogglePlayerInventory?: () => void;
  onZoomIn?: () => void;
  onZoomOut?: () => void;
  zoomInDisabled?: boolean;
  zoomOutDisabled?: boolean;
  menuId?: string; // 当前菜单 ID，用于变量管理
}

export function CanvasToolbar({
  viewMode,
  onViewModeChange,
  showGrid = false,
  onToggleGrid,
  showPlayerInventory = false,
  onTogglePlayerInventory,
  onZoomIn,
  onZoomOut,
  zoomInDisabled = false,
  zoomOutDisabled = false,
  menuId,
}: CanvasToolbarProps) {
  const [variablesOpen, setVariablesOpen] = useState(false);

  return (
    <>
      <VariablesManager
        open={variablesOpen}
        onOpenChange={setVariablesOpen}
        menuId={menuId}
      />
      <div className="bg-background/95 h-10 min-h-10 shrink-0 border-b backdrop-blur">
        <div className="flex h-full items-center justify-between px-4">
          {/* 左侧：视图切换 - 使用 Segmented Control 风格 */}
          <div className="bg-muted inline-flex shrink-0 items-center rounded-md p-0.5">
            <button
              className={cn(
                "inline-flex h-7 items-center justify-center rounded-sm px-3 text-xs font-medium transition-all",
                "focus-visible:ring-ring focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none",
                viewMode === "visual"
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              )}
              onClick={() => onViewModeChange("visual")}
            >
              <Eye className="mr-1.5 h-3.5 w-3.5" />
              可视化
            </button>
            <button
              className={cn(
                "inline-flex h-7 items-center justify-center rounded-sm px-3 text-xs font-medium transition-all",
                "focus-visible:ring-ring focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none",
                viewMode === "code"
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              )}
              onClick={() => onViewModeChange("code")}
            >
              <Code2 className="mr-1.5 h-3.5 w-3.5" />
              配置文件
            </button>
          </div>

          {/* 右侧：辅助功能 - 只在可视化模式显示 */}
          {viewMode === "visual" && (
            <div className="flex shrink-0 items-center gap-1">
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

              {/* 变量管理 */}
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0"
                onClick={() => setVariablesOpen(true)}
                title="变量管理"
              >
                <Variable className="h-4 w-4" />
              </Button>
              <Separator orientation="vertical" className="h-5" />

              {/* 缩放控制 */}
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0"
                title="缩小"
                onClick={onZoomOut}
                disabled={!onZoomOut || zoomOutDisabled}
              >
                <ZoomOut className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0"
                title="放大"
                onClick={onZoomIn}
                disabled={!onZoomIn || zoomInDisabled}
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
          )}
        </div>
      </div>
    </>
  );
}
