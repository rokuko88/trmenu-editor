"use client";

import * as React from "react";
import { useRouter, usePathname } from "next/navigation";
import {
  Plus,
  Home,
  Settings,
  Package,
  Folder,
  File,
  ChevronRight,
  History,
} from "lucide-react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  useDroppable,
} from "@dnd-kit/core";
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

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
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { GithubStar } from "@/components/github-star";
import type { MenuConfig, MenuGroup } from "@/types";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { useMenuContext } from "@/contexts/menu-context";

// 可拖拽的菜单项组件
function DraggableMenuItem({
  menu,
  isActive,
  onDelete,
  onRename,
}: {
  menu: MenuConfig;
  isActive: boolean;
  onDelete: (menuId: string) => void;
  onRename: (menuId: string) => void;
}) {
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

// 可拖拽的菜单组组件
function DraggableMenuGroup({
  group,
  menus,
  isOpen,
  selectedMenuId,
  onToggle,
  onCreateMenu,
  onDeleteMenu,
  onRenameMenu,
  onDeleteGroup,
  onRenameGroup,
}: {
  group: MenuGroup;
  menus: MenuConfig[];
  isOpen: boolean;
  selectedMenuId?: string | null;
  onToggle: () => void;
  onCreateMenu: (groupId: string) => void;
  onDeleteMenu: (menuId: string) => void;
  onRenameMenu: (menuId: string) => void;
  onDeleteGroup: (groupId: string) => void;
  onRenameGroup: (groupId: string) => void;
}) {
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
                  onCreateMenu(group.id);
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
                  <DropdownMenuItem onClick={() => onRenameGroup(group.id)}>
                    重命名
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => onDeleteGroup(group.id)}
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
                  <DraggableMenuItem
                    key={menu.id}
                    menu={menu}
                    isActive={selectedMenuId === menu.id}
                    onDelete={onDeleteMenu}
                    onRename={onRenameMenu}
                  />
                ))}
              </SortableContext>
            </SidebarMenu>
          </CollapsibleContent>
        </SidebarMenuItem>
      </Collapsible>
    </div>
  );
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const router = useRouter();
  const pathname = usePathname();
  const {
    menus,
    menuGroups,
    selectedMenuId,
    setSelectedMenuId,
    createMenu,
    createGroup,
    deleteMenu,
    renameMenu,
    deleteGroup,
    renameGroup,
    handleMenuDragEnd,
  } = useMenuContext();

  const [openGroups, setOpenGroups] = React.useState<string[]>([]);

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
    router.push(`/menu/${menuId}`);
  };

  // 获取未分组的菜单（按 order 排序）
  const ungroupedMenus = menus
    .filter((menu) => !menu.groupId)
    .sort((a, b) => a.order - b.order);

  // 获取分组的菜单（按 order 排序）
  const getGroupMenus = (groupId: string) =>
    menus
      .filter((menu) => menu.groupId === groupId)
      .sort((a, b) => a.order - b.order);

  // 获取排序后的菜单组
  const sortedGroups = [...menuGroups].sort((a, b) => a.order - b.order);
  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
            >
              <div className="bg-linear-to-br from-blue-500 to-blue-700 text-white flex aspect-square size-8 items-center justify-center rounded-lg">
                <span className="text-lg font-bold">T</span>
              </div>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-semibold">TrMenu Editor</span>
                <span className="truncate text-xs">v1.0.0</span>
              </div>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
        {/* 工作区 */}
        <SidebarGroup className="py-0">
          <SidebarGroupLabel>工作区</SidebarGroupLabel>
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
              <SidebarMenuButton tooltip="最近使用">
                <History className="h-4 w-4 shrink-0" />
                <span className="truncate">最近使用</span>
              </SidebarMenuButton>
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
              <DropdownMenuContent align="end" className="w-36">
                <DropdownMenuItem onClick={() => handleCreateMenu()}>
                  <File className="h-4 w-4 mr-2" />
                  创建菜单
                </DropdownMenuItem>
                <DropdownMenuItem onClick={createGroup}>
                  <Folder className="h-4 w-4 mr-2" />
                  创建菜单组
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleMenuDragEnd}
          >
            <SidebarMenu>
              {menus.length === 0 && menuGroups.length === 0 ? (
                <div className="text-center text-xs text-muted-foreground py-6 px-4">
                  <File className="h-6 w-6 mx-auto mb-2 opacity-50" />
                  <p>暂无菜单</p>
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
                          onRenameMenu={renameMenu}
                          onDeleteGroup={deleteGroup}
                          onRenameGroup={renameGroup}
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
                        onRename={renameMenu}
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
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 rounded-full shrink-0"
              onClick={() => router.push("/settings")}
              title="设置"
            >
              <Settings className="h-4 w-4" />
            </Button>
          </div>
        </div>
        {/* 收起状态 */}
        <div className="hidden group-data-[collapsible=icon]:flex justify-center py-2">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 rounded-full"
            onClick={() => router.push("/settings")}
            title="设置"
          >
            <Settings className="h-4 w-4" />
          </Button>
        </div>
      </SidebarFooter>

      <SidebarRail />
    </Sidebar>
  );
}
