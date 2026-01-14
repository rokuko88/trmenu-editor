"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

/**
 * 处理 GitHub Pages 的客户端路由恢复
 * 当通过 404.html 重定向回来时，恢复原始路径
 */
export function RouteHandler() {
  const router = useRouter();

  useEffect(() => {
    // 检查是否有需要恢复的路径
    const redirectPath = sessionStorage.getItem("redirectPath");

    if (redirectPath) {
      // 清除存储的路径
      sessionStorage.removeItem("redirectPath");

      // 恢复到原始路径
      router.replace(redirectPath);
    }
  }, [router]);

  return null;
}
