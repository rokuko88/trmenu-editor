module.exports = {
  extends: ["@commitlint/config-conventional"],
  rules: {
    "type-enum": [
      2,
      "always",
      [
        "feat", // 新功能
        "fix", // 修复 bug
        "docs", // 文档更新
        "style", // 代码格式（不影响代码运行的变动）
        "refactor", // 重构
        "perf", // 性能优化
        "test", // 测试相关
        "build", // 构建系统或外部依赖的变动
        "ci", // CI 配置文件和脚本的变动
        "chore", // 其他不修改 src 或测试文件的变动
        "revert", // 回滚 commit
      ],
    ],
    "type-case": [2, "always", "lower-case"],
    "type-empty": [2, "never"],
    "subject-empty": [2, "never"],
    "subject-case": [0], // 关闭 subject case 检查，允许任意大小写
    "subject-full-stop": [2, "never", "."],
    "header-max-length": [2, "always", 200],
  },
};
