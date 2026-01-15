"use client";

import {
  FileUp,
  Plus,
  BookOpen,
  Github,
  MessageCircle,
  ChevronRight,
  Clock,
  Folder,
  FileText,
  ExternalLink,
  History,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { getAssetPath } from "@/lib/config";
import { toast } from "sonner";

interface WelcomePageProps {
  onCreateBlank: () => void;
  onImportMenu: () => void;
}

export default function WelcomePage({
  onCreateBlank,
  onImportMenu,
}: WelcomePageProps) {
  // 模拟最近打开的菜单数据（后续可以从 localStorage 或数据库获取）
  const recentMenus: Array<{
    id: string;
    name: string;
    path: string;
    lastOpened: string;
    itemCount: number;
  }> = [
    {
      id: "1",
      name: "主菜单",
      path: "D:\\menus\\main-menu.yml",
      lastOpened: "2 小时前",
      itemCount: 12,
    },
    {
      id: "2",
      name: "商店菜单",
      path: "D:\\menus\\shop-menu.yml",
      lastOpened: "昨天",
      itemCount: 8,
    },
    {
      id: "3",
      name: "传送菜单",
      path: "D:\\menus\\teleport.yml",
      lastOpened: "3 天前",
      itemCount: 15,
    },
  ];

  const quickActions = [
    {
      icon: Plus,
      title: "新建菜单",
      description: "从空白画布开始创建",
      action: onCreateBlank,
      variant: "default" as const,
    },
    {
      icon: FileUp,
      title: "导入配置",
      description: "从 YAML 文件导入",
      action: onImportMenu,
      variant: "outline" as const,
    },
    {
      icon: Folder,
      title: "打开文件夹",
      description: "浏览本地菜单文件",
      action: () => toast.info("打开文件夹功能即将推出"),
      variant: "outline" as const,
    },
    {
      icon: Sparkles,
      title: "使用模板",
      description: "从预设模板开始",
      action: () => toast.info("模板功能即将推出"),
      variant: "outline" as const,
    },
  ];

  return (
    <div className="flex h-full">
      {/* 左侧主要区域 */}
      <div className="flex-1 overflow-auto">
        <div className="max-w-4xl mx-auto p-12 space-y-10">
          {/* Logo 和标语 */}
          <div className="flex items-center gap-6">
            <div className="relative w-24 h-24 shrink-0">
              <Image
                src={getAssetPath("/image.png")}
                alt="TrMenu Editor Logo"
                width={96}
                height={96}
                className="rounded-xl"
                priority
                unoptimized
              />
            </div>
            <div>
              <h1 className="text-2xl font-semibold mb-1">
                欢迎使用 TrMenu Editor
              </h1>
              <p className="text-sm text-muted-foreground">
                可视化菜单配置编辑器，让菜单设计变得简单高效
              </p>
            </div>
          </div>

          {/* 快速操作网格 */}
          <section>
            <h2 className="text-sm font-medium mb-4 text-muted-foreground">
              快速操作
            </h2>
            <div className="grid grid-cols-2 gap-3">
              {quickActions.map((action, index) => (
                <button
                  key={index}
                  onClick={action.action}
                  className="flex items-start gap-4 p-4 text-left bg-card border rounded-lg hover:bg-accent hover:border-accent-foreground/20 transition-all group"
                >
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0 group-hover:bg-primary/20 transition-colors">
                    <action.icon className="w-5 h-5 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-sm mb-0.5">
                      {action.title}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {action.description}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </section>

          {/* 最近打开 */}
          <section>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-medium text-muted-foreground">
                最近打开
              </h2>
              {recentMenus.length > 0 && (
                <button className="text-xs text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1">
                  <History className="w-3 h-3" />
                  查看更多
                </button>
              )}
            </div>

            {recentMenus.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <div className="w-16 h-16 rounded-full bg-muted/50 flex items-center justify-center mb-4">
                  <Clock className="w-8 h-8 text-muted-foreground/50" />
                </div>
                <p className="text-sm text-muted-foreground mb-1">
                  暂无最近打开的项目
                </p>
                <p className="text-xs text-muted-foreground/60 mb-4">
                  开始创建或导入菜单配置文件
                </p>
                <div className="flex gap-2">
                  <Button variant="default" size="sm" onClick={onCreateBlank}>
                    <Plus className="w-4 h-4 mr-1.5" />
                    新建菜单
                  </Button>
                  <Button variant="outline" size="sm" onClick={onImportMenu}>
                    <FileUp className="w-4 h-4 mr-1.5" />
                    导入配置
                  </Button>
                </div>
              </div>
            ) : (
              <div className="space-y-1">
                {recentMenus.map((menu) => (
                  <button
                    key={menu.id}
                    className="w-full flex items-center justify-between px-4 py-3 text-left bg-card border hover:bg-accent hover:border-accent-foreground/20 rounded-lg transition-all group"
                  >
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      <div className="w-8 h-8 rounded bg-primary/10 flex items-center justify-center shrink-0">
                        <FileText className="w-4 h-4 text-primary" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="text-sm font-medium mb-0.5">
                          {menu.name}
                        </div>
                        <div className="text-xs text-muted-foreground flex items-center gap-3">
                          <span className="truncate">{menu.path}</span>
                          <span className="shrink-0">·</span>
                          <span className="shrink-0">{menu.itemCount} 项</span>
                          <span className="shrink-0">·</span>
                          <span className="shrink-0">{menu.lastOpened}</span>
                        </div>
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity shrink-0 ml-2" />
                  </button>
                ))}
              </div>
            )}
          </section>

          {/* 学习资源 */}
          <section>
            <h2 className="text-sm font-medium mb-4 text-muted-foreground">
              学习与帮助
            </h2>
            <div className="grid grid-cols-3 gap-3">
              <a
                href="#"
                className="flex flex-col items-center justify-center p-4 text-center bg-card border rounded-lg hover:bg-accent hover:border-accent-foreground/20 transition-all group"
              >
                <BookOpen className="w-5 h-5 text-muted-foreground mb-2 group-hover:text-foreground transition-colors" />
                <span className="text-sm font-medium">查看文档</span>
              </a>
              <a
                href="#"
                className="flex flex-col items-center justify-center p-4 text-center bg-card border rounded-lg hover:bg-accent hover:border-accent-foreground/20 transition-all group"
              >
                <Github className="w-5 h-5 text-muted-foreground mb-2 group-hover:text-foreground transition-colors" />
                <span className="text-sm font-medium">GitHub</span>
              </a>
              <a
                href="#"
                className="flex flex-col items-center justify-center p-4 text-center bg-card border rounded-lg hover:bg-accent hover:border-accent-foreground/20 transition-all group"
              >
                <MessageCircle className="w-5 h-5 text-muted-foreground mb-2 group-hover:text-foreground transition-colors" />
                <span className="text-sm font-medium">反馈</span>
              </a>
            </div>
          </section>
        </div>
      </div>

      {/* 右侧信息面板 */}
      <div className="w-72 border-l overflow-auto">
        <div className="p-6 space-y-6">
          {/* 快速开始 */}
          <div>
            <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3">
              快速开始
            </h3>
            <div className="space-y-2">
              <Button
                onClick={onCreateBlank}
                className="w-full justify-start"
                size="sm"
              >
                <Plus className="w-4 h-4 mr-2" />
                创建空白菜单
              </Button>
              <Button
                onClick={onImportMenu}
                variant="outline"
                className="w-full justify-start"
                size="sm"
              >
                <FileUp className="w-4 h-4 mr-2" />
                导入现有配置
              </Button>
            </div>
          </div>

          {/* 常用链接 */}
          <div>
            <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3">
              资源链接
            </h3>
            <div className="space-y-1.5">
              <a
                href="#"
                className="flex items-center gap-2 px-2 py-1.5 text-xs hover:bg-accent rounded transition-colors group"
              >
                <ExternalLink className="w-3 h-3 text-muted-foreground" />
                <span className="flex-1">TrMenu 官方文档</span>
              </a>
              <a
                href="#"
                className="flex items-center gap-2 px-2 py-1.5 text-xs hover:bg-accent rounded transition-colors group"
              >
                <ExternalLink className="w-3 h-3 text-muted-foreground" />
                <span className="flex-1">示例配置</span>
              </a>
              <a
                href="#"
                className="flex items-center gap-2 px-2 py-1.5 text-xs hover:bg-accent rounded transition-colors group"
              >
                <ExternalLink className="w-3 h-3 text-muted-foreground" />
                <span className="flex-1">社区讨论</span>
              </a>
            </div>
          </div>

          {/* 提示 */}
          <div className="p-3 bg-muted/50 rounded-lg">
            <div className="flex items-start gap-2">
              <Sparkles className="w-4 h-4 text-primary shrink-0 mt-0.5" />
              <div className="text-xs text-muted-foreground">
                <p className="font-medium text-foreground mb-1">小提示</p>
                <p>使用快捷键 Ctrl+N 快速创建新菜单</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
