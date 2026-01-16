"use client";

import * as React from "react";
import Image from "next/image";
import { useRouter, usePathname } from "next/navigation";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";

import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
  SidebarGroup,
  useSidebar,
} from "@/components/ui/sidebar";
import { useMenuStore } from "@/store/menu-store";
import type { MenuConfig } from "@/types";
import { getAssetPath, navigateToMenu } from "@/lib/config";
import { WorkspaceMenu } from "./workspace-menu";
import { MenuListHeader } from "./menu-list-header";
import { EmptyMenuState } from "./empty-menu-state";
import { SidebarFooter } from "./sidebar-footer";
import { DraggableMenuItem } from "./draggable-menu-item";
import { DraggableMenuGroup } from "./draggable-menu-group";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuTrigger,
} from "@/components/ui/context-menu";
import { Plus, Clipboard, FolderPlus } from "lucide-react";
import { toast } from "sonner";

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const router = useRouter();
  const pathname = usePathname();
  const { setOpen, open } = useSidebar();

  // 使用 zustand store (只获取必要的数据)
  const menus = useMenuStore((state) => state.menus);
  const menuGroups = useMenuStore((state) => state.menuGroups);
  const setSelectedMenuId = useMenuStore((state) => state.setSelectedMenuId);
  const createMenu = useMenuStore((state) => state.createMenu);
  const createGroup = useMenuStore((state) => state.createGroup);
  const handleMenuDragEnd = useMenuStore((state) => state.handleMenuDragEnd);
  const clearAllMenus = useMenuStore((state) => state.clearAllMenus);
  const pasteMenu = useMenuStore((state) => state.pasteMenu);
  const menuClipboard = useMenuStore((state) => state.menuClipboard);

  const [openGroups, setOpenGroups] = React.useState<string[]>([]);
  const [searchQuery, setSearchQuery] = React.useState("");
  const [showClearDialog, setShowClearDialog] = React.useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8, // 需要拖拽 8px 才激活，避免和点击冲突
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // 根据路径更新 selectedMenuId
  React.useEffect(() => {
    const match = pathname.match(/^\/menu\/(.+)$/);
    if (match) {
      setSelectedMenuId(match[1]);
    } else {
      setSelectedMenuId(null);
    }
  }, [pathname, setSelectedMenuId]);

  // 切换菜单组展开/收起
  const toggleGroup = (groupId: string) => {
    setOpenGroups((prev) =>
      prev.includes(groupId)
        ? prev.filter((id) => id !== groupId)
        : [...prev, groupId]
    );
  };

  // 创建菜单并导航（只在未分组时需要）
  const handleCreateMenu = () => {
    const menuId = createMenu();
    router.push(navigateToMenu(menuId));
  };

  // 搜索过滤函数
  const filterMenusBySearch = (menuList: MenuConfig[]) => {
    if (!searchQuery.trim()) return menuList;
    return menuList.filter((menu) =>
      menu.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  };

  // 获取未分组的菜单（按 order 排序 + 搜索过滤）
  const ungroupedMenus = filterMenusBySearch(
    menus.filter((menu) => !menu.groupId).sort((a, b) => a.order - b.order)
  );

  // 获取分组的菜单 IDs（按 order 排序 + 搜索过滤）
  const getGroupMenuIds = (groupId: string) =>
    filterMenusBySearch(
      menus
        .filter((menu) => menu.groupId === groupId)
        .sort((a, b) => a.order - b.order)
    ).map((m) => m.id);

  // 获取排序后的菜单组（如果组内有匹配的菜单才显示）
  const sortedGroups = [...menuGroups]
    .sort((a, b) => a.order - b.order)
    .filter((group) => {
      if (!searchQuery.trim()) return true;
      return getGroupMenuIds(group.id).length > 0;
    });

  // 切换侧边栏展开/收起
  const toggleSidebar = () => {
    setOpen(!open);
  };

  // 处理粘贴菜单
  const handlePasteMenu = () => {
    if (!menuClipboard) {
      toast.error("剪贴板为空");
      return;
    }
    const newMenuId = pasteMenu();
    if (newMenuId) {
      toast.success("粘贴成功");
      router.push(navigateToMenu(newMenuId));
    }
  };

  // 处理创建菜单组
  const handleCreateGroup = () => {
    createGroup();
    toast.success("已创建新菜单组");
  };

  return (
    <>
      <Sidebar collapsible="icon" {...props}>
        <SidebarHeader>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton
                size="lg"
                className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground group-data-[collapsible=icon]:justify-center"
              >
                <div className="flex aspect-square size-8 items-center justify-center overflow-hidden bg-white dark:bg-slate-800 rounded-md group-data-[collapsible=icon]:mx-0">
                  <Image
                    src={getAssetPath("/image.png")}
                    alt="TrMenu Logo"
                    width={32}
                    height={32}
                    className="object-contain dark:brightness-110"
                    priority
                    unoptimized
                  />
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight group-data-[collapsible=icon]:hidden">
                  <span className="truncate font-semibold">TrMenu Editor</span>
                  <span className="truncate text-xs text-muted-foreground">
                    可视化菜单编辑器
                  </span>
                </div>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarHeader>

        <SidebarContent>
          {/* 工作区 */}
          <WorkspaceMenu />

          {/* 菜单列表 */}
          <ContextMenu modal={false}>
            <ContextMenuTrigger asChild>
              <SidebarGroup className="group-data-[collapsible=icon]:hidden py-0 flex-1">
                <MenuListHeader
                  searchQuery={searchQuery}
                  onSearchChange={setSearchQuery}
                  onCreateMenu={handleCreateMenu}
                  onClearAll={() => setShowClearDialog(true)}
                />

                <DndContext
                  sensors={sensors}
                  collisionDetection={closestCenter}
                  onDragEnd={handleMenuDragEnd}
                >
                  <SidebarMenu>
                    {menus.length === 0 && menuGroups.length === 0 ? (
                      <EmptyMenuState />
                    ) : (
                      <>
                        {/* 渲染菜单组 */}
                        <SortableContext
                          items={sortedGroups.map((g) => g.id)}
                          strategy={verticalListSortingStrategy}
                        >
                          {sortedGroups.map((group) => {
                            const groupMenuIds = getGroupMenuIds(group.id);
                            const isOpen = openGroups.includes(group.id);

                            return (
                              <DraggableMenuGroup
                                key={group.id}
                                group={group}
                                groupMenus={groupMenuIds}
                                isOpen={isOpen}
                                onToggle={() => toggleGroup(group.id)}
                              />
                            );
                          })}
                        </SortableContext>

                        {/* 渲染未分组的菜单 */}
                        <SortableContext
                          items={ungroupedMenus.map((m) => m.id)}
                          strategy={verticalListSortingStrategy}
                        >
                          {ungroupedMenus.map((menu) => (
                            <DraggableMenuItem key={menu.id} menu={menu} />
                          ))}
                        </SortableContext>
                      </>
                    )}
                  </SidebarMenu>
                </DndContext>
              </SidebarGroup>
            </ContextMenuTrigger>

            {/* 空白区域右键菜单 */}
            <ContextMenuContent className="w-48">
              <ContextMenuItem onClick={handleCreateMenu}>
                <Plus className="mr-2 h-4 w-4" />
                新建菜单
              </ContextMenuItem>
              <ContextMenuItem onClick={handleCreateGroup}>
                <FolderPlus className="mr-2 h-4 w-4" />
                新建菜单组
              </ContextMenuItem>
              <ContextMenuSeparator />
              <ContextMenuItem
                onClick={handlePasteMenu}
                disabled={!menuClipboard}
              >
                <Clipboard className="mr-2 h-4 w-4" />
                粘贴菜单
              </ContextMenuItem>
            </ContextMenuContent>
          </ContextMenu>
        </SidebarContent>

        <SidebarFooter isOpen={open} onToggle={toggleSidebar} />

        <SidebarRail />
      </Sidebar>

      {/* 清空菜单确认对话框 */}
      <AlertDialog open={showClearDialog} onOpenChange={setShowClearDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>确认清空所有菜单？</AlertDialogTitle>
            <AlertDialogDescription>
              此操作将删除所有菜单和菜单组，包括 {menus.length} 个菜单和{" "}
              {menuGroups.length} 个菜单组。此操作不可恢复，请谨慎操作。
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>取消</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                clearAllMenus();
                setShowClearDialog(false);
                router.push("/");
              }}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              确认清空
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
