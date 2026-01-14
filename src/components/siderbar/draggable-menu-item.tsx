"use client";

import { useRouter } from "next/navigation";
import { File, Settings } from "lucide-react";
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

interface DraggableMenuItemProps {
  menu: MenuConfig;
  isActive: boolean;
  onDelete: (menuId: string) => void;
  onRename: (menuId: string) => void;
}

export function DraggableMenuItem({
  menu,
  isActive,
  onDelete,
  onRename,
}: DraggableMenuItemProps) {
  const router = useRouter();
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

  return (
    <div ref={setNodeRef} style={style}>
      <SidebarMenuItem>
        <div className="group/item relative">
          <SidebarMenuButton
            onClick={() => router.push(`/menu/${menu.id}`)}
            isActive={isActive}
            tooltip={menu.name}
            className="h-8"
            {...attributes}
            {...listeners}
          >
            <File className="h-4 w-4 shrink-0" />
            <span className="truncate">{menu.name}</span>
          </SidebarMenuButton>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-5 w-5 shrink-0 opacity-0 group-hover/item:opacity-100 absolute right-1 top-1/2 -translate-y-1/2 z-10 transition-opacity"
                onClick={(e) => e.stopPropagation()}
              >
                <Settings className="h-3 w-3" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onRename(menu.id)}>
                重命名
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => onDelete(menu.id)}
                className="text-destructive"
              >
                删除
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </SidebarMenuItem>
    </div>
  );
}
