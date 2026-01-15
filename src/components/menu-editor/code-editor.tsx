"use client";

import { useMemo, useState } from "react";
import { useTheme } from "next-themes";
import Editor from "@monaco-editor/react";
import type { MenuConfig } from "@/types";
import { exportMenuToYAML } from "@/lib/yaml-exporter";

interface CodeEditorProps {
  menu: MenuConfig;
  onSave?: (yamlContent: string) => void;
}

export function CodeEditor({ menu, onSave }: CodeEditorProps) {
  const { theme, resolvedTheme } = useTheme();
  const [localCode, setLocalCode] = useState<string | null>(null);

  // 确定当前是否为暗黑模式
  const isDark = theme === "dark" || resolvedTheme === "dark";

  // 使用 useMemo 生成 YAML 代码，避免在 effect 中 setState
  const code = useMemo(() => {
    // 如果用户编辑过，使用本地编辑的代码
    if (localCode !== null) {
      return localCode;
    }

    // 否则从 menu 生成 YAML
    try {
      return exportMenuToYAML(menu);
    } catch (error) {
      console.error("生成 YAML 失败:", error);
      return (
        "# 生成 YAML 失败\n# " +
        (error instanceof Error ? error.message : "未知错误")
      );
    }
  }, [menu, localCode]);

  const handleEditorChange = (value: string | undefined) => {
    if (value !== undefined) {
      setLocalCode(value);
      onSave?.(value);
    }
  };

  return (
    <div className="h-full w-full">
      <Editor
        height="100%"
        defaultLanguage="yaml"
        value={code}
        onChange={handleEditorChange}
        theme={isDark ? "vs-dark" : "vs-light"}
        options={{
          minimap: { enabled: false },
          fontSize: 13,
          lineNumbers: "on",
          scrollBeyondLastLine: false,
          automaticLayout: true,
          tabSize: 2,
          insertSpaces: true,
          wordWrap: "on",
          readOnly: false,
          scrollbar: {
            verticalScrollbarSize: 8,
            horizontalScrollbarSize: 8,
          },
        }}
      />
    </div>
  );
}
