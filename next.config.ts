import type { NextConfig } from "next";

const isProd = process.env.NODE_ENV === "production";

const nextConfig: NextConfig = {
  // 只在生产环境启用静态导出（用于 GitHub Pages）
  // 开发环境使用正常的 SSR 模式，支持动态路由
  ...(isProd && { output: "export" }),

  // 只在生产环境使用 basePath（GitHub Pages 子路径部署）
  basePath: isProd ? "/trmenu-editor" : "",

  // GitHub Pages 不支持图片优化
  images: {
    unoptimized: true,
  },

  // 禁用严格模式（可选）
  // reactStrictMode: true,
};

export default nextConfig;
