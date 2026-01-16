"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { Plugin, PluginComponentProps } from "@/types/plugin";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useEditorStore } from "@/store/editor-store";

interface PluginPanelProps {
  plugins: Plugin[];
  pluginProps: PluginComponentProps;
}

export function PluginPanel({ plugins, pluginProps }: PluginPanelProps) {
  const [isResizing, setIsResizing] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);

  // 从 store 获取状态
  const isExpanded = useEditorStore((state) => state.pluginPanelExpanded);
  const activePluginId = useEditorStore((state) => state.activePluginId);
  const panelWidth = useEditorStore((state) => state.pluginPanelWidth);
  const setPanelWidth = useEditorStore((state) => state.setPluginPanelWidth);
  const togglePanel = useEditorStore((state) => state.togglePluginPanel);
  const setExpanded = useEditorStore((state) => state.setPluginPanelExpanded);
  const setActivePluginId = useEditorStore((state) => state.setActivePluginId);

  // 初始化默认插件
  useEffect(() => {
    if (!activePluginId && plugins.length > 0) {
      setActivePluginId(plugins[0].id);
    }
  }, [activePluginId, plugins, setActivePluginId]);

  const activePlugin = plugins.find((p) => p.id === activePluginId);

  // 处理插件点击
  const handlePluginClick = (pluginId: string) => {
    togglePanel(pluginId);
  };

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
    <div className="flex h-full">
      {/* 插件面板内容 */}
      <div
        ref={panelRef}
        className={cn(
          "relative shrink-0 overflow-hidden border-l",
          isResizing ? "transition-none" : "transition-all duration-300"
        )}
        style={{ width: isExpanded ? `${panelWidth}px` : "0px" }}
      >
        {/* 拖拽调整宽度的手柄 */}
        {isExpanded && (
          <div
            className={cn(
              "group absolute top-0 bottom-0 left-0 z-10 w-1 cursor-col-resize transition-colors",
              isResizing ? "bg-primary/70" : "hover:bg-primary/50"
            )}
            onMouseDown={() => setIsResizing(true)}
          >
            <div className="group-hover:bg-primary/30 absolute top-0 bottom-0 left-0 w-1 bg-transparent" />
          </div>
        )}

        {activePlugin && (
          <div
            className="bg-background/50 flex h-full flex-col backdrop-blur-sm"
            style={{ width: `${panelWidth}px` }}
          >
            {/* 插件头部 - 固定 Layout */}
            <div className="bg-background/80 shrink-0 border-b">
              <div className="flex items-center justify-between p-3">
                <div className="flex min-w-0 flex-1 items-center gap-2">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-linear-to-br from-blue-500 to-purple-500 shadow-sm">
                    <activePlugin.icon className="h-4 w-4 text-white" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="truncate text-sm font-semibold">
                      {activePlugin.name}
                    </h3>
                    <p className="text-muted-foreground truncate text-xs">
                      {activePlugin.description}
                    </p>
                  </div>
                </div>
                {/* 收缩按钮 */}
                <TooltipProvider delayDuration={300}>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 shrink-0"
                        onClick={() => setExpanded(false)}
                      >
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent side="left">
                      <p>收起面板</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
            </div>

            {/* 插件内容区 */}
            <div className="flex-1 overflow-hidden">
              <activePlugin.component {...pluginProps} />
            </div>
          </div>
        )}
      </div>

      {/* 插件按钮列表 - 始终可见 */}
      <div className="bg-background/30 flex shrink-0 flex-col border-l">
        <ScrollArea className="flex-1">
          <div className="flex flex-col">
            {plugins.map((plugin) => (
              <TooltipProvider key={plugin.id} delayDuration={300}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant={
                        plugin.id === activePluginId && isExpanded
                          ? "secondary"
                          : "ghost"
                      }
                      size="icon"
                      className="hover:bg-accent/50 h-12 w-12 rounded-none transition-colors"
                      onClick={() => handlePluginClick(plugin.id)}
                    >
                      <plugin.icon className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="left">
                    <div className="space-y-1">
                      <p className="font-medium">{plugin.name}</p>
                      <p className="text-muted-foreground text-xs">
                        {plugin.description}
                      </p>
                    </div>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            ))}
          </div>
        </ScrollArea>
      </div>
    </div>
  );
}
