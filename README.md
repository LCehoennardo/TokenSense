# Token Dashboard

A visualization tool for Claude Code token usage. Parse session logs and generate an interactive HTML dashboard showing token consumption patterns.

## Features

- **Token Overview** - Total tokens with breakdown (input/output/cache creation/cache read)
- **Cost Estimation** - Estimated API costs based on model pricing
- **Daily Usage Chart** - Bar chart showing daily token consumption (Chart.js)
- **Activity Heatmap** - Visualize activity patterns across 7D/30D/365D views
- **Top Projects & Models** - Sidebar showing usage by project and model
- **Sessions Table** - Sortable, filterable table with pagination
- **Auto-refresh** - Updates every 60 seconds
- **i18n** - Supports English and Chinese
- **Dark/Light Theme** - Toggle between themes

## Requirements

- Python 3.8+
- Claude Code with session logs in `~/.claude/projects/`

## Quick Start

```bash
# Clone the repository
git clone https://github.com/yourusername/token-dashboard.git
cd token-dashboard

# Generate data once
python3 refresh_token_data.py --once

# Or run in continuous mode (refreshes every 60 seconds)
python3 refresh_token_data.py

# Open the dashboard
open token_visual.html
```

## Usage

### Single Refresh

Generate data once and exit:

```bash
python3 refresh_token_data.py --once
```

### Continuous Mode

Run in the background with auto-refresh:

```bash
python3 refresh_token_data.py
```

The dashboard will automatically reload data every 60 seconds.

## Project Structure

```
token-dashboard/
├── refresh_token_data.py  # Main Python script
├── token_visual.html      # Dashboard HTML
├── style.css              # Dashboard styles
├── app.js                 # Dashboard JavaScript
├── token_data.js          # Auto-generated data (gitignored)
├── .session_cache.json    # Parse cache (gitignored)
└── .summary_cache.json    # Summary cache (gitignored)
```

## License

MIT License - see [LICENSE](LICENSE) for details.