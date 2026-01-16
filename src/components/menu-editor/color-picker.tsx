"use client";

import { useState } from "react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Palette } from "lucide-react";
import { cn } from "@/lib/utils";

interface ColorPickerProps {
  children?: React.ReactNode;
  onColorSelect: (colorCode: string) => void;
}

// Minecraft 传统颜色代码
const MC_COLORS = [
  { code: "§0", name: "黑色", color: "#000000" },
  { code: "§1", name: "深蓝色", color: "#0000AA" },
  { code: "§2", name: "深绿色", color: "#00AA00" },
  { code: "§3", name: "深青色", color: "#00AAAA" },
  { code: "§4", name: "深红色", color: "#AA0000" },
  { code: "§5", name: "紫色", color: "#AA00AA" },
  { code: "§6", name: "金色", color: "#FFAA00" },
  { code: "§7", name: "灰色", color: "#AAAAAA" },
  { code: "§8", name: "深灰色", color: "#555555" },
  { code: "§9", name: "蓝色", color: "#5555FF" },
  { code: "§a", name: "绿色", color: "#55FF55" },
  { code: "§b", name: "青色", color: "#55FFFF" },
  { code: "§c", name: "红色", color: "#FF5555" },
  { code: "§d", name: "粉色", color: "#FF55FF" },
  { code: "§e", name: "黄色", color: "#FFFF55" },
  { code: "§f", name: "白色", color: "#FFFFFF" },
];

// Minecraft 格式代码
const MC_FORMATS = [
  { code: "§k", name: "随机字符", icon: "?" },
  { code: "§l", name: "粗体", icon: "B", style: "font-bold" },
  { code: "§m", name: "删除线", icon: "S", style: "line-through" },
  { code: "§n", name: "下划线", icon: "U", style: "underline" },
  { code: "§o", name: "斜体", icon: "I", style: "italic" },
  { code: "§r", name: "重置", icon: "R" },
];

