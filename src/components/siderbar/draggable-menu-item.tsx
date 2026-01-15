"use client";

import { useRouter } from "next/navigation";
import { File, Settings, Trash2 } from "lucide-react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

import { SidebarMenuButton, SidebarMenuItem } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { MenuConfig } from "@/types";
import { navigateToMenu } from "@/lib/config";
import { useMenuStore } from "@/store/menu-store";

interface DraggableMenuItemProps {
  menu: MenuConfig;
}

export function DraggableMenuItem({ menu }: DraggableMenuItemProps) {
  const router = useRouter();

  // 直接从 zustand 获取数据和 actions
  const selectedMenuId = useMenuStore((state) => state.selectedMenuId);
  const deleteMenu = useMenuStore((state) => state.deleteMenu);
  const renameMenu = useMenuStore((state) => state.renameMenu);

  const isActive = selectedMenuId === menu.id;
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: menu.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    cursor: isDragging ? "grabbing" : undefined,
  };

  // 处理菜单点击 - GitHub Pages 兼容
  const handleMenuClick = () => {
    router.push(navigateToMenu(menu.id));
  };

  // 处理重命名
  const handleRename = () => {
    const newName = prompt("请输入新的菜单名称：", menu.name);
    if (newName && newName.trim()) {
      renameMenu(menu.id, newName.trim());
    }
  };

  return (
    <div ref={setNodeRef} style={style}>
      <SidebarMenuItem>
        <div className="group/item relative">
          <SidebarMenuButton
            onClick={handleMenuClick}
            isActive={isActive}
            tooltip={menu.name}
            className="h-8 pr-12"
            {...attributes}
            {...listeners}
          >
            <File className="h-4 w-4 shrink-0" />
            <span className="truncate">{menu.name}</span>
          </SidebarMenuButton>

          {/* 操作按钮组 */}
          <div className="absolute right-1 top-1/2 -translate-y-1/2 flex items-center gap-0.5 opacity-0 group-hover/item:opacity-100 transition-opacity z-10">
            {/* 删除按钮 */}
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6 shrink-0 hover:bg-destructive/10 hover:text-destructive"
              onClick={(e) => {
                e.stopPropagation();
                deleteMenu(menu.id);
              }}
              title="删除菜单"
            >
              <Trash2 className="h-3 w-3" />
            </Button>

            {/* 更多选项 */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-5 w-5 shrink-0"
                  onClick={(e) => e.stopPropagation()}
                  title="更多选项"
                >
                  <Settings className="h-3 w-3" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={handleRename}>
                  重命名
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => deleteMenu(menu.id)}
                  className="text-destructive"
                >
                  删除
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </SidebarMenuItem>
    </div>
  );
}
