# Token-Insights Skill 设计方案

将 TokenSense 改造成类似 Claude Code `/insights` 的 Skill，生成一次性、数据固定的静态 HTML 报告。

## 背景参考

### `/insights` 命令特点

- **命令**: `/insights`
- **描述**: "Generate a report analyzing your Claude Code sessions"
- **输出**: 交互式 HTML 报告，保存到 `~/.claude/usage-data/report.html`
- **特点**: 一次性生成、数据固定、不自动刷新

### TokenSense 当前架构

- **数据流**: Python 解析会话日志 → 生成 `token_data.js` → HTML 渲染
- **刷新模式**: 每 60 秒自动刷新
- **文件结构**: 
  - `src/refresh_token_data.py` - 主脚本
  - `src/token_visual.html` - 仪表板
  - `data/token_data.js` - 动态数据

---

## 改造方案

### 目标

创建一个 Skill，运行后生成**静态 HTML 报告**，数据在生成时固定，无需持续进程或自动刷新。

### 目录结构

```
TokenSense/
├── .claude/skills/token-insights/
│   ├── SKILL.md              # Skill 定义
│   ├── generate_report.py    # 一次性生成脚本
│   ├── templates/
│   │   └── report.html       # 静态 HTML 模板
│   └── style/
│       └── report.css        # 报告样式
└── output/
    └── token-insights-{timestamp}.html  # 生成的报告
```

### SKILL.md

```markdown
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
- Complete session history with sortable table

## How to use

1. Run this skill (it will execute the generator automatically)
2. The report will be saved to `output/token-insights-{timestamp}.html`
3. Open the file in your browser

```bash
# The skill runs this command:
python3 generate_report.py
```

## Key differences from /insights

| Aspect | TokenSense | /insights |
|--------|------------|-----------|
| Focus | Token usage & costs | Interaction patterns & qualitative insights |
| Analysis | Quantitative metrics | LLM-generated facets & recommendations |
| Output | Interactive charts | Narrative report with stats |

## Output format

- Single static HTML file
- All data embedded at generation time
- No server required, no auto-refresh
- Charts use Chart.js via CDN
```

### generate_report.py