export function ColorPicker({ children, onColorSelect }: ColorPickerProps) {
  const [hexColor, setHexColor] = useState("#FFFFFF");
  const [gradientStart, setGradientStart] = useState("#FF0000");
  const [gradientEnd, setGradientEnd] = useState("#0000FF");
  const [gradientText, setGradientText] = useState("渐变文字");

  // 处理传统颜色选择
  const handleColorClick = (code: string) => {
    onColorSelect(code);
  };

  // 处理格式代码选择
  const handleFormatClick = (code: string) => {
    onColorSelect(code);
  };

  // 处理六进制颜色
  const handleHexColorApply = () => {
    // 转换为 Minecraft 六进制格式：&#RRGGBB
    const hex = hexColor.replace("#", "");
    const mcHexCode = `&#${hex}`;
    onColorSelect(mcHexCode);
  };

  // 处理渐变色
  const handleGradientApply = () => {
    const start = gradientStart.replace("#", "");
    const end = gradientEnd.replace("#", "");
    const gradientCode = `<gradient:#${start}:#${end}>${gradientText}</gradient>`;
    onColorSelect(gradientCode);
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        {children || (
          <Button variant="outline" size="icon" className="h-9 w-9 shrink-0">
            <Palette className="h-4 w-4" />
          </Button>
        )}
      </PopoverTrigger>
      <PopoverContent className="w-64" align="start">
        <div className="space-y-2">
          <h4 className="font-medium text-sm">调色盘</h4>

          <Tabs defaultValue="colors" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="colors" className="text-xs">
                颜色
              </TabsTrigger>
              <TabsTrigger value="formats" className="text-xs">
                格式
              </TabsTrigger>
              <TabsTrigger value="hex" className="text-xs">
                十六进制
              </TabsTrigger>
              <TabsTrigger value="gradient" className="text-xs">
                渐变
              </TabsTrigger>
            </TabsList>

            {/* 传统颜色代码 */}
            <TabsContent value="colors" className="space-y-3">
              <div className="grid grid-cols-8 gap-1">
                {MC_COLORS.map((color) => (
                  <Button
                    key={color.code}
                    variant="outline"
                    size="icon"
                    onClick={() => handleColorClick(color.code)}
                    className="group relative aspect-square rounded-sm border-2 border-transparent hover:border-primary transition-colors overflow-hidden p-0 size-6"
                    style={{ backgroundColor: color.color }}
                    title={`${color.name} (${color.code})`}
                  >
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <span className="text-white text-xs font-mono">
                        {color.code}
                      </span>
                    </div>
                  </Button>
                ))}
              </div>
            </TabsContent>

            {/* 格式代码 */}
            <TabsContent value="formats" className="space-y-3">
              <div className="grid grid-cols-3 gap-2">
                {MC_FORMATS.map((format) => (
                  <Button
                    key={format.code}
                    variant="outline"
                    size="sm"
                    onClick={() => handleFormatClick(format.code)}
                    className="h-16 flex flex-col items-center justify-center gap-1"
                    title={format.name}
                  >
                    <span className={cn("text-lg font-mono", format.style)}>
                      {format.icon}
                    </span>
                    <span className="text-xs">{format.name}</span>
                  </Button>
                ))}
              </div>
              <div className="text-xs text-muted-foreground text-center pt-2">
                点击按钮插入格式代码
              </div>
            </TabsContent>

            {/* 六进制颜色 */}
            <TabsContent value="hex" className="space-y-3">
              <div className="space-y-3">
                <div className="space-y-2">
                  <Label htmlFor="hex-color" className="text-xs">
                    自定义颜色
                  </Label>
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <Input
                        id="hex-color"
                        type="color"
                        value={hexColor}
                        onChange={(e) => setHexColor(e.target.value)}
                        className="h-10 w-full cursor-pointer"
                      />
                    </div>
                    <Input
                      type="text"
                      value={hexColor.toUpperCase()}
                      onChange={(e) => {
                        const value = e.target.value;
                        if (/^#[0-9A-Fa-f]{0,6}$/.test(value)) {
                          setHexColor(value);
                        }
                      }}
                      className="h-10 w-24 font-mono text-xs"
                      placeholder="#FFFFFF"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-xs">预览</Label>
                  <div
                    className="h-12 rounded-md border flex items-center justify-center text-sm font-medium"
                    style={{ backgroundColor: hexColor }}
                  >
                    <span
                      style={{
                        color:
                          parseInt(hexColor.slice(1), 16) > 0x888888
                            ? "#000000"
                            : "#FFFFFF",
                      }}
                    >
                      示例文字
                    </span>
                  </div>
                </div>

                <Button
                  onClick={handleHexColorApply}
                  className="w-full"
                  size="sm"
                >
                  应用颜色 (&#{hexColor.replace("#", "").toUpperCase()})
                </Button>

                <div className="text-xs text-muted-foreground">
                  <p>六进制颜色格式：&#RRGGBB</p>
                  <p className="mt-1">示例：&#FF5555 表示红色</p>
                </div>
              </div>
            </TabsContent>

            {/* 渐变色 */}
            <TabsContent value="gradient" className="space-y-3">
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label htmlFor="gradient-start" className="text-xs">
                      起始颜色
                    </Label>
                    <Input
                      id="gradient-start"
                      type="color"
                      value={gradientStart}
                      onChange={(e) => setGradientStart(e.target.value)}
                      className="h-10 cursor-pointer"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="gradient-end" className="text-xs">
                      结束颜色
                    </Label>
                    <Input
                      id="gradient-end"
                      type="color"
                      value={gradientEnd}
                      onChange={(e) => setGradientEnd(e.target.value)}
                      className="h-10 cursor-pointer"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="gradient-text" className="text-xs">
                    渐变文字
                  </Label>
                  <Input
                    id="gradient-text"
                    type="text"
                    value={gradientText}
                    onChange={(e) => setGradientText(e.target.value)}
                    placeholder="输入要应用渐变的文字"
                    className="text-sm"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-xs">预览</Label>
                  <div
                    className="h-12 rounded-md border flex items-center justify-center text-lg font-medium"
                    style={{
                      background: `linear-gradient(to right, ${gradientStart}, ${gradientEnd})`,
                      WebkitBackgroundClip: "text",
                      WebkitTextFillColor: "transparent",
                      backgroundClip: "text",
                    }}
                  >
                    {gradientText || "渐变文字"}
                  </div>
                </div>

                <Button
                  onClick={handleGradientApply}
                  className="w-full"
                  size="sm"
                  disabled={!gradientText.trim()}
                >
                  应用渐变
                </Button>

                <div className="text-xs text-muted-foreground">
                  <p>
                    渐变格式：
                    &lt;gradient:#起始色:#结束色&gt;文字&lt;/gradient&gt;
                  </p>
                  <p className="mt-1">
                    示例：&lt;gradient:#FF0000:#0000FF&gt;彩虹&lt;/gradient&gt;
                  </p>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </PopoverContent>
    </Popover>
  );
}
