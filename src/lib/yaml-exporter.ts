import type { MenuConfig, MenuItem, MenuAction, ClickType } from "@/types";

/**
 * 将菜单配置导出为 TRMenu YAML 格式
 */
export function exportMenuToYAML(menu: MenuConfig): string {
  const lines: string[] = [];

  // 标题和基本信息
  lines.push(`# ${menu.name}`);
  lines.push(`# 创建时间: ${new Date(menu.createdAt).toLocaleString()}`);
  lines.push(`# 最后更新: ${new Date(menu.updatedAt).toLocaleString()}`);
  lines.push("");

  // Title - 支持单标题和多标题
  if (Array.isArray(menu.title)) {
    lines.push(`Title:`);
    menu.title.forEach((title) => {
      lines.push(`  - '${escapeYAML(title)}'`);
    });
    lines.push("");

    // Title-Update - 仅当有多个标题时有效
    if (menu.title.length > 1 && menu.titleUpdate) {
      lines.push(`Title-Update: ${menu.titleUpdate}`);
      lines.push("");
    }
  } else {
    lines.push(`Title: '${escapeYAML(menu.title)}'`);
    lines.push("");
  }

  // Type
  if (menu.type !== "CHEST") {
    lines.push(`Type: ${menu.type}`);
    lines.push("");
  }

  // Shape (根据 size 生成)
  lines.push(`Shape:`);
  const rows = menu.size / 9;
  for (let i = 0; i < rows; i++) {
    const row = Array.from({ length: 9 }, (_, j) => {
      const slot = i * 9 + j;
      const item = menu.items.find((item) => item.slot === slot);
      return item ? getItemSymbol(item, menu.items) : " ";
    }).join("");
    lines.push(`  - '${row}'`);
  }
  lines.push("");

  // Items
  lines.push(`Items:`);

  // 获取唯一的物品（按照符号分组）
  const uniqueItems = getUniqueItems(menu.items);

  uniqueItems.forEach((item) => {
    const symbol = getItemSymbol(item, menu.items);
    lines.push(`  '${symbol}':`);

    // Material
    lines.push(`    material: ${item.material}`);

    // Display name
    if (item.displayName) {
      lines.push(`    name: '${escapeYAML(item.displayName)}'`);
    }

    // Amount
    if (item.amount && item.amount > 1) {
      lines.push(`    amount: ${item.amount}`);
    }

    // Custom Model Data
    if (item.customModelData) {
      lines.push(`    model-data: ${item.customModelData}`);
    }

    // Lore
    if (item.lore && item.lore.length > 0) {
      lines.push(`    lore:`);
      item.lore.forEach((line) => {
        lines.push(`      - '${escapeYAML(line)}'`);
      });
    }

    // Actions
    if (item.actions && item.actions.length > 0) {
      const actionsByClick = groupActionsByClickType(item.actions);

      Object.entries(actionsByClick).forEach(([clickType, actions]) => {
        const clickKey = formatClickType(clickType as ClickType);
        lines.push(`    ${clickKey}:`);

        // 按优先级排序
        const sortedActions = [...actions].sort(
          (a, b) => (b.priority || 0) - (a.priority || 0)
        );

        sortedActions.forEach((action) => {
          // 条件
          if (action.conditions && action.conditions.length > 0) {
            action.conditions.forEach((condition) => {
              if (condition.type === "require") {
                lines.push(
                  `      - condition: '${escapeYAML(condition.expression)}'`
                );
              } else {
                lines.push(
                  `      - deny: '${escapeYAML(condition.expression)}'`
                );
              }
            });
          }

          // 动作
          const actionLine = formatAction(action);
          lines.push(`      - ${actionLine}`);
        });
      });
    }

    lines.push("");
  });

  return lines.join("\n");
}

/**
 * 批量导出多个菜单
 */
export function exportMultipleMenus(menus: MenuConfig[]): Map<string, string> {
  const exports = new Map<string, string>();

  menus.forEach((menu) => {
    const yaml = exportMenuToYAML(menu);
    const filename = sanitizeFilename(menu.name) + ".yml";
    exports.set(filename, yaml);
  });

  return exports;
}

/**
 * 下载 YAML 文件
 */
