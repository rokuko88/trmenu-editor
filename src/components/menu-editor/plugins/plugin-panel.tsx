"use client";

import { useState } from "react";
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

interface PluginPanelProps {
  plugins: Plugin[];
  pluginProps: PluginComponentProps;
}

export function PluginPanel({ plugins, pluginProps }: PluginPanelProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [activePluginId, setActivePluginId] = useState<string | null>(
    plugins[0]?.id || null
  );

  const activePlugin = plugins.find((p) => p.id === activePluginId);

  // 处理插件点击
  const handlePluginClick = (pluginId: string) => {
    if (pluginId === activePluginId && isExpanded) {
      // 如果点击的是当前激活的插件，并且面板已展开，则收起
      setIsExpanded(false);
    } else {
      // 否则切换插件并展开
      setActivePluginId(pluginId);
      setIsExpanded(true);
    }
  };

  return (
    <div className="flex h-full">
      {/* 插件面板内容 */}
      <div
        className={cn(
          "transition-all duration-300 border-l overflow-hidden shrink-0",
          isExpanded ? "w-80" : "w-0"
        )}
      >
        {activePlugin && (
          <div className="flex flex-col h-full w-80 bg-background/50 backdrop-blur-sm">
            {/* 插件头部 - 固定 Layout */}
            <div className="shrink-0 border-b bg-background/80">
              <div className="flex items-center justify-between p-3">
                <div className="flex items-center gap-2 flex-1 min-w-0">
                  <div className="h-8 w-8 rounded-lg bg-linear-to-br from-blue-500 to-purple-500 flex items-center justify-center shrink-0 shadow-sm">
                    <activePlugin.icon className="h-4 w-4 text-white" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="font-semibold text-sm truncate">
                      {activePlugin.name}
                    </h3>
                    <p className="text-xs text-muted-foreground truncate">
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
                        onClick={() => setIsExpanded(false)}
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
      <div className="flex flex-col border-l shrink-0 bg-background/30">
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
                      className="h-12 w-12 rounded-none hover:bg-accent/50 transition-colors"
                      onClick={() => handlePluginClick(plugin.id)}
                    >
                      <plugin.icon className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="left">
                    <div className="space-y-1">
                      <p className="font-medium">{plugin.name}</p>
                      <p className="text-xs text-muted-foreground">
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
