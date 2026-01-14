"use client";

import { useState, useCallback } from "react";
import { AppSidebar } from "@/components/siderbar";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import WelcomePage from "@/components/welcome-page";
import type { MenuConfig } from "@/types";

export default function Home() {
  const [menus, setMenus] = useState<MenuConfig[]>([]);
  const [selectedMenuId, setSelectedMenuId] = useState<string | null>(null);

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
  }, [menus.length]);

  // 导入菜单（暂时用创建模拟）
  const handleImportMenu = useCallback(() => {
    // TODO: 实现文件选择和 YAML 解析
    alert("导入功能即将推出！");
  }, []);

  // 选择菜单
  const handleSelectMenu = useCallback((menuId: string) => {
    setSelectedMenuId(menuId);
  }, []);

  // 判断是否显示 Welcome 页面
  const showWelcome = menus.length === 0;

  return (
    <SidebarProvider>
      <AppSidebar
        menus={menus}
        selectedMenuId={selectedMenuId}
        onSelectMenu={handleSelectMenu}
        onCreateMenu={handleCreateBlank}
      />
      <SidebarInset>
        {showWelcome ? (
          <WelcomePage
            onCreateBlank={handleCreateBlank}
            onImportMenu={handleImportMenu}
          />
        ) : (
          <div className="h-full flex items-center justify-center">
            <div className="text-center text-muted-foreground">
              <div className="text-6xl mb-4">🚧</div>
              <p className="text-lg font-medium">编辑器正在开发中</p>
              <p className="text-sm mt-2">
                已选择菜单：
                {menus.find((m) => m.id === selectedMenuId)?.name}
              </p>
            </div>
          </div>
        )}
      </SidebarInset>
    </SidebarProvider>
  );
}
