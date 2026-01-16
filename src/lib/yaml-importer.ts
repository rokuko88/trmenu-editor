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
    // 支持 Layout 和 Shape（向后兼容）
    const layout = data.Layout || data.layout || data.Shape || data.shape || [];

    // 判断是单页还是多页布局
    let pages = 1;
    let layoutPages: string[][] = [];

    if (layout.length > 0 && Array.isArray(layout[0])) {
      // 多页布局格式
      pages = layout.length;
      layoutPages = layout as string[][];
    } else {
      // 单页布局格式
      pages = 1;
      layoutPages = [layout as string[]];
    }

    // 计算菜单大小（使用第一页的行数）
    const rows = layoutPages[0]?.length || 0;
    const size = (rows * 9) as MenuSize;

    // 解析物品（支持多页）
    const items = parseItemsMultiPage(
      data.Items || data.items || {},
      layoutPages
    );

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
      pages,
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

    if (!data.Layout && !data.layout && !data.Shape && !data.shape) {
      warnings.push("缺少 Layout 字段");
    }

    if (!data.Items && !data.items) {
      warnings.push("缺少 Items 字段");
    }

    // 检查 Layout/Shape 格式（支持两种格式）
    const layout = data.Layout || data.layout || data.Shape || data.shape;
    if (layout && Array.isArray(layout)) {
      if (layout.length === 0) {
        warnings.push("Layout 不能为空");
      }
      layout.forEach((row: string, index: number) => {
        if (typeof row !== "string") {
          warnings.push(`Layout 第 ${index + 1} 行格式错误：应为字符串`);
        } else if (row.length !== 9) {
          warnings.push(`Layout 第 ${index + 1} 行长度错误：应为 9 个字符`);
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
 * 解析物品（多页支持）
 */
function parseItemsMultiPage(
  itemsData: Record<string, unknown>,
  layoutPages: string[][]
): MenuItem[] {
  const items: MenuItem[] = [];
  const symbolMap = new Map<string, Record<string, unknown>>();

  // 构建符号到物品配置的映射
  Object.entries(itemsData).forEach(([symbol, config]) => {
    symbolMap.set(symbol, config as Record<string, unknown>);
  });

  // 遍历每一页
  layoutPages.forEach((page, pageIndex) => {
    page.forEach((row, rowIndex) => {
      // 处理字符串中的反引号包裹的多字符符号
      let colIndex = 0;
      let i = 0;
      while (i < row.length) {
        if (row[i] === "`") {
          // 找到反引号包裹的符号
          const endIndex = row.indexOf("`", i + 1);
          if (endIndex !== -1) {
            const symbol = row.substring(i + 1, endIndex);
            const config = symbolMap.get(symbol);
            if (config) {
              const slot = rowIndex * 9 + colIndex;
              const item = parseItem(config, slot, pageIndex);
              items.push(item);
            }
            i = endIndex + 1;
            colIndex++;
            continue;
          }
        }

        // 单字符符号
        const symbol = row[i];
        if (symbol !== " ") {
          const config = symbolMap.get(symbol);
          if (config) {
            const slot = rowIndex * 9 + colIndex;
            const item = parseItem(config, slot, pageIndex);
            items.push(item);
          }
        }
        i++;
        colIndex++;
      }
    });
  });

  return items;
}

/**
 * 解析物品（单页，向后兼容）
 */
function parseItems(
  itemsData: Record<string, unknown>,
  shape: string[]
): MenuItem[] {
  return parseItemsMultiPage(itemsData, [shape]);
}

/**
 * 解析单个物品
 */
function parseItem(
  config: Record<string, unknown>,
  slot: number,
  page: number = 0
): MenuItem {
  const item: MenuItem = {
    id: `item-${Date.now()}-${page}-${slot}-${Math.random()}`,
    slot,
    page,
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
