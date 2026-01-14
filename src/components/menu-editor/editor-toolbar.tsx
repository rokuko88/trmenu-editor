"use client";

import {
  Save,
  FileDown,
  FileUp,
  Undo,
  Redo,
  Settings,
  Play,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface EditorToolbarProps {
  menuName: string;
  onSave: () => void;
  onExport: () => void;
  onImport: () => void;
  onPreview: () => void;
  hasUnsavedChanges?: boolean;
}

export function EditorToolbar({
  menuName,
  onSave,
  onExport,
  onImport,
  onPreview,
  hasUnsavedChanges = false,
}: EditorToolbarProps) {
  return (
    <div className="h-12 border-b flex items-center justify-between px-4 gap-3">
      {/* 左侧：文件名和主要操作 */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium">{menuName}</span>
          {hasUnsavedChanges && (
            <span className="text-xs text-muted-foreground">• 未保存</span>
          )}
        </div>
        <Separator orientation="vertical" className="h-4" />
        <TooltipProvider delayDuration={300}>
          <div className="flex items-center gap-1">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onSave}
                  className="text-sm"
                >
                  <Save className="h-4 w-4 mr-2" />
                  保存
                </Button>
              </TooltipTrigger>
              <TooltipContent side="bottom">
                <p>Ctrl+S</p>
              </TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onExport}
                  className="text-sm"
                >
                  <FileDown className="h-4 w-4 mr-2" />
                  导出
                </Button>
              </TooltipTrigger>
              <TooltipContent side="bottom">
                <p>导出为 YAML</p>
              </TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onImport}
                  className="text-sm"
                >
                  <FileUp className="h-4 w-4 mr-2" />
                  导入
                </Button>
              </TooltipTrigger>
              <TooltipContent side="bottom">
                <p>从 YAML 导入</p>
              </TooltipContent>
            </Tooltip>
          </div>
        </TooltipProvider>
      </div>

      {/* 中间：编辑操作 */}
      <div className="flex items-center gap-1">
        <TooltipProvider delayDuration={300}>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="icon" disabled>
                <Undo className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="bottom">
              <p>Ctrl+Z</p>
            </TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="icon" disabled>
                <Redo className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="bottom">
              <p>Ctrl+Y</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>

      {/* 右侧：预览和设置 */}
      <div className="flex items-center gap-2">
        <TooltipProvider delayDuration={300}>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="default"
                size="sm"
                onClick={onPreview}
                className="text-sm"
              >
                <Play className="h-4 w-4 mr-2" />
                预览
              </Button>
            </TooltipTrigger>
            <TooltipContent side="bottom">
              <p>预览菜单</p>
            </TooltipContent>
          </Tooltip>

          <Separator orientation="vertical" className="h-4" />

          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="icon">
                <Settings className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="bottom">
              <p>设置</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
    </div>
  );
}
