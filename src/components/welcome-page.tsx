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
import { getAssetPath, navigateToMenu } from "@/lib/config";
import { toast } from "sonner";
import { useMenuStore } from "@/store/menu-store";
import { useRouter } from "next/navigation";
import { useMemo, useState, useEffect } from "react";

interface WelcomePageProps {
  onCreateBlank: () => void;
  onImportMenu: () => void;
}

// 辅助函数：格式化相对时间
function formatRelativeTime(dateString: string, currentTime: number): string {
  const openedTime = new Date(dateString).getTime();
  const diffMs = currentTime - openedTime;
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) {
    return "刚刚";
  } else if (diffMins < 60) {
    return `${diffMins} 分钟前`;
  } else if (diffHours < 24) {
    return `${diffHours} 小时前`;
  } else if (diffDays === 1) {
    return "昨天";
  } else if (diffDays < 7) {
    return `${diffDays} 天前`;
  } else {
    return new Date(dateString).toLocaleDateString("zh-CN");
  }
}

export default function WelcomePage({
  onCreateBlank,
  onImportMenu,
}: WelcomePageProps) {
  const router = useRouter();
  const [currentTime, setCurrentTime] = useState(() => Date.now());

  // 从 store 获取数据
  const menus = useMenuStore((state) => state.menus);
  const menuGroups = useMenuStore((state) => state.menuGroups);
  const recentItems = useMenuStore((state) => state.recentItems);
  const clearRecent = useMenuStore((state) => state.clearRecent);

  // 每分钟更新一次当前时间，保持相对时间显示准确
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(Date.now());
    }, 60000); // 每分钟更新一次

    return () => clearInterval(interval);
  }, []);

  // 处理最近打开的菜单数据
  const recentMenus = useMemo(() => {
    return recentItems
      .map((recent) => {
        const menu = menus.find((m) => m.id === recent.menuId);
        if (!menu) return null;

        const group = menu.groupId
          ? menuGroups.find((g) => g.id === menu.groupId)
          : null;

        return {
          id: menu.id,
          name: menu.name,
          itemCount: menu.items.length,
          lastOpened: formatRelativeTime(recent.openedAt, currentTime),
          groupId: menu.groupId,
          groupName: group?.name,
        };
      })
      .filter((item) => item !== null);
  }, [recentItems, menus, menuGroups, currentTime]);

  // 处理打开最近菜单
  const handleOpenRecentMenu = (menuId: string) => {
    router.push(navigateToMenu(menuId));
  };

  // 处理清除历史记录
  const handleClearRecent = () => {
    clearRecent();
    toast.success("已清除历史记录");
  };

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
        <div className="mx-auto max-w-4xl space-y-10 p-12">
          {/* Logo 和标语 */}
          <div className="space-y-4">
            <div className="flex items-center gap-6">
              <div className="relative h-24 w-24 shrink-0">
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
                <h1 className="mb-1 text-2xl font-semibold">
                  欢迎使用 TrMenu Editor
                </h1>
                <p className="text-muted-foreground text-sm">
                  可视化菜单配置编辑器，让菜单设计变得简单高效
                </p>
              </div>
            </div>

            {/* 统计信息 */}
            {menus.length > 0 && (
              <div className="grid grid-cols-3 gap-3">
                <div className="bg-card rounded-lg border p-3">
                  <div className="mb-0.5 text-2xl font-semibold">
                    {menus.length}
                  </div>
                  <div className="text-muted-foreground text-xs">个菜单</div>
                </div>
                <div className="bg-card rounded-lg border p-3">
                  <div className="mb-0.5 text-2xl font-semibold">
                    {menuGroups.length}
                  </div>
                  <div className="text-muted-foreground text-xs">个分组</div>
                </div>
                <div className="bg-card rounded-lg border p-3">
                  <div className="mb-0.5 text-2xl font-semibold">
                    {menus.reduce((sum, m) => sum + m.items.length, 0)}
                  </div>
                  <div className="text-muted-foreground text-xs">个物品</div>
                </div>
              </div>
            )}
          </div>

          {/* 快速操作网格 */}
          <section>
            <h2 className="text-muted-foreground mb-4 text-sm font-medium">
              快速操作
            </h2>
            <div className="grid grid-cols-2 gap-3">
              {quickActions.map((action, index) => (
                <button
                  key={index}
                  onClick={action.action}
                  className="bg-card hover:bg-accent hover:border-accent-foreground/20 group flex items-start gap-4 rounded-lg border p-4 text-left transition-all"
                >
                  <div className="bg-primary/10 group-hover:bg-primary/20 flex h-10 w-10 shrink-0 items-center justify-center rounded-lg transition-colors">
                    <action.icon className="text-primary h-5 w-5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="mb-0.5 text-sm font-medium">
                      {action.title}
                    </div>
                    <div className="text-muted-foreground text-xs">
                      {action.description}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </section>

          {/* 最近打开 */}
          <section>
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-muted-foreground text-sm font-medium">
                最近打开
              </h2>
              {recentMenus.length > 0 && (
                <button
                  onClick={handleClearRecent}
                  className="text-muted-foreground hover:text-foreground flex items-center gap-1 text-xs transition-colors"
                  title="清除历史记录"
                >
                  <History className="h-3 w-3" />
                  清除记录
                </button>
              )}
            </div>

            {recentMenus.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <div className="bg-muted/50 mb-4 flex h-16 w-16 items-center justify-center rounded-full">
                  <Clock className="text-muted-foreground/50 h-8 w-8" />
                </div>
                <p className="text-muted-foreground mb-1 text-sm">
                  暂无最近打开的项目
                </p>
                <p className="text-muted-foreground/60 mb-4 text-xs">
                  开始创建或导入菜单配置文件
                </p>
                <div className="flex gap-2">
                  <Button variant="default" size="sm" onClick={onCreateBlank}>
                    <Plus className="mr-1.5 h-4 w-4" />
                    新建菜单
                  </Button>
                  <Button variant="outline" size="sm" onClick={onImportMenu}>
                    <FileUp className="mr-1.5 h-4 w-4" />
                    导入配置
                  </Button>
                </div>
              </div>
            ) : (
              <div className="space-y-1">
                {recentMenus.map((menu) => (
                  <button
                    key={menu.id}
                    onClick={() => handleOpenRecentMenu(menu.id)}
                    className="bg-card hover:bg-accent hover:border-accent-foreground/20 group flex w-full items-center justify-between rounded-lg border px-4 py-3 text-left transition-all"
                  >
                    <div className="flex min-w-0 flex-1 items-center gap-3">
                      <div className="bg-primary/10 flex h-8 w-8 shrink-0 items-center justify-center rounded">
                        <FileText className="text-primary h-4 w-4" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="mb-0.5 flex items-center gap-2">
                          <span className="text-sm font-medium">
                            {menu.name}
                          </span>
                          {menu.groupName && (
                            <span className="bg-muted inline-flex items-center gap-1 rounded px-1.5 py-0.5 text-xs">
                              <Folder className="h-3 w-3" />
                              {menu.groupName}
                            </span>
                          )}
                        </div>
                        <div className="text-muted-foreground flex items-center gap-2 text-xs">
                          <span className="shrink-0">{menu.itemCount} 项</span>
                          <span className="shrink-0">·</span>
                          <span className="shrink-0">{menu.lastOpened}</span>
                        </div>
                      </div>
                    </div>
                    <ChevronRight className="text-muted-foreground ml-2 h-4 w-4 shrink-0 opacity-0 transition-opacity group-hover:opacity-100" />
                  </button>
                ))}
              </div>
            )}
          </section>

          {/* 学习资源 */}
          <section>
            <h2 className="text-muted-foreground mb-4 text-sm font-medium">
              学习与帮助
            </h2>
            <div className="grid grid-cols-3 gap-3">
              <a
                href="#"
                className="bg-card hover:bg-accent hover:border-accent-foreground/20 group flex flex-col items-center justify-center rounded-lg border p-4 text-center transition-all"
              >
                <BookOpen className="text-muted-foreground group-hover:text-foreground mb-2 h-5 w-5 transition-colors" />
                <span className="text-sm font-medium">查看文档</span>
              </a>
              <a
                href="#"
                className="bg-card hover:bg-accent hover:border-accent-foreground/20 group flex flex-col items-center justify-center rounded-lg border p-4 text-center transition-all"
              >
                <Github className="text-muted-foreground group-hover:text-foreground mb-2 h-5 w-5 transition-colors" />
                <span className="text-sm font-medium">GitHub</span>
              </a>
              <a
                href="#"
                className="bg-card hover:bg-accent hover:border-accent-foreground/20 group flex flex-col items-center justify-center rounded-lg border p-4 text-center transition-all"
              >
                <MessageCircle className="text-muted-foreground group-hover:text-foreground mb-2 h-5 w-5 transition-colors" />
                <span className="text-sm font-medium">反馈</span>
              </a>
            </div>
          </section>
        </div>
      </div>

      {/* 右侧信息面板 */}
      <div className="w-72 overflow-auto border-l">
        <div className="space-y-6 p-6">
          {/* 快速开始 */}
          <div>
            <h3 className="text-muted-foreground mb-3 text-xs font-medium tracking-wider uppercase">
              快速开始
            </h3>
            <div className="space-y-2">
              <Button
                onClick={onCreateBlank}
                className="w-full justify-start"
                size="sm"
              >
                <Plus className="mr-2 h-4 w-4" />
                创建空白菜单
              </Button>
              <Button
                onClick={onImportMenu}
                variant="outline"
                className="w-full justify-start"
                size="sm"
              >
                <FileUp className="mr-2 h-4 w-4" />
                导入现有配置
              </Button>
            </div>
          </div>

          {/* 常用链接 */}
          <div>
            <h3 className="text-muted-foreground mb-3 text-xs font-medium tracking-wider uppercase">
              资源链接
            </h3>
            <div className="space-y-1.5">
              <a
                href="https://hhhhhy.gitbook.io/trmenu-v3"
                target="_blank"
                rel="noreferrer"
                className="hover:bg-accent group flex items-center gap-2 rounded px-2 py-1.5 text-xs transition-colors"
              >
                <ExternalLink className="text-muted-foreground h-3 w-3" />
                <span className="flex-1">TrMenu 官方文档</span>
              </a>
              <a
                href="#"
                className="hover:bg-accent group flex items-center gap-2 rounded px-2 py-1.5 text-xs transition-colors"
              >
                <ExternalLink className="text-muted-foreground h-3 w-3" />
                <span className="flex-1">示例配置</span>
              </a>
              <a
                href="#"
                className="hover:bg-accent group flex items-center gap-2 rounded px-2 py-1.5 text-xs transition-colors"
              >
                <ExternalLink className="text-muted-foreground h-3 w-3" />
                <span className="flex-1">社区讨论</span>
              </a>
            </div>
          </div>

          {/* 提示 */}
          <div className="bg-muted/50 rounded-lg p-3">
            <div className="flex items-start gap-2">
              <Sparkles className="text-primary mt-0.5 h-4 w-4 shrink-0" />
              <div className="text-muted-foreground text-xs">
                <p className="text-foreground mb-1 font-medium">小提示</p>
                <p>使用快捷键 Ctrl+N 快速创建新菜单</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
