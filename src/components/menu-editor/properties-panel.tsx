"use client";

import { useState } from "react";
import type { MenuConfig, MenuItem, MenuSize, MenuType } from "@/types";
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
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ChevronRight } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";

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
    <div className="w-80 border-l bg-background/50 backdrop-blur-sm flex flex-col overflow-hidden">
      <ScrollArea className="flex-1">
        <div className="p-4 space-y-4">
          {/* 菜单属性 */}
          <Collapsible open={menuPropsOpen} onOpenChange={setMenuPropsOpen}>
            <CollapsibleTrigger className="flex items-center justify-between w-full p-2 hover:bg-accent rounded-md">
              <span className="font-semibold text-sm">菜单属性</span>
              <ChevronRight
                className={`h-4 w-4 transition-transform ${
                  menuPropsOpen ? "rotate-90" : ""
                }`}
              />
            </CollapsibleTrigger>
            <CollapsibleContent className="mt-3 space-y-3">
              <div className="space-y-2">
                <Label htmlFor="menu-title" className="text-xs">
                  显示标题
                </Label>
                <Input
                  id="menu-title"
                  value={menu.title}
                  onChange={(e) => onMenuUpdate({ title: e.target.value })}
                  placeholder="菜单标题"
                  className="h-8"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="menu-size" className="text-xs">
                  菜单大小
                </Label>
                <Select
                  value={menu.size.toString()}
                  onValueChange={(value: string) =>
                    onMenuUpdate({ size: Number(value) as MenuSize })
                  }
                >
                  <SelectTrigger id="menu-size" className="h-8">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="9">9 格 (1 行)</SelectItem>
                    <SelectItem value="18">18 格 (2 行)</SelectItem>
                    <SelectItem value="27">27 格 (3 行)</SelectItem>
                    <SelectItem value="36">36 格 (4 行)</SelectItem>
                    <SelectItem value="45">45 格 (5 行)</SelectItem>
                    <SelectItem value="54">54 格 (6 行)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="menu-type" className="text-xs">
                  菜单类型
                </Label>
                <Select
                  value={menu.type}
                  onValueChange={(value: string) =>
                    onMenuUpdate({ type: value as MenuType })
                  }
                >
                  <SelectTrigger id="menu-type" className="h-8">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="CHEST">箱子 (CHEST)</SelectItem>
                    <SelectItem value="HOPPER">漏斗 (HOPPER)</SelectItem>
                    <SelectItem value="DISPENSER">
                      发射器 (DISPENSER)
                    </SelectItem>
                    <SelectItem value="DROPPER">投掷器 (DROPPER)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="pt-2 flex gap-2">
                <Badge variant="secondary" className="flex-1 justify-center">
                  物品 {menu.items.length}
                </Badge>
                <Badge variant="outline" className="flex-1 justify-center">
                  空位 {menu.size - menu.items.length}
                </Badge>
              </div>
            </CollapsibleContent>
          </Collapsible>

          <Separator />

          {/* 物品属性 */}
          <Collapsible open={itemPropsOpen} onOpenChange={setItemPropsOpen}>
            <CollapsibleTrigger className="flex items-center justify-between w-full p-2 hover:bg-accent rounded-md">
              <span className="font-semibold text-sm">
                {selectedItem ? "物品属性" : "未选中物品"}
              </span>
              <ChevronRight
                className={`h-4 w-4 transition-transform ${
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
                <div className="text-center py-8 text-sm text-muted-foreground">
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
    <div className="space-y-3">
      {/* 材质 */}
      <div className="space-y-2">
        <Label htmlFor="item-material" className="text-xs">
          材质 (Material)
        </Label>
        <Input
          id="item-material"
          value={item.material}
          onChange={(e) => onUpdate({ material: e.target.value.toUpperCase() })}
          placeholder="DIAMOND"
          className="h-8 font-mono text-xs"
        />
      </div>

      {/* 显示名称 */}
      <div className="space-y-2">
        <Label htmlFor="item-display-name" className="text-xs">
          显示名称
        </Label>
        <Input
          id="item-display-name"
          value={item.displayName || ""}
          onChange={(e) => onUpdate({ displayName: e.target.value })}
          placeholder="自定义名称"
          className="h-8"
        />
      </div>

      {/* 数量和槽位 */}
      <div className="grid grid-cols-2 gap-2">
        <div className="space-y-2">
          <Label htmlFor="item-amount" className="text-xs">
            数量
          </Label>
          <Input
            id="item-amount"
            type="number"
            min={1}
            max={64}
            value={item.amount || 1}
            onChange={(e) => onUpdate({ amount: Number(e.target.value) })}
            className="h-8"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="item-slot" className="text-xs">
            槽位
          </Label>
          <Input
            id="item-slot"
            type="number"
            value={item.slot}
            className="h-8"
            disabled
          />
        </div>
      </div>

      {/* 自定义模型数据 */}
      <div className="space-y-2">
        <Label htmlFor="item-custom-model" className="text-xs">
          自定义模型数据
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
          className="h-8"
        />
      </div>

      {/* Lore 描述 */}
      <div className="space-y-2">
        <Label className="text-xs">Lore 描述</Label>
        <div className="space-y-2">
          {item.lore && item.lore.length > 0 && (
            <div className="space-y-1">
              {item.lore.map((line, index) => (
                <div
                  key={index}
                  className="flex items-center gap-2 group text-xs bg-muted/50 rounded px-2 py-1.5"
                >
                  <span className="flex-1 truncate text-muted-foreground">
                    {line}
                  </span>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-5 w-5 opacity-0 group-hover:opacity-100"
                    onClick={() => handleRemoveLore(index)}
                  >
                    <Trash2 className="h-3 w-3" />
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
              className="h-8 text-xs"
            />
            <Button
              size="icon"
              variant="outline"
              className="h-8 w-8 shrink-0"
              onClick={handleAddLore}
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* 动作提示 */}
      <Card>
        <CardHeader className="p-3 pb-2">
          <CardTitle className="text-xs">点击动作</CardTitle>
          <CardDescription className="text-xs">
            {item.actions && item.actions.length > 0
              ? `${item.actions.length} 个动作`
              : "暂无动作"}
          </CardDescription>
        </CardHeader>
        <CardContent className="p-3 pt-0">
          <Button variant="outline" size="sm" className="w-full h-7 text-xs">
            配置动作
          </Button>
        </CardContent>
      </Card>

      <Separator />

      {/* 删除按钮 */}
      <Button
        variant="destructive"
        size="sm"
        className="w-full"
        onClick={onDelete}
      >
        <Trash2 className="h-4 w-4 mr-2" />
        删除物品
      </Button>
    </div>
  );
}
