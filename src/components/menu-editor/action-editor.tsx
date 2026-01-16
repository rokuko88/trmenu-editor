"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import {
  Plus,
  Trash2,
  Edit,
  ChevronDown,
  ChevronRight,
  Command,
  MousePointer,
  X as CloseIcon,
  MessageSquare,
  ArrowUpDown,
  Shield,
  LucideIcon,
} from "lucide-react";
import type {
  MenuAction,
  ClickType,
  ActionType,
  ActionCondition,
} from "@/types";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useConfirm } from "@/hooks/use-confirm";
import { toast } from "sonner";

interface ActionEditorProps {
  actions: MenuAction[];
  onUpdate: (actions: MenuAction[]) => void;
}

export function ActionEditor({ actions, onUpdate }: ActionEditorProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingAction, setEditingAction] = useState<MenuAction | null>(null);
  const { confirm, ConfirmDialog } = useConfirm();

  const handleAddAction = () => {
    setEditingAction({
      id: `action-${Date.now()}`,
      type: "COMMAND",
      clickType: "ALL",
      value: "",
      priority: 0,
      conditions: [],
    });
    setIsDialogOpen(true);
  };

  const handleEditAction = (action: MenuAction) => {
    setEditingAction({ ...action });
    setIsDialogOpen(true);
  };

  const handleSaveAction = (action: MenuAction) => {
    const existingIndex = actions.findIndex((a) => a.id === action.id);
    if (existingIndex >= 0) {
      // 更新现有动作
      const newActions = [...actions];
      newActions[existingIndex] = action;
      onUpdate(newActions);
    } else {
      // 添加新动作
      onUpdate([...actions, action]);
    }
    setIsDialogOpen(false);
    setEditingAction(null);
  };

  const handleDeleteAction = async (actionId: string) => {
    const shouldDelete = await confirm({
      title: "删除动作",
      description: "确定要删除这个动作吗？",
      variant: "destructive",
      confirmText: "删除",
    });
    if (shouldDelete) {
      onUpdate(actions.filter((a) => a.id !== actionId));
    }
  };

  const handleMoveAction = (index: number, direction: "up" | "down") => {
    const newActions = [...actions];
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= newActions.length) return;

    [newActions[index], newActions[targetIndex]] = [
      newActions[targetIndex],
      newActions[index],
    ];
    onUpdate(newActions);
  };

  return (
    <div className="space-y-2">
      {/* 动作列表 */}
      {actions.length > 0 && (
        <div className="space-y-1.5">
          {actions.map((action, index) => (
            <ActionItem
              key={action.id}
              action={action}
              index={index}
              total={actions.length}
              onEdit={() => handleEditAction(action)}
              onDelete={() => handleDeleteAction(action.id)}
              onMoveUp={() => handleMoveAction(index, "up")}
              onMoveDown={() => handleMoveAction(index, "down")}
            />
          ))}
        </div>
      )}

      {/* 添加按钮 */}
      <Button
        variant="outline"
        size="sm"
        className="h-9 w-full text-sm"
        onClick={handleAddAction}
      >
        <Plus className="mr-2 h-4 w-4" />
        添加动作
      </Button>

      {/* 动作编辑对话框 */}
      {editingAction && (
        <ActionEditDialog
          action={editingAction}
          open={isDialogOpen}
          onOpenChange={setIsDialogOpen}
          onSave={handleSaveAction}
        />
      )}

      {/* Modal Dialog */}
      {ConfirmDialog}
    </div>
  );
}

