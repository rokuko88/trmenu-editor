import { Plugin } from "@/types/plugin";
import { Package, Palette } from "lucide-react";
import { ItemAssetsPlugin } from "./item-assets-plugin";
import { ColorSchemePlugin } from "./color-scheme-plugin";

// 注册所有可用的插件
export const AVAILABLE_PLUGINS: Plugin[] = [
  {
    id: "item-assets",
    name: "物品资产库",
    description: "保存和管理常用物品模板",
    icon: Package,
    component: ItemAssetsPlugin,
    order: 1,
  },
  // {
  //   id: "templates",
  //   name: "菜单模板",
  //   description: "快速应用预设的菜单布局",
  //   icon: FileText,
  //   // component: TemplatesPlugin,
  //   component: () => null,
  //   order: 2,
  // },
  // {
  //   id: "quick-actions",
  //   name: "快捷操作",
  //   description: "一键生成常用布局和装饰",
  //   icon: Wand2,
  //   component: () => null,
  //   order: 3,
  // },
  {
    id: "color-scheme",
    name: "配色方案",
    description: "应用美丽的配色主题",
    icon: Palette,
    component: ColorSchemePlugin,
    order: 4,
  },
];

export { ItemAssetsPlugin, ColorSchemePlugin };
