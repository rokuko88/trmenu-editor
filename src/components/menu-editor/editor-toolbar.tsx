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
    <div className="h-12 border-b bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60 flex items-center justify-between px-4 gap-4">
      {/* 左侧：文件名和主要操作 */}
      <div className="flex items-center gap-2">
        <div className="flex items-center gap-2">
          <span className="font-medium text-sm">{menuName}</span>
          {hasUnsavedChanges && (
            <span className="text-xs text-muted-foreground">• 未保存</span>
          )}
        </div>
        <Separator orientation="vertical" className="h-6" />
        <TooltipProvider delayDuration={300}>
          <div className="flex items-center gap-1">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onSave}
                  className="h-8"
                >
                  <Save className="h-4 w-4 mr-2" />
                  保存
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>保存更改 (Ctrl+S)</p>
              </TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onExport}
                  className="h-8"
                >
                  <FileDown className="h-4 w-4 mr-2" />
                  导出
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>导出为 YAML 文件</p>
              </TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onImport}
                  className="h-8"
                >
                  <FileUp className="h-4 w-4 mr-2" />
                  导入
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>从 YAML 文件导入</p>
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
              <Button variant="ghost" size="icon" className="h-8 w-8" disabled>
                <Undo className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>撤销 (Ctrl+Z)</p>
            </TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8" disabled>
                <Redo className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>重做 (Ctrl+Y)</p>
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
                className="h-8"
              >
                <Play className="h-4 w-4 mr-2" />
                预览
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>预览菜单效果</p>
            </TooltipContent>
          </Tooltip>

          <Separator orientation="vertical" className="h-6" />

          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <Settings className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>编辑器设置</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
    </div>
  );
}
