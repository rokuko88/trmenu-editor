"use client";

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

export default function SettingsPage() {
  return (
    <SidebarInset>
      <header className="bg-background/95 supports-backdrop-filter:bg-background/60 flex h-14 shrink-0 items-center gap-2 border-b backdrop-blur">
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
                <BreadcrumbPage>设置</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
      </header>
      <div className="flex flex-1 flex-col gap-4 p-4">
        <div className="bg-muted/50 flex h-full items-center justify-center rounded-xl border">
          <div className="text-muted-foreground text-center">
            <div className="mb-4 text-6xl">⚙️</div>
            <p className="text-lg font-medium">设置页面</p>
            <p className="mt-2 text-sm">即将推出</p>
          </div>
        </div>
      </div>
    </SidebarInset>
  );
}
