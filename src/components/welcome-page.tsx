"use client";

import {
  FileUp,
  Plus,
  BookOpen,
  Github,
  MessageCircle,
  FolderOpen,
  ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";

interface WelcomePageProps {
  onCreateBlank: () => void;
  onImportMenu: () => void;
}

export default function WelcomePage({
  onCreateBlank,
  onImportMenu,
}: WelcomePageProps) {
  // 模拟最近打开的菜单数据（后续可以从 localStorage 或数据库获取）
  const recentMenus: Array<{ name: string; path: string; lastOpened: string }> =
    [];

  return (
    <div className="flex h-full bg-background">
      {/* 左侧：最近打开和项目列表 */}
      <div className="flex-1 border-r overflow-auto">
        <div className="p-6 space-y-6">
          {/* 品牌区域 - 紧凑版 */}
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-linear-to-br from-blue-500 to-blue-700 rounded-md flex items-center justify-center">
              <span className="text-base font-bold text-white">T</span>
            </div>
            <div className="flex-1">
              <h1 className="text-base font-semibold tracking-tight">
                TrMenu Editor
              </h1>
              <p className="text-xs text-muted-foreground">
                可视化菜单配置编辑器
              </p>
            </div>
          </div>

          <Separator />

          {/* 最近打开 */}
          <div className="space-y-2.5">
            <h2 className="text-xs font-medium text-muted-foreground uppercase tracking-wider px-1">
              最近打开
            </h2>

            {recentMenus.length === 0 ? (
              <Empty className="py-8">
                <EmptyHeader>
                  <EmptyMedia variant="icon">
                    <FolderOpen />
                  </EmptyMedia>
                  <EmptyTitle>暂无最近打开的菜单</EmptyTitle>
                  <EmptyDescription>
                    开始创建新菜单或导入已有的 TrMenu 配置文件
                  </EmptyDescription>
                </EmptyHeader>
                <EmptyContent>
                  <div className="flex gap-2 justify-center">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={onCreateBlank}
                      className="h-8 text-xs gap-1.5"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      新建
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={onImportMenu}
                      className="h-8 text-xs gap-1.5"
                    >
                      <FileUp className="w-3.5 h-3.5" />
                      导入
                    </Button>
                  </div>
                </EmptyContent>
              </Empty>
            ) : (
              <div className="space-y-0.5">
                {recentMenus.map((menu, index) => (
                  <button
                    key={index}
                    className="w-full text-left px-2.5 py-2 rounded-md hover:bg-accent transition-colors group flex items-center justify-between"
                  >
                    <div className="min-w-0 flex-1">
                      <div className="font-medium text-sm">{menu.name}</div>
                      <div className="text-xs text-muted-foreground truncate">
                        {menu.path}
                      </div>
                    </div>
                    <ChevronRight className="w-3.5 h-3.5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity shrink-0 ml-2" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* 学习资源 */}
          <div className="space-y-2.5">
            <h2 className="text-xs font-medium text-muted-foreground uppercase tracking-wider px-1">
              帮助与支持
            </h2>
            <div className="space-y-0.5">
              <a
                href="#"
                className="flex items-center gap-2.5 px-2.5 py-2 rounded-md hover:bg-accent transition-colors text-sm group"
              >
                <BookOpen className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                <span className="flex-1">查看文档</span>
              </a>
              <a
                href="#"
                className="flex items-center gap-2.5 px-2.5 py-2 rounded-md hover:bg-accent transition-colors text-sm group"
              >
                <Github className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                <span className="flex-1">GitHub</span>
              </a>
              <a
                href="#"
                className="flex items-center gap-2.5 px-2.5 py-2 rounded-md hover:bg-accent transition-colors text-sm group"
              >
                <MessageCircle className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                <span className="flex-1">反馈</span>
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* 右侧：快速操作面板 */}
      <div className="w-[360px] border-l bg-muted/30">
        <div className="p-6 space-y-6">
          {/* 快速开始 */}
          <div className="space-y-2.5">
            <h2 className="text-xs font-medium text-muted-foreground uppercase tracking-wider px-1">
              开始使用
            </h2>
            <div className="space-y-2">
              <Button
                className="w-full justify-start h-auto py-3 px-3.5"
                onClick={onCreateBlank}
              >
                <Plus className="w-4 h-4 mr-2.5 shrink-0" />
                <div className="text-left flex-1">
                  <div className="font-medium text-sm">创建空白菜单</div>
                  <div className="text-xs text-primary-foreground/70 font-normal">
                    从头开始设计
                  </div>
                </div>
              </Button>

              <Button
                variant="outline"
                className="w-full justify-start h-auto py-3 px-3.5"
                onClick={onImportMenu}
              >
                <FileUp className="w-4 h-4 mr-2.5 shrink-0" />
                <div className="text-left flex-1">
                  <div className="font-medium text-sm">导入已有菜单</div>
                  <div className="text-xs text-muted-foreground font-normal">
                    从 YAML 文件导入
                  </div>
                </div>
              </Button>
            </div>
          </div>

          <Separator />

          {/* 功能特性 - 更紧凑 */}
          <div className="space-y-2.5">
            <h2 className="text-xs font-medium text-muted-foreground uppercase tracking-wider px-1">
              功能特性
            </h2>
            <div className="space-y-1.5 text-sm">
              <div className="flex items-start gap-2.5 p-2.5 rounded-md bg-background/50">
                <div className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-1.5 shrink-0" />
                <div className="space-y-0.5">
                  <div className="text-xs font-medium">可视化编辑器</div>
                  <div className="text-xs text-muted-foreground leading-snug">
                    图形界面，拖拽式设计
                  </div>
                </div>
              </div>
              <div className="flex items-start gap-2.5 p-2.5 rounded-md bg-background/50">
                <div className="w-1.5 h-1.5 rounded-full bg-green-500 mt-1.5 shrink-0" />
                <div className="space-y-0.5">
                  <div className="text-xs font-medium">实时预览</div>
                  <div className="text-xs text-muted-foreground leading-snug">
                    所见即所得，即时反馈
                  </div>
                </div>
              </div>
              <div className="flex items-start gap-2.5 p-2.5 rounded-md bg-background/50">
                <div className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-1.5 shrink-0" />
                <div className="space-y-0.5">
                  <div className="text-xs font-medium">完整配置支持</div>
                  <div className="text-xs text-muted-foreground leading-snug">
                    支持所有 TrMenu 选项
                  </div>
                </div>
              </div>
            </div>
          </div>

          <Separator />

          {/* 版本信息 - 极简 */}
          <div className="px-1 space-y-1">
            <p className="text-xs font-medium">TrMenu Editor v1.0.0</p>
            <p className="text-xs text-muted-foreground leading-relaxed">
              基于 Next.js + React 构建
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