```python
#!/usr/bin/env python3
"""
Token-Insights Skill - Generate a static HTML token usage report.

Unlike the dashboard version, this generates a one-time snapshot
with no auto-refresh or live updates.
"""

import json
import time
from pathlib import Path
from datetime import datetime
from collections import defaultdict

# 定价表（与主脚本一致）
MODEL_PRICING = {
    "claude-opus-4-5":   {"input": 15.00, "output": 75.00, "cw": 18.75, "cr": 1.50},
    "claude-opus-4":     {"input": 15.00, "output": 75.00, "cw": 18.75, "cr": 1.50},
    "claude-sonnet-4-5": {"input":  3.00, "output": 15.00, "cw":  3.75, "cr": 0.30},
    "claude-sonnet-4":   {"input":  3.00, "output": 15.00, "cw":  3.75, "cr": 0.30},
    "claude-haiku-4-5":  {"input":  0.80, "output":  4.00, "cw":  1.00, "cr": 0.08},
    "claude-haiku-4":    {"input":  0.80, "output":  4.00, "cw":  1.00, "cr": 0.08},
}

PROJECTS_DIR = Path.home() / ".claude" / "projects"


def parse_session_file(jsonl_path):
    """Parse a single session file and extract token data."""
    # ... 复用现有解析逻辑 ...
    pass


def parse_all_sessions():
    """Parse all session logs from ~/.claude/projects/."""
    sessions = []
    for project_dir in PROJECTS_DIR.iterdir():
        if not project_dir.is_dir():
            continue
        for jsonl_file in project_dir.glob("*.jsonl"):
            session_data = parse_session_file(jsonl_file)
            if session_data:
                sessions.append(session_data)
    return sessions


def compute_summary(sessions):
    """Compute aggregated statistics."""
    # ... 复用现有汇总逻辑 ...
    return {
        "total_tokens": ...,
        "total_input": ...,
        "total_output": ...,
        "total_cache_creation": ...,
        "total_cache_read": ...,
        "total_sessions": len(sessions),
        "total_cost": ...,
        "daily": [...],
        "by_project": [...],
        "by_model": [...],
        "sessions": [...],
    }


def compute_cost(session):
    """Calculate estimated cost for a session."""
    model = session.get("model", "")
    pricing = MODEL_PRICING.get(model, MODEL_PRICING["claude-sonnet-4"])
    
    input_cost = (session["input_tokens"] / 1e6) * pricing["input"]
    output_cost = (session["output_tokens"] / 1e6) * pricing["output"]
    cache_cost = (session.get("cache_creation_input_tokens", 0) / 1e6) * pricing["cw"]
    
    return input_cost + output_cost + cache_cost


def generate_html(data, template_path):
    """Generate static HTML report from data."""
    template = Path(template_path).read_text(encoding="utf-8")
    
    # Replace placeholders
    html = template.replace(
        "{{REPORT_DATA}}", 
        json.dumps(data, ensure_ascii=False)
    ).replace(
        "{{GENERATED_AT}}",
        datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    )
    
    return html


def main():
    """Main entry point."""
    print("Token-Insights Skill - Generating static report...")
    print()
    
    # Parse sessions
    print("Parsing session logs from ~/.claude/projects/...")
    sessions = parse_all_sessions()
    print(f"  Found {len(sessions)} sessions")
    
    # Compute summary
    print("Computing statistics...")
    summary = compute_summary(sessions)
    
    # Prepare data for embedding
    report_data = {
        "generated_at": datetime.now().isoformat(),
        "summary": summary,
        "sessions": sessions[:100],  # Limit to 100 for file size
    }
    
    # Generate HTML
    print("Generating HTML report...")
    template_path = Path(__file__).parent / "templates" / "report.html"
    html = generate_html(report_data, template_path)
    
    # Save output
    output_dir = Path(__file__).parent.parent / "output"
    output_dir.mkdir(exist_ok=True)
    
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    output_file = output_dir / f"token-insights-{timestamp}.html"
    output_file.write_text(html, encoding="utf-8")
    
    print()
    print(f"✓ Report generated: {output_file}")
    print()
    print(f"Open with:")
    print(f"  open {output_file}")
    print()


if __name__ == "__main__":
    main()
```

### 静态 HTML 模板 (templates/report.html)

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Token-Insights Report</title>
  <script src="https://cdn.jsdelivr.net/npm/chart.js@4.4.1/dist/chart.umd.min.js"></script>
  <style>
    :root {
      --bg-primary: #0f1419;
      --bg-card: #1a1f2e;
      --text-primary: #f0f4f8;
      --text-secondary: #8899a6;
      --accent-cool: #4ecdc4;
      --accent-hot: #ff6b6b;
      --border: #2a3441;
    }
    
    * { box-sizing: border-box; margin: 0; padding: 0; }
    
    body {
      font-family: 'Outfit', -apple-system, BlinkMacSystemFont, sans-serif;
      background: var(--bg-primary);
      color: var(--text-primary);
      padding: 24px;
      line-height: 1.6;
    }
    
    .header {
      max-width: 1400px;
      margin: 0 auto 32px;
      border-bottom: 1px solid var(--border);
      padding-bottom: 16px;
    }
    
    .header h1 {
      font-size: 28px;
      font-weight: 800;
      margin-bottom: 8px;
    }
    
    .generated-at {
      color: var(--text-secondary);
      font-size: 12px;
      font-family: 'JetBrains Mono', monospace;
    }
    
    .metrics-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 16px;
      max-width: 1400px;
      margin: 0 auto 32px;
    }
    
    .metric-card {
      background: var(--bg-card);
      border: 1px solid var(--border);
      border-radius: 12px;
      padding: 20px;
    }
    
    .metric-label {
      font-size: 11px;
      color: var(--text-secondary);
      text-transform: uppercase;
      letter-spacing: 1px;
      margin-bottom: 8px;
    }
    
    .metric-value {
      font-size: 24px;
      font-weight: 700;
      font-family: 'JetBrains Mono', monospace;
    }
    
    .section {
      max-width: 1400px;
      margin: 0 auto 32px;
      background: var(--bg-card);
      border: 1px solid var(--border);
      border-radius: 12px;
      padding: 20px;
    }
    
    .section-title {
      font-size: 14px;
      font-weight: 600;
      margin-bottom: 16px;
      color: var(--text-primary);
    }
    
    .chart-container {
      height: 300px;
      position: relative;
    }
    
    table {
      width: 100%;
      border-collapse: collapse;
      font-size: 12px;
    }
    
    th, td {
      padding: 10px 12px;
      text-align: left;
      border-bottom: 1px solid var(--border);
    }
    
    th {
      color: var(--text-secondary);
      font-weight: 500;
      text-transform: uppercase;
      font-size: 10px;
      letter-spacing: 0.5px;
    }
    
    .num { 
      text-align: right; 
      font-family: 'JetBrains Mono', monospace;
    }
  </style>
