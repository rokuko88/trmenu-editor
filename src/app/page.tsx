"use client";

import { useState, useCallback } from "react";
import { AppSidebar } from "@/components/siderbar";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import WelcomePage from "@/components/welcome-page";
import type { MenuConfig } from "@/types";

type ViewType = "home" | "editor" | "settings";

export default function Home() {
  const [menus, setMenus] = useState<MenuConfig[]>([]);
  const [selectedMenuId, setSelectedMenuId] = useState<string | null>(null);
  const [currentView, setCurrentView] = useState<ViewType>("home");

  // 创建空白菜单
  const handleCreateBlank = useCallback(() => {
    const newMenu: MenuConfig = {
      id: `menu-${Date.now()}`,
      name: `菜单 ${menus.length + 1}`,
      title: "箱子菜单",
      size: 54,
      type: "CHEST",
      items: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    setMenus((prev) => [...prev, newMenu]);
    setSelectedMenuId(newMenu.id);
    setCurrentView("editor");
  }, [menus.length]);

  // 导入菜单
  const handleImportMenu = useCallback(() => {
    // TODO: 实现文件选择和 YAML 解析
    alert("导入功能即将推出！");
  }, []);

  // 选择菜单
  const handleSelectMenu = useCallback((menuId: string) => {
    setSelectedMenuId(menuId);
    setCurrentView("editor");
  }, []);

  // 导航切换
  const handleNavigate = useCallback((view: "home" | "settings") => {
    setCurrentView(view);
    if (view === "home") {
      setSelectedMenuId(null);
    }
  }, []);

  // 获取当前选中的菜单
  const selectedMenu = menus.find((m) => m.id === selectedMenuId);

  // 获取面包屑内容
  const getBreadcrumbs = () => {
    switch (currentView) {
      case "home":
        return (
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbPage>首页</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        );
      case "editor":
        return (
          <BreadcrumbList>
            <BreadcrumbItem className="hidden md:block">
              <BreadcrumbLink
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  handleNavigate("home");
                }}
              >
                首页
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator className="hidden md:block" />
            <BreadcrumbItem>
              <BreadcrumbPage>
                {selectedMenu?.name || "菜单编辑器"}
              </BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        );
      case "settings":
        return (
          <BreadcrumbList>
            <BreadcrumbItem className="hidden md:block">
              <BreadcrumbLink
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  handleNavigate("home");
                }}
              >
                首页
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator className="hidden md:block" />
            <BreadcrumbItem>
              <BreadcrumbPage>设置</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        );
      default:
        return null;
    }
  };

  // 渲染主内容
  const renderContent = () => {
    switch (currentView) {
      case "home":
        return (
          <WelcomePage
            onCreateBlank={handleCreateBlank}
            onImportMenu={handleImportMenu}
          />
        );
      case "editor":
        return (
          <div className="flex flex-1 flex-col gap-4 p-4">
            <div className="h-full flex items-center justify-center rounded-xl border bg-muted/50">
              <div className="text-center text-muted-foreground">
                <div className="text-6xl mb-4">🚧</div>
                <p className="text-lg font-medium">编辑器正在开发中</p>
                <p className="text-sm mt-2">当前菜单：{selectedMenu?.name}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  {selectedMenu?.size} 格 • {selectedMenu?.type}
                </p>
              </div>
            </div>
          </div>
        );
      case "settings":
        return (
          <div className="flex flex-1 flex-col gap-4 p-4">
            <div className="h-full flex items-center justify-center rounded-xl border bg-muted/50">
              <div className="text-center text-muted-foreground">
                <div className="text-6xl mb-4">⚙️</div>
                <p className="text-lg font-medium">设置页面</p>
                <p className="text-sm mt-2">即将推出</p>
              </div>
            </div>
          </div>
        );
    }
  };

  return (
    <SidebarProvider>
      <AppSidebar
        menus={menus}
        selectedMenuId={selectedMenuId}
        currentView={currentView}
        onSelectMenu={handleSelectMenu}
        onCreateMenu={handleCreateBlank}
        onNavigate={handleNavigate}
      />
      <SidebarInset>
        {currentView !== "home" && (
          <header className="flex h-14 shrink-0 items-center gap-2 border-b bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60">
            <div className="flex items-center gap-2 px-3">
              <SidebarTrigger className="-ml-1" />
              <Separator orientation="vertical" className="mr-2 h-4" />
              <Breadcrumb>{getBreadcrumbs()}</Breadcrumb>
            </div>
          </header>
        )}
        {renderContent()}
      </SidebarInset>
    </SidebarProvider>
  );
}