// 动作项组件
function ActionItem({
  action,
  index,
  total,
  onEdit,
  onDelete,
  onMoveUp,
  onMoveDown,
}: {
  action: MenuAction;
  index: number;
  total: number;
  onEdit: () => void;
  onDelete: () => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
}) {
  const [isExpanded, setIsExpanded] = useState(false);

  const getActionData = (
    type: ActionType
  ): { icon: LucideIcon; label: string } => {
    switch (type) {
      case "COMMAND":
        return { icon: Command, label: "执行命令" };
      case "OPEN_MENU":
        return { icon: MousePointer, label: "打开菜单" };
      case "CLOSE":
        return { icon: CloseIcon, label: "关闭菜单" };
      case "MESSAGE":
        return { icon: MessageSquare, label: "发送消息" };
    }
  };

  const getClickTypeLabel = (clickType: ClickType) => {
    switch (clickType) {
      case "ALL":
        return "所有点击";
      case "LEFT":
        return "左键";
      case "RIGHT":
        return "右键";
      case "SHIFT_LEFT":
        return "Shift+左键";
      case "SHIFT_RIGHT":
        return "Shift+右键";
    }
  };

  const actionData = getActionData(action.type);
  const ActionIcon = actionData.icon;

  return (
    <Collapsible open={isExpanded} onOpenChange={setIsExpanded}>
      <div className="group bg-card hover:bg-accent/50 rounded-md border transition-colors">
        <div className="flex items-center gap-2 p-2">
          {/* 展开/收起按钮 */}
          <CollapsibleTrigger asChild>
            <Button variant="ghost" size="icon" className="h-6 w-6 shrink-0">
              {isExpanded ? (
                <ChevronDown className="h-3 w-3" />
              ) : (
                <ChevronRight className="h-3 w-3" />
              )}
            </Button>
          </CollapsibleTrigger>

          {/* 动作图标和类型 */}
          <div className="flex min-w-0 flex-1 items-center gap-1.5">
            <ActionIcon className="text-primary h-3.5 w-3.5 shrink-0" />
            <span className="truncate text-xs font-medium">
              {actionData.label}
            </span>
            {action.priority && action.priority > 0 && (
              <Badge variant="secondary" className="h-4 px-1 text-[9px]">
                P{action.priority}
              </Badge>
            )}
            {action.conditions && action.conditions.length > 0 && (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger>
                    <Shield className="h-3 w-3 text-yellow-500" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="text-xs">
                      有 {action.conditions.length} 个条件
                    </p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}
          </div>

          {/* 操作按钮 */}
          <div className="flex items-center gap-0.5 opacity-0 transition-opacity group-hover:opacity-100">
            {/* 上移 */}
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6"
                    onClick={onMoveUp}
                    disabled={index === 0}
                  >
                    <ChevronDown className="h-3 w-3 rotate-180" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>上移</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>

            {/* 下移 */}
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6"
                    onClick={onMoveDown}
                    disabled={index === total - 1}
                  >
                    <ChevronDown className="h-3 w-3" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>下移</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>

            {/* 编辑 */}
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6"
                    onClick={onEdit}
                  >
                    <Edit className="h-3 w-3" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>编辑</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>

            {/* 删除 */}
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-destructive hover:text-destructive h-6 w-6"
                    onClick={onDelete}
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>删除</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </div>

        {/* 展开内容 */}
        <CollapsibleContent>
          <div className="mt-1 space-y-1 border-t px-2 pt-2 pb-2">
            <div className="text-muted-foreground space-y-0.5 text-[10px]">
              <div className="flex items-center gap-1">
                <span className="font-medium">点击类型:</span>
                <Badge variant="outline" className="h-4 text-[9px]">
                  {getClickTypeLabel(action.clickType)}
                </Badge>
              </div>
              <div className="flex items-start gap-1">
                <span className="shrink-0 font-medium">值:</span>
                <span className="font-mono break-all">
                  {action.value || "无"}
                </span>
              </div>
            </div>
          </div>
        </CollapsibleContent>
      </div>
    </Collapsible>
  );
}

// 动作编辑对话框
function ActionEditDialog({
  action,
  open,
  onOpenChange,
  onSave,
}: {
  action: MenuAction;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (action: MenuAction) => void;
}) {
  const [editedAction, setEditedAction] = useState<MenuAction>(action);

  const handleSave = () => {
    // 验证
    if (!editedAction.value && editedAction.type !== "CLOSE") {
      toast.error("请输入动作值");
      return;
    }
    onSave(editedAction);
  };

  const handleAddCondition = () => {
    setEditedAction({
      ...editedAction,
      conditions: [
        ...(editedAction.conditions || []),
        { type: "require", expression: "" },
      ],
    });
  };

  const handleUpdateCondition = (
    index: number,
    updates: Partial<ActionCondition>
  ) => {
    const newConditions = [...(editedAction.conditions || [])];
    newConditions[index] = { ...newConditions[index], ...updates };
    setEditedAction({ ...editedAction, conditions: newConditions });
  };

  const handleDeleteCondition = (index: number) => {
    const newConditions = (editedAction.conditions || []).filter(
      (_, i) => i !== index
    );
    setEditedAction({ ...editedAction, conditions: newConditions });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex max-h-[90vh] max-w-2xl flex-col">
        <DialogHeader>
          <DialogTitle>{action.value ? "编辑动作" : "添加动作"}</DialogTitle>
          <DialogDescription>配置物品点击时执行的动作</DialogDescription>
        </DialogHeader>

        <ScrollArea className="flex-1 pr-4">
          <div className="space-y-4 py-4">
            {/* 动作类型 */}
            <div className="space-y-2">
              <Label htmlFor="action-type">动作类型</Label>
              <Select
                value={editedAction.type}
                onValueChange={(value: ActionType) =>
                  setEditedAction({ ...editedAction, type: value })
                }
              >
                <SelectTrigger id="action-type">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="COMMAND">执行命令 (COMMAND)</SelectItem>
                  <SelectItem value="OPEN_MENU">
                    打开菜单 (OPEN_MENU)
                  </SelectItem>
                  <SelectItem value="CLOSE">关闭菜单 (CLOSE)</SelectItem>
                  <SelectItem value="MESSAGE">发送消息 (MESSAGE)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* 点击类型 */}
            <div className="space-y-2">
              <Label htmlFor="click-type">点击类型</Label>
              <Select
                value={editedAction.clickType}
                onValueChange={(value: ClickType) =>
                  setEditedAction({ ...editedAction, clickType: value })
                }
              >
                <SelectTrigger id="click-type">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">所有点击 (ALL)</SelectItem>
                  <SelectItem value="LEFT">左键点击 (LEFT)</SelectItem>
                  <SelectItem value="RIGHT">右键点击 (RIGHT)</SelectItem>
                  <SelectItem value="SHIFT_LEFT">
                    Shift + 左键 (SHIFT_LEFT)
                  </SelectItem>
                  <SelectItem value="SHIFT_RIGHT">
                    Shift + 右键 (SHIFT_RIGHT)
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* 动作值 */}
            {editedAction.type !== "CLOSE" && (
              <div className="space-y-2">
                <Label htmlFor="action-value">
                  {editedAction.type === "COMMAND" && "命令"}
                  {editedAction.type === "OPEN_MENU" && "菜单名称"}
                  {editedAction.type === "MESSAGE" && "消息内容"}
                </Label>
                <Input
                  id="action-value"
                  value={editedAction.value}
                  onChange={(e) =>
                    setEditedAction({ ...editedAction, value: e.target.value })
                  }
                  placeholder={
                    editedAction.type === "COMMAND"
                      ? "例如: give {player} diamond 1"
                      : editedAction.type === "OPEN_MENU"
                        ? "例如: shop"
                        : "例如: §a操作成功！"
                  }
                  className="font-mono text-sm"
                />
                <p className="text-muted-foreground text-xs">
                  {editedAction.type === "COMMAND" &&
                    "支持变量：{player}, {uuid}, {world} 等"}
                  {editedAction.type === "OPEN_MENU" &&
                    "填写要打开的菜单配置文件名（不含 .yml）"}
                  {editedAction.type === "MESSAGE" && "支持颜色代码 § 和变量"}
                </p>
              </div>
            )}

            {/* 优先级 */}
            <div className="space-y-2">
              <Label htmlFor="priority" className="flex items-center gap-2">
                <ArrowUpDown className="h-3.5 w-3.5" />
                优先级（可选）
              </Label>
              <Input
                id="priority"
                type="number"
                value={editedAction.priority || 0}
                onChange={(e) =>
                  setEditedAction({
                    ...editedAction,
                    priority: Number(e.target.value),
                  })
                }
                min={0}
                max={100}
              />
              <p className="text-muted-foreground text-xs">
                数字越大优先级越高，默认为 0
              </p>
            </div>

            {/* 条件列表 */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label className="flex items-center gap-2">
                  <Shield className="h-3.5 w-3.5" />
                  执行条件（可选）
                </Label>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleAddCondition}
                  className="h-7 text-xs"
                >
                  <Plus className="mr-1 h-3 w-3" />
                  添加条件
                </Button>
              </div>

              {editedAction.conditions &&
                editedAction.conditions.length > 0 && (
                  <div className="bg-muted/30 space-y-2 rounded-md border p-3">
                    {editedAction.conditions.map((condition, index) => (
                      <div
                        key={index}
                        className="bg-background space-y-2 rounded border p-2"
                      >
                        <div className="flex items-center gap-2">
                          <Select
                            value={condition.type}
                            onValueChange={(value: "require" | "deny") =>
                              handleUpdateCondition(index, { type: value })
                            }
                          >
                            <SelectTrigger className="h-7 w-28">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="require">需要满足</SelectItem>
                              <SelectItem value="deny">禁止满足</SelectItem>
                            </SelectContent>
                          </Select>
                          <Input
                            value={condition.expression}
                            onChange={(e) =>
                              handleUpdateCondition(index, {
                                expression: e.target.value,
                              })
                            }
                            placeholder="Kether 表达式，例如: perm *admin"
                            className="h-7 flex-1 font-mono text-xs"
                          />
                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-destructive h-7 w-7"
                            onClick={() => handleDeleteCondition(index)}
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                        <p className="text-muted-foreground text-[10px]">
                          {condition.type === "require"
                            ? "玩家必须满足此条件才能执行动作"
                            : "玩家满足此条件则禁止执行动作"}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
            </div>
          </div>
        </ScrollArea>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            取消
          </Button>
          <Button onClick={handleSave}>保存动作</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