</head>
<body>
  <header class="header">
    <h1>Token-Insights ⚡ Report</h1>
    <p class="generated-at">Generated: {{GENERATED_AT}}</p>
  </header>
  
  <main>
    <!-- Metrics Overview -->
    <div class="metrics-grid" id="metricsGrid"></div>
    
    <!-- Daily Usage Chart -->
    <div class="section">
      <h2 class="section-title">Daily Usage</h2>
      <div class="chart-container">
        <canvas id="dailyChart"></canvas>
      </div>
    </div>
    
    <!-- Top Projects -->
    <div class="section">
      <h2 class="section-title">Top Projects</h2>
      <table id="projectsTable"></table>
    </div>
    
    <!-- Sessions Table -->
    <div class="section">
      <h2 class="section-title">Recent Sessions</h2>
      <table id="sessionsTable"></table>
    </div>
  </main>
  
  <script>
    // Embedded report data
    const REPORT_DATA = {{REPORT_DATA}};
    
    // Format large numbers
    function formatNumber(n) {
      if (n >= 1e9) return (n / 1e9).toFixed(2) + 'B';
      if (n >= 1e6) return (n / 1e6).toFixed(2) + 'M';
      if (n >= 1e3) return (n / 1e3).toFixed(1) + 'K';
      return n.toString();
    }
    
    // Format cost
    function formatCost(cost) {
      return '$' + cost.toFixed(2);
    }
    
    // Render metrics cards
    function renderMetrics(summary) {
      const grid = document.getElementById('metricsGrid');
      const metrics = [
        { label: 'Total Tokens', value: formatNumber(summary.total_tokens) },
        { label: 'Input Tokens', value: formatNumber(summary.total_input) },
        { label: 'Output Tokens', value: formatNumber(summary.total_output) },
        { label: 'Cache Hits', value: formatNumber(summary.total_cache_read) },
        { label: 'Est. Cost', value: formatCost(summary.total_cost) },
        { label: 'Sessions', value: summary.total_sessions },
      ];
      
      grid.innerHTML = metrics.map(m => `
        <div class="metric-card">
          <div class="metric-label">${m.label}</div>
          <div class="metric-value">${m.value}</div>
        </div>
      `).join('');
    }
    
    // Render daily chart
    function renderChart(daily) {
      const ctx = document.getElementById('dailyChart');
      const data = daily.slice(-14); // Last 14 days
      
      new Chart(ctx, {
        type: 'bar',
        data: {
          labels: data.map(d => d.date.slice(5)),
          datasets: [
            {
              label: 'Input',
              data: data.map(d => d.input_tokens),
              backgroundColor: '#4ecdc4',
              borderRadius: 4
            },
            {
              label: 'Output',
              data: data.map(d => d.output_tokens),
              backgroundColor: '#c8ff00',
              borderRadius: 4
            }
          ]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              position: 'top',
              labels: { color: '#8899a6', font: { size: 10 } }
            }
          },
          scales: {
            x: {
              grid: { display: false },
              ticks: { color: '#8899a6', font: { size: 9 } }
            },
            y: {
              grid: { color: '#2a3441' },
              ticks: { color: '#8899a6', font: { size: 9 } }
            }
          }
        }
      });
    }
    
    // Render projects table
    function renderProjects(projects) {
      const table = document.getElementById('projectsTable');
      const top = projects.slice(0, 10);
      
      table.innerHTML = `
        <thead>
          <tr>
            <th>Project</th>
            <th class="num">Tokens</th>
            <th class="num">Cost</th>
            <th class="num">Sessions</th>
          </tr>
        </thead>
        <tbody>
          ${top.map(p => `
            <tr>
              <td>${p.project}</td>
              <td class="num">${formatNumber(p.total_tokens)}</td>
              <td class="num">${formatCost(p.est_cost)}</td>
              <td class="num">${p.sessions}</td>
            </tr>
          `).join('')}
        </tbody>
      `;
    }
    
    // Render sessions table
    function renderSessions(sessions) {
      const table = document.getElementById('sessionsTable');
      const recent = sessions.slice(0, 20);
      
      table.innerHTML = `
        <thead>
          <tr>
            <th>Date</th>
            <th>Project</th>
            <th>Model</th>
            <th class="num">Input</th>
            <th class="num">Output</th>
            <th class="num">Cache</th>
            <th class="num">Total</th>
          </tr>
        </thead>
        <tbody>
          ${recent.map(s => `
            <tr>
              <td>${s.date} ${s.time}</td>
              <td>${s.project}</td>
              <td>${s.model}</td>
              <td class="num">${formatNumber(s.input_tokens)}</td>
              <td class="num">${formatNumber(s.output_tokens)}</td>
              <td class="num">${formatNumber(s.cache_read)}</td>
              <td class="num">${formatNumber(s.total_tokens)}</td>
            </tr>
          `).join('')}
        </tbody>
      `;
    }
    
    // Initialize page
    document.addEventListener('DOMContentLoaded', () => {
      const { summary } = REPORT_DATA;
      renderMetrics(summary);
      renderChart(summary.daily || []);
      renderProjects(summary.by_project || []);
      renderSessions(REPORT_DATA.sessions || []);
    });
  </script>
