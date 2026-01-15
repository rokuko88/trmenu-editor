"use client";

import { Plus, Folder, ChevronRight, Settings } from "lucide-react";
import { useSortable } from "@dnd-kit/sortable";
import { useDroppable } from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import type { MenuGroup } from "@/types";
import { DraggableMenuItem } from "./draggable-menu-item";
import { useMenuStore } from "@/store/menu-store";
import { useRouter } from "next/navigation";
import { navigateToMenu } from "@/lib/config";

interface DraggableMenuGroupProps {
  group: MenuGroup;
  groupMenus: string[]; // 只传递菜单 IDs
  isOpen: boolean;
  onToggle: () => void;
}

export function DraggableMenuGroup({
  group,
  groupMenus,
  isOpen,
  onToggle,
}: DraggableMenuGroupProps) {
  const router = useRouter();

  // 直接从 zustand 获取数据和 actions
  const menus = useMenuStore((state) =>
    state.menus.filter((m) => groupMenus.includes(m.id))
  );
  const createMenu = useMenuStore((state) => state.createMenu);
  const deleteGroup = useMenuStore((state) => state.deleteGroup);
  const renameGroup = useMenuStore((state) => state.renameGroup);
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: group.id });

  const { setNodeRef: setDropRef, isOver } = useDroppable({
    id: group.id,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    cursor: isDragging ? "grabbing" : undefined,
  };

  // 处理在组中创建菜单
  const handleCreateMenu = () => {
    const menuId = createMenu(group.id);
    router.push(navigateToMenu(menuId));
  };

  // 处理重命名组
  const handleRenameGroup = () => {
    const newName = prompt("请输入新的菜单组名称：", group.name);
    if (newName && newName.trim()) {
      renameGroup(group.id, newName.trim());
    }
  };

  return (
    <div ref={setNodeRef} style={style}>
      <Collapsible open={isOpen} onOpenChange={onToggle}>
        <SidebarMenuItem>
          <div
            ref={setDropRef}
            className={`${
              isOver ? "bg-accent/50 rounded-md" : ""
            } transition-colors relative group/group`}
          >
            <CollapsibleTrigger asChild>
              <SidebarMenuButton
                tooltip={group.name}
                className="h-8"
                {...attributes}
                {...listeners}
              >
                <ChevronRight
                  className={`h-4 w-4 shrink-0 transition-transform ${
                    isOpen ? "rotate-90" : ""
                  }`}
                />
                <Folder className="h-4 w-4 shrink-0" />
                <span className="truncate flex-1">{group.name}</span>
                <span className="text-xs text-muted-foreground">
                  {menus.length}
                </span>
              </SidebarMenuButton>
            </CollapsibleTrigger>
            <div className="absolute right-1 top-1/2 -translate-y-1/2 z-10 flex gap-0.5 opacity-0 group-hover/group:opacity-100 transition-opacity">
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6 shrink-0"
                onClick={(e) => {
                  e.stopPropagation();
                  handleCreateMenu();
                }}
                title="在此组中创建菜单"
              >
                <Plus className="h-3 w-3" />
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 shrink-0"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <Settings className="h-3 w-3" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={handleRenameGroup}>
                    重命名
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => deleteGroup(group.id)}
                    className="text-destructive"
                  >
                    删除
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
          <CollapsibleContent>
            <SidebarMenu className="ml-4 border-l pl-2">
              <SortableContext
                items={menus.map((m) => m.id)}
                strategy={verticalListSortingStrategy}
              >
                {menus.map((menu) => (
                  <DraggableMenuItem key={menu.id} menu={menu} />
                ))}
              </SortableContext>
            </SidebarMenu>
          </CollapsibleContent>
        </SidebarMenuItem>
      </Collapsible>
    </div>
  );
}
