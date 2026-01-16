"use client";

import { Plus, File, Folder, Search, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { SidebarGroupLabel } from "@/components/ui/sidebar";
import { Input } from "@/components/ui/input";
import { useMenuStore } from "@/store/menu-store";

interface MenuListHeaderProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
  onCreateMenu: () => void;
  onClearAll: () => void;
}

export function MenuListHeader({
  searchQuery,
  onSearchChange,
  onCreateMenu,
  onClearAll,
}: MenuListHeaderProps) {
  // 直接从 zustand 获取数据
  const menusCount = useMenuStore((state) => state.menus.length);
  const createGroup = useMenuStore((state) => state.createGroup);
  return (
    <>
      <div className="mb-1 flex items-center justify-between px-2">
        <SidebarGroupLabel className="px-0">我的菜单</SidebarGroupLabel>
        <div className="flex items-center gap-1">
          {/* 清空按钮 */}
          {menusCount > 0 && (
            <Button
              variant="ghost"
              size="icon"
              className="hover:bg-destructive/10 hover:text-destructive h-6 w-6 shrink-0"
              title="清空所有菜单"
              onClick={onClearAll}
            >
              <Trash2 className="h-3.5 w-3.5" />
            </Button>
          )}

          {/* 新建菜单下拉 */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6 shrink-0"
                title="新建"
              >
                <Plus className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-40">
              <DropdownMenuItem
                onClick={onCreateMenu}
                className="cursor-pointer"
              >
                <File className="mr-2 h-4 w-4" />
                <span>创建菜单</span>
                <span className="text-muted-foreground ml-auto text-xs">
                  ⌘N
                </span>
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={createGroup}
                className="cursor-pointer"
              >
                <Folder className="mr-2 h-4 w-4" />
                <span>创建菜单组</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* 搜索框 */}
      <div className="mb-2 px-2">
        <div className="relative">
          <Search className="text-muted-foreground pointer-events-none absolute top-1/2 left-2 h-3.5 w-3.5 -translate-y-1/2" />
          <Input
            type="text"
            placeholder="搜索菜单..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="h-8 pr-2 pl-7 text-sm"
          />
        </div>
      </div>
    </>
  );
}
