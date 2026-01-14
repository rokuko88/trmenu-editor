"use client";

import { useParams, useRouter } from "next/navigation";
import { SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { useMenuContext } from "@/contexts/menu-context";
import { useEffect } from "react";

export default function MenuEditorPage() {
  const params = useParams();
  const router = useRouter();
  const { menus, setSelectedMenuId } = useMenuContext();
  const menuId = params.id as string;

  // 查找当前菜单
  const currentMenu = menus.find((m) => m.id === menuId);

  // 更新选中状态
  useEffect(() => {
    setSelectedMenuId(menuId);
  }, [menuId, setSelectedMenuId]);

  // 如果菜单不存在，重定向到首页
  useEffect(() => {
    if (!currentMenu && menus.length > 0) {
      router.push("/");
    }
  }, [currentMenu, menus.length, router]);

  if (!currentMenu) {
    return (
      <SidebarInset>
        <header className="flex h-14 shrink-0 items-center gap-2 border-b bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60">
          <div className="flex items-center gap-2 px-3">
            <SidebarTrigger className="-ml-1" />
            <Separator orientation="vertical" className="mr-2 h-4" />
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem className="hidden md:block">
                  <BreadcrumbLink href="/">首页</BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator className="hidden md:block" />
                <BreadcrumbItem>
                  <BreadcrumbPage>加载中...</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
        </header>
        <div className="flex flex-1 items-center justify-center">
          <p className="text-muted-foreground">加载中...</p>
        </div>
      </SidebarInset>
    );
  }

  return (
    <SidebarInset>
      <header className="flex h-14 shrink-0 items-center gap-2 border-b bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60">
        <div className="flex items-center gap-2 px-3">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="mr-2 h-4" />
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem className="hidden md:block">
                <BreadcrumbLink href="/">首页</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator className="hidden md:block" />
              <BreadcrumbItem>
                <BreadcrumbPage>{currentMenu.name}</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
      </header>
      <div className="flex flex-1 flex-col gap-4 p-4">
        <div className="h-full flex items-center justify-center rounded-xl border bg-muted/50">
          <div className="text-center text-muted-foreground">
            <div className="text-6xl mb-4">🚧</div>
            <p className="text-lg font-medium">编辑器正在开发中</p>
            <p className="text-sm mt-2">当前菜单：{currentMenu.name}</p>
            <p className="text-xs text-muted-foreground mt-1">
              {currentMenu.size} 格 • {currentMenu.type}
            </p>
          </div>
        </div>
      </div>
    </SidebarInset>
  );
}
