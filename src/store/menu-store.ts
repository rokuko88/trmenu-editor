import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { MenuConfig, MenuGroup, MenuItem } from "@/types";

interface RecentItem {
  menuId: string;
  menuName: string;
  openedAt: string;
}

interface MenuStore {
  // 状态
  menus: MenuConfig[];
  menuGroups: MenuGroup[];
  selectedMenuId: string | null;
  recentItems: RecentItem[];

  // 菜单操作
  createMenu: (groupId?: string) => string;
  deleteMenu: (menuId: string) => void;
  renameMenu: (menuId: string, newName: string) => void;
  updateMenu: (menuId: string, updates: Partial<MenuConfig>) => void;

  // 菜单项操作
  addMenuItem: (menuId: string, item: MenuItem) => void;
  updateMenuItem: (
    menuId: string,
    itemId: string,
    updates: Partial<MenuItem>
  ) => void;
  deleteMenuItem: (menuId: string, itemId: string) => void;
  moveMenuItem: (menuId: string, itemId: string, newSlot: number) => void;

  // 菜单组操作
  createGroup: () => void;
  deleteGroup: (groupId: string) => void;
  renameGroup: (groupId: string, newName: string) => void;

  // 选择和最近打开
  setSelectedMenuId: (id: string | null) => void;
  addToRecent: (menuId: string) => void;
  clearRecent: () => void;

  // 拖拽排序
  handleMenuDragEnd: (result: {
    active: { id: string | number };
    over: { id: string | number } | null;
  }) => void;

  // 批量操作
  importMenus: (menus: MenuConfig[]) => void;
  clearAllMenus: () => void;
}

