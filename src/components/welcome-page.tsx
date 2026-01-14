"use client";

import { FileUp, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

interface WelcomePageProps {
  onCreateBlank: () => void;
  onImportMenu: () => void;
}

export default function WelcomePage({
  onCreateBlank,
  onImportMenu,
}: WelcomePageProps) {
  return (
    <div className="flex items-center justify-center h-full bg-background">
      <div className="max-w-2xl w-full px-8 text-center space-y-8">
        {/* Logo 区域 */}
        <div className="flex flex-col items-center space-y-4">
          <div className="w-24 h-24 bg-linear-to-br from-amber-500 to-amber-700 rounded-2xl flex items-center justify-center shadow-2xl">
            <span className="text-5xl font-bold text-white">T</span>
          </div>
          <div className="space-y-2">
            <h1 className="text-4xl font-bold tracking-tight">TrMenu Editor</h1>
            <p className="text-lg text-muted-foreground">
              可视化编辑 Minecraft TrMenu 菜单配置
            </p>
          </div>
        </div>

        {/* 主要操作按钮 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-8">
          <Button
            size="lg"
            className="h-32 flex-col gap-3 text-base"
            onClick={onCreateBlank}
          >
            <Plus className="w-8 h-8" />
            <div className="flex flex-col gap-1">
              <span className="font-semibold">创建空白菜单</span>
              <span className="text-xs text-primary-foreground/80 font-normal">
                从头开始设计你的菜单
              </span>
            </div>
          </Button>

          <Button
            size="lg"
            variant="outline"
            className="h-32 flex-col gap-3 text-base"
            onClick={onImportMenu}
          >
            <FileUp className="w-8 h-8" />
            <div className="flex flex-col gap-1">
              <span className="font-semibold">导入已有菜单</span>
              <span className="text-xs text-muted-foreground font-normal">
                从本地 YAML 文件导入
              </span>
            </div>
          </Button>
        </div>

        {/* 底部提示 */}
        <div className="pt-8 text-sm text-muted-foreground">
          <p>支持完整的 TrMenu 配置 • 可视化编辑 • 实时预览</p>
        </div>
      </div>
    </div>
  );
}
