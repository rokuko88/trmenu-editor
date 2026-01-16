"use client";

import {
  Plus,
  Folder,
  ChevronRight,
  Settings,
  Edit,
  Trash2,
  Clipboard,
} from "lucide-react";
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
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuTrigger,
} from "@/components/ui/context-menu";
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
import { useConfirm } from "@/hooks/use-confirm";
import { usePrompt } from "@/hooks/use-prompt";
import { toast } from "sonner";

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
  const pasteMenu = useMenuStore((state) => state.pasteMenu);
  const menuClipboard = useMenuStore((state) => state.menuClipboard);

  // Hooks for modal dialogs
  const { confirm, ConfirmDialog } = useConfirm();
  const { prompt, PromptDialog } = usePrompt();
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
  const handleRenameGroup = async () => {
    const newName = await prompt({
      title: "重命名菜单组",
      description: "请输入新的菜单组名称",
      defaultValue: group.name,
      placeholder: "菜单组名称",
    });
    if (newName && newName.trim()) {
      renameGroup(group.id, newName.trim());
    }
  };

  // 处理删除组
  const handleDeleteGroup = async () => {
    const groupMenuCount = menus.length;

    const shouldDelete = await confirm({
      title: "删除菜单组",
      description:
        groupMenuCount > 0
          ? `此菜单组包含 ${groupMenuCount} 个菜单，删除后菜单将移至未分组。确定要删除吗？`
          : "确定要删除这个菜单组吗？",
      variant: "destructive",
      confirmText: "删除",
    });

    if (shouldDelete) {
      deleteGroup(group.id);
    }
  };

  // 处理粘贴到组
  const handlePasteToGroup = () => {
    if (!menuClipboard) {
      toast.error("剪贴板为空");
      return;
    }
    const newMenuId = pasteMenu(group.id);
    if (newMenuId) {
      toast.success("粘贴成功");
      router.push(navigateToMenu(newMenuId));
    }
  };

  return (
    <div ref={setNodeRef} style={style}>
      <ContextMenu modal={false}>
        <ContextMenuTrigger asChild>
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
                        onClick={handleDeleteGroup}
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
        </ContextMenuTrigger>

        {/* 右键菜单 */}
        <ContextMenuContent className="w-48">
          <ContextMenuItem onClick={handleCreateMenu}>
            <Plus className="mr-2 h-4 w-4" />
            新建菜单
          </ContextMenuItem>
          <ContextMenuItem
            onClick={handlePasteToGroup}
            disabled={!menuClipboard}
          >
            <Clipboard className="mr-2 h-4 w-4" />
            粘贴菜单
          </ContextMenuItem>
          <ContextMenuSeparator />
          <ContextMenuItem onClick={handleRenameGroup}>
            <Edit className="mr-2 h-4 w-4" />
            重命名组
          </ContextMenuItem>
          <ContextMenuItem
            onClick={handleDeleteGroup}
            className="text-destructive focus:text-destructive"
          >
            <Trash2 className="mr-2 h-4 w-4" />
            删除组
          </ContextMenuItem>
        </ContextMenuContent>
      </ContextMenu>

      {/* Modal Dialogs */}
      {ConfirmDialog}
      {PromptDialog}
    </div>
  );
}