export const useMenuStore = create<MenuStore>()(
  persist(
    (set, get) => ({
      // 初始状态
      menus: [],
      menuGroups: [],
      selectedMenuId: null,
      recentItems: [],

      // 创建空白菜单
      createMenu: (groupId?: string) => {
        const state = get();
        const newMenu: MenuConfig = {
          id: `menu-${Date.now()}`,
          name: `菜单 ${state.menus.length + 1}`,
          title: "箱子菜单",
          size: 27,
          type: "CHEST",
          items: [],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          groupId,
          order: state.menus.length,
        };

        set({ menus: [...state.menus, newMenu] });
        return newMenu.id;
      },

      // 删除菜单
      deleteMenu: (menuId: string, skipConfirm = false) => {
        const state = get();
        set({
          menus: state.menus.filter((m) => m.id !== menuId),
          selectedMenuId:
            state.selectedMenuId === menuId ? null : state.selectedMenuId,
          recentItems: state.recentItems.filter(
            (item) => item.menuId !== menuId
          ),
        });
      },

      // 重命名菜单
      renameMenu: (menuId: string, newName: string) => {
        const state = get();
        const menu = state.menus.find((m) => m.id === menuId);
        if (!menu) return;

        if (!newName || !newName.trim()) return;

        set({
          menus: state.menus.map((m) =>
            m.id === menuId
              ? {
                  ...m,
                  name: newName.trim(),
                  updatedAt: new Date().toISOString(),
                }
              : m
          ),
          recentItems: state.recentItems.map((item) =>
            item.menuId === menuId
              ? { ...item, menuName: newName.trim() }
              : item
          ),
        });
      },

      // 更新菜单
      updateMenu: (menuId: string, updates: Partial<MenuConfig>) => {
        const state = get();
        set({
          menus: state.menus.map((m) =>
            m.id === menuId
              ? {
                  ...m,
                  ...updates,
                  updatedAt: new Date().toISOString(),
                }
              : m
          ),
        });
      },

      // 创建菜单组
      createGroup: () => {
        const state = get();
        const newGroup: MenuGroup = {
          id: `group-${Date.now()}`,
          name: `菜单组 ${state.menuGroups.length + 1}`,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          order: state.menuGroups.length,
        };

        set({ menuGroups: [...state.menuGroups, newGroup] });
      },

      // 删除菜单组
      deleteGroup: (groupId: string, skipConfirm = false) => {
        const state = get();
        const groupMenus = state.menus.filter((m) => m.groupId === groupId);

        if (groupMenus.length > 0) {
          // 将组内菜单移至未分组
          set({
            menus: state.menus.map((m) =>
              m.groupId === groupId ? { ...m, groupId: undefined } : m
            ),
            menuGroups: state.menuGroups.filter((g) => g.id !== groupId),
          });
        } else {
          set({
            menuGroups: state.menuGroups.filter((g) => g.id !== groupId),
          });
        }
      },

      // 重命名菜单组
      renameGroup: (groupId: string, newName: string) => {
        const state = get();
        const group = state.menuGroups.find((g) => g.id === groupId);
        if (!group) return;

        if (!newName || !newName.trim()) return;

        set({
          menuGroups: state.menuGroups.map((g) =>
            g.id === groupId
              ? {
                  ...g,
                  name: newName.trim(),
                  updatedAt: new Date().toISOString(),
                }
              : g
          ),
        });
      },

      // 设置选中的菜单
      setSelectedMenuId: (id: string | null) => {
        set({ selectedMenuId: id });
      },

      // 添加到最近打开
      addToRecent: (menuId: string) => {
        const state = get();
        const menu = state.menus.find((m) => m.id === menuId);
        if (!menu) return;

        // 移除已存在的相同记录
        const filteredRecent = state.recentItems.filter(
          (item) => item.menuId !== menuId
        );

        // 添加到开头
        const newRecentItem: RecentItem = {
          menuId: menu.id,
          menuName: menu.name,
          openedAt: new Date().toISOString(),
        };

        // 只保留最近 10 条
        const newRecent = [newRecentItem, ...filteredRecent].slice(0, 10);

        set({ recentItems: newRecent });
      },

      // 清空最近打开
      clearRecent: () => {
        set({ recentItems: [] });
      },

      // 处理菜单拖拽
      handleMenuDragEnd: (result) => {
        const { active, over } = result;
        if (!over || active.id === over.id) return;

        const activeId = active.id as string;
        const overId = over.id as string;
        const state = get();

        // 判断是否拖拽到菜单组上
        if (overId.startsWith("group-")) {
          set({
            menus: state.menus.map((menu) =>
              menu.id === activeId ? { ...menu, groupId: overId } : menu
            ),
          });
          return;
        }

        // 判断拖拽的是菜单还是菜单组
        if (activeId.startsWith("menu-") && overId.startsWith("menu-")) {
          // 菜单之间的重新排序
          const oldIndex = state.menus.findIndex((m) => m.id === activeId);
          const newIndex = state.menus.findIndex((m) => m.id === overId);

          const newMenus = [...state.menus];
          const [movedMenu] = newMenus.splice(oldIndex, 1);
          newMenus.splice(newIndex, 0, movedMenu);

          // 更新 order
          set({
            menus: newMenus.map((menu, index) => ({
              ...menu,
              order: index,
            })),
          });
        } else if (
          activeId.startsWith("group-") &&
          overId.startsWith("group-")
        ) {
          // 菜单组之间的重新排序
          const oldIndex = state.menuGroups.findIndex((g) => g.id === activeId);
          const newIndex = state.menuGroups.findIndex((g) => g.id === overId);

          const newGroups = [...state.menuGroups];
          const [movedGroup] = newGroups.splice(oldIndex, 1);
          newGroups.splice(newIndex, 0, movedGroup);

          // 更新 order
          set({
            menuGroups: newGroups.map((group, index) => ({
              ...group,
              order: index,
            })),
          });
        }
      },

      // 导入菜单（批量添加）
      importMenus: (menus: MenuConfig[]) => {
        const state = get();
        set({ menus: [...state.menus, ...menus] });
      },

      // 清空所有菜单
      clearAllMenus: (skipConfirm = false) => {
        set({
          menus: [],
          menuGroups: [],
          selectedMenuId: null,
          recentItems: [],
        });
      },

      // 添加菜单项
      addMenuItem: (menuId: string, item: MenuItem) => {
        const state = get();
        set({
          menus: state.menus.map((menu) =>
            menu.id === menuId
              ? {
                  ...menu,
                  items: [...menu.items, item],
                  updatedAt: new Date().toISOString(),
                }
              : menu
          ),
        });
      },

      // 更新菜单项
      updateMenuItem: (
        menuId: string,
        itemId: string,
        updates: Partial<MenuItem>
      ) => {
        const state = get();
        set({
          menus: state.menus.map((menu) =>
            menu.id === menuId
              ? {
                  ...menu,
                  items: menu.items.map((item) =>
                    item.id === itemId ? { ...item, ...updates } : item
                  ),
                  updatedAt: new Date().toISOString(),
                }
              : menu
          ),
        });
      },

      // 删除菜单项
      deleteMenuItem: (menuId: string, itemId: string) => {
        const state = get();
        set({
          menus: state.menus.map((menu) =>
            menu.id === menuId
              ? {
                  ...menu,
                  items: menu.items.filter((item) => item.id !== itemId),
                  updatedAt: new Date().toISOString(),
                }
              : menu
          ),
        });
      },

      // 移动菜单项到新位置
      moveMenuItem: (menuId: string, itemId: string, newSlot: number) => {
        const state = get();
        set({
          menus: state.menus.map((menu) =>
            menu.id === menuId
              ? {
                  ...menu,
                  items: menu.items.map((item) =>
                    item.id === itemId ? { ...item, slot: newSlot } : item
                  ),
                  updatedAt: new Date().toISOString(),
                }
              : menu
          ),
        });
      },
    }),
    {
      name: "trmenu-storage", // localStorage key
      storage: createJSONStorage(() => localStorage),
      // 可以选择性地持久化某些字段
      partialize: (state) => ({
        menus: state.menus,
        menuGroups: state.menuGroups,
        recentItems: state.recentItems,
        // selectedMenuId 不持久化，每次启动都是 null
      }),
    }
  )
);
