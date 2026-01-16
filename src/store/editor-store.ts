import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

interface EditorUIState {
  // 属性面板状态
  propertiesPanelWidth: number;
  propertiesPanelCollapsed: boolean;

  // 插件面板状态
  pluginPanelWidth: number;
  pluginPanelExpanded: boolean;
  activePluginId: string | null;

  // 操作方法
  setPropertiesPanelWidth: (width: number) => void;
  setPropertiesPanelCollapsed: (collapsed: boolean) => void;
  togglePropertiesPanel: () => void;

  setPluginPanelWidth: (width: number) => void;
  setPluginPanelExpanded: (expanded: boolean) => void;
  setActivePluginId: (id: string | null) => void;
  togglePluginPanel: (pluginId?: string) => void;
}

export const useEditorStore = create<EditorUIState>()(
  persist(
    (set, get) => ({
      // 默认状态
      propertiesPanelWidth: 320,
      propertiesPanelCollapsed: false,

      pluginPanelWidth: 320,
      pluginPanelExpanded: false,
      activePluginId: null,

      // 属性面板操作
      setPropertiesPanelWidth: (width) => set({ propertiesPanelWidth: width }),

      setPropertiesPanelCollapsed: (collapsed) =>
        set({ propertiesPanelCollapsed: collapsed }),

      togglePropertiesPanel: () =>
        set((state) => ({
          propertiesPanelCollapsed: !state.propertiesPanelCollapsed,
        })),

      // 插件面板操作
      setPluginPanelWidth: (width) => set({ pluginPanelWidth: width }),

      setPluginPanelExpanded: (expanded) =>
        set({ pluginPanelExpanded: expanded }),

      setActivePluginId: (id) => set({ activePluginId: id }),

      togglePluginPanel: (pluginId) => {
        const state = get();
        if (pluginId) {
          // 如果点击的是当前激活的插件，并且面板已展开，则收起
          if (pluginId === state.activePluginId && state.pluginPanelExpanded) {
            set({ pluginPanelExpanded: false });
          } else {
            // 否则切换插件并展开
            set({ activePluginId: pluginId, pluginPanelExpanded: true });
          }
        } else {
          // 如果没有指定插件 ID，则切换展开状态
          set({ pluginPanelExpanded: !state.pluginPanelExpanded });
        }
      },
    }),
    {
      name: "editor-ui-storage",
      storage: createJSONStorage(() => localStorage),
    }
  )
);
