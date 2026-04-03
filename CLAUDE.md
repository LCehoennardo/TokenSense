# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

TokenSense is a visualization tool for Claude Code token usage. It parses Claude's session logs from `~/.claude/projects/` and generates an interactive HTML dashboard showing token consumption patterns.

## Key Commands

```bash
# Single refresh - generate data once
python3 refresh_token_data.py --once

# Continuous mode - refresh every 60 seconds (default)
python3 refresh_token_data.py

# Open the dashboard
open token_visual.html
```

## Architecture

**Data Flow:**
1. `refresh_token_data.py` parses all `.jsonl` session files from `~/.claude/projects/`
2. Extracts token usage (input, output, cache creation, cache read) from each session
3. Computes summary statistics (daily, per-project, per-model aggregations)
4. Writes `token_data.js` only (HTML is not regenerated — `token_visual.html` is the canonical file)

**Caching:**
- `.session_cache.json` - Session parse cache keyed by file mtime (skips re-parsing unchanged files)
- `.summary_cache.json` - Summary cache (skips `compute_summary` when all sessions hit session cache)
- Increment `CACHE_VERSION` in `refresh_token_data.py` to invalidate all caches

**Files:**
- `refresh_token_data.py` - Main Python script that parses sessions and generates output
- `token_visual.html` - Slim HTML shell; loads `style.css` and `app.js`
- `style.css` - All CSS for the dashboard
- `app.js` - All JavaScript logic (Chart.js rendering, i18n, state, event handling)
- `token_data.js` - **Auto-generated** data file containing `window.TOKEN_DATA` (gitignored)
- `.session_cache.json` - **Auto-generated** parse cache (gitignored)
- `.summary_cache.json` - **Auto-generated** summary cache (gitignored)

**Dashboard Features:**
- Four tabs: Tokens, Costs, Behavior, Tools
- Total tokens summary with breakdown (input/output/cache)
- Estimated cost calculation (model pricing defined in Python)
- Daily usage bar chart (Chart.js)
- Activity heatmap with 7D/30D/365D views
- Top projects and models sidebar
- Sortable/filterable sessions table with pagination
- Auto-refresh every 60 seconds
