/**
 * Minecraft 颜色和格式代码工具
 */
import React from "react";

// Minecraft 传统颜色映射
const MC_COLOR_MAP: Record<string, string> = {
  "§0": "#000000",
  "§1": "#0000AA",
  "§2": "#00AA00",
  "§3": "#00AAAA",
  "§4": "#AA0000",
  "§5": "#AA00AA",
  "§6": "#FFAA00",
  "§7": "#AAAAAA",
  "§8": "#555555",
  "§9": "#5555FF",
  "§a": "#55FF55",
  "§b": "#55FFFF",
  "§c": "#FF5555",
  "§d": "#FF55FF",
  "§e": "#FFFF55",
  "§f": "#FFFFFF",
  // 同时支持 & 符号
  "&0": "#000000",
  "&1": "#0000AA",
  "&2": "#00AA00",
  "&3": "#00AAAA",
  "&4": "#AA0000",
  "&5": "#AA00AA",
  "&6": "#FFAA00",
  "&7": "#AAAAAA",
  "&8": "#555555",
  "&9": "#5555FF",
  "&a": "#55FF55",
  "&b": "#55FFFF",
  "&c": "#FF5555",
  "&d": "#FF55FF",
  "&e": "#FFFF55",
  "&f": "#FFFFFF",
};

interface TextStyle {
  color?: string;
  bold?: boolean;
  italic?: boolean;
  underline?: boolean;
  strikethrough?: boolean;
}

/**
 * 解析 Minecraft 文本颜色代码并返回 React 元素
 */
export function parseMinecraftText(text: string): React.ReactNode[] {
  if (!text) return [];

  const result: React.ReactNode[] = [];
  let currentStyle: TextStyle = {};
  let currentText = "";
  let i = 0;

  const flushText = () => {
    if (currentText) {
      const style: React.CSSProperties = {
        color: currentStyle.color,
        fontWeight: currentStyle.bold ? "bold" : undefined,
        fontStyle: currentStyle.italic ? "italic" : undefined,
        textDecoration:
          [
            currentStyle.underline && "underline",
            currentStyle.strikethrough && "line-through",
          ]
            .filter(Boolean)
            .join(" ") || undefined,
      };
      result.push(
        <span key={result.length} style={style}>
          {currentText}
        </span>
      );
      currentText = "";
    }
  };

  // 处理渐变色
  const gradientRegex =
    /<gradient:(#[0-9A-Fa-f]{6}):(#[0-9A-Fa-f]{6})>(.*?)<\/gradient>/g;
  let match;
  let lastIndex = 0;
  const gradientMatches: Array<{
    start: number;
    end: number;
    match: RegExpExecArray;
  }> = [];

  while ((match = gradientRegex.exec(text)) !== null) {
    gradientMatches.push({
      start: match.index,
      end: match.index + match[0].length,
      match,
    });
  }

  if (gradientMatches.length > 0) {
    // 如果有渐变色，分段处理
    gradientMatches.forEach((gradMatch, idx) => {
      // 处理渐变前的文本
      if (lastIndex < gradMatch.start) {
        const beforeText = text.substring(lastIndex, gradMatch.start);
        result.push(...parseMinecraftText(beforeText));
      }

      // 添加渐变文本
      const startColor = gradMatch.match[1];
      const endColor = gradMatch.match[2];
      const gradientText = gradMatch.match[3];
      result.push(
        <span
          key={`gradient-${idx}`}
          style={{
            background: `linear-gradient(to right, ${startColor}, ${endColor})`,
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text",
          }}
        >
          {gradientText}
        </span>
      );

      lastIndex = gradMatch.end;
    });

    // 处理最后一段
    if (lastIndex < text.length) {
      const afterText = text.substring(lastIndex);
      result.push(...parseMinecraftText(afterText));
    }

    return result;
  }

  // 处理普通颜色代码
  while (i < text.length) {
    const char = text[i];
    const nextChar = text[i + 1];

    // 检查是否是颜色代码
    if ((char === "§" || char === "&") && nextChar) {
      const code = char + nextChar.toLowerCase();

      // 检查是否是颜色代码
      if (MC_COLOR_MAP[code]) {
        flushText();
        currentStyle.color = MC_COLOR_MAP[code];
        i += 2;
        continue;
      }

      // 检查是否是格式代码
      switch (nextChar.toLowerCase()) {
        case "l":
          flushText();
          currentStyle.bold = true;
          i += 2;
          continue;
        case "o":
          flushText();
          currentStyle.italic = true;
          i += 2;
          continue;
        case "n":
          flushText();
          currentStyle.underline = true;
          i += 2;
          continue;
        case "m":
          flushText();
          currentStyle.strikethrough = true;
          i += 2;
          continue;
        case "r":
          flushText();
          currentStyle = {};
          i += 2;
          continue;
        case "k":
          // 随机字符效果，暂时忽略
          i += 2;
          continue;
      }
    }

    // 检查是否是六进制颜色代码 &#RRGGBB
    if (char === "&" && nextChar === "#" && text.length >= i + 8) {
      const hexColor = text.substring(i + 1, i + 8); // #RRGGBB
      if (/^#[0-9A-Fa-f]{6}$/.test(hexColor)) {
        flushText();
        currentStyle.color = hexColor;
        i += 8;
        continue;
      }
    }

    // 普通字符
    currentText += char;
    i++;
  }

  flushText();
  return result.length > 0 ? result : [text];
}

/**
 * 移除文本中的所有颜色代码，返回纯文本
 */
export function stripMinecraftColors(text: string): string {
  return text
    .replace(
      /<gradient:#[0-9A-Fa-f]{6}:#[0-9A-Fa-f]{6}>(.*?)<\/gradient>/g,
      "$1"
    )
    .replace(/[§&][0-9a-fklmnor]/gi, "")
    .replace(/&#[0-9A-Fa-f]{6}/g, "");
}

/**
 * 检查文本是否包含颜色代码
 */
export function hasMinecraftColors(text: string): boolean {
  return (
    /[§&][0-9a-fklmnor]/i.test(text) ||
    /&#[0-9A-Fa-f]{6}/.test(text) ||
    /<gradient:#[0-9A-Fa-f]{6}:#[0-9A-Fa-f]{6}>/.test(text)
  );
}