export function downloadYAML(filename: string, content: string): void {
  const blob = new Blob([content], { type: "text/yaml;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename.endsWith(".yml") ? filename : `${filename}.yml`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * 批量下载为 ZIP（需要 JSZip 库）
 */
export async function downloadMultipleAsZip(
  exports: Map<string, string>,
  zipName: string
): Promise<void> {
  try {
    // 动态导入 JSZip
    const JSZip = (await import("jszip")).default;
    const zip = new JSZip();

    exports.forEach((content, filename) => {
      zip.file(filename, content);
    });

    const blob = await zip.generateAsync({ type: "blob" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = zipName.endsWith(".zip") ? zipName : `${zipName}.zip`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  } catch (error) {
    console.error("Failed to create zip:", error);
    throw new Error("批量导出失败，请确保已安装 jszip 依赖");
  }
}

// ========== 辅助函数 ==========

/**
 * 转义 YAML 特殊字符
 */
function escapeYAML(str: string): string {
  return str.replace(/\\/g, "\\\\").replace(/'/g, "''").replace(/\n/g, "\\n");
}

/**
 * 获取物品的唯一符号
 */
function getItemSymbol(item: MenuItem, allItems: MenuItem[]): string {
  // 找到相同配置的物品并分配字母
  const uniqueConfigs = new Map<string, MenuItem[]>();

  allItems.forEach((i) => {
    const key = getItemConfigKey(i);
    if (!uniqueConfigs.has(key)) {
      uniqueConfigs.set(key, []);
    }
    uniqueConfigs.get(key)!.push(i);
  });

  const configs = Array.from(uniqueConfigs.values());
  const itemKey = getItemConfigKey(item);
  const configIndex = configs.findIndex((items) =>
    items.some((i) => getItemConfigKey(i) === itemKey)
  );

  // 使用字母 A-Z，如果超过 26 个则使用 AA, AB, ...
  if (configIndex < 26) {
    return String.fromCharCode(65 + configIndex); // A-Z
  } else {
    const first = Math.floor(configIndex / 26) - 1;
    const second = configIndex % 26;
    return String.fromCharCode(65 + first) + String.fromCharCode(65 + second);
  }
}

/**
 * 获取物品配置的唯一键（用于判断物品是否相同）
 */
function getItemConfigKey(item: MenuItem): string {
  return JSON.stringify({
    material: item.material,
    displayName: item.displayName,
    lore: item.lore,
    amount: item.amount,
    customModelData: item.customModelData,
    actions: item.actions,
  });
}

/**
 * 获取唯一的物品列表（去重）
 */
function getUniqueItems(items: MenuItem[]): MenuItem[] {
  const unique = new Map<string, MenuItem>();

  items.forEach((item) => {
    const key = getItemConfigKey(item);
    if (!unique.has(key)) {
      unique.set(key, item);
    }
  });

  return Array.from(unique.values());
}

/**
 * 按点击类型分组动作
 */
function groupActionsByClickType(
  actions: MenuAction[]
): Record<ClickType, MenuAction[]> {
  const grouped: Partial<Record<ClickType, MenuAction[]>> = {};

  actions.forEach((action) => {
    if (!grouped[action.clickType]) {
      grouped[action.clickType] = [];
    }
    grouped[action.clickType]!.push(action);
  });

  return grouped as Record<ClickType, MenuAction[]>;
}

/**
 * 格式化点击类型为 TRMenu 格式
 */
function formatClickType(clickType: ClickType): string {
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
 * 格式化动作为 TRMenu 格式
 */
function formatAction(action: MenuAction): string {
  switch (action.type) {
    case "COMMAND":
      return `'command: ${escapeYAML(action.value)}'`;
    case "OPEN_MENU":
      return `'open: ${escapeYAML(action.value)}'`;
    case "CLOSE":
      return "'close'";
    case "MESSAGE":
      return `'tell: ${escapeYAML(action.value)}'`;
    default:
      return `'${escapeYAML(action.value)}'`;
  }
}

/**
 * 清理文件名
 */
function sanitizeFilename(name: string): string {
  return name
    .replace(/[<>:"/\\|?*]/g, "_")
    .replace(/\s+/g, "_")
    .toLowerCase();
}
