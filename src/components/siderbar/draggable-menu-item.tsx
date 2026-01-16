"use client";

import { useRouter } from "next/navigation";
import {
  File,
  Settings,
  Trash2,
  Copy,
  Clipboard,
  Edit,
  FileStack,
} from "lucide-react";
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
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuTrigger,
} from "@/components/ui/context-menu";
import type { MenuConfig } from "@/types";
import { navigateToMenu } from "@/lib/config";
import { useMenuStore } from "@/store/menu-store";
import { useConfirm } from "@/hooks/use-confirm";
import { usePrompt } from "@/hooks/use-prompt";
import { toast } from "sonner";

interface DraggableMenuItemProps {
  menu: MenuConfig;
}

export function DraggableMenuItem({ menu }: DraggableMenuItemProps) {
  const router = useRouter();

  // 直接从 zustand 获取数据和 actions
  const selectedMenuId = useMenuStore((state) => state.selectedMenuId);
  const deleteMenu = useMenuStore((state) => state.deleteMenu);
  const renameMenu = useMenuStore((state) => state.renameMenu);
  const cloneMenu = useMenuStore((state) => state.cloneMenu);
  const copyMenu = useMenuStore((state) => state.copyMenu);
  const pasteMenu = useMenuStore((state) => state.pasteMenu);
  const menuClipboard = useMenuStore((state) => state.menuClipboard);

  // Hooks for modal dialogs
  const { confirm, ConfirmDialog } = useConfirm();
  const { prompt, PromptDialog } = usePrompt();

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
  const handleRename = async () => {
    const newName = await prompt({
      title: "重命名菜单",
      description: "请输入新的菜单名称",
      defaultValue: menu.name,
      placeholder: "菜单名称",
    });
    if (newName && newName.trim()) {
      renameMenu(menu.id, newName.trim());
    }
  };

  // 处理删除
  const handleDelete = async () => {
    const shouldDelete = await confirm({
      title: "删除菜单",
      description: "确定要删除这个菜单吗？",
      variant: "destructive",
      confirmText: "删除",
    });
    if (shouldDelete) {
      deleteMenu(menu.id);
    }
  };

  // 处理复制
  const handleCopy = () => {
    copyMenu(menu.id);
    toast.success("已复制到剪贴板");
  };

  // 处理粘贴
  const handlePaste = () => {
    if (!menuClipboard) {
      toast.error("剪贴板为空");
      return;
    }
    const newMenuId = pasteMenu(menu.groupId);
    if (newMenuId) {
      toast.success("粘贴成功");
      router.push(navigateToMenu(newMenuId));
    }
  };

  // 处理克隆
  const handleClone = () => {
    const newMenuId = cloneMenu(menu.id);
    if (newMenuId) {
      toast.success("克隆成功");
      router.push(navigateToMenu(newMenuId));
    }
  };

  return (
    <div ref={setNodeRef} style={style}>
      <ContextMenu modal={false}>
        <ContextMenuTrigger asChild>
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
                    handleDelete();
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
                      onClick={handleDelete}
                      className="text-destructive"
                    >
                      删除
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </SidebarMenuItem>
        </ContextMenuTrigger>

        {/* 右键菜单 */}
        <ContextMenuContent className="w-48">
          <ContextMenuItem onClick={handleMenuClick}>
            <File className="mr-2 h-4 w-4" />
            打开菜单
          </ContextMenuItem>
          <ContextMenuSeparator />
          <ContextMenuItem onClick={handleRename}>
            <Edit className="mr-2 h-4 w-4" />
            重命名
          </ContextMenuItem>
          <ContextMenuItem onClick={handleCopy}>
            <Copy className="mr-2 h-4 w-4" />
            复制
          </ContextMenuItem>
          <ContextMenuItem onClick={handlePaste} disabled={!menuClipboard}>
            <Clipboard className="mr-2 h-4 w-4" />
            粘贴
          </ContextMenuItem>
          <ContextMenuItem onClick={handleClone}>
            <FileStack className="mr-2 h-4 w-4" />
            克隆
          </ContextMenuItem>
          <ContextMenuSeparator />
          <ContextMenuItem
            onClick={handleDelete}
            className="text-destructive focus:text-destructive"
          >
            <Trash2 className="mr-2 h-4 w-4" />
            删除
          </ContextMenuItem>
        </ContextMenuContent>
      </ContextMenu>

      {/* Modal Dialogs */}
      {ConfirmDialog}
      {PromptDialog}
    </div>
  );
}
