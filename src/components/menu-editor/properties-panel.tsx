"use client";

import { useState } from "react";
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
import { Badge } from "@/components/ui/badge";
import { Trash2, Plus } from "lucide-react";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ChevronRight } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ActionEditor } from "./action-editor";

interface PropertiesPanelProps {
  menu: MenuConfig;
  selectedItem: MenuItem | null;
  onMenuUpdate: (updates: Partial<MenuConfig>) => void;
  onItemUpdate: (itemId: string, updates: Partial<MenuItem>) => void;
  onItemDelete: (itemId: string) => void;
}

export function PropertiesPanel({
  menu,
  selectedItem,
  onMenuUpdate,
  onItemUpdate,
  onItemDelete,
}: PropertiesPanelProps) {
  const [menuPropsOpen, setMenuPropsOpen] = useState(true);
  const [itemPropsOpen, setItemPropsOpen] = useState(true);

  return (
    <div className="w-72 border-l bg-background/50 backdrop-blur-sm flex flex-col overflow-hidden">
      <ScrollArea className="flex-1">
        <div className="p-3 space-y-3">
          {/* 菜单属性 */}
          <Collapsible open={menuPropsOpen} onOpenChange={setMenuPropsOpen}>
            <CollapsibleTrigger className="flex items-center justify-between w-full px-2 py-1.5 hover:bg-accent rounded-md transition-colors">
              <span className="font-semibold text-xs">菜单属性</span>
              <ChevronRight
                className={`h-3.5 w-3.5 transition-transform ${
                  menuPropsOpen ? "rotate-90" : ""
                }`}
              />
            </CollapsibleTrigger>
            <CollapsibleContent className="mt-2 space-y-2.5">
              <div className="space-y-1.5">
                <Label
                  htmlFor="menu-title"
                  className="text-xs font-medium text-muted-foreground"
                >
                  显示标题
                </Label>
                <Input
                  id="menu-title"
                  value={menu.title}
                  onChange={(e) => onMenuUpdate({ title: e.target.value })}
                  placeholder="菜单标题"
                  className="h-7 text-sm"
                />
              </div>

              <div className="space-y-1.5">
                <Label
                  htmlFor="menu-size"
                  className="text-xs font-medium text-muted-foreground"
                >
                  菜单大小
                </Label>
                <Select
                  value={menu.size.toString()}
                  onValueChange={(value: string) =>
                    onMenuUpdate({ size: Number(value) as MenuSize })
                  }
                >
                  <SelectTrigger id="menu-size" className="h-7 text-sm">
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
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label
                  htmlFor="menu-type"
                  className="text-xs font-medium text-muted-foreground"
                >
                  菜单类型
                </Label>
                <Select
                  value={menu.type}
                  onValueChange={(value: string) =>
                    onMenuUpdate({ type: value as MenuType })
                  }
                >
                  <SelectTrigger id="menu-type" className="h-7 text-sm">
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

              <div className="pt-1 flex gap-1.5">
                <Badge
                  variant="secondary"
                  className="flex-1 justify-center text-xs py-0.5"
                >
                  物品 {menu.items.length}
                </Badge>
                <Badge
                  variant="outline"
                  className="flex-1 justify-center text-xs py-0.5"
                >
                  空位 {menu.size - menu.items.length}
                </Badge>
              </div>
            </CollapsibleContent>
          </Collapsible>

          <Separator />

          {/* 物品属性 */}
          <Collapsible open={itemPropsOpen} onOpenChange={setItemPropsOpen}>
            <CollapsibleTrigger className="flex items-center justify-between w-full px-2 py-1.5 hover:bg-accent rounded-md transition-colors">
              <span className="font-semibold text-xs">
                {selectedItem ? "物品属性" : "未选中物品"}
              </span>
              <ChevronRight
                className={`h-3.5 w-3.5 transition-transform ${
                  itemPropsOpen ? "rotate-90" : ""
                }`}
              />
            </CollapsibleTrigger>
            <CollapsibleContent className="mt-2">
              {selectedItem ? (
                <ItemProperties
                  item={selectedItem}
                  onUpdate={(updates) => onItemUpdate(selectedItem.id, updates)}
                  onDelete={() => onItemDelete(selectedItem.id)}
                />
              ) : (
                <div className="text-center py-6 text-xs text-muted-foreground">
                  点击画布中的物品以编辑属性
                </div>
              )}
            </CollapsibleContent>
          </Collapsible>
        </div>
      </ScrollArea>
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

  const handleAddLore = () => {
    if (loreInput.trim()) {
      const currentLore = item.lore || [];
      onUpdate({ lore: [...currentLore, loreInput.trim()] });
      setLoreInput("");
    }
  };

  const handleRemoveLore = (index: number) => {
    const currentLore = item.lore || [];
    onUpdate({ lore: currentLore.filter((_, i) => i !== index) });
  };

  return (
    <div className="space-y-2.5">
      {/* 材质 */}
      <div className="space-y-1.5">
        <Label
          htmlFor="item-material"
          className="text-xs font-medium text-muted-foreground"
        >
          材质 (Material)
        </Label>
        <Input
          id="item-material"
          value={item.material}
          onChange={(e) => onUpdate({ material: e.target.value.toUpperCase() })}
          placeholder="DIAMOND"
          className="h-7 font-mono text-xs"
        />
      </div>

      {/* 显示名称 */}
      <div className="space-y-1.5">
        <Label
          htmlFor="item-display-name"
          className="text-xs font-medium text-muted-foreground"
        >
          显示名称
        </Label>
        <Input
          id="item-display-name"
          value={item.displayName || ""}
          onChange={(e) => onUpdate({ displayName: e.target.value })}
          placeholder="自定义名称"
          className="h-7 text-sm"
        />
      </div>

      {/* 数量和槽位 */}
      <div className="grid grid-cols-2 gap-1.5">
        <div className="space-y-1.5">
          <Label
            htmlFor="item-amount"
            className="text-xs font-medium text-muted-foreground"
          >
            数量
          </Label>
          <Input
            id="item-amount"
            type="number"
            min={1}
            max={64}
            value={item.amount || 1}
            onChange={(e) => onUpdate({ amount: Number(e.target.value) })}
            className="h-7 text-sm"
          />
        </div>
        <div className="space-y-1.5">
          <Label
            htmlFor="item-slot"
            className="text-xs font-medium text-muted-foreground"
          >
            槽位
          </Label>
          <Input
            id="item-slot"
            type="number"
            value={item.slot}
            className="h-7 text-sm"
            disabled
          />
        </div>
      </div>

      {/* 自定义模型数据 */}
      <div className="space-y-1.5">
        <Label
          htmlFor="item-custom-model"
          className="text-xs font-medium text-muted-foreground"
        >
          自定义模型数据 (CustomModelData)
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
          placeholder="留空表示无"
          className="h-7 text-sm"
        />
      </div>

      {/* Lore 描述 */}
      <div className="space-y-1.5">
        <Label className="text-xs font-medium text-muted-foreground">
          Lore 描述
        </Label>
        <div className="space-y-1.5">
          {item.lore && item.lore.length > 0 && (
            <div className="space-y-1">
              {item.lore.map((line, index) => (
                <div
                  key={index}
                  className="flex items-center gap-1.5 group text-xs bg-muted/50 rounded px-2 py-1 hover:bg-muted/80 transition-colors"
                >
                  <span className="flex-1 truncate text-muted-foreground text-xs">
                    {line}
                  </span>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={() => handleRemoveLore(index)}
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              ))}
            </div>
          )}
          <div className="flex gap-1.5">
            <Input
              value={loreInput}
              onChange={(e) => setLoreInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  handleAddLore();
                }
              }}
              placeholder="输入描述行"
              className="h-7 text-xs"
            />
            <Button
              size="icon"
              variant="outline"
              className="h-7 w-7 shrink-0"
              onClick={handleAddLore}
            >
              <Plus className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>
      </div>

      {/* 点击动作 */}
      <div className="space-y-1.5">
        <Label className="text-xs font-medium text-muted-foreground">
          点击动作
          {item.actions && item.actions.length > 0 && (
            <Badge variant="secondary" className="ml-2 text-[9px] h-4 px-1">
              {item.actions.length}
            </Badge>
          )}
        </Label>
        <ActionEditor
          actions={item.actions || []}
          onUpdate={(actions: MenuAction[]) => onUpdate({ actions })}
        />
      </div>

      <Separator className="my-2" />

      {/* 删除按钮 */}
      <Button
        variant="destructive"
        size="sm"
        className="w-full h-7 text-xs"
        onClick={onDelete}
      >
        <Trash2 className="h-3 w-3 mr-1.5" />
        删除物品
      </Button>
    </div>
  );
}
