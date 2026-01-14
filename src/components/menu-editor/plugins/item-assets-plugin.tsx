"use client";

import { useState } from "react";
import { PluginComponentProps, ItemAsset } from "@/types/plugin";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Package, Plus, Search, Trash2, Download } from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// 本地存储的资产库
const ASSETS_STORAGE_KEY = "trmenu-item-assets";

// 初始化默认资产
const getInitialAssets = (): ItemAsset[] => {
  const stored = localStorage.getItem(ASSETS_STORAGE_KEY);
  if (stored) {
    return JSON.parse(stored);
  }

  // 初始化一些默认资产
  const defaultAssets: ItemAsset[] = [
    {
      id: "asset-1",
      name: "关闭按钮",
      description: "红色玻璃板，点击关闭菜单",
      category: "按钮",
      tags: ["关闭", "按钮", "常用"],
      createdAt: new Date().toISOString(),
      template: {
        material: "RED_STAINED_GLASS_PANE",
        displayName: "§c§l关闭",
        lore: ["§7点击关闭菜单"],
        actions: [
          {
            id: "action-close-1",
            type: "CLOSE",
            clickType: "ALL",
            value: "",
          },
        ],
      },
    },
    {
      id: "asset-2",
      name: "返回按钮",
      description: "箭头，返回上一级菜单",
      category: "按钮",
      tags: ["返回", "按钮", "常用"],
      createdAt: new Date().toISOString(),
      template: {
        material: "ARROW",
        displayName: "§e§l返回",
        lore: ["§7点击返回上一级"],
        actions: [],
      },
    },
    {
      id: "asset-3",
      name: "下一页",
      description: "绿色染料，翻页按钮",
      category: "按钮",
      tags: ["翻页", "按钮"],
      createdAt: new Date().toISOString(),
      template: {
        material: "LIME_DYE",
        displayName: "§a§l下一页",
        lore: ["§7点击查看下一页"],
        actions: [],
      },
    },
    {
      id: "asset-4",
      name: "装饰-黑色玻璃板",
      description: "黑色玻璃板装饰",
      category: "装饰",
      tags: ["装饰", "玻璃"],
      createdAt: new Date().toISOString(),
      template: {
        material: "BLACK_STAINED_GLASS_PANE",
        displayName: " ",
        lore: [],
      },
    },
    {
      id: "asset-5",
      name: "装饰-灰色玻璃板",
      description: "灰色玻璃板装饰",
      category: "装饰",
      tags: ["装饰", "玻璃"],
      createdAt: new Date().toISOString(),
      template: {
        material: "GRAY_STAINED_GLASS_PANE",
        displayName: " ",
        lore: [],
      },
    },
    {
      id: "asset-6",
      name: "信息提示",
      description: "书本，用于显示信息",
      category: "功能",
      tags: ["信息", "提示"],
      createdAt: new Date().toISOString(),
      template: {
        material: "BOOK",
        displayName: "§b§l信息",
        lore: ["§7这是一条信息提示"],
      },
    },
    {
      id: "asset-7",
      name: "确认按钮",
      description: "绿色羊毛，确认操作",
      category: "按钮",
      tags: ["确认", "按钮"],
      createdAt: new Date().toISOString(),
      template: {
        material: "LIME_WOOL",
        displayName: "§a§l✔ 确认",
        lore: ["§7点击确认操作"],
      },
    },
    {
      id: "asset-8",
      name: "取消按钮",
      description: "红色羊毛，取消操作",
      category: "按钮",
      tags: ["取消", "按钮"],
      createdAt: new Date().toISOString(),
      template: {
        material: "RED_WOOL",
        displayName: "§c§l✖ 取消",
        lore: ["§7点击取消操作"],
      },
    },
  ];
  localStorage.setItem(ASSETS_STORAGE_KEY, JSON.stringify(defaultAssets));
  return defaultAssets;
};

