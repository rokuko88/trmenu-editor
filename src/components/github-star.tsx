"use client";

import { Star, Github } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";

// 配置 GitHub 仓库信息
// TODO: 替换为实际的 GitHub 仓库地址
const GITHUB_REPO = "your-org/trmenu-editor";
const GITHUB_URL = `https://github.com/${GITHUB_REPO}`;

export function GithubStar() {
  const [stars, setStars] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 只在配置了真实仓库时才获取 star 数
    if (GITHUB_REPO === "your-org/trmenu-editor") {
      setLoading(false);
      return;
    }

    // 获取 GitHub star 数
    fetch(`https://api.github.com/repos/${GITHUB_REPO}`)
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch");
        return res.json();
      })
      .then((data) => {
        if (data.stargazers_count !== undefined) {
          setStars(data.stargazers_count);
        }
      })
      .catch(() => {
        // 失败时静默处理
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  const formatStars = (num: number) => {
    if (num >= 1000) {
      return `${(num / 1000).toFixed(1)}k`;
    }
    return num.toString();
  };

  return (
    <Button variant="outline" size="sm" className="h-8 gap-2" asChild>
      <a
        href={GITHUB_URL}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center gap-2"
      >
        <Github className="h-3.5 w-3.5" />
        <span className="text-xs font-medium">GitHub</span>
        {!loading && stars !== null && stars > 0 && (
          <>
            <span className="text-muted-foreground">|</span>
            <div className="flex items-center gap-1">
              <Star className="h-3 w-3 fill-current" />
              <span className="text-xs font-medium">{formatStars(stars)}</span>
            </div>
          </>
        )}
      </a>
    </Button>
  );
}
