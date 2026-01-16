import type {
  MenuConfig,
  MenuItem,
  MenuAction,
  MenuSize,
  MenuType,
  ClickType,
  ActionType,
} from "@/types";
import YAML from "yaml";

/**
 * 从 TRMenu YAML 导入菜单配置
 */
export function importMenuFromYAML(
  yamlContent: string,
  menuName?: string
): MenuConfig {
  try {
    const data = YAML.parse(yamlContent);

    // 解析基本信息
    const titleData = data.Title || data.title || "未命名菜单";
    // 支持单标题和多标题
    let title: string | string[];
    let titleUpdate: number | undefined;

    if (Array.isArray(titleData)) {
      // 多标题模式
      title = titleData;
      titleUpdate =
        data["Title-Update"] || data["title-update"] || data.TitleUpdate;
    } else {
      // 单标题模式
      title = titleData;
      titleUpdate = undefined;
    }

    const type = (data.Type || data.type || "CHEST").toUpperCase() as MenuType;
    const shape = data.Shape || data.shape || [];

    // 计算菜单大小
    const rows = shape.length;
    const size = (rows * 9) as MenuSize;

    // 解析物品
    const items = parseItems(data.Items || data.items || {}, shape);

    const menu: MenuConfig = {
      id: `menu-${Date.now()}`,
      name:
        menuName ||
        extractNameFromTitle(Array.isArray(title) ? title[0] : title),
      title,
      titleUpdate,
      size,
      type,
      items,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      order: 0,
    };

    return menu;
  } catch (error) {
    console.error("YAML 解析错误:", error);
    throw new Error(
      `无法解析 YAML 文件: ${
        error instanceof Error ? error.message : "未知错误"
      }`
    );
  }
}

/**
 * 验证 YAML 语法
 */
export function validateYAML(yamlContent: string): {
  valid: boolean;
  error?: string;
  warnings?: string[];
} {
  const warnings: string[] = [];

  try {
    const data = YAML.parse(yamlContent);

    // 检查必需字段
    if (!data.Title && !data.title) {
      warnings.push("缺少 Title 字段");
    }

    if (!data.Shape && !data.shape) {
      warnings.push("缺少 Shape 字段");
    }

    if (!data.Items && !data.items) {
      warnings.push("缺少 Items 字段");
    }

    // 检查 Shape 格式
    const shape = data.Shape || data.shape;
    if (shape && Array.isArray(shape)) {
      if (shape.length === 0) {
        warnings.push("Shape 不能为空");
      }
      shape.forEach((row: string, index: number) => {
        if (typeof row !== "string") {
          warnings.push(`Shape 第 ${index + 1} 行格式错误：应为字符串`);
        } else if (row.length !== 9) {
          warnings.push(`Shape 第 ${index + 1} 行长度错误：应为 9 个字符`);
        }
      });
    }

    return {
      valid: true,
      warnings: warnings.length > 0 ? warnings : undefined,
    };
  } catch (error) {
    return {
      valid: false,
      error: error instanceof Error ? error.message : "YAML 语法错误",
    };
  }
}

/**
 * 从文件读取并导入
 */
export function importMenuFromFile(file: File): Promise<MenuConfig> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        const menuName = file.name.replace(/\.ya?ml$/i, "");
        const menu = importMenuFromYAML(content, menuName);
        resolve(menu);
      } catch (error) {
        reject(error);
      }
    };

    reader.onerror = () => {
      reject(new Error("文件读取失败"));
    };

    reader.readAsText(file, "utf-8");
  });
}

// ========== 辅助函数 ==========

/**
 * 解析物品
 */
function parseItems(
  itemsData: Record<string, unknown>,
  shape: string[]
): MenuItem[] {
  const items: MenuItem[] = [];
  const symbolMap = new Map<string, Record<string, unknown>>();

  // 构建符号到物品配置的映射
  Object.entries(itemsData).forEach(([symbol, config]) => {
    symbolMap.set(symbol, config as Record<string, unknown>);
  });

  // 遍历 Shape，找出每个物品的位置
  shape.forEach((row, rowIndex) => {
    for (let colIndex = 0; colIndex < row.length; colIndex++) {
      const symbol = row[colIndex];
      if (symbol === " ") continue;

      const config = symbolMap.get(symbol);
      if (!config) continue;

      const slot = rowIndex * 9 + colIndex;
      const item = parseItem(config, slot);
      items.push(item);
    }
  });

  return items;
}

