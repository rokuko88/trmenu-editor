"use client";

import { useState, useRef, useEffect } from "react";
import type {
  MenuConfig,
  MenuItem,
  MenuSize,
  MenuType,
  MenuAction,
} from "@/types";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Label } from "@/components/ui/label";
import { Trash2, Plus, ChevronLeft, ChevronRight } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { ActionEditor } from "./action-editor";
import { ColorPicker } from "./color-picker";
import { cn } from "@/lib/utils";
import { useEditorStore } from "@/store/editor-store";
import { parseMinecraftText, hasMinecraftColors } from "@/lib/minecraft-colors";

interface PropertiesPanelProps {
  menu: MenuConfig;
  selectedItem: MenuItem | null;
  onMenuUpdate: (updates: Partial<MenuConfig>) => void;
  onItemUpdate: (itemId: string, updates: Partial<MenuItem>) => void;
  onItemDelete: (itemId: string) => void;
  onSelectItem: (itemId: string | null) => void;
}

export function PropertiesPanel({
  menu,
  selectedItem,
  onMenuUpdate,
  onItemUpdate,
  onItemDelete,
  onSelectItem,
}: PropertiesPanelProps) {
  const [isResizing, setIsResizing] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);

  // 从 store 获取状态
  const panelWidth = useEditorStore((state) => state.propertiesPanelWidth);
  const isCollapsed = useEditorStore((state) => state.propertiesPanelCollapsed);
  const panelView = useEditorStore((state) => state.propertiesPanelView);
  const setPanelWidth = useEditorStore(
    (state) => state.setPropertiesPanelWidth
  );
  const togglePanel = useEditorStore((state) => state.togglePropertiesPanel);
  const setPanelView = useEditorStore((state) => state.setPropertiesPanelView);

  // 当选中物品时，自动切换到槽位视图
  useEffect(() => {
    if (selectedItem) {
      setPanelView("slot");
    }
  }, [selectedItem, setPanelView]);

  // 处理拖拽调整宽度
  useEffect(() => {
    if (!isResizing) return;

    const handleMouseMove = (e: MouseEvent) => {
      if (!panelRef.current) return;
      const panelRect = panelRef.current.getBoundingClientRect();
      const newWidth = panelRect.right - e.clientX;
      // 限制宽度在 240px 到 600px 之间
      const constrainedWidth = Math.max(240, Math.min(600, newWidth));
      setPanelWidth(constrainedWidth);
    };

    const handleMouseUp = () => {
      setIsResizing(false);
    };

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isResizing, setPanelWidth]);

  return (
    <div className="relative flex shrink-0">
      {/* 面板内容 */}
      <div
        ref={panelRef}
        className={cn(
          "border-l flex flex-col overflow-hidden relative",
          isResizing ? "transition-none" : "transition-all duration-300"
        )}
        style={{ width: isCollapsed ? "0px" : `${panelWidth}px` }}
      >
        {/* 拖拽调整宽度的手柄 */}
        {!isCollapsed && (
          <div
            className={cn(
              "absolute left-0 top-0 bottom-0 w-1 cursor-col-resize transition-colors group z-10",
              isResizing ? "bg-primary/70" : "hover:bg-primary/50"
            )}
            onMouseDown={() => setIsResizing(true)}
          >
            <div className="absolute left-0 top-0 bottom-0 w-1 bg-transparent group-hover:bg-primary/30" />
          </div>
        )}

        {/* 面包屑导航 */}
        <div className="border-b px-4 py-3">
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                {panelView === "menu" ? (
                  <BreadcrumbPage className="text-sm">菜单</BreadcrumbPage>
                ) : (
                  <BreadcrumbLink
                    className="text-sm cursor-pointer"
                    onClick={() => {
                      setPanelView("menu");
                      onSelectItem(null); // 取消选中物品
                    }}
                  >
                    菜单
                  </BreadcrumbLink>
                )}
              </BreadcrumbItem>
              {panelView === "slot" && selectedItem && (
                <>
                  <BreadcrumbSeparator />
                  <BreadcrumbItem>
                    <BreadcrumbPage className="text-sm">
                      #{selectedItem.slot}
                    </BreadcrumbPage>
                  </BreadcrumbItem>
                </>
              )}
            </BreadcrumbList>
          </Breadcrumb>
        </div>

        <ScrollArea className="flex-1">
          <div className="p-4 space-y-4">
            {/* 根据视图显示不同内容 */}
            {panelView === "slot" && selectedItem ? (
              <ItemProperties
                item={selectedItem}
                onUpdate={(updates) => onItemUpdate(selectedItem.id, updates)}
                onDelete={() => onItemDelete(selectedItem.id)}
              />
            ) : (
              <MenuProperties menu={menu} onUpdate={onMenuUpdate} />
            )}
          </div>
        </ScrollArea>
      </div>

      {/* 折叠按钮 - 固定在面板左侧中间 */}
      <Button
        variant="ghost"
        size="icon"
        className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-full h-10 w-5 rounded-r-none rounded-l-sm border border-r-0 bg-background hover:bg-accent z-20 shadow-sm"
        onClick={togglePanel}
        title={isCollapsed ? "展开属性面板" : "折叠属性面板"}
      >
        {isCollapsed ? (
          <ChevronLeft className="h-4 w-4" />
        ) : (
          <ChevronRight className="h-4 w-4" />
        )}
      </Button>
    </div>
  );
}

