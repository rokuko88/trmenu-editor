"use client";

import {
  createContext,
  useContext,
  useState,
  useCallback,
  ReactNode,
} from "react";
import type { MenuConfig, MenuGroup } from "@/types";

interface MenuContextType {
  menus: MenuConfig[];
  menuGroups: MenuGroup[];
  selectedMenuId: string | null;
  setSelectedMenuId: (id: string | null) => void;
  createMenu: (groupId?: string) => string;
  createGroup: () => void;
  deleteMenu: (menuId: string) => void;
  renameMenu: (menuId: string) => void;
  deleteGroup: (groupId: string) => void;
  renameGroup: (groupId: string) => void;
  handleMenuDragEnd: (result: {
    active: { id: string | number };
    over: { id: string | number } | null;
  }) => void;
}

const MenuContext = createContext<MenuContextType | undefined>(undefined);

export function MenuProvider({ children }: { children: ReactNode }) {
  const [menus, setMenus] = useState<MenuConfig[]>([]);
  const [menuGroups, setMenuGroups] = useState<MenuGroup[]>([]);
  const [selectedMenuId, setSelectedMenuId] = useState<string | null>(null);

  // 创建空白菜单
  const createMenu = useCallback(
    (groupId?: string) => {
      const newMenu: MenuConfig = {
        id: `menu-${Date.now()}`,
        name: `菜单 ${menus.length + 1}`,
        title: "箱子菜单",
        size: 54,
        type: "CHEST",
        items: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        groupId,
        order: menus.length,
      };

      setMenus((prev) => [...prev, newMenu]);
      return newMenu.id;
    },
    [menus.length]
  );

  // 创建菜单组
  const createGroup = useCallback(() => {
    const newGroup: MenuGroup = {
      id: `group-${Date.now()}`,
      name: `菜单组 ${menuGroups.length + 1}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      order: menuGroups.length,
    };

    setMenuGroups((prev) => [...prev, newGroup]);
  }, [menuGroups.length]);

  // 删除菜单
  const deleteMenu = useCallback((menuId: string) => {
    if (confirm("确定要删除这个菜单吗？")) {
      setMenus((prev) => prev.filter((m) => m.id !== menuId));
      setSelectedMenuId((prev) => (prev === menuId ? null : prev));
    }
  }, []);

  // 重命名菜单
  const renameMenu = useCallback(
    (menuId: string) => {
      const menu = menus.find((m) => m.id === menuId);
      if (!menu) return;

      const newName = prompt("请输入新的菜单名称：", menu.name);
      if (newName && newName.trim()) {
        setMenus((prev) =>
          prev.map((m) =>
            m.id === menuId
              ? {
                  ...m,
                  name: newName.trim(),
                  updatedAt: new Date().toISOString(),
                }
              : m
          )
        );
      }
    },
    [menus]
  );

  // 删除菜单组
  const deleteGroup = useCallback(
    (groupId: string) => {
      const groupMenus = menus.filter((m) => m.groupId === groupId);

      if (groupMenus.length > 0) {
        if (
          !confirm(
            `此菜单组包含 ${groupMenus.length} 个菜单，删除后菜单将移至未分组。确定要删除吗？`
          )
        ) {
          return;
        }
        setMenus((prev) =>
          prev.map((m) =>
            m.groupId === groupId ? { ...m, groupId: undefined } : m
          )
        );
      } else {
        if (!confirm("确定要删除这个菜单组吗？")) {
          return;
        }
      }

      setMenuGroups((prev) => prev.filter((g) => g.id !== groupId));
    },
    [menus]
  );

  // 重命名菜单组
  const renameGroup = useCallback(
    (groupId: string) => {
      const group = menuGroups.find((g) => g.id === groupId);
      if (!group) return;

      const newName = prompt("请输入新的菜单组名称：", group.name);
      if (newName && newName.trim()) {
        setMenuGroups((prev) =>
          prev.map((g) =>
            g.id === groupId
              ? {
                  ...g,
                  name: newName.trim(),
                  updatedAt: new Date().toISOString(),
                }
              : g
          )
        );
      }
    },
    [menuGroups]
  );

  // 处理菜单拖拽
  const handleMenuDragEnd = useCallback(
    (result: {
      active: { id: string | number };
      over: { id: string | number } | null;
    }) => {
      const { active, over } = result;

      if (!over || active.id === over.id) return;

      const activeId = active.id as string;
      const overId = over.id as string;

      // 判断是否拖拽到菜单组上
      if (overId.startsWith("group-")) {
        setMenus((prev) =>
          prev.map((menu) =>
            menu.id === activeId ? { ...menu, groupId: overId } : menu
          )
        );
        return;
      }

      // 判断拖拽的是菜单还是菜单组
      if (activeId.startsWith("menu-") && overId.startsWith("menu-")) {
        setMenus((prev) => {
          const oldIndex = prev.findIndex((m) => m.id === activeId);
          const newIndex = prev.findIndex((m) => m.id === overId);

          const newMenus = [...prev];
          const [movedMenu] = newMenus.splice(oldIndex, 1);
          newMenus.splice(newIndex, 0, movedMenu);

          return newMenus.map((menu, index) => ({
            ...menu,
            order: index,
          }));
        });
      } else if (activeId.startsWith("group-") && overId.startsWith("group-")) {
        setMenuGroups((prev) => {
          const oldIndex = prev.findIndex((g) => g.id === activeId);
          const newIndex = prev.findIndex((g) => g.id === overId);

          const newGroups = [...prev];
          const [movedGroup] = newGroups.splice(oldIndex, 1);
          newGroups.splice(newIndex, 0, movedGroup);

          return newGroups.map((group, index) => ({
            ...group,
            order: index,
          }));
        });
      }
    },
    []
  );

  return (
    <MenuContext.Provider
      value={{
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
      }}
    >
      {children}
    </MenuContext.Provider>
  );
}

export function useMenuContext() {
  const context = useContext(MenuContext);
  if (context === undefined) {
    throw new Error("useMenuContext must be used within a MenuProvider");
  }
  return context;
}
