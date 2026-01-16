"use client";

import { useRouter } from "next/navigation";
import { Settings, PanelLeftClose, PanelLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { GithubStar } from "@/components/github-star";
import { ThemeSwitcher } from "./theme-switcher";
import { SidebarFooter as SidebarFooterUI } from "@/components/ui/sidebar";

interface SidebarFooterProps {
  isOpen: boolean;
  onToggle: () => void;
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function SidebarFooter({ isOpen, onToggle }: SidebarFooterProps) {
  const router = useRouter();

  return (
    <SidebarFooterUI>
      {/* 展开状态 */}
      <div className="group-data-[collapsible=icon]:hidden">
        <div className="flex items-center justify-between gap-2 px-2 py-2">
          <div className="min-w-0 flex-1 overflow-hidden">
            <GithubStar />
          </div>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 shrink-0 rounded-full"
                title="设置"
              >
                <Settings className="h-4 w-4" />
              </Button>
            </PopoverTrigger>
            <PopoverContent align="center" side="top">
              <div className="space-y-3">
                {/* 主题切换 */}
                <div className="flex items-center justify-between gap-12">
                  <div className="text-muted-foreground text-xs font-medium whitespace-nowrap">
                    主题
                  </div>
                  <ThemeSwitcher />
                </div>

                <Separator />

                {/* 更多设置 */}
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8 w-full text-xs"
                  onClick={() => {
                    router.push("/settings");
                  }}
                >
                  更多设置
                </Button>
              </div>
            </PopoverContent>
          </Popover>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 shrink-0 rounded-full"
            onClick={onToggle}
            title="收起侧边栏"
          >
            <PanelLeftClose className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* 收起状态 */}
      <div className="hidden flex-col items-center gap-2 py-2 group-data-[collapsible=icon]:flex">
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 rounded-full"
              title="设置"
            >
              <Settings className="h-4 w-4" />
            </Button>
          </PopoverTrigger>
          <PopoverContent align="end" side="right">
            <div className="space-y-3">
              {/* 主题切换 */}
              <div className="space-y-2">
                <div className="text-muted-foreground text-xs font-medium">
                  主题
                </div>
                <ThemeSwitcher />
              </div>

              <Separator />

              {/* 更多设置 */}
              <Button
                variant="outline"
                size="sm"
                className="h-8 w-full text-xs"
                onClick={() => {
                  router.push("/settings");
                }}
              >
                更多设置
              </Button>
            </div>
          </PopoverContent>
        </Popover>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 rounded-full"
          onClick={onToggle}
          title="展开侧边栏"
        >
          <PanelLeft className="h-4 w-4" />
        </Button>
      </div>
    </SidebarFooterUI>
  );
}