export function ItemAssetsPlugin({
  onItemCreate,
  selectedItem,
}: PluginComponentProps) {
  const [assets, setAssets] = useState<ItemAsset[]>(getInitialAssets);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [draggedItem, setDraggedItem] = useState<ItemAsset | null>(null);

  // 保存资产到本地存储
  const saveAssets = (newAssets: ItemAsset[]) => {
    setAssets(newAssets);
    localStorage.setItem(ASSETS_STORAGE_KEY, JSON.stringify(newAssets));
  };

  // 添加当前选中的物品到资产库
  const addCurrentItem = () => {
    if (!selectedItem) {
      alert("请先选择一个物品");
      return;
    }

    const name = prompt(
      "请输入资产名称：",
      selectedItem.displayName || "新资产"
    );
    if (!name) return;

    const category = prompt("请输入分类：", "自定义");
    if (!category) return;

    const newAsset: ItemAsset = {
      id: `asset-${Date.now()}`,
      name,
      description: `来自槽位 ${selectedItem.slot}`,
      category,
      tags: [category],
      createdAt: new Date().toISOString(),
      template: {
        material: selectedItem.material,
        displayName: selectedItem.displayName,
        lore: selectedItem.lore,
        amount: selectedItem.amount,
        customModelData: selectedItem.customModelData,
        actions: selectedItem.actions,
      },
    };

    saveAssets([...assets, newAsset]);
  };

  // 删除资产
  const deleteAsset = (assetId: string) => {
    if (!confirm("确定要删除这个资产吗？")) return;
    saveAssets(assets.filter((a) => a.id !== assetId));
  };

  // 使用资产（创建物品）
  const applyAsset = (asset: ItemAsset) => {
    if (onItemCreate) {
      onItemCreate(asset.template);
    }
  };

  // 获取所有分类
  const categories = ["all", ...new Set(assets.map((a) => a.category))];

  // 筛选资产
  const filteredAssets = assets.filter((asset) => {
    const matchesSearch =
      searchQuery === "" ||
      asset.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      asset.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      asset.tags.some((tag) =>
        tag.toLowerCase().includes(searchQuery.toLowerCase())
      );

    const matchesCategory =
      selectedCategory === "all" || asset.category === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  return (
    <div className="flex flex-col h-full">
      {/* 搜索和筛选 */}
      <div className="p-2 space-y-1.5 border-b shrink-0">
        <div className="relative">
          <Search className="absolute left-2 top-2 h-3 w-3 text-muted-foreground" />
          <Input
            placeholder="搜索资产..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-7 h-7 text-xs"
          />
        </div>

        <Select value={selectedCategory} onValueChange={setSelectedCategory}>
          <SelectTrigger className="h-7 text-xs">
            <SelectValue placeholder="选择分类" />
          </SelectTrigger>
          <SelectContent>
            {categories.map((cat) => (
              <SelectItem key={cat} value={cat} className="text-xs">
                {cat === "all" ? "全部分类" : cat}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* 操作按钮 */}
      <div className="p-2 border-b flex gap-1.5 shrink-0">
        <Button
          variant="outline"
          size="sm"
          className="flex-1 h-6 text-[10px]"
          onClick={addCurrentItem}
          disabled={!selectedItem}
        >
          <Plus className="h-2.5 w-2.5 mr-0.5" />
          添加当前物品
        </Button>
      </div>

      {/* 资产列表 */}
      <ScrollArea className="flex-1">
        <div className="p-2 space-y-1.5">
          {filteredAssets.length === 0 ? (
            <div className="text-center py-6 text-muted-foreground">
              <Package className="h-8 w-8 mx-auto mb-1.5 opacity-20" />
              <p className="text-xs">暂无资产</p>
            </div>
          ) : (
            filteredAssets.map((asset) => (
              <div
                key={asset.id}
                className={cn(
                  "group relative p-2 border rounded-md hover:bg-accent/50 transition-colors cursor-move",
                  draggedItem?.id === asset.id && "opacity-50"
                )}
                draggable
                onDragStart={() => setDraggedItem(asset)}
                onDragEnd={() => setDraggedItem(null)}
              >
                {/* 拖拽提示 */}
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                  <div className="bg-primary/10 rounded px-1.5 py-0.5">
                    <span className="text-primary font-medium">拖拽到画布</span>
                  </div>
                </div>

                <div className="flex items-start gap-1.5">
                  <div className="h-7 w-7 rounded bg-linear-to-br from-blue-500/20 to-purple-500/20 flex items-center justify-center shrink-0">
                    <Package className="h-3.5 w-3.5 text-blue-500" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-1.5">
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-xs truncate">
                          {asset.name}
                        </h4>
                        <p className="text-muted-foreground truncate leading-tight">
                          {asset.description}
                        </p>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-5 w-5 shrink-0 opacity-0 group-hover:opacity-100"
                        onClick={() => deleteAsset(asset.id)}
                      >
                        <Trash2 className="h-2.5 w-2.5" />
                      </Button>
                    </div>

                    <div className="flex items-center gap-1 mt-1">
                      <Badge
                        variant="secondary"
                        className="text-[9px] h-4 px-1"
                      >
                        {asset.category}
                      </Badge>
                      <span className="text-[9px] text-muted-foreground font-mono">
                        {asset.template.material}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="mt-1.5 pt-1.5 border-t flex gap-1">
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-6 flex-1"
                    onClick={() => applyAsset(asset)}
                  >
                    <Download className="h-2.5 w-2.5 mr-0.5" />
                    使用
                  </Button>
                </div>
              </div>
            ))
          )}
        </div>
      </ScrollArea>

      {/* 底部统计 */}
      <div className="p-2 border-t text-muted-foreground text-center shrink-0">
        共 {filteredAssets.length} 个资产
      </div>
    </div>
  );
}
