"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Bot, Send, Sparkles } from "lucide-react";
import { Separator } from "@/components/ui/separator";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

interface AIAssistantProps {
  onGenerate?: (prompt: string) => void;
}

export function AIAssistant({ onGenerate }: AIAssistantProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      role: "assistant",
      content:
        '你好！我是 TrMenu AI 助手。我可以帮你快速创建菜单配置。\n\n试试对我说：\n• "创建一个商店菜单，有钻石剑、钻石镐和钻石铠甲"\n• "添加一个关闭按钮在第49格"\n• "给第0格的物品添加发光效果"',
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage: Message = {
      id: `user-${Date.now()}`,
      role: "user",
      content: input,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    // TODO: 这里接入实际的 AI API
    // 现在只是模拟响应
    setTimeout(() => {
      const assistantMessage: Message = {
        id: `assistant-${Date.now()}`,
        role: "assistant",
        content:
          "AI 功能正在开发中。这里会接入大语言模型来帮助你生成菜单配置。\n\n你可以预留这个接口，稍后接入 OpenAI、Claude 或其他 AI 服务。",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, assistantMessage]);
      setIsLoading(false);

      // 通知父组件生成
      if (onGenerate) {
        onGenerate(input);
      }
    }, 1000);
  };

  const quickPrompts = [
    "创建商店菜单",
    "添加返回按钮",
    "添加装饰物品",
    "创建确认界面",
  ];

  return (
    <div className="flex flex-col h-full bg-background/50">
      {/* 头部 */}
      <div className="p-4 border-b">
        <div className="flex items-center gap-2 mb-2">
          <div className="h-8 w-8 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
            <Bot className="h-4 w-4 text-white" />
          </div>
          <div>
            <h3 className="font-semibold text-sm">AI 助手</h3>
            <p className="text-xs text-muted-foreground">实验性功能</p>
          </div>
        </div>
      </div>

      {/* 快速提示 */}
      <div className="p-4 border-b">
        <p className="text-xs text-muted-foreground mb-2">快速开始：</p>
        <div className="flex flex-wrap gap-2">
          {quickPrompts.map((prompt) => (
            <Button
              key={prompt}
              variant="outline"
              size="sm"
              className="h-7 text-xs"
              onClick={() => setInput(prompt)}
            >
              <Sparkles className="h-3 w-3 mr-1" />
              {prompt}
            </Button>
          ))}
        </div>
      </div>

      {/* 消息列表 */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex gap-3 ${
              message.role === "user" ? "flex-row-reverse" : ""
            }`}
          >
            {/* 头像 */}
            <div
              className={`h-8 w-8 rounded-full flex-shrink-0 flex items-center justify-center ${
                message.role === "assistant"
                  ? "bg-gradient-to-br from-purple-500 to-pink-500"
                  : "bg-primary"
              }`}
            >
              {message.role === "assistant" ? (
                <Bot className="h-4 w-4 text-white" />
              ) : (
                <span className="text-xs text-white font-medium">U</span>
              )}
            </div>

            {/* 消息内容 */}
            <div
              className={`flex-1 rounded-lg p-3 ${
                message.role === "assistant"
                  ? "bg-muted/50"
                  : "bg-primary text-primary-foreground"
              }`}
            >
              <p className="text-sm whitespace-pre-wrap">{message.content}</p>
              <span className="text-xs opacity-50 mt-2 block">
                {message.timestamp.toLocaleTimeString("zh-CN", {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </span>
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="flex gap-3">
            <div className="h-8 w-8 rounded-full flex-shrink-0 flex items-center justify-center bg-gradient-to-br from-purple-500 to-pink-500">
              <Bot className="h-4 w-4 text-white animate-pulse" />
            </div>
            <div className="flex-1 rounded-lg p-3 bg-muted/50">
              <div className="flex gap-1">
                <span className="h-2 w-2 rounded-full bg-muted-foreground/50 animate-bounce" />
                <span className="h-2 w-2 rounded-full bg-muted-foreground/50 animate-bounce [animation-delay:0.2s]" />
                <span className="h-2 w-2 rounded-full bg-muted-foreground/50 animate-bounce [animation-delay:0.4s]" />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 输入框 */}
      <div className="p-4 border-t">
        <div className="flex gap-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
            placeholder="描述你想要的菜单..."
            className="flex-1"
            disabled={isLoading}
          />
          <Button
            size="icon"
            onClick={handleSend}
            disabled={isLoading || !input.trim()}
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
        <p className="text-xs text-muted-foreground mt-2">
          提示：详细描述可以获得更好的结果
        </p>
      </div>
    </div>
  );
}
