"use client";

import { useRouter, usePathname } from "next/navigation";
import { Home, History, Package, File, X } from "lucide-react";
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from "@/components/ui/sidebar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Separator } from "@/components/ui/separator";
import { navigateToMenu } from "@/lib/config";
import { useMenuStore } from "@/store/menu-store";

export function WorkspaceMenu() {
  const router = useRouter();
  const pathname = usePathname();

  // 直接从 zustand 获取数据
  const recentItems = useMenuStore((state) => state.recentItems);
  const clearRecent = useMenuStore((state) => state.clearRecent);

  return (
    <SidebarGroup className="py-0">
      <div className="group-data-[collapsible=icon]:hidden">
        <SidebarGroupLabel>工作区</SidebarGroupLabel>
      </div>
      <div className="hidden group-data-[collapsible=icon]:flex h-8 items-center px-2">
        <Separator />
      </div>
      <SidebarMenu>
        <SidebarMenuItem>
          <SidebarMenuButton
            onClick={() => router.push("/")}
            isActive={pathname === "/"}
            tooltip="首页"
          >
            <Home className="h-4 w-4 shrink-0" />
            <span className="truncate">首页</span>
          </SidebarMenuButton>
        </SidebarMenuItem>
        <SidebarMenuItem>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <SidebarMenuButton tooltip="最近使用">
                <History className="h-4 w-4 shrink-0" />
                <span className="truncate">最近使用</span>
                {recentItems.length > 0 && (
                  <span className="ml-auto text-xs text-muted-foreground">
                    {recentItems.length}
                  </span>
                )}
              </SidebarMenuButton>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-64">
              {recentItems.length === 0 ? (
                <div className="px-2 py-6 text-center">
                  <History className="h-8 w-8 mx-auto mb-2 opacity-20" />
                  <p className="text-xs text-muted-foreground">
                    暂无最近打开的菜单
                  </p>
                </div>
              ) : (
                <>
                  <div className="px-2 py-1.5">
                    <p className="text-xs font-medium text-muted-foreground">
                      最近打开
                    </p>
                  </div>
                  {recentItems.map((item, index) => (
                    <DropdownMenuItem
                      key={item.menuId}
                      onClick={() => {
                        router.push(navigateToMenu(item.menuId));
                      }}
                      className="cursor-pointer"
                    >
                      <File className="h-4 w-4 mr-2 shrink-0" />
                      <span className="flex-1 truncate text-sm">
                        {item.menuName}
                      </span>
                      <span className="text-xs text-muted-foreground ml-2">
                        {index < 9 && `⌘${index + 1}`}
                      </span>
                    </DropdownMenuItem>
                  ))}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={clearRecent}
                    className="text-destructive text-sm"
                  >
                    <X className="h-4 w-4 mr-2" />
                    清空历史记录
                  </DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </SidebarMenuItem>
        <SidebarMenuItem>
          <SidebarMenuButton tooltip="模板库">
            <Package className="h-4 w-4 shrink-0" />
            <span className="truncate">模板库</span>
          </SidebarMenuButton>
        </SidebarMenuItem>
      </SidebarMenu>
    </SidebarGroup>
  );
}
