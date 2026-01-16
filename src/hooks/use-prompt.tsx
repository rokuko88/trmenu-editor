"use client";

import { useState, useCallback } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface PromptOptions {
  title?: string;
  description?: string;
  defaultValue?: string;
  placeholder?: string;
  confirmText?: string;
  cancelText?: string;
  required?: boolean;
}

export function usePrompt() {
  const [isOpen, setIsOpen] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const [options, setOptions] = useState<PromptOptions>({});
  const [resolvePromise, setResolvePromise] = useState<
    ((value: string | null) => void) | null
  >(null);

  const prompt = useCallback(
    (
      descriptionOrOptions: string | PromptOptions,
      defaultValue?: string
    ): Promise<string | null> => {
      let promptOptions: PromptOptions;

      if (typeof descriptionOrOptions === "string") {
        promptOptions = {
          description: descriptionOrOptions,
          defaultValue: defaultValue || "",
        };
      } else {
        promptOptions = descriptionOrOptions;
      }

      setOptions({
        title: promptOptions.title || "请输入",
        confirmText: promptOptions.confirmText || "确认",
        cancelText: promptOptions.cancelText || "取消",
        required: promptOptions.required !== false,
        ...promptOptions,
      });
      setInputValue(promptOptions.defaultValue || "");
      setIsOpen(true);

      return new Promise<string | null>((resolve) => {
        setResolvePromise(() => resolve);
      });
    },
    []
  );

  const handleConfirm = useCallback(() => {
    if (options.required && !inputValue.trim()) {
      return;
    }
    setIsOpen(false);
    resolvePromise?.(inputValue);
    setResolvePromise(null);
    setInputValue("");
  }, [inputValue, options.required, resolvePromise]);

  const handleCancel = useCallback(() => {
    setIsOpen(false);
    resolvePromise?.(null);
    setResolvePromise(null);
    setInputValue("");
  }, [resolvePromise]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "Enter") {
        e.preventDefault();
        handleConfirm();
      } else if (e.key === "Escape") {
        e.preventDefault();
        handleCancel();
      }
    },
    [handleConfirm, handleCancel]
  );

  const PromptDialog = (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{options.title}</DialogTitle>
          {options.description && (
            <DialogDescription>{options.description}</DialogDescription>
          )}
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="prompt-input">
              {options.description || "请输入内容"}
              {options.required && (
                <span className="text-destructive ml-1">*</span>
              )}
            </Label>
            <Input
              id="prompt-input"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={options.placeholder}
              autoFocus
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={handleCancel}>
            {options.cancelText}
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={options.required && !inputValue.trim()}
          >
            {options.confirmText}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );

  return { prompt, PromptDialog };
}