</body>
</html>
```

---

## 与现有版本对比

| 特性 | 当前 Dashboard | Skill 版本 |
|------|---------------|-----------|
| 运行模式 | 持续进程，60 秒刷新 | 一次性执行 |
| 输出文件 | `token_data.js` + `token_visual.html` | 单个静态 HTML |
| 数据更新 | 自动轮询 | 手动重新运行 |
| 文件大小 | ~50KB HTML + 外部数据 | ~500KB-2MB (内联数据) |
| 使用场景 | 开发时实时监控 | 定期生成报告/分享 |

---

## 可选增强功能

### LLM 增强分析（类似 /insights）

在生成报告前调用 Haiku API，添加定性分析：

```python
def generate_insights(summary):
    """Call Haiku to generate qualitative insights."""
    prompt = f"""
    Analyze this Claude Code token usage data and provide brief insights:
    
    Total tokens: {summary['total_tokens']:,}
    Total cost: ${summary['total_cost']:.2f}
    Top project: {summary['by_project'][0]['project'] if summary['by_project'] else 'N/A'}
    Top model: {summary['by_model'][0]['model'] if summary['by_model'] else 'N/A'}
    
    Provide:
    1. One observation about usage patterns
    2. One suggestion for cost optimization
    3. One tip for better cache utilization
    """
    
    # Call Anthropic API
    response = client.messages.create(
        model="claude-haiku-4-5",
        max_tokens=500,
        messages=[{"role": "user", "content": prompt}]
    )
    
    return response.content[0].text
```

然后在 HTML 中添加一个 "Insights" 卡片展示分析结果。

---

## 实现步骤

1. **创建 Skill 目录**
   ```bash
   mkdir -p .claude/skills/token-insights/{templates,style,output}
   ```

2. **复制并精简代码**
   - 从 `src/refresh_token_data.py` 复制解析逻辑到 `generate_report.py`
   - 简化 HTML 模板，移除自动刷新相关代码

3. **测试生成**
   ```bash
   cd .claude/skills/token-insights
   python3 generate_report.py
   open ../../output/token-insights-*.html
   ```

4. **验证 Skill 加载**
   ```bash
   claude
   /token-insights
   ```

---

## 参考

- [Deep Dive: How Claude Code's /insights Command Works](https://www.zolkos.com/2026/02/04/deep-dive-how-claude-codes-insights-command-works.html)
- [Inside Claude Code Skills: Structure, prompts, invocation](https://mikhail.io/2025/10/claude-code-skills/)
- [Official Skills Documentation](https://code.claude.com/docs/en/skills)
