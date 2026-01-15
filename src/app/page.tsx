"use client";

import { useRouter } from "next/navigation";
import { SidebarInset } from "@/components/ui/sidebar";
import WelcomePage from "@/components/welcome-page";
import { useMenuStore } from "@/store/menu-store";

export default function Home() {
  const router = useRouter();
  const createMenu = useMenuStore((state) => state.createMenu);

  // 创建空白菜单
  const handleCreateBlank = () => {
    const menuId = createMenu();
    // 存储目标菜单 ID（GitHub Pages 兼容）
    sessionStorage.setItem("targetMenuId", menuId);
    // 统一跳转到 default 路由
    router.push("/menu/default");
  };

  // 导入菜单
  const handleImportMenu = () => {
    // TODO: 实现文件选择和 YAML 解析
    alert("导入功能即将推出！");
  };

  return (
    <SidebarInset>
      <WelcomePage
        onCreateBlank={handleCreateBlank}
        onImportMenu={handleImportMenu}
      />
    </SidebarInset>
  );
}
