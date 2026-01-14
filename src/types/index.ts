// 菜单大小类型
export type MenuSize = 9 | 18 | 27 | 36 | 45 | 54;

// 菜单类型
export type MenuType = "CHEST" | "HOPPER" | "DISPENSER" | "DROPPER";

// 点击类型
export type ClickType = "LEFT" | "RIGHT" | "SHIFT_LEFT" | "SHIFT_RIGHT" | "ALL";

// 菜单项（物品）
export interface MenuItem {
  id: string;
  slot: number;
  material: string;
  displayName?: string;
  lore?: string[];
  amount?: number;
  customModelData?: number;
  actions?: MenuAction[];
}

// 菜单动作
export interface MenuAction {
  type: "COMMAND" | "OPEN_MENU" | "CLOSE" | "MESSAGE";
  clickType: ClickType;
  value: string;
}

// 菜单配置
export interface MenuConfig {
  id: string;
  name: string;
  title: string;
  size: MenuSize;
  type: MenuType;
  items: MenuItem[];
  createdAt: string;
  updatedAt: string;
  groupId?: string; // 所属菜单组ID（可选）
  order: number; // 排序顺序
}

// 菜单组
export interface MenuGroup {
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
  order: number; // 排序顺序
}