// 菜单属性编辑组件
function MenuProperties({
  menu,
  onUpdate,
}: {
  menu: MenuConfig;
  onUpdate: (updates: Partial<MenuConfig>) => void;
}) {
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="menu-title" className="text-sm">
          标题
        </Label>
        <Input
          id="menu-title"
          value={menu.title}
          onChange={(e) => onUpdate({ title: e.target.value })}
          placeholder="菜单标题"
          className="text-sm"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="menu-size" className="text-sm">
          大小
        </Label>
        <Select
          value={menu.size.toString()}
          onValueChange={(value: string) =>
            onUpdate({ size: Number(value) as MenuSize })
          }
        >
          <SelectTrigger id="menu-size" className="text-sm">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="9" className="text-sm">
              9 格 (1 行)
            </SelectItem>
            <SelectItem value="18" className="text-sm">
              18 格 (2 行)
            </SelectItem>
            <SelectItem value="27" className="text-sm">
              27 格 (3 行)
            </SelectItem>
            <SelectItem value="36" className="text-sm">
              36 格 (4 行)
            </SelectItem>
            <SelectItem value="45" className="text-sm">
              45 格 (5 行)
            </SelectItem>
            <SelectItem value="54" className="text-sm">
              54 格 (6 行)
            </SelectItem>
            <SelectItem value="63" className="text-sm">
              63 格 (7 行)
            </SelectItem>
            <SelectItem value="72" className="text-sm">
              72 格 (8 行)
            </SelectItem>
            <SelectItem value="81" className="text-sm">
              81 格 (9 行)
            </SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="menu-type" className="text-sm">
          类型
        </Label>
        <Select
          value={menu.type}
          onValueChange={(value: string) =>
            onUpdate({ type: value as MenuType })
          }
        >
          <SelectTrigger id="menu-type" className="text-sm">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="CHEST" className="text-sm">
              箱子 (CHEST)
            </SelectItem>
            <SelectItem value="HOPPER" className="text-sm">
              漏斗 (HOPPER)
            </SelectItem>
            <SelectItem value="DISPENSER" className="text-sm">
              发射器 (DISPENSER)
            </SelectItem>
            <SelectItem value="DROPPER" className="text-sm">
              投掷器 (DROPPER)
            </SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Separator />

      <div className="grid grid-cols-2 gap-4 text-sm">
        <div className="space-y-1">
          <div className="text-muted-foreground">已使用</div>
          <div className="text-2xl font-semibold">{menu.items.length}</div>
        </div>
        <div className="space-y-1">
          <div className="text-muted-foreground">空位</div>
          <div className="text-2xl font-semibold">
            {menu.size - menu.items.length}
          </div>
        </div>
      </div>
    </div>
  );
}

