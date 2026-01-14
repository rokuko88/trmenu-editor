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
      <div className="inline-flex h-9 items-center justify-center rounded-lg bg-muted p-1 text-muted-foreground w-full">
        <button
          onClick={() => setTheme("light")}
          className={`inline-flex items-center justify-center whitespace-nowrap rounded-md px-3 py-1.5 text-xs font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 flex-1 ${
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
          className={`inline-flex items-center justify-center whitespace-nowrap rounded-md px-3 py-1.5 text-xs font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 flex-1 ${
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
          className={`inline-flex items-center justify-center whitespace-nowrap rounded-md px-3 py-1.5 text-xs font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 flex-1 ${
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
