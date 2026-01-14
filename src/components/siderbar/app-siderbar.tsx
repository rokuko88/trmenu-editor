"use client";

import * as React from "react";
import { FileText, Plus } from "lucide-react";

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
import type { MenuConfig } from "@/types";
import { cn } from "@/lib/utils";

interface AppSidebarProps extends React.ComponentProps<typeof Sidebar> {
  menus: MenuConfig[];
  selectedMenuId?: string | null;
  onSelectMenu: (menuId: string) => void;
  onCreateMenu: () => void;
}

export function AppSidebar({
  menus,
  selectedMenuId,
  onSelectMenu,
  onCreateMenu,
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
              <div className="bg-linear-to-br from-amber-500 to-amber-700 text-white flex aspect-square size-8 items-center justify-center rounded-lg">
                <span className="text-lg font-bold">T</span>
              </div>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-semibold">TrMenu Editor</span>
                <span className="truncate text-xs">菜单编辑器</span>
              </div>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
        {/* 创建按钮 */}
        <SidebarGroup>
          <div className="px-2 py-2">
            <Button
              className="w-full justify-start"
              size="sm"
              onClick={onCreateMenu}
            >
              <Plus className="h-4 w-4 mr-2" />
              新建菜单
            </Button>
          </div>
        </SidebarGroup>

        {/* 菜单列表 */}
        <SidebarGroup>
          <SidebarGroupLabel>我的菜单</SidebarGroupLabel>
          <SidebarMenu>
            {menus.length === 0 ? (
              <div className="text-center text-sm text-muted-foreground py-8 px-4">
                <FileText className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p>暂无菜单</p>
                <p className="text-xs mt-1">点击上方按钮创建</p>
              </div>
            ) : (
              menus.map((menu) => (
                <SidebarMenuItem key={menu.id}>
                  <SidebarMenuButton
                    onClick={() => onSelectMenu(menu.id)}
                    isActive={selectedMenuId === menu.id}
                    tooltip={menu.name}
                  >
                    <FileText className="h-4 w-4" />
                    <div className="flex-1 min-w-0">
                      <div className="truncate font-medium">{menu.name}</div>
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
        <SidebarMenu>
          <SidebarMenuItem>
            <div className="px-2 py-2 text-xs text-muted-foreground">
              <div className="flex justify-between">
                <span>菜单总数</span>
                <span className="font-medium">{menus.length}</span>
              </div>
            </div>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>

      <SidebarRail />
    </Sidebar>
  );
}
