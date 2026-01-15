/**
 * 应用配置
 */

// 是否为生产环境
export const IS_PRODUCTION = process.env.NODE_ENV === "production";

// GitHub Pages 部署的 basePath
export const BASE_PATH = IS_PRODUCTION ? "/trmenu-editor" : "";

/**
 * 获取完整的资源路径
 * @param path 相对路径（以 / 开头）
 * @returns 完整的路径
 */
export function getAssetPath(path: string): string {
  return `${BASE_PATH}${path}`;
}

/**
 * 导航到菜单页面（处理 GitHub Pages 路由兼容）
 * @param menuId 菜单 ID
 * @returns 路由路径
 */
export function navigateToMenu(menuId: string): string {
  if (IS_PRODUCTION) {
    // 生产环境：使用 sessionStorage + default 路由
    sessionStorage.setItem("targetMenuId", menuId);
    return "/menu/default";
  } else {
    // 开发环境：直接使用真实路由
    return `/menu/${menuId}`;
  }
}
