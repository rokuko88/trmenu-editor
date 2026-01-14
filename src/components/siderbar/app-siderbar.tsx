"use client";

import * as React from "react";
import {
  FileText,
  Plus,
  Home,
  Settings,
  BookOpen,
  Package,
} from "lucide-react";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
  SidebarGroupLabel,
  SidebarGroup,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { GithubStar } from "@/components/github-star";
import type { MenuConfig } from "@/types";

interface AppSidebarProps extends React.ComponentProps<typeof Sidebar> {
  menus: MenuConfig[];
  selectedMenuId?: string | null;
  currentView?: "home" | "editor" | "settings";
  onSelectMenu: (menuId: string) => void;
  onCreateMenu: () => void;
  onNavigate?: (view: "home" | "settings") => void;
}

export function AppSidebar({
  menus,
  selectedMenuId,
  currentView = "home",
  onSelectMenu,
  onCreateMenu,
  onNavigate,
  ...props
}: AppSidebarProps) {
  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
            >
              <div className="bg-linear-to-br from-blue-500 to-blue-700 text-white flex aspect-square size-8 items-center justify-center rounded-lg">
                <span className="text-lg font-bold">T</span>
              </div>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-semibold">TrMenu Editor</span>
                <span className="truncate text-xs">v1.0.0</span>
              </div>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
        {/* 快速访问 */}
        <SidebarGroup className="pb-2">
          <SidebarGroupLabel>快速访问</SidebarGroupLabel>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton
                onClick={() => onNavigate?.("home")}
                isActive={currentView === "home"}
                tooltip="首页"
              >
                <Home className="h-4 w-4 shrink-0" />
                <span className="truncate">首页</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton tooltip="模板库">
                <Package className="h-4 w-4 shrink-0" />
                <span className="truncate">模板库</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton tooltip="文档">
                <BookOpen className="h-4 w-4 shrink-0" />
                <span className="truncate">文档</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarGroup>

        {/* 菜单列表 */}
        <SidebarGroup className="group-data-[collapsible=icon]:hidden pt-2">
          <SidebarGroupLabel>我的菜单</SidebarGroupLabel>
          <div className="px-2 pb-2">
            <Button
              className="w-full justify-start h-8 text-xs min-w-0"
              size="sm"
              onClick={onCreateMenu}
            >
              <Plus className="h-3.5 w-3.5 mr-1.5 shrink-0" />
              <span className="truncate">新建菜单</span>
            </Button>
          </div>
          <SidebarMenu>
            {menus.length === 0 ? (
              <div className="text-center text-xs text-muted-foreground py-6 px-4">
                <FileText className="h-6 w-6 mx-auto mb-2 opacity-50" />
                <p>暂无菜单</p>
              </div>
            ) : (
              menus.map((menu) => (
                <SidebarMenuItem key={menu.id}>
                  <SidebarMenuButton
                    onClick={() => onSelectMenu(menu.id)}
                    isActive={selectedMenuId === menu.id}
                    tooltip={menu.name}
                    className="h-auto py-2"
                  >
                    <FileText className="h-4 w-4 shrink-0" />
                    <div className="flex-1 min-w-0 overflow-hidden">
                      <div className="truncate text-sm font-medium">
                        {menu.name}
                      </div>
                      <div className="text-xs text-muted-foreground truncate">
                        {menu.size} 格 • {menu.items.length} 物品
                      </div>
                    </div>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))
            )}
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
        {/* 展开状态 */}
        <div className="group-data-[collapsible=icon]:hidden">
          <div className="flex items-center justify-between px-2 py-2 gap-2">
            <div className="flex-1 min-w-0 overflow-hidden">
              <GithubStar />
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 rounded-full shrink-0"
              onClick={() => onNavigate?.("settings")}
              title="设置"
            >
              <Settings className="h-4 w-4" />
            </Button>
          </div>
        </div>
        {/* 收起状态 */}
        <div className="hidden group-data-[collapsible=icon]:flex justify-center py-2">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 rounded-full"
            onClick={() => onNavigate?.("settings")}
            title="设置"
          >
            <Settings className="h-4 w-4" />
          </Button>
        </div>
      </SidebarFooter>

      <SidebarRail />
    </Sidebar>
  );
}
