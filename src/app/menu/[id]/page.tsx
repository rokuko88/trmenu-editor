"use client";

import { useParams, useRouter } from "next/navigation";
import { SidebarInset } from "@/components/ui/sidebar";
import { useMenuStore } from "@/store/menu-store";
import { useEffect, useState } from "react";
import type { MenuItem, MenuConfig } from "@/types";
import { EditorToolbar } from "@/components/menu-editor/editor-toolbar";
import { MenuCanvas } from "@/components/menu-editor/menu-canvas";
import { PropertiesPanel } from "@/components/menu-editor/properties-panel";
import { AIAssistant } from "@/components/menu-editor/ai-assistant";
import { Button } from "@/components/ui/button";
import { Bot, ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

export default function MenuEditorPage() {
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

  const menuId = params.id as string;
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);
  const [showAI, setShowAI] = useState(false);

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

  // 如果菜单不存在，重定向到首页
  useEffect(() => {
    if (!currentMenu && menus.length > 0) {
      router.push("/");
    }
  }, [currentMenu, menus.length, router]);

  // 处理保存
  const handleSave = () => {
    // 实际上 zustand 已经自动持久化了
    alert("保存成功！数据已自动同步到本地存储。");
  };

  // 处理导出
  const handleExport = () => {
    if (!currentMenu) return;
    // TODO: 实现导出为 YAML
    const dataStr = JSON.stringify(currentMenu, null, 2);
    const dataBlob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${currentMenu.name}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  // 处理导入
  const handleImport = () => {
    alert("导入功能即将推出！");
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
          />

          {/* 右侧面板容器 */}
          <div className="flex">
            {/* 属性面板 */}
            <PropertiesPanel
              menu={currentMenu}
              selectedItem={selectedItem || null}
              onMenuUpdate={handleMenuUpdate}
              onItemUpdate={handleItemUpdate}
              onItemDelete={handleItemDelete}
            />

            {/* AI 助手面板 */}
            <div
              className={cn(
                "transition-all duration-300 border-l overflow-hidden",
                showAI ? "w-80" : "w-0"
              )}
            >
              {showAI && <AIAssistant />}
            </div>

            {/* AI 切换按钮 */}
            <div className="flex flex-col border-l">
              <Button
                variant="ghost"
                size="icon"
                className="h-12 w-12 rounded-none"
                onClick={() => setShowAI(!showAI)}
                title={showAI ? "隐藏 AI 助手" : "显示 AI 助手"}
              >
                {showAI ? (
                  <ChevronRight className="h-4 w-4" />
                ) : (
                  <>
                    <Bot className="h-4 w-4" />
                    <ChevronLeft className="h-3 w-3 absolute -right-1" />
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </SidebarInset>
  );
}