/**
 * 解析单个物品
 */
function parseItem(config: Record<string, unknown>, slot: number): MenuItem {
  const item: MenuItem = {
    id: `item-${Date.now()}-${slot}`,
    slot,
    material: String(config.material || config.Material || "STONE"),
  };

  // Display name
  if (config.name || config.Name) {
    item.displayName = String(config.name || config.Name);
  }

  // Lore
  if (config.lore || config.Lore) {
    const lore = config.lore || config.Lore;
    if (Array.isArray(lore)) {
      item.lore = lore.map((line) => String(line));
    }
  }

  // Amount
  if (config.amount || config.Amount) {
    item.amount = Number(config.amount || config.Amount);
  }

  // Custom Model Data
  if (config["model-data"] || config["Model-Data"] || config.modelData) {
    item.customModelData = Number(
      config["model-data"] || config["Model-Data"] || config.modelData
    );
  }

  // Actions
  item.actions = parseActions(config);

  return item;
}

/**
 * 解析动作
 */
function parseActions(config: Record<string, unknown>): MenuAction[] {
  const actions: MenuAction[] = [];
  const clickTypes: ClickType[] = [
    "ALL",
    "LEFT",
    "RIGHT",
    "SHIFT_LEFT",
    "SHIFT_RIGHT",
  ];

  clickTypes.forEach((clickType) => {
    const key = formatClickTypeKey(clickType);
    const clickActions = config[key] || config[key.toLowerCase()];

    if (clickActions && Array.isArray(clickActions)) {
      clickActions.forEach((actionStr: string, index: number) => {
        const action = parseAction(actionStr, clickType, index);
        if (action) {
          actions.push(action);
        }
      });
    }
  });

  return actions;
}

/**
 * 解析单个动作
 */
function parseAction(
  actionStr: string,
  clickType: ClickType,
  index: number
): MenuAction | null {
  // 移除引号
  const cleaned = actionStr.replace(/^['"]|['"]$/g, "").trim();

  // 解析条件
  if (cleaned.startsWith("condition:") || cleaned.startsWith("deny:")) {
    // 条件会在下一个动作中处理
    return null;
  }

  // 解析动作类型和值
  let type: ActionType;
  let value: string;

  if (cleaned.startsWith("command:")) {
    type = "COMMAND";
    value = cleaned.substring(8).trim();
  } else if (cleaned.startsWith("open:")) {
    type = "OPEN_MENU";
    value = cleaned.substring(5).trim();
  } else if (cleaned === "close") {
    type = "CLOSE";
    value = "";
  } else if (cleaned.startsWith("tell:")) {
    type = "MESSAGE";
    value = cleaned.substring(5).trim();
  } else {
    // 默认当作命令
    type = "COMMAND";
    value = cleaned;
  }

  return {
    id: `action-${Date.now()}-${index}`,
    type,
    clickType,
    value,
    priority: 0,
    conditions: [],
  };
}

/**
 * 格式化点击类型键
 */
function formatClickTypeKey(clickType: ClickType): string {
  switch (clickType) {
    case "ALL":
      return "all";
    case "LEFT":
      return "left";
    case "RIGHT":
      return "right";
    case "SHIFT_LEFT":
      return "shift-left";
    case "SHIFT_RIGHT":
      return "shift-right";
    default:
      return "all";
  }
}

/**
 * 从标题提取菜单名称
 */
function extractNameFromTitle(title: string): string {
  // 移除颜色代码和特殊字符
  return title
    .replace(/§[0-9a-fk-or]/gi, "")
    .replace(/[^\w\s\u4e00-\u9fa5]/g, "")
    .trim()
    .substring(0, 50);
}
