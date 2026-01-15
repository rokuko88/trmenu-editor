import MenuEditorClient from "./menu-editor-client";

// 为静态导出生成路由参数
// Next.js 在构建时会为这个路由创建静态页面
export function generateStaticParams() {
  // 返回一个占位路径
  // 实际的菜单路由在客户端通过 404.html 重定向处理
  return [{ id: "default" }];
}

export default function MenuEditorPage() {
  return <MenuEditorClient />;
}
