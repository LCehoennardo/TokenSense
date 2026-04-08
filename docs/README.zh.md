# TokenSense ⚡

<img src="./images/logo.svg" alt="TokenSense" width="240"/>

> 了解你的 Claude Code 消费，做聪明的 AI 用户

[![MIT License](https://img.shields.io/badge/License-MIT-green.svg)](https://choosealicense.com/licenses/mit/)
[![Node.js 版本](https://img.shields.io/badge/Node.js-14+-green.svg)](https://nodejs.org/)
[![Claude Code](https://img.shields.io/badge/Claude%20Code-Supported-purple.svg)](https://claude.com/code)

[English](./README.md)

Claude Code Token 使用可视化工具。解析会话日志并生成交互式 HTML 仪表板，展示 Token 消耗模式。

![Demo Screenshot](./images/screenshot-demo-zh.png)

## 这是什么？

TokenSense 读取你的 Claude Code 会话日志，生成交互式仪表板，展示：

- Token 总量（输入 / 输出 / 缓存创建 / 缓存读取）
- 预估 API 费用
- 每日用量趋势（柱状图）
- 活动热力图（7天 / 30天 / 365天）
- 项目与模型排行
- 所有会话（可排序、可筛选）

## 快速开始

```bash
# 1. 克隆仓库
git clone https://github.com/LCehoennardo/TokenSense.git
cd TokenSense

# 2. 启动服务器
node src/server.js

# 3. 打开浏览器
open http://localhost:3000
```

完成。仪表板已就绪，每 60 秒自动刷新。

## 项目结构

```
TokenSense/
├── src/
│   ├── server.js                     # Node.js 服务器（读取日志 → API）
│   ├── token_visual.html             # 仪表板 HTML
│   ├── style.css                     # 仪表板样式
│   └── app.js                        # 仪表板逻辑
├── docs/                             # 文档与截图
└── skills/                           # Claude Code Skills
    └── token-insights/               # 静态报告生成器
        ├── SKILL.md                  # Skill 定义
        ├── generate_report.py        # 报告生成脚本
        └── templates/
            ├── dashboard.html        # 仪表板 HTML 模板
            ├── app.js                # 仪表板逻辑
            ├── style.css             # 仪表板样式
            └── logo.svg              # Logo
```

## Token-Insights Skill

生成一次性、静态 HTML 仪表板，无需服务器。

### 安装

```bash
cp -r skills/token-insights ~/.claude/skills/
```

### 使用方法

在 Claude Code 中运行：

```
/token-insights
```

Skill 会在以下路径生成自包含的报告目录：
`~/.claude/skills/token-insights/output/token-insights-{timestamp}/`

在浏览器中打开 `index.html` 即可查看。

**功能特点：**
- 完整的 4 标签仪表板（Token、成本、行为、工具）——与服务器版 UI 相同
- 无需服务器，无自动刷新
- 自包含目录，包含所有资源

## 命令

```bash
# 启动服务器（每 60 秒自动刷新）
node src/server.js

# 访问 http://localhost:3000
```

## 环境要求

- Node.js 14+
- Claude Code（会话日志位于 `~/.claude/projects/`）

## License

MIT License - 详见 [LICENSE](LICENSE) 文件。
