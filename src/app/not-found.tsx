"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";

export default function NotFound() {
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // 如果路径匹配 /menu/* 模式，重定向到 /menu/default，然后由客户端处理
    if (pathname && pathname.startsWith("/menu/")) {
      // 在客户端，实际的菜单 ID 会从 URL 中解析并从 localStorage 加载
      // 这里我们只需要加载页面，页面组件会处理剩余逻辑
      const menuId = pathname.split("/menu/")[1];
      if (menuId && menuId !== "default") {
        // 使用 replace 而不是 push，避免影响浏览器历史
        router.replace("/menu/default");
      }
    }
  }, [pathname, router]);

  return (
    <div className="flex h-screen items-center justify-center">
      <div className="text-center">
        <h1 className="mb-4 text-4xl font-bold">404</h1>
        <p className="text-muted-foreground mb-4">页面未找到</p>
        <Link href="/" className="text-primary hover:underline">
          返回首页
        </Link>
      </div>
    </div>
  );
}
