"use client";

import { useEffect, useState } from "react";
import Editor from "@monaco-editor/react";
import type { MenuConfig } from "@/types";
import { exportMenuToYAML } from "@/lib/yaml-exporter";

interface CodeEditorProps {
  menu: MenuConfig;
  onSave?: (yamlContent: string) => void;
}

export function CodeEditor({ menu, onSave }: CodeEditorProps) {
  const [code, setCode] = useState("");
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    // 检测主题
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    setIsDark(mediaQuery.matches);

    const handleChange = (e: MediaQueryListEvent) => setIsDark(e.matches);
    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, []);

  useEffect(() => {
    // 生成 YAML 代码
    try {
      const yaml = exportMenuToYAML(menu);
      setCode(yaml);
    } catch (error) {
      console.error("生成 YAML 失败:", error);
      setCode(
        "# 生成 YAML 失败\n# " +
          (error instanceof Error ? error.message : "未知错误")
      );
    }
  }, [menu]);

  const handleEditorChange = (value: string | undefined) => {
    if (value !== undefined) {
      setCode(value);
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
