"use client";

import { Sun, Moon, Monitor } from "lucide-react";
import { useTheme } from "next-themes";

interface ThemeSwitcherProps {
  className?: string;
}

export function ThemeSwitcher({ className }: ThemeSwitcherProps) {
  const { theme, setTheme } = useTheme();

  return (
    <div className={className}>
      <div className="bg-muted text-muted-foreground inline-flex h-9 w-full items-center justify-center rounded-lg p-1">
        <button
          onClick={() => setTheme("light")}
          className={`ring-offset-background focus-visible:ring-ring inline-flex flex-1 items-center justify-center rounded-md px-3 py-1.5 text-xs font-medium whitespace-nowrap transition-all focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50 ${
            theme === "light"
              ? "bg-background text-foreground shadow-sm"
              : "hover:bg-muted-foreground/10"
          }`}
          title="亮色模式"
        >
          <Sun className="h-3.5 w-3.5" />
        </button>
        <button
          onClick={() => setTheme("dark")}
          className={`ring-offset-background focus-visible:ring-ring inline-flex flex-1 items-center justify-center rounded-md px-3 py-1.5 text-xs font-medium whitespace-nowrap transition-all focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50 ${
            theme === "dark"
              ? "bg-background text-foreground shadow-sm"
              : "hover:bg-muted-foreground/10"
          }`}
          title="暗色模式"
        >
          <Moon className="h-3.5 w-3.5" />
        </button>
        <button
          onClick={() => setTheme("system")}
          className={`ring-offset-background focus-visible:ring-ring inline-flex flex-1 items-center justify-center rounded-md px-3 py-1.5 text-xs font-medium whitespace-nowrap transition-all focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50 ${
            theme === "system"
              ? "bg-background text-foreground shadow-sm"
              : "hover:bg-muted-foreground/10"
          }`}
          title="跟随系统"
        >
          <Monitor className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
}
