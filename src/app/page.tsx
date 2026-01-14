"use client";

import { useRouter } from "next/navigation";
import { SidebarInset } from "@/components/ui/sidebar";
import WelcomePage from "@/components/welcome-page";
import { useMenuContext } from "@/contexts/menu-context";

export default function Home() {
  const router = useRouter();
  const { createMenu } = useMenuContext();

  // 创建空白菜单
  const handleCreateBlank = () => {
    const menuId = createMenu();
    router.push(`/menu/${menuId}`);
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
