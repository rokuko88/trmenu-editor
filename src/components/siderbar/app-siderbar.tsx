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

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const router = useRouter();
  const pathname = usePathname();
  const { setOpen, open } = useSidebar();

  // 使用 zustand store
  const menus = useMenuStore((state) => state.menus);
  const menuGroups = useMenuStore((state) => state.menuGroups);
  const selectedMenuId = useMenuStore((state) => state.selectedMenuId);
  const recentItems = useMenuStore((state) => state.recentItems);
  const setSelectedMenuId = useMenuStore((state) => state.setSelectedMenuId);
  const createMenu = useMenuStore((state) => state.createMenu);
  const createGroup = useMenuStore((state) => state.createGroup);
  const deleteMenu = useMenuStore((state) => state.deleteMenu);
  const renameMenu = useMenuStore((state) => state.renameMenu);
  const deleteGroup = useMenuStore((state) => state.deleteGroup);
  const renameGroup = useMenuStore((state) => state.renameGroup);
  const handleMenuDragEnd = useMenuStore((state) => state.handleMenuDragEnd);
  const clearRecent = useMenuStore((state) => state.clearRecent);
  const clearAllMenus = useMenuStore((state) => state.clearAllMenus);

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

  // 创建菜单并导航
  const handleCreateMenu = (groupId?: string) => {
    const menuId = createMenu(groupId);
    router.push(navigateToMenu(menuId));
  };

  // 重命名菜单（带输入框）
  const handleRenameMenu = (menuId: string) => {
    const menu = menus.find((m) => m.id === menuId);
    if (!menu) return;

    const newName = prompt("请输入新的菜单名称：", menu.name);
    if (newName && newName.trim()) {
      renameMenu(menuId, newName.trim());
    }
  };

  // 重命名菜单组（带输入框）
  const handleRenameGroup = (groupId: string) => {
    const group = menuGroups.find((g) => g.id === groupId);
    if (!group) return;

    const newName = prompt("请输入新的菜单组名称：", group.name);
    if (newName && newName.trim()) {
      renameGroup(groupId, newName.trim());
    }
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

  // 获取分组的菜单（按 order 排序 + 搜索过滤）
  const getGroupMenus = (groupId: string) =>
    filterMenusBySearch(
      menus
        .filter((menu) => menu.groupId === groupId)
        .sort((a, b) => a.order - b.order)
    );

  // 获取排序后的菜单组（如果组内有匹配的菜单才显示）
  const sortedGroups = [...menuGroups]
    .sort((a, b) => a.order - b.order)
    .filter((group) => {
      if (!searchQuery.trim()) return true;
      return getGroupMenus(group.id).length > 0;
    });

  // 切换侧边栏展开/收起
  const toggleSidebar = () => {
    setOpen(!open);
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
          <WorkspaceMenu
            recentItems={recentItems}
            onClearRecent={clearRecent}
          />

          {/* 菜单列表 */}
          <SidebarGroup className="group-data-[collapsible=icon]:hidden py-0">
            <MenuListHeader
              menusCount={menus.length}
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
              onCreateMenu={() => handleCreateMenu()}
              onCreateGroup={createGroup}
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
                        const groupMenus = getGroupMenus(group.id);
                        const isOpen = openGroups.includes(group.id);

                        return (
                          <DraggableMenuGroup
                            key={group.id}
                            group={group}
                            menus={groupMenus}
                            isOpen={isOpen}
                            selectedMenuId={selectedMenuId}
                            onToggle={() => toggleGroup(group.id)}
                            onCreateMenu={handleCreateMenu}
                            onDeleteMenu={deleteMenu}
                            onRenameMenu={handleRenameMenu}
                            onDeleteGroup={deleteGroup}
                            onRenameGroup={handleRenameGroup}
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
                        <DraggableMenuItem
                          key={menu.id}
                          menu={menu}
                          isActive={selectedMenuId === menu.id}
                          onDelete={deleteMenu}
                          onRename={handleRenameMenu}
                        />
                      ))}
                    </SortableContext>
                  </>
                )}
              </SidebarMenu>
            </DndContext>
          </SidebarGroup>
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
