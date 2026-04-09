# TokenSense ⚡

<img src="./docs/images/logo.svg" alt="TokenSense" width="240"/>

> Understand your Claude Code token usage and become a smarter AI user

[![MIT License](https://img.shields.io/badge/License-MIT-green.svg)](https://choosealicense.com/licenses/mit/)
[![Node.js Version](https://img.shields.io/badge/Node.js-14+-green.svg)](https://nodejs.org/)
[![Claude Code](https://img.shields.io/badge/Claude%20Code-Supported-purple.svg)](https://claude.com/code)

[中文](./docs/README.zh.md)

A visualization tool for Claude Code token usage. Parses session logs and generates an interactive HTML dashboard showing token consumption patterns.

![Demo Screenshot](./docs/images/screenshot-demo-en.png)

## What is this?

TokenSense reads your Claude Code session logs and generates an interactive dashboard where you can see:

- Total tokens (input / output / cache creation / cache read)
- Estimated API costs
- Daily usage trends (bar chart)
- Activity heatmap (7D / 30D / 365D)
- Top projects & models
- All sessions in a sortable table

## Installation

### Install via Agent

In Claude Code, Codex, OpenClaw, or other Skill-supporting agents, just paste:

```
Install this skill: https://github.com/LCehoennardo/TokenSense
```

### Manual Install

1. Download this repository.
2. Drag the `skills/token-insights` file into your tool's Skills directory

| Tool | Path |
|------|------|
| Claude Code | `~/.claude/skills/` |

### Quick Start (Dashboard)

```bash
# 1. Clone
git clone https://github.com/LCehoennardo/TokenSense.git
cd TokenSense

# 2. Start server
node src/server.js

# 3. Open browser
open http://localhost:3000
```

Done. You'll see your token usage dashboard with auto-refresh every 60s.

## Project Structure

```
TokenSense/
├── src/
│   ├── server.js                     # Node.js server (reads logs → API)
│   ├── token_visual.html             # Dashboard HTML
│   ├── style.css                     # Dashboard styles
│   └── app.js                        # Dashboard logic
├── docs/                             # Documentation & screenshots
└── skills/                           # Claude Code Skills
    └── token-insights/               # Static report generator
        ├── SKILL.md                  # Skill definition
        ├── generate_report.py        # Report generator script
        └── templates/
            ├── dashboard.html        # Dashboard HTML template
            ├── app.js                # Dashboard logic
            ├── style.css             # Dashboard styles
            └── logo.svg              # Logo
```

## Token-Insights Skill

After installing via the methods above:
- Use `/token-insights` in Claude Code to generate a report
- Claude will also auto-trigger this skill when you ask about token usage, API costs, or Claude Code activity
- Reports are generated as self-contained HTML directories — open `index.html` in any browser, no server needed

**Features:**
- Full 4-tab dashboard (Tokens, Costs, Behavior, Tools) — same UI as the server
- No server required, no auto-refresh
- Self-contained directory with all assets

## Commands

```bash
# Start server (auto-refresh every 60s)
node src/server.js

# Visit http://localhost:3000
```

## Requirements

- Node.js 14+
- Claude Code with session logs at `~/.claude/projects/`

## License

MIT License - see [LICENSE](LICENSE) for details.
