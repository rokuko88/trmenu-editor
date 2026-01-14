"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import {
  Command,
  Search,
  Plus,
  Copy,
  Download,
  Upload,
  Trash2,
  Grid3x3,
  Sparkles,
} from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";

interface QuickActionsProps {
  onAction?: (action: string, params?: unknown) => void;
}

export function QuickActions({ onAction }: QuickActionsProps) {
  const [searchQuery, setSearchQuery] = useState("");

  const quickActions = [
    {
      category: "创建",
      items: [
        {
          icon: Plus,
          label: "添加物品",
          description: "在选中的槽位添加物品",
          action: "add-item",
        },
        {
          icon: Copy,
          label: "复制物品",
          description: "复制选中的物品",
          action: "copy-item",
        },
        {
          icon: Grid3x3,
          label: "填充边框",
          description: "用装饰物品填充边框",
          action: "fill-border",
        },
      ],
    },
    {
      category: "文件",
      items: [
        {
          icon: Download,
          label: "导出 YAML",
          description: "导出为 TrMenu 配置文件",
          action: "export-yaml",
        },
        {
          icon: Upload,
          label: "导入配置",
          description: "从 YAML 文件导入",
          action: "import-yaml",
        },
      ],
    },
    {
      category: "编辑",
      items: [
        {
          icon: Command,
          label: "批量添加动作",
          description: "为多个物品添加相同动作",
          action: "batch-actions",
        },
        {
          icon: Trash2,
          label: "清空菜单",
          description: "删除所有物品",
          action: "clear-menu",
        },
      ],
    },
  ];

  const filteredActions = quickActions
    .map((category) => ({
      ...category,
      items: category.items.filter(
        (item) =>
          item.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
          item.description.toLowerCase().includes(searchQuery.toLowerCase())
      ),
    }))
    .filter((category) => category.items.length > 0);

  return (
    <div className="flex flex-col h-full">
      {/* 头部 */}
      <div className="p-4 border-b">
        <div className="flex items-center gap-2 mb-3">
          <Sparkles className="h-4 w-4 text-primary" />
          <h3 className="text-sm font-medium">快速操作</h3>
        </div>

        {/* 搜索 */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="搜索操作..."
            className="h-9 pl-9 text-sm"
          />
        </div>
      </div>

      {/* 操作列表 */}
      <ScrollArea className="flex-1">
        <div className="p-4 space-y-6">
          {filteredActions.map((category) => (
            <div key={category.category}>
              <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">
                {category.category}
              </h4>
              <div className="space-y-1">
                {category.items.map((item) => (
                  <button
                    key={item.action}
                    onClick={() => onAction?.(item.action)}
                    className="w-full flex items-start gap-3 p-2.5 text-left hover:bg-accent rounded-md transition-colors group"
                  >
                    <div className="mt-0.5">
                      <item.icon className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium mb-0.5">
                        {item.label}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {item.description}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>

      {/* 底部提示 */}
      <div className="p-4 border-t">
        <div className="text-xs text-muted-foreground">
          <p className="mb-1">💡 快捷键提示：</p>
          <div className="space-y-0.5">
            <div className="flex items-center justify-between">
              <span>Ctrl+C</span>
              <span className="text-muted-foreground/60">复制物品</span>
            </div>
            <div className="flex items-center justify-between">
              <span>Ctrl+V</span>
              <span className="text-muted-foreground/60">粘贴物品</span>
            </div>
            <div className="flex items-center justify-between">
              <span>Del</span>
              <span className="text-muted-foreground/60">删除物品</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
