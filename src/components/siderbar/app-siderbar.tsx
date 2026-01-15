"use client";

import * as React from "react";
import Image from "next/image";
import { useRouter, usePathname } from "next/navigation";
import {
  Plus,
  Home,
  Settings,
  Package,
  Folder,
  File,
  History,
  X,
  PanelLeftClose,
  PanelLeft,
  Search,
} from "lucide-react";
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
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
  SidebarGroupLabel,
  SidebarGroup,
  useSidebar,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { GithubStar } from "@/components/github-star";
import { Separator } from "@/components/ui/separator";
import { useMenuStore } from "@/store/menu-store";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import type { MenuConfig } from "@/types";
import { DraggableMenuItem } from "./draggable-menu-item";
import { DraggableMenuGroup } from "./draggable-menu-group";
import { ThemeSwitcher } from "./theme-switcher";
import { getAssetPath, navigateToMenu } from "@/lib/config";

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

  const [openGroups, setOpenGroups] = React.useState<string[]>([]);
  const [searchQuery, setSearchQuery] = React.useState("");

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

        {/* 菜单列表 */}
        <SidebarGroup className="group-data-[collapsible=icon]:hidden py-0">
          <div className="flex items-center justify-between px-2 mb-1">
            <SidebarGroupLabel className="px-0">我的菜单</SidebarGroupLabel>
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
                  onClick={() => handleCreateMenu()}
                  className="cursor-pointer"
                >
                  <File className="h-4 w-4 mr-2" />
                  <span>创建菜单</span>
                  <span className="ml-auto text-xs text-muted-foreground">
                    ⌘N
                  </span>
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={createGroup}
                  className="cursor-pointer"
                >
                  <Folder className="h-4 w-4 mr-2" />
                  <span>创建菜单组</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* 搜索框 */}
          <div className="px-2 mb-2">
            <div className="relative">
              <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground pointer-events-none" />
              <Input
                type="text"
                placeholder="搜索菜单..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="h-8 pl-7 pr-2 text-sm"
              />
            </div>
          </div>

          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleMenuDragEnd}
          >
            <SidebarMenu>
              {menus.length === 0 && menuGroups.length === 0 ? (
                <div className="text-center py-8 px-4">
                  <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-muted mb-3">
                    <File className="h-6 w-6 text-muted-foreground" />
                  </div>
                  <p className="text-sm font-medium text-muted-foreground mb-1">
                    暂无菜单
                  </p>
                  <p className="text-xs text-muted-foreground/70">
                    点击上方 + 号创建新菜单
                  </p>
                </div>
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

      <SidebarFooter>
        {/* 展开状态 */}
        <div className="group-data-[collapsible=icon]:hidden">
          <div className="flex items-center justify-between px-2 py-2 gap-2">
            <div className="flex-1 min-w-0 overflow-hidden">
              <GithubStar />
            </div>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 rounded-full shrink-0"
                  title="设置"
                >
                  <Settings className="h-4 w-4" />
                </Button>
              </PopoverTrigger>
              <PopoverContent align="center" side="top">
                <div className="space-y-3">
                  {/* 主题切换 */}
                  <div className="flex items-center justify-between gap-12">
                    <div className="text-xs font-medium text-muted-foreground whitespace-nowrap">
                      主题
                    </div>
                    <ThemeSwitcher />
                  </div>

                  <Separator />

                  {/* 更多设置 */}
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full h-8 text-xs"
                    onClick={() => {
                      router.push("/settings");
                    }}
                  >
                    更多设置
                  </Button>
                </div>
              </PopoverContent>
            </Popover>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 rounded-full shrink-0"
              onClick={toggleSidebar}
              title="收起侧边栏"
            >
              <PanelLeftClose className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* 收起状态 */}
        <div className="hidden group-data-[collapsible=icon]:flex flex-col items-center py-2 gap-2">
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 rounded-full"
                title="设置"
              >
                <Settings className="h-4 w-4" />
              </Button>
            </PopoverTrigger>
            <PopoverContent align="end" side="right">
              <div className="space-y-3">
                {/* 主题切换 */}
                <div className="space-y-2">
                  <div className="text-xs font-medium text-muted-foreground">
                    主题
                  </div>
                  <ThemeSwitcher />
                </div>

                <Separator />

                {/* 更多设置 */}
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full h-8 text-xs"
                  onClick={() => {
                    router.push("/settings");
                  }}
                >
                  更多设置
                </Button>
              </div>
            </PopoverContent>
          </Popover>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 rounded-full"
            onClick={toggleSidebar}
            title="展开侧边栏"
          >
            <PanelLeft className="h-4 w-4" />
          </Button>
        </div>
      </SidebarFooter>

      <SidebarRail />
    </Sidebar>
  );
}
