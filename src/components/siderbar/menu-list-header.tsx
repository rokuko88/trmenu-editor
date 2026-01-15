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

interface MenuListHeaderProps {
  menusCount: number;
  searchQuery: string;
  onSearchChange: (value: string) => void;
  onCreateMenu: () => void;
  onCreateGroup: () => void;
  onClearAll: () => void;
}

export function MenuListHeader({
  menusCount,
  searchQuery,
  onSearchChange,
  onCreateMenu,
  onCreateGroup,
  onClearAll,
}: MenuListHeaderProps) {
  return (
    <>
      <div className="flex items-center justify-between px-2 mb-1">
        <SidebarGroupLabel className="px-0">我的菜单</SidebarGroupLabel>
        <div className="flex items-center gap-1">
          {/* 清空按钮 */}
          {menusCount > 0 && (
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6 shrink-0 hover:bg-destructive/10 hover:text-destructive"
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
                <File className="h-4 w-4 mr-2" />
                <span>创建菜单</span>
                <span className="ml-auto text-xs text-muted-foreground">
                  ⌘N
                </span>
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={onCreateGroup}
                className="cursor-pointer"
              >
                <Folder className="h-4 w-4 mr-2" />
                <span>创建菜单组</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* 搜索框 */}
      <div className="px-2 mb-2">
        <div className="relative">
          <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground pointer-events-none" />
          <Input
            type="text"
            placeholder="搜索菜单..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="h-8 pl-7 pr-2 text-sm"
          />
        </div>
      </div>
    </>
  );
}
