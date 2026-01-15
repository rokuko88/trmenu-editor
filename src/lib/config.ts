/**
 * 应用配置
 */

// GitHub Pages 部署的 basePath
export const BASE_PATH =
  process.env.NODE_ENV === "production" ? "/trmenu-editor" : "";

/**
 * 获取完整的资源路径
 * @param path 相对路径（以 / 开头）
 * @returns 完整的路径
 */
export function getAssetPath(path: string): string {
  return `${BASE_PATH}${path}`;
}
