# TokenSense ⚡

<img src="./images/logo.svg" alt="TokenSense" width="240"/>

> 了解你的 Claude Code 消费，做聪明的 AI 用户

[![MIT License](https://img.shields.io/badge/License-MIT-green.svg)](https://choosealicense.com/licenses/mit/)
[![Python 版本](https://img.shields.io/badge/Python-3.8+-blue.svg)](https://www.python.org/)
[![Claude Code](https://img.shields.io/badge/Claude%20Code-Supported-purple.svg)](https://claude.com/code)

Claude Code Token 使用可视化工具。解析会话日志并生成交互式 HTML 仪表板，展示 Token 消耗模式。

[English](./README.md)

## 功能特性

- **Token 概览** - 总量及分类统计（输入/输出/缓存创建/缓存读取）
- **成本估算** - 基于模型定价计算 API 费用
- **每日用量图表** - 柱状图展示每日 Token 消耗（使用 Chart.js）
- **活动热力图** - 可视化 7天/30天/365天 活动模式
- **项目与模型排行** - 侧边栏展示各项目及模型的使用情况
- **会话列表** - 可排序、可筛选、带分页
- **自动刷新** - 每 60 秒更新一次
- **国际化** - 支持英文和中文
- **深色/浅色主题** - 自由切换

## 环境要求

- Python 3.8+
- Claude Code（会话日志位于 `~/.claude/projects/`）

## 快速开始

![仪表板截图](./images/screenshot-demo-zh.png)

```bash
# 克隆仓库
git clone https://github.com/LCehoennardo/TokenSense.git
cd TokenSense

# 进入源代码目录
cd src

# 生成数据（一次性）
python3 refresh_token_data.py --once

# 或持续运行模式（每60秒刷新）
python3 refresh_token_data.py

# 打开仪表板
open token_visual.html
```

## 使用方法

### 一次性刷新

生成数据后退出：

```bash
cd src
python3 refresh_token_data.py --once
```

### 持续运行模式

后台自动刷新：

```bash
cd src
python3 refresh_token_data.py
```

仪表板将每 60 秒自动重新加载数据。

## 项目结构

```
token-dashboard/
├── docs/                     # 文档
│   ├── README.md            # 英文版说明
│   ├── README.zh.md        # 中文版说明
│   └── LICENSE
├── src/                     # 源代码
│   ├── refresh_token_data.py  # 主 Python 脚本
│   ├── token_visual.html      # 仪表板 HTML
│   ├── style.css              # 仪表板样式
│   └── app.js                 # 仪表板 JavaScript
└── data/                     # 自动生成的数据（gitignore）
    ├── token_data.js
    ├── .session_cache.json
    └── .summary_cache.json
```

## License

MIT License - 详见 [LICENSE](LICENSE) 文件。