module.exports = {
  // TypeScript 和 JavaScript 文件
  "*.{ts,tsx,js,jsx}": ["eslint --fix", "prettier --write"],
  // JSON, YAML, Markdown 文件
  "*.{json,yaml,yml,md}": ["prettier --write"],
  // CSS 文件
  "*.{css,scss}": ["prettier --write"],
};
