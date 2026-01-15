"use client";

import { useParams, useRouter } from "next/navigation";
import { SidebarInset } from "@/components/ui/sidebar";
import { useMenuStore } from "@/store/menu-store";
import { useEffect, useState } from "react";
import type { MenuItem, MenuConfig } from "@/types";
import { EditorToolbar } from "@/components/menu-editor/editor-toolbar";
import { MenuCanvas } from "@/components/menu-editor/menu-canvas";
import { PropertiesPanel } from "@/components/menu-editor/properties-panel";
import { PluginPanel } from "@/components/menu-editor/plugins/plugin-panel";
import { AVAILABLE_PLUGINS } from "@/components/menu-editor/plugins";
import { exportMenuToYAML, downloadYAML } from "@/lib/yaml-exporter";
import { importMenuFromFile, validateYAML } from "@/lib/yaml-importer";
import { navigateToMenu } from "@/lib/config";

export default function MenuEditorClient() {
  const params = useParams();
  const router = useRouter();
  const menus = useMenuStore((state) => state.menus);
  const setSelectedMenuId = useMenuStore((state) => state.setSelectedMenuId);
  const addToRecent = useMenuStore((state) => state.addToRecent);
  const updateMenu = useMenuStore((state) => state.updateMenu);
  const addMenuItem = useMenuStore((state) => state.addMenuItem);
  const updateMenuItem = useMenuStore((state) => state.updateMenuItem);
  const deleteMenuItem = useMenuStore((state) => state.deleteMenuItem);
  const moveMenuItem = useMenuStore((state) => state.moveMenuItem);

  // 获取菜单 ID：优先使用 sessionStorage 中的目标 ID（用于 GitHub Pages 路由恢复）
  const [menuId, setMenuId] = useState<string>("");

  useEffect(() => {
    const targetMenuId =
      typeof window !== "undefined"
        ? sessionStorage.getItem("targetMenuId")
        : null;

    if (targetMenuId) {
      // 使用存储的目标 ID 并清除存储
      sessionStorage.removeItem("targetMenuId");
      setMenuId(targetMenuId);
    } else {
      // 使用 URL 中的 ID
      setMenuId(params.id as string);
    }
  }, [params.id]);

  // 在生产环境中，监听 storage 事件以支持同页面切换菜单
  useEffect(() => {
    const handleStorageChange = () => {
      const targetMenuId = sessionStorage.getItem("targetMenuId");
      if (targetMenuId) {
        sessionStorage.removeItem("targetMenuId");
        setMenuId(targetMenuId);
      }
    };

    // 监听自定义事件（同页面内的 sessionStorage 变化）
    window.addEventListener("menuChange", handleStorageChange);

    return () => {
      window.removeEventListener("menuChange", handleStorageChange);
    };
  }, []);

  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);
  const [clipboard, setClipboard] = useState<MenuItem | null>(null);

  // 查找当前菜单
  const currentMenu = menus.find((m) => m.id === menuId);
  const selectedItem = currentMenu?.items.find(
    (item) => item.id === selectedItemId
  );

  // 更新选中状态并添加到最近打开
  useEffect(() => {
    if (currentMenu) {
      setSelectedMenuId(menuId);
      addToRecent(menuId);
    }
  }, [menuId, currentMenu, setSelectedMenuId, addToRecent]);

  // 如果菜单不存在且不是 default 占位路由，重定向到首页
  useEffect(() => {
    // menuId 为空或是 default 占位符时，不检查
    if (!menuId || menuId === "default") return;

    // 有 menuId，但找不到对应菜单，且已有其他菜单存在，说明菜单确实不存在
    if (!currentMenu && menus.length > 0) {
      router.push("/");
    }
  }, [currentMenu, menus.length, router, menuId]);

  // 处理保存
  const handleSave = () => {
    // 实际上 zustand 已经自动持久化了
    alert("保存成功！数据已自动同步到本地存储。");
  };

  // 处理导出
  const handleExport = () => {
    if (!currentMenu) return;

    try {
      const yaml = exportMenuToYAML(currentMenu);
      const filename = currentMenu.name.replace(/[^\w\s\u4e00-\u9fa5]/g, "_");
      downloadYAML(filename, yaml);
      alert("导出成功！");
    } catch (error) {
      console.error("导出失败:", error);
      alert(`导出失败: ${error instanceof Error ? error.message : "未知错误"}`);
    }
  };

  // 处理导入
  const handleImport = () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".yml,.yaml";

    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;

      try {
        // 先读取文件内容验证
        const reader = new FileReader();
        reader.onload = async (event) => {
          const content = event.target?.result as string;

          // 验证 YAML
          const validation = validateYAML(content);
          if (!validation.valid) {
            alert(`YAML 格式错误: ${validation.error}`);
            return;
          }

          if (validation.warnings && validation.warnings.length > 0) {
            const proceed = confirm(
              `检测到以下警告:\n${validation.warnings.join(
                "\n"
              )}\n\n是否继续导入？`
            );
            if (!proceed) return;
          }

          // 导入菜单
          const importedMenu = await importMenuFromFile(file);

          // 询问是否覆盖当前菜单或创建新菜单
          const shouldReplace = confirm(
            `是否用导入的配置替换当前菜单 "${currentMenu?.name}"?\n\n点击"确定"替换当前菜单\n点击"取消"创建新菜单`
          );

          if (shouldReplace && currentMenu) {
            // 替换当前菜单
            updateMenu(menuId, {
              title: importedMenu.title,
              size: importedMenu.size,
              type: importedMenu.type,
              items: importedMenu.items,
            });
            alert("导入成功！已替换当前菜单。");
          } else {
            // 创建新菜单
            const createMenu = useMenuStore.getState().createMenu;
            const newMenuId = createMenu(currentMenu?.groupId);
            updateMenu(newMenuId, {
              name: importedMenu.name,
              title: importedMenu.title,
              size: importedMenu.size,
              type: importedMenu.type,
              items: importedMenu.items,
            });
            router.push(navigateToMenu(newMenuId));
            alert("导入成功！已创建新菜单。");
          }
        };

        reader.readAsText(file, "utf-8");
      } catch (error) {
        console.error("导入失败:", error);
        alert(
          `导入失败: ${error instanceof Error ? error.message : "未知错误"}`
        );
      }
    };

    input.click();
  };

  // 处理预览
  const handlePreview = () => {
    alert("预览功能即将推出！将会在新窗口中显示菜单效果。");
  };

  // 处理槽位点击（添加新物品）
  const handleSlotClick = (slot: number) => {
    if (!currentMenu) return;

    // 检查槽位是否已有物品
    const existingItem = currentMenu.items.find((item) => item.slot === slot);
    if (existingItem) {
      setSelectedItemId(existingItem.id);
      return;
    }

    // 创建新物品
    const newItem: MenuItem = {
      id: `item-${Date.now()}`,
      slot,
      material: "STONE",
      displayName: "新物品",
      amount: 1,
      lore: [],
      actions: [],
    };

    addMenuItem(menuId, newItem);
    setSelectedItemId(newItem.id);
  };

  // 处理从插件创建物品
  const handleItemCreateFromPlugin = (itemTemplate: Partial<MenuItem>) => {
    if (!currentMenu) return;

    // 找到第一个空槽位
    let slot = 0;
    for (let i = 0; i < currentMenu.size; i++) {
      if (!currentMenu.items.find((item) => item.slot === i)) {
        slot = i;
        break;
      }
    }

    const newItem: MenuItem = {
      id: `item-${Date.now()}`,
      slot,
      material: itemTemplate.material || "STONE",
      displayName: itemTemplate.displayName || "新物品",
      amount: itemTemplate.amount || 1,
      lore: itemTemplate.lore || [],
      actions: itemTemplate.actions || [],
      customModelData: itemTemplate.customModelData,
    };

    addMenuItem(menuId, newItem);
    setSelectedItemId(newItem.id);
  };

  // 处理菜单更新
  const handleMenuUpdate = (updates: Partial<MenuConfig>) => {
    updateMenu(menuId, updates);
  };

  // 处理物品更新
  const handleItemUpdate = (itemId: string, updates: Partial<MenuItem>) => {
    updateMenuItem(menuId, itemId, updates);
  };

  // 处理物品删除
  const handleItemDelete = (itemId: string) => {
    deleteMenuItem(menuId, itemId);
    setSelectedItemId(null);
  };

  // 处理物品移动
  const handleItemMove = (itemId: string, newSlot: number) => {
    // 检查目标槽位是否有物品
    const targetItem = currentMenu?.items.find((item) => item.slot === newSlot);
    if (targetItem && targetItem.id !== itemId) {
      // 交换位置
      const sourceItem = currentMenu?.items.find((item) => item.id === itemId);
      if (sourceItem) {
        moveMenuItem(menuId, itemId, newSlot);
        moveMenuItem(menuId, targetItem.id, sourceItem.slot);
      }
    } else {
      moveMenuItem(menuId, itemId, newSlot);
    }
  };

  // 处理复制物品
  const handleCopyItem = (item: MenuItem) => {
    setClipboard({ ...item });
  };

  // 处理粘贴物品
  const handlePasteItem = (slot: number) => {
    if (!clipboard || !currentMenu) return;

    // 检查目标槽位是否已有物品
    const existingItem = currentMenu.items.find((i) => i.slot === slot);
    if (existingItem) {
      const shouldReplace = confirm("目标槽位已有物品，是否替换？");
      if (!shouldReplace) return;
      deleteMenuItem(menuId, existingItem.id);
    }

    // 创建新物品（复制剪贴板中的物品）
    const newItem: MenuItem = {
      ...clipboard,
      id: `item-${Date.now()}`,
      slot,
    };

    addMenuItem(menuId, newItem);
  };

  // 处理克隆物品
  const handleCloneItem = (item: MenuItem, sourceSlot: number) => {
    if (!currentMenu) return;

    const targetSlotStr = prompt(
      "请输入目标槽位号 (0-" + (currentMenu.size - 1) + "):",
      String(sourceSlot + 1)
    );

    if (!targetSlotStr) return;

    const targetSlot = parseInt(targetSlotStr);
    if (isNaN(targetSlot) || targetSlot < 0 || targetSlot >= currentMenu.size) {
      alert("无效的槽位号");
      return;
    }

    // 检查目标槽位是否已有物品
    const existingItem = currentMenu.items.find((i) => i.slot === targetSlot);
    if (existingItem) {
      alert("目标槽位已有物品");
      return;
    }

    // 克隆物品到目标槽位
    const clonedItem: MenuItem = {
      ...item,
      id: `item-${Date.now()}`,
      slot: targetSlot,
    };

    addMenuItem(menuId, clonedItem);
  };

  // 批量删除
  const handleBatchDelete = (itemIds: string[]) => {
    if (!currentMenu) return;

    const shouldDelete = confirm(`确定要删除选中的 ${itemIds.length} 个物品吗？`);
    if (!shouldDelete) return;

    itemIds.forEach((itemId) => {
      deleteMenuItem(menuId, itemId);
    });
    setSelectedItemId(null);
  };

  // 批量移动
  const handleBatchMove = (
    slots: number[],
    direction: "up" | "down" | "left" | "right"
  ) => {
    if (!currentMenu) return;

    const cols = 9;
    const rows = currentMenu.size / 9;

    // 计算每个槽位的新位置
    const movements = slots.map((slot) => {
      let newSlot = slot;
      const currentRow = Math.floor(slot / cols);
      const currentCol = slot % cols;

      switch (direction) {
        case "up":
          if (currentRow > 0) newSlot = slot - cols;
          break;
        case "down":
          if (currentRow < rows - 1) newSlot = slot + cols;
          break;
        case "left":
          if (currentCol > 0) newSlot = slot - 1;
          break;
        case "right":
          if (currentCol < cols - 1) newSlot = slot + 1;
          break;
      }

      return { oldSlot: slot, newSlot };
    });

    // 检查是否有冲突
    const targetSlots = movements.map((m) => m.newSlot);
    const hasConflict = targetSlots.some((targetSlot) => {
      const item = currentMenu.items.find((i) => i.slot === targetSlot);
      return item && !slots.includes(targetSlot);
    });

    if (hasConflict) {
      alert("目标位置有物品，无法移动");
      return;
    }

    // 执行移动
    movements.forEach(({ oldSlot, newSlot }) => {
      const item = currentMenu.items.find((i) => i.slot === oldSlot);
      if (item && oldSlot !== newSlot) {
        moveMenuItem(menuId, item.id, newSlot);
      }
    });
  };

  // 等待 menuId 加载
  if (!menuId) {
    return (
      <SidebarInset>
        <div className="flex h-screen items-center justify-center">
          <p className="text-muted-foreground">加载中...</p>
        </div>
      </SidebarInset>
    );
  }

  if (!currentMenu) {
    return (
      <SidebarInset>
        <div className="flex h-screen items-center justify-center">
          <p className="text-muted-foreground">加载中...</p>
        </div>
      </SidebarInset>
    );
  }

  return (
    <SidebarInset>
      {/* 编辑器主体 */}
      <div className="flex flex-col h-screen">
        {/* 工具栏 */}
        <EditorToolbar
          menuName={currentMenu.name}
          onSave={handleSave}
          onExport={handleExport}
          onImport={handleImport}
          onPreview={handlePreview}
        />

        {/* 编辑器内容区 */}
        <div className="flex-1 flex overflow-hidden">
          {/* 左侧：菜单画布 */}
          <MenuCanvas
            menu={currentMenu}
            selectedItemId={selectedItemId}
            onSelectItem={setSelectedItemId}
            onSlotClick={handleSlotClick}
            onItemMove={handleItemMove}
            onItemCopy={handleCopyItem}
            onItemPaste={handlePasteItem}
            onItemDelete={handleItemDelete}
            onItemClone={handleCloneItem}
            onBatchDelete={handleBatchDelete}
            onBatchMove={handleBatchMove}
            clipboard={clipboard}
          />

          {/* 右侧面板容器 */}
          <div className="flex shrink-0">
            {/* 属性面板 */}
            <PropertiesPanel
              menu={currentMenu}
              selectedItem={selectedItem || null}
              onMenuUpdate={handleMenuUpdate}
              onItemUpdate={handleItemUpdate}
              onItemDelete={handleItemDelete}
            />

            {/* 插件面板 */}
            <PluginPanel
              plugins={AVAILABLE_PLUGINS}
              pluginProps={{
                menuId,
                onItemCreate: handleItemCreateFromPlugin,
                selectedItem: selectedItem || null,
              }}
            />
          </div>
        </div>
      </div>
    </SidebarInset>
  );
}
