"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Trash2, Edit2, Plus, Check, X } from "lucide-react";
import { useVariablesStore } from "@/store/variables-store";
import { useMenuStore } from "@/store/menu-store";
import type { Variable } from "@/types";
import { toast } from "sonner";

interface VariablesManagerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  menuId?: string;
}

interface EditingVariable {
  id: string | null;
  key: string;
  value: string;
  description: string;
}

export function VariablesManager({
  open,
  onOpenChange,
  menuId,
}: VariablesManagerProps) {
  const {
    globalVariables,
    createGlobalVariable,
    updateGlobalVariable,
    deleteGlobalVariable,
  } = useVariablesStore();
  const { menus, createMenuVariable, updateMenuVariable, deleteMenuVariable } =
    useMenuStore();

  const [editingGlobal, setEditingGlobal] = useState<EditingVariable | null>(
    null
  );
  const [editingMenu, setEditingMenu] = useState<EditingVariable | null>(null);

  // 获取当前菜单
  const currentMenu = menuId ? menus.find((m) => m.id === menuId) : null;
  const menuVariables = currentMenu?.variables || [];

  // 开始编辑全局变量
  const startEditGlobal = (variable?: Variable) => {
    if (variable) {
      setEditingGlobal({
        id: variable.id,
        key: variable.key,
        value: variable.value,
        description: variable.description || "",
      });
    } else {
      setEditingGlobal({
        id: null,
        key: "",
        value: "",
        description: "",
      });
    }
  };

  // 开始编辑菜单变量
  const startEditMenu = (variable?: Variable) => {
    if (variable) {
      setEditingMenu({
        id: variable.id,
        key: variable.key,
        value: variable.value,
        description: variable.description || "",
      });
    } else {
      setEditingMenu({
        id: null,
        key: "",
        value: "",
        description: "",
      });
    }
  };

  // 保存全局变量
  const saveGlobalVariable = () => {
    if (!editingGlobal) return;

    if (!editingGlobal.key.trim()) {
      toast.error("变量键名不能为空");
      return;
    }

    try {
      if (editingGlobal.id) {
        updateGlobalVariable(editingGlobal.id, {
          key: editingGlobal.key.trim(),
          value: editingGlobal.value,
          description: editingGlobal.description || undefined,
        });
        toast.success("全局变量已更新");
      } else {
        createGlobalVariable(
          editingGlobal.key.trim(),
          editingGlobal.value,
          editingGlobal.description || undefined
        );
        toast.success("全局变量已创建");
      }
      setEditingGlobal(null);
    } catch (error) {
      toast.error((error as Error).message);
    }
  };

  // 保存菜单变量
  const saveMenuVariable = () => {
    if (!editingMenu || !menuId) return;

    if (!editingMenu.key.trim()) {
      toast.error("变量键名不能为空");
      return;
    }

    try {
      if (editingMenu.id) {
        updateMenuVariable(menuId, editingMenu.id, {
          key: editingMenu.key.trim(),
          value: editingMenu.value,
          description: editingMenu.description || undefined,
        });
        toast.success("菜单变量已更新");
      } else {
        createMenuVariable(
          menuId,
          editingMenu.key.trim(),
          editingMenu.value,
          editingMenu.description || undefined
        );
        toast.success("菜单变量已创建");
      }
      setEditingMenu(null);
    } catch (error) {
      toast.error((error as Error).message);
    }
  };

  // 删除全局变量
  const handleDeleteGlobal = (id: string) => {
    if (confirm("确定要删除这个全局变量吗？")) {
      deleteGlobalVariable(id);
      toast.success("全局变量已删除");
    }
  };

  // 删除菜单变量
  const handleDeleteMenu = (id: string) => {
    if (!menuId) return;
    if (confirm("确定要删除这个菜单变量吗？")) {
      deleteMenuVariable(menuId, id);
      toast.success("菜单变量已删除");
    }
  };

  // 渲染变量表格
  const renderVariableTable = (
    variables: Variable[],
    editingState: EditingVariable | null,
    onEdit: (variable?: Variable) => void,
    onSave: () => void,
    onCancel: () => void,
    onDelete: (id: string) => void,
    onChange: (field: keyof EditingVariable, value: string) => void
  ) => {
    return (
      <div className="space-y-2">
        {/* 添加按钮 */}
        <div className="flex items-center justify-between">
          <Button onClick={() => onEdit()} disabled={editingState !== null}>
            <Plus className="h-4 w-4" />
            添加变量
          </Button>
        </div>

        {/* 变量表格 */}
        <div className="rounded-sm border">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead>键名</TableHead>
                <TableHead>值</TableHead>
                <TableHead>描述</TableHead>
                <TableHead className="pr-2 text-right">操作</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {/* 新建行 */}
              {editingState?.id === null && (
                <TableRow className="bg-secondary/50">
                  <TableCell className="py-1">
                    <Input
                      value={editingState.key}
                      onChange={(e) => onChange("key", e.target.value)}
                      placeholder="例如: SERVER_NAME"
                      autoFocus
                    />
                  </TableCell>
                  <TableCell className="py-1">
                    <Input
                      value={editingState.value}
                      onChange={(e) => onChange("value", e.target.value)}
                      placeholder="变量值"
                    />
                  </TableCell>
                  <TableCell className="py-1">
                    <Input
                      value={editingState.description}
                      onChange={(e) => onChange("description", e.target.value)}
                      placeholder="变量描述（可选）"
                    />
                  </TableCell>
                  <TableCell className="py-1 pr-2 text-right">
                    <div className="flex justify-end gap-2">
                      <Button size="sm" onClick={onSave}>
                        <Check className="h-4 w-4" />
                        保存
                      </Button>
                      <Button size="sm" variant="outline" onClick={onCancel}>
                        <X className="h-4 w-4" />
                        取消
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              )}

              {/* 现有变量行 */}
              {variables.map((variable) => {
                const isEditing = editingState?.id === variable.id;

                if (isEditing && editingState) {
                  return (
                    <TableRow key={variable.id} className="bg-secondary/50">
                      <TableCell className="py-1">
                        <Input
                          value={editingState.key}
                          onChange={(e) => onChange("key", e.target.value)}
                          placeholder="变量键名"
                        />
                      </TableCell>
                      <TableCell className="py-1">
                        <Input
                          value={editingState.value}
                          onChange={(e) => onChange("value", e.target.value)}
                          placeholder="变量值"
                        />
                      </TableCell>
                      <TableCell className="py-1">
                        <Input
                          value={editingState.description}
                          onChange={(e) =>
                            onChange("description", e.target.value)
                          }
                          placeholder="变量描述（可选）"
                        />
                      </TableCell>
                      <TableCell className="py-1 pr-2 text-right">
                        <div className="flex justify-end gap-2">
                          <Button size="sm" onClick={onSave}>
                            <Check className="h-4 w-4" />
                            保存
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={onCancel}
                          >
                            <X className="h-4 w-4" />
                            取消
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                }

                return (
                  <TableRow key={variable.id}>
                    <TableCell className="py-1">
                      <code className="bg-muted rounded px-1.5 py-1 font-mono text-sm font-semibold">
                        {variable.key}
                      </code>
                    </TableCell>
                    <TableCell className="py-1">
                      <span className="text-sm">
                        {variable.value || (
                          <span className="text-muted-foreground italic">
                            （空值）
                          </span>
                        )}
                      </span>
                    </TableCell>
                    <TableCell className="py-1">
                      <span className="text-muted-foreground text-sm">
                        {variable.description || "-"}
                      </span>
                    </TableCell>
                    <TableCell className="py-1 pr-2 text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          size="icon"
                          variant="outline"
                          onClick={() => onEdit(variable)}
                          disabled={editingState !== null}
                          title="编辑"
                        >
                          <Edit2 className="h-2 w-2" />
                        </Button>
                        <Button
                          size="icon"
                          variant="destructive"
                          onClick={() => onDelete(variable.id)}
                          disabled={editingState !== null}
                          title="删除"
                        >
                          <Trash2 className="h-2 w-2" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}

              {/* 空状态 */}
              {variables.length === 0 && editingState === null && (
                <TableRow>
                  <TableCell colSpan={4} className="text-center">
                    <div className="text-muted-foreground flex flex-col items-center gap-3 py-24">
                      <div className="text-sm">暂无变量</div>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => onEdit()}
                      >
                        <Plus className="h-4 w-4" />
                        添加第一个变量
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex max-h-[80vh] min-h-[80vh] w-[90vw] flex-col gap-2 sm:max-w-7xl">
        <DialogHeader>
          <DialogTitle>变量管理</DialogTitle>
          <DialogDescription>
            管理全局变量和菜单变量。这些变量仅在导入/导出时应用。
          </DialogDescription>
        </DialogHeader>
        <Tabs defaultValue="global" className="flex flex-1 flex-col">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="global">
              全局变量 ({globalVariables.length})
            </TabsTrigger>
            <TabsTrigger value="menu" disabled={!menuId}>
              菜单变量 ({menuVariables.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="global" className="flex-1">
            <ScrollArea className="h-full">
              {renderVariableTable(
                globalVariables,
                editingGlobal,
                startEditGlobal,
                saveGlobalVariable,
                () => setEditingGlobal(null),
                handleDeleteGlobal,
                (field, value) =>
                  setEditingGlobal((prev) =>
                    prev ? { ...prev, [field]: value } : null
                  )
              )}
            </ScrollArea>
          </TabsContent>

          <TabsContent value="menu" className="flex-1">
            <ScrollArea className="h-full">
              {menuId ? (
                renderVariableTable(
                  menuVariables,
                  editingMenu,
                  startEditMenu,
                  saveMenuVariable,
                  () => setEditingMenu(null),
                  handleDeleteMenu,
                  (field, value) =>
                    setEditingMenu((prev) =>
                      prev ? { ...prev, [field]: value } : null
                    )
                )
              ) : (
                <div className="text-muted-foreground flex h-64 items-center justify-center text-sm">
                  请先选择一个菜单
                </div>
              )}
            </ScrollArea>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
