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
    <div className="w-80 border-l flex flex-col overflow-hidden">
      <ScrollArea className="flex-1">
        <div className="p-2 space-y-2">
          {/* 菜单属性 */}
          <Collapsible open={menuPropsOpen} onOpenChange={setMenuPropsOpen}>
            <CollapsibleTrigger className="flex items-center justify-between w-full py-2 hover:opacity-70 transition-opacity">
              <span className="text-xs  text-muted-foreground uppercase tracking-wider">
                菜单配置
              </span>
              <ChevronRight
                className={`h-3.5 w-3.5 text-muted-foreground transition-transform ${
                  menuPropsOpen ? "rotate-90" : ""
                }`}
              />
            </CollapsibleTrigger>
            <CollapsibleContent className="mt-3 space-y-3">
              <div className="space-y-1">
                <Label htmlFor="menu-title" className="text-sm ">
                  标题
                </Label>
                <Input
                  id="menu-title"
                  value={menu.title}
                  onChange={(e) => onMenuUpdate({ title: e.target.value })}
                  placeholder="菜单标题"
                  className="text-sm"
                />
              </div>

              <div className="space-y-1">
                <Label htmlFor="menu-size" className="text-sm ">
                  大小
                </Label>
                <Select
                  value={menu.size.toString()}
                  onValueChange={(value: string) =>
                    onMenuUpdate({ size: Number(value) as MenuSize })
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
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1">
                <Label htmlFor="menu-type" className="text-sm ">
                  类型
                </Label>
                <Select
                  value={menu.type}
                  onValueChange={(value: string) =>
                    onMenuUpdate({ type: value as MenuType })
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

              <div className="pt-2 grid grid-cols-2 gap-2 text-xs">
                <div className="text-muted-foreground">
                  <span className="font-medium">{menu.items.length}</span> 项
                </div>
                <div className="text-muted-foreground text-right">
                  <span className="font-medium">
                    {menu.size - menu.items.length}
                  </span>{" "}
                  空位
                </div>
              </div>
            </CollapsibleContent>
          </Collapsible>

          <Separator />

          {/* 物品属性 */}
          <Collapsible open={itemPropsOpen} onOpenChange={setItemPropsOpen}>
            <CollapsibleTrigger className="flex items-center justify-between w-full py-2 hover:opacity-70 transition-opacity">
              <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                {selectedItem ? "物品配置" : "未选中"}
              </span>
              <ChevronRight
                className={`h-3.5 w-3.5 text-muted-foreground transition-transform ${
                  itemPropsOpen ? "rotate-90" : ""
                }`}
              />
            </CollapsibleTrigger>
            <CollapsibleContent className="mt-3">
              {selectedItem ? (
                <ItemProperties
                  item={selectedItem}
                  onUpdate={(updates) => onItemUpdate(selectedItem.id, updates)}
                  onDelete={() => onItemDelete(selectedItem.id)}
                />
              ) : (
                <div className="text-center py-12 text-xs text-muted-foreground">
                  选择一个物品以编辑
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
        <Input
          id="item-display-name"
          value={item.displayName || ""}
          onChange={(e) => onUpdate({ displayName: e.target.value })}
          placeholder="自定义名称"
          className="text-sm"
        />
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
                  className="flex items-center gap-2 group text-sm bg-muted/30 rounded px-3 py-2 hover:bg-muted/50 transition-colors"
                >
                  <span className="flex-1 truncate text-sm">{line}</span>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity"
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
            <Button
              size="icon"
              variant="outline"
              className="h-9 w-9 shrink-0"
              onClick={handleAddLore}
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>
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
