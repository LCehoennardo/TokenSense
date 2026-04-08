---
name: token-insights
description: |
  Generate a static HTML dashboard analyzing Claude Code token usage and costs.
  Use this skill whenever the user wants to check their token consumption, see how much they've spent on Claude API, analyze token usage patterns, view costs by model or project, or get a visual report of their Claude Code activity. Trigger when the user mentions "token usage", "how many tokens", "how much did I spend", "API cost", "Claude spending", "token breakdown", or asks about their Claude Code session history, spending trends, or resource consumption — even if they just say "check my usage" or "show me my token stats".
---

# Token-Insights - Token Usage Report Generator

## What it does
Parses all Claude Code session logs from `~/.claude/projects/` and generates a **one-time, static HTML report** showing:

- Total token consumption (input/output/cache creation/cache read)
- Estimated API costs by model
- Daily usage trends (bar chart)
- Top projects and models
- Complete session history
- Behavior analytics (permission modes, stop reasons, thinking turns)
- Tool usage statistics (Read/Write/Edit/Bash, MCP tools, skills)

## Installation

Copy this `token-insights/` folder to `~/.claude/skills/` (or use in-place from this repo).

```bash
cp -r token-insights ~/.claude/skills/
```

Once installed, Claude will auto-trigger this skill when you ask about token usage, API costs, or Claude Code activity. You can also invoke it directly with `/token-insights`.

## How to use

When invoked, this skill will:
1. Parse all Claude Code session logs from `~/.claude/projects/`
2. Generate a complete report directory in `output/token-insights-{timestamp}/`
3. Provide the file path — open `index.html` in any browser to view

## Commands

```bash
# Run the report generator
python3 generate_report.py
```

## File Structure

```
token-insights/
├── SKILL.md                 # This file
├── generate_report.py       # Report generator script
├── templates/
│   ├── dashboard.html       # Dashboard HTML template
│   ├── style.css            # Dashboard styles
│   ├── app.js               # Dashboard UI logic
│   └── logo.svg             # Logo icon
└── output/
    └── token-insights-{timestamp}/  # Generated reports
        ├── index.html       # Dashboard entry point
        ├── token_data.js    # Session data
        ├── style.css        # Styles
        ├── app.js           # UI logic
        └── logo.svg         # Logo
```

## Output Format

The generated report is a **self-contained directory** with everything needed to view:

- **Dashboard UI** with 4 tabs: Tokens, Costs, Behavior, Tools
- **Interactive charts** via Chart.js (loaded from CDN)
- **i18n support** — English/Chinese toggle
- **Theme support** — dark/light mode
- **No server required** — static files, open directly in browser
- **No auto-refresh** — one-time snapshot

## Dependencies

- Python 3.9+ (for `generate_report.py`)
- Modern browser (for viewing reports)
- Chart.js loaded from CDN at view time (requires internet for charts)
