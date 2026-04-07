---
name: token-insights
description: Generate a static HTML report analyzing your Claude Code token usage and costs
---

# Token-Insights - Token Usage Report Generator

## What it does
Parses all Claude Code session logs from `~/.claude/projects/` and generates a **one-time, static HTML report** showing:

- Total token consumption (input/output/cache creation/cache read)
- Estimated API costs by model
- Daily usage trends (bar chart)
- Top projects and models
- Complete session history

## How to use

When invoked, this skill will:
1. Run the `generate_report.py` script in this folder
2. Generate a static HTML report saved to `output/token-insights-{timestamp}.html`
3. Provide the file path to open in browser

## Commands

```bash
# Run the report generator
python3 generate_report.py
```

## File Structure

```
token-insights/
├── SKILL.md           # This file
├── generate_report.py # Report generator script
├── templates/
│   └── report.html    # Static HTML template
└── output/
    └── *.html         # Generated reports
```

## Output Format

- Single static HTML file with all data embedded
- No server required, no auto-refresh
- Charts use Chart.js via CDN
- Open directly in any modern browser

## Key Differences from /insights

| Aspect | Token-Insights | /insights |
|--------|---------------|-----------|
| Focus | Token usage & costs | Interaction patterns |
| Analysis | Quantitative metrics | LLM-generated facets |
| Output | Interactive charts | Narrative report |
