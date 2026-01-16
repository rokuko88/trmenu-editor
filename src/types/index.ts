// 菜单大小类型
export type MenuSize = 9 | 18 | 27 | 36 | 45 | 54 | 63 | 72 | 81;

// 菜单类型
export type MenuType = "CHEST" | "HOPPER" | "DISPENSER" | "DROPPER";

// 点击类型
export type ClickType = "LEFT" | "RIGHT" | "SHIFT_LEFT" | "SHIFT_RIGHT" | "ALL";

// 动作类型
export type ActionType = "COMMAND" | "OPEN_MENU" | "CLOSE" | "MESSAGE";

// 条件类型
export interface ActionCondition {
  type: "require" | "deny";
  expression: string; // Kether 表达式
}

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
  id: string;
  type: ActionType;
  clickType: ClickType;
  value: string;
  priority?: number; // 优先级，数字越大越优先
  conditions?: ActionCondition[]; // 条件列表
}

// 菜单配置
export interface MenuConfig {
  id: string;
  name: string;
  title: string | string[]; // 支持单个标题或多个动态标题
  titleUpdate?: number; // 标题更新周期（ticks），仅在有多个标题时有效
  size: MenuSize;
  type: MenuType;
  items: MenuItem[];
  createdAt: string;
  updatedAt: string;
  groupId?: string; // 所属菜单组ID（可选）
  order: number; // 排序顺序
  variables?: Variable[]; // 菜单级别的变量
}

// 菜单组
export interface MenuGroup {
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
  order: number; // 排序顺序
}

// 变量定义
export interface Variable {
  id: string;
  key: string; // 变量键名，如 ${SERVER_NAME}
  value: string; // 变量值
  description?: string; // 变量描述
  createdAt: string;
  updatedAt: string;
}
