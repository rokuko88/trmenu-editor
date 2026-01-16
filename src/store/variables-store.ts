import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { Variable } from "@/types";

interface VariablesStore {
  // 全局变量列表
  globalVariables: Variable[];

  // 操作方法
  createGlobalVariable: (
    key: string,
    value: string,
    description?: string
  ) => void;
  updateGlobalVariable: (
    id: string,
    updates: Partial<Omit<Variable, "id" | "createdAt">>
  ) => void;
  deleteGlobalVariable: (id: string) => void;
  getGlobalVariable: (id: string) => Variable | undefined;
  findGlobalVariableByKey: (key: string) => Variable | undefined;

  // 批量操作
  importGlobalVariables: (variables: Variable[]) => void;
  clearGlobalVariables: () => void;
}

export const useVariablesStore = create<VariablesStore>()(
  persist(
    (set, get) => ({
      // 初始状态
      globalVariables: [],

      // 创建全局变量
      createGlobalVariable: (
        key: string,
        value: string,
        description?: string
      ) => {
        const state = get();

        // 检查键名是否已存在
        const existing = state.globalVariables.find((v) => v.key === key);
        if (existing) {
          throw new Error(`变量键名 "${key}" 已存在`);
        }

        const newVariable: Variable = {
          id: `var-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          key,
          value,
          description,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };

        set({
          globalVariables: [...state.globalVariables, newVariable],
        });
      },

      // 更新全局变量
      updateGlobalVariable: (
        id: string,
        updates: Partial<Omit<Variable, "id" | "createdAt">>
      ) => {
        const state = get();

        // 如果更新了 key，检查是否与其他变量冲突
        if (updates.key) {
          const existing = state.globalVariables.find(
            (v) => v.key === updates.key && v.id !== id
          );
          if (existing) {
            throw new Error(`变量键名 "${updates.key}" 已存在`);
          }
        }

        set({
          globalVariables: state.globalVariables.map((variable) =>
            variable.id === id
              ? {
                  ...variable,
                  ...updates,
                  updatedAt: new Date().toISOString(),
                }
              : variable
          ),
        });
      },

      // 删除全局变量
      deleteGlobalVariable: (id: string) => {
        const state = get();
        set({
          globalVariables: state.globalVariables.filter((v) => v.id !== id),
        });
      },

      // 获取全局变量
      getGlobalVariable: (id: string) => {
        const state = get();
        return state.globalVariables.find((v) => v.id === id);
      },

      // 根据键名查找全局变量
      findGlobalVariableByKey: (key: string) => {
        const state = get();
        return state.globalVariables.find((v) => v.key === key);
      },

      // 导入全局变量
      importGlobalVariables: (variables: Variable[]) => {
        const state = get();
        set({
          globalVariables: [...state.globalVariables, ...variables],
        });
      },

      // 清空全局变量
      clearGlobalVariables: () => {
        set({
          globalVariables: [],
        });
      },
    }),
    {
      name: "trmenu-variables-storage",
      storage: createJSONStorage(() => localStorage),
    }
  )
);