// 物品属性编辑组件
function ItemProperties({
  item,
  onUpdate,
  onDelete,
}: {
  item: MenuItem;
  onUpdate: (updates: Partial<MenuItem>) => void;
  onDelete: () => void;
}) {
  const [loreInput, setLoreInput] = useState("");
  const displayNameInputRef = useRef<HTMLInputElement>(null);
  const loreInputRef = useRef<HTMLInputElement>(null);

  const handleAddLore = () => {
    if (loreInput.trim()) {
      const currentLore = item.lore || [];
      onUpdate({ lore: [...currentLore, loreInput.trim()] });
      setLoreInput("");
    }
  };

  // 处理颜色代码插入到显示名称
  const handleDisplayNameColorSelect = (colorCode: string) => {
    const input = displayNameInputRef.current;
    if (!input) return;

    const start = input.selectionStart || 0;
    const end = input.selectionEnd || 0;
    const currentValue = item.displayName || "";
    const newValue =
      currentValue.slice(0, start) + colorCode + currentValue.slice(end);

    onUpdate({ displayName: newValue });

    // 恢复光标位置
    setTimeout(() => {
      input.focus();
      const newPos = start + colorCode.length;
      input.setSelectionRange(newPos, newPos);
    }, 0);
  };

  // 处理颜色代码插入到 Lore 输入框
  const handleLoreColorSelect = (colorCode: string) => {
    const input = loreInputRef.current;
    if (!input) return;

    const start = input.selectionStart || 0;
    const end = input.selectionEnd || 0;
    const newValue =
      loreInput.slice(0, start) + colorCode + loreInput.slice(end);

    setLoreInput(newValue);

    // 恢复光标位置
    setTimeout(() => {
      input.focus();
      const newPos = start + colorCode.length;
      input.setSelectionRange(newPos, newPos);
    }, 0);
  };

  const handleRemoveLore = (index: number) => {
    const currentLore = item.lore || [];
    onUpdate({ lore: currentLore.filter((_, i) => i !== index) });
  };

  return (
    <div className="space-y-3">
      {/* 材质 */}
      <div className="space-y-2">
        <Label htmlFor="item-material" className="text-sm ">
          材质
        </Label>
        <Input
          id="item-material"
          value={item.material}
          onChange={(e) => onUpdate({ material: e.target.value.toUpperCase() })}
          placeholder="DIAMOND"
          className="font-mono text-sm"
        />
      </div>

      {/* 显示名称 */}
      <div className="space-y-2">
        <Label htmlFor="item-display-name" className="text-sm ">
          显示名称
        </Label>
        <div className="flex gap-2">
          <Input
            ref={displayNameInputRef}
            id="item-display-name"
            value={item.displayName || ""}
            onChange={(e) => onUpdate({ displayName: e.target.value })}
            placeholder="自定义名称"
            className="text-sm"
          />
          <ColorPicker onColorSelect={handleDisplayNameColorSelect} />
        </div>
        {/* 颜色预览 */}
        {item.displayName && hasMinecraftColors(item.displayName) && (
          <div className="mt-2 p-2 rounded-md bg-muted/50 border text-sm">
            <div className="text-xs text-muted-foreground mb-1">预览：</div>
            <div className="font-medium">
              {parseMinecraftText(item.displayName)}
            </div>
          </div>
        )}
      </div>

      {/* 数量和槽位 */}
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-2">
          <Label htmlFor="item-amount" className="text-sm ">
            数量
          </Label>
          <Input
            id="item-amount"
            type="number"
            min={1}
            max={64}
            value={item.amount || 1}
            onChange={(e) => onUpdate({ amount: Number(e.target.value) })}
            className="text-sm"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="item-slot" className="text-sm ">
            槽位
          </Label>
          <Input
            id="item-slot"
            type="number"
            value={item.slot}
            className="text-sm"
            disabled
          />
        </div>
      </div>

      {/* 自定义模型数据 */}
      <div className="space-y-2">
        <Label htmlFor="item-custom-model" className="text-sm ">
          CustomModelData
        </Label>
        <Input
          id="item-custom-model"
          type="number"
          value={item.customModelData || ""}
          onChange={(e) =>
            onUpdate({
              customModelData: e.target.value
                ? Number(e.target.value)
                : undefined,
            })
          }
          placeholder="留空"
          className="text-sm"
        />
      </div>

      {/* Lore 描述 */}
      <div className="space-y-2">
        <Label className="text-sm ">Lore</Label>
        <div className="space-y-2">
          {item.lore && item.lore.length > 0 && (
            <div className="space-y-1.5">
              {item.lore.map((line, index) => (
                <div
                  key={index}
                  className="flex items-start gap-2 group text-sm bg-muted/30 rounded px-3 py-2 hover:bg-muted/50 transition-colors"
                >
                  <div className="flex-1 min-w-0">
                    <div className="truncate text-xs text-muted-foreground font-mono mb-1">
                      {line}
                    </div>
                    {hasMinecraftColors(line) && (
                      <div className="text-sm">{parseMinecraftText(line)}</div>
                    )}
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity shrink-0"
                    onClick={() => handleRemoveLore(index)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}
          <div className="flex gap-2">
            <Input
              ref={loreInputRef}
              value={loreInput}
              onChange={(e) => setLoreInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  handleAddLore();
                }
              }}
              placeholder="输入描述行"
              className="h-9 text-sm"
            />
            <ColorPicker onColorSelect={handleLoreColorSelect} />
            <Button
              size="icon"
              variant="outline"
              className="h-9 w-9 shrink-0"
              onClick={handleAddLore}
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>
          {/* Lore 输入框预览 */}
          {loreInput && hasMinecraftColors(loreInput) && (
            <div className="p-2 rounded-md bg-muted/50 border text-sm">
              <div className="text-xs text-muted-foreground mb-1">预览：</div>
              <div>{parseMinecraftText(loreInput)}</div>
            </div>
          )}
        </div>
      </div>

      {/* 点击动作 */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label className="text-sm ">动作</Label>
          {item.actions && item.actions.length > 0 && (
            <span className="text-xs text-muted-foreground">
              {item.actions.length} 项
            </span>
          )}
        </div>
        <ActionEditor
          actions={item.actions || []}
          onUpdate={(actions: MenuAction[]) => onUpdate({ actions })}
        />
      </div>

      <Separator className="my-4" />

      {/* 删除按钮 */}
      <Button
        variant="destructive"
        size="sm"
        className="w-full text-sm"
        onClick={onDelete}
      >
        <Trash2 className="h-4 w-4 mr-2" />
        删除物品
      </Button>
    </div>
  );
}
