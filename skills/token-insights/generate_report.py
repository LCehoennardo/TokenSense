#!/usr/bin/env python3
"""
Token-Insights Skill - Generate a static HTML token usage report.

Unlike the dashboard version, this generates a one-time snapshot
with no auto-refresh or live updates.
"""

import json
import re
import shutil
from pathlib import Path
from datetime import datetime, timezone
from collections import defaultdict, Counter

# 定价表（与主脚本一致）
MODEL_PRICING = {
    "claude-opus-4-5":   {"input": 15.00, "output": 75.00, "cw": 18.75, "cr": 1.50},
    "claude-opus-4":     {"input": 15.00, "output": 75.00, "cw": 18.75, "cr": 1.50},
    "claude-sonnet-4-6": {"input":  3.00, "output": 15.00, "cw":  3.75, "cr": 0.30},
    "claude-sonnet-4-5": {"input":  3.00, "output": 15.00, "cw":  3.75, "cr": 0.30},
    "claude-sonnet-4":   {"input":  3.00, "output": 15.00, "cw":  3.75, "cr": 0.30},
    "claude-haiku-4-5":  {"input":  0.80, "output":  4.00, "cw":  1.00, "cr": 0.08},
    "claude-haiku-4":    {"input":  0.80, "output":  4.00, "cw":  1.00, "cr": 0.08},
    "claude-opus-3":     {"input": 15.00, "output": 75.00, "cw": 18.75, "cr": 1.50},
    "claude-sonnet-3":   {"input":  3.00, "output": 15.00, "cw":  3.75, "cr": 0.30},
    "claude-haiku-3":    {"input":  0.25, "output":  1.25, "cw":  0.30, "cr": 0.03},
}
_DEFAULT_P = {"input": 3.00, "output": 15.00, "cw": 3.75, "cr": 0.30}

PROJECTS_DIR = Path.home() / ".claude" / "projects"


def normalize_project_name(dir_name):
    """规范化项目名称，提取简洁易读的名称。"""
    if not dir_name:
        return "Unknown"

    # 移除 (subagent) 后缀
    base_name = dir_name.replace(" (subagent)", "")

    # 处理 Claude Code 格式：-Users-username-machine-projectname
    if base_name.startswith("-Users-"):
        parts = base_name.split("-")
        if len(parts) >= 5:
            name = "-".join(parts[4:])
        elif len(parts) >= 4:
            name = parts[3]
        else:
            name = base_name
    else:
        if "/" in base_name:
            name = base_name.rsplit("/", 1)[-1]
        else:
            name = base_name

    # 清理多余的连字符
    name = re.sub(r'-+', '-', name)
    name = name.strip('-')

    return name or "Unknown"


def _get_pricing(model_str: str) -> dict:
    if not model_str:
        return _DEFAULT_P
    lower = model_str.lower()
    for key, p in MODEL_PRICING.items():
        if key in lower:
            return p
    return _DEFAULT_P


def _session_cost(s: dict) -> float:
    p = _get_pricing(s.get("model_str", ""))
    return (
        (s.get("input_tokens", 0) / 1e6) * p["input"]
        + (s.get("output_tokens", 0) / 1e6) * p["output"]
        + ((s.get("cache_creation_input_tokens", 0) or 0) / 1e6) * p["cw"]
        + ((s.get("cache_read_input_tokens", 0) or 0) / 1e6) * p["cr"]
    )


def parse_session_file(jsonl_path, project_name):
    """解析单个会话文件。"""
    session_id = jsonl_path.stem
    usage_total = {
        "input_tokens": 0, "output_tokens": 0,
        "cache_creation_input_tokens": 0, "cache_read_input_tokens": 0,
    }
    models = set()
    first_timestamp = None
    last_timestamp = None
    user_messages = 0
    assistant_messages = 0
    first_prompt = ""
    cwd = ""

    # 工具调用
    tool_calls = []
    tool_results = {}

    # 行为统计
    turn_durations = []
    api_error_count = 0
    max_retry_attempt = 0
    compact_count = 0
    thinking_turns = 0
    permission_modes = Counter()
    git_branch_val = ""
    version_val = ""
    stop_reasons = Counter()
    mcp_tools_counter = Counter()
    skill_calls_counter = Counter()
    cost_snapshots = []

    with open(jsonl_path, "r", encoding="utf-8") as f:
        for line in f:
            try:
                data = json.loads(line.strip())
            except json.JSONDecodeError:
                continue

            record_type = data.get("type", "")
            timestamp = data.get("timestamp", "")

            if timestamp:
                try:
                    dt = datetime.fromisoformat(timestamp.replace("Z", "+00:00"))
                    if first_timestamp is None or dt < first_timestamp:
                        first_timestamp = dt
                    if last_timestamp is None or dt > last_timestamp:
                        last_timestamp = dt
                except (ValueError, TypeError):
                    pass

            if "cwd" in data and not cwd:
                cwd = data["cwd"]

            # 顶层元数据
            if "gitBranch" in data and not git_branch_val:
                git_branch_val = data["gitBranch"]
            if "version" in data and not version_val:
                version_val = data["version"]
            if "permissionMode" in data:
                permission_modes[data["permissionMode"]] += 1

            # system 记录
            if record_type == "system":
                sub = data.get("subtype", "")
                if sub == "turn_duration":
                    ms = data.get("durationMs", 0) or 0
                    if ms > 0:
                        turn_durations.append(ms)
                elif sub == "api_error":
                    api_error_count += 1
                    max_retry_attempt = max(max_retry_attempt, data.get("retryAttempt", 0) or 0)
                elif sub == "compact_boundary":
                    compact_count += 1
                elif sub == "local_command":
                    cv = data.get("content", "")
                    if isinstance(cv, str) and "Total cost" in cv:
                        m = re.search(r"Total cost:\s+\$([0-9,.]+)", cv)
                        if m:
                            try:
                                cost_snapshots.append(float(m.group(1).replace(",", "")))
                            except ValueError:
                                pass

            if record_type == "user":
                user_messages += 1
                if not first_prompt and "message" in data:
                    content = data["message"].get("content", "")
                    if isinstance(content, str) and content and not content.startswith("<"):
                        first_prompt = content[:100]
                    elif isinstance(content, list):
                        for item in content:
                            if isinstance(item, dict) and item.get("type") == "text":
                                text = item.get("text", "")
                                if text and not text.startswith("<local-command") and not text.startswith("Base directory"):
                                    first_prompt = text[:100]
                                    break
                            elif isinstance(item, dict) and item.get("type") == "tool_result":
                                tool_id = item.get("tool_use_id", "")
                                is_error = item.get("is_error", False)
                                result_content = item.get("content", "")
                                error_type = None
                                if is_error:
                                    if "doesn't want to proceed" in str(result_content):
                                        error_type = "rejected"
                                    elif "Exit code" in str(result_content):
                                        error_type = "command_failed"
                                    else:
                                        error_type = "other_error"
                                tool_results[tool_id] = {"is_error": is_error, "error_type": error_type}

            elif record_type == "assistant":
                assistant_messages += 1
                if "message" in data:
                    msg = data["message"]
                    usage = msg.get("usage", {})
                    if usage:
                        usage_total["input_tokens"] += usage.get("input_tokens", 0) or 0
                        usage_total["output_tokens"] += usage.get("output_tokens", 0) or 0
                        usage_total["cache_creation_input_tokens"] += usage.get("cache_creation_input_tokens", 0) or 0
                        usage_total["cache_read_input_tokens"] += usage.get("cache_read_input_tokens", 0) or 0

                    model = msg.get("model", "")
                    if model and not model.startswith("<"):
                        models.add(model)

                    sr = msg.get("stop_reason", "")
                    if sr:
                        stop_reasons[sr] += 1

                    content = msg.get("content", [])
                    if isinstance(content, list):
                        for item in content:
                            if isinstance(item, dict) and item.get("type") == "thinking":
                                thinking_turns += 1
                            elif isinstance(item, dict) and item.get("type") == "tool_use":
                                tool_name = item.get("name", "")
                                tool_id = item.get("id", "")
                                tool_input = item.get("input", {})
                                tool_call = {"name": tool_name, "id": tool_id, "timestamp": timestamp}
                                if tool_name == "Read":
                                    tool_call["file"] = tool_input.get("file_path", "")
                                elif tool_name in ("Write", "Edit"):
                                    tool_call["file"] = tool_input.get("file_path", "")
                                elif tool_name == "Bash":
                                    tool_call["command"] = tool_input.get("command", "")
                                tool_calls.append(tool_call)

                                if tool_name.startswith("mcp__"):
                                    parts = tool_name.split("__")
                                    if len(parts) >= 2:
                                        mcp_tools_counter[parts[1]] += 1
                                elif tool_name == "Skill":
                                    sn = tool_input.get("skill", "") if isinstance(tool_input, dict) else ""
                                    if sn:
                                        skill_calls_counter[sn] += 1

    if usage_total["input_tokens"] == 0 and usage_total["output_tokens"] == 0:
        return None

    duration_minutes = 0
    if first_timestamp and last_timestamp:
        duration_minutes = int((last_timestamp - first_timestamp).total_seconds() / 60)

    local_start = first_timestamp.astimezone() if first_timestamp else None

    # 合并工具调用结果
    for tc in tool_calls:
        tid = tc.get("id", "")
        if tid in tool_results:
            tc["is_error"] = tool_results[tid]["is_error"]
            tc["error_type"] = tool_results[tid]["error_type"]
        else:
            tc["is_error"] = False
            tc["error_type"] = None

    # 工具统计
    tool_stats = defaultdict(lambda: {"count": 0, "errors": 0, "rejected": 0})
    for tc in tool_calls:
        name = tc.get("name", "unknown")
        tool_stats[name]["count"] += 1
        if tc.get("is_error"):
            tool_stats[name]["errors"] += 1
            if tc.get("error_type") == "rejected":
                tool_stats[name]["rejected"] += 1

    # 文件操作
    file_operations = defaultdict(lambda: {"reads": 0, "writes": 0, "edits": 0})
    for tc in tool_calls:
        name = tc.get("name", "")
        fp = tc.get("file", "")
        if fp:
            short = "/".join(fp.split("/")[-3:]) if "/" in fp else fp
            if name == "Read":
                file_operations[short]["reads"] += 1
            elif name == "Write":
                file_operations[short]["writes"] += 1
            elif name == "Edit":
                file_operations[short]["edits"] += 1

    # Bash 命令
    bash_cmds = []
    for tc in tool_calls:
        if tc.get("name") == "Bash" and tc.get("command"):
            cmd_text = tc["command"]
            bash_cmds.append({"command": cmd_text.split()[0] if cmd_text.strip() else "unknown", "is_error": tc.get("is_error", False)})

    result = {
        "id": session_id,
        "project": project_name,
        "project_path": cwd,
        "input_tokens": usage_total["input_tokens"],
        "output_tokens": usage_total["output_tokens"],
        "cache_creation_input_tokens": usage_total["cache_creation_input_tokens"],
        "cache_read_input_tokens": usage_total["cache_read_input_tokens"],
        "total_tokens": usage_total["input_tokens"] + usage_total["output_tokens"] + usage_total["cache_creation_input_tokens"] + usage_total["cache_read_input_tokens"],
        "models": list(models),
        "model_str": ", ".join(sorted(models))[:30],
        "start_time": first_timestamp.isoformat(),
        "duration_minutes": duration_minutes,
        "time": local_start.strftime("%H:%M") if local_start else "",
        "date": local_start.strftime("%Y-%m-%d") if local_start else "",
        "hour": local_start.hour if local_start else 0,
        "weekday": local_start.weekday() if local_start else 0,
        "user_messages": user_messages,
        "assistant_messages": assistant_messages,
        "first_prompt": first_prompt,
        "tool_stats": dict(tool_stats),
        "tool_chain": [tc["name"] for tc in tool_calls],
        "file_operations": dict(file_operations),
        "bash_commands": bash_cmds,
        "turn_count": len(turn_durations),
        "avg_turn_ms": int(sum(turn_durations) / len(turn_durations)) if turn_durations else 0,
        "total_turn_ms": sum(turn_durations),
        "max_turn_ms": max(turn_durations) if turn_durations else 0,
        "api_errors": api_error_count,
        "max_retry": max_retry_attempt,
        "compact_events": compact_count,
        "thinking_turns": thinking_turns,
        "has_thinking": thinking_turns > 0,
        "dominant_permission": permission_modes.most_common(1)[0][0] if permission_modes else "default",
        "permission_modes": dict(permission_modes),
        "git_branch": git_branch_val,
        "version": version_val,
        "stop_reasons": dict(stop_reasons),
        "agentic_ratio": round(stop_reasons.get("tool_use", 0) / max(1, sum(stop_reasons.values())), 3),
        "mcp_tools": dict(mcp_tools_counter),
        "skill_calls": dict(skill_calls_counter),
    }

    # Compute estimated cost for this session
    p = _get_pricing(result.get("model_str", ""))
    result["est_cost"] = round(
        (result["input_tokens"] / 1e6) * p["input"]
        + (result["output_tokens"] / 1e6) * p["output"]
        + ((result["cache_creation_input_tokens"] or 0) / 1e6) * p["cw"]
        + ((result["cache_read_input_tokens"] or 0) / 1e6) * p["cr"], 6
    )
    result["final_cost"] = max(cost_snapshots) if cost_snapshots else None
    return result


def parse_all_sessions():
    """解析所有会话文件（不使用缓存，每次重新生成）。"""
    sessions = []

    for project_dir in PROJECTS_DIR.iterdir():
        if not project_dir.is_dir():
            continue

        project_name = normalize_project_name(project_dir.name)

        # 扫描主 session 文件
        for jsonl_file in project_dir.glob("*.jsonl"):
            try:
                session_data = parse_session_file(jsonl_file, project_name)
                if session_data:
                    session_data["project"] = normalize_project_name(session_data.get("project", ""))
                    sessions.append(session_data)
            except Exception as e:
                print(f"解析失败 {jsonl_file.name}: {e}")

        # 扫描子 agent session 文件
        for jsonl_file in project_dir.glob("*.jsonl"):
            session_id = jsonl_file.stem
            session_subagents_dir = project_dir / session_id / "subagents"
            if session_subagents_dir.is_dir():
                for subagent_file in session_subagents_dir.glob("*.jsonl"):
                    if subagent_file.name.endswith(".meta.json"):
                        continue
                    try:
                        session_data = parse_session_file(subagent_file, f"{project_name} (subagent)")
                        if session_data:
                            session_data["project"] = normalize_project_name(session_data.get("project", ""))
                            sessions.append(session_data)
                    except Exception as e:
                        print(f"解析失败 {subagent_file.name}: {e}")

    # 按时间排序
    sessions.sort(key=lambda x: x["start_time"], reverse=True)
    return sessions


def compute_summary(sessions):
    """计算汇总统计（与主仪表板 refresh_token_data.py 格式一致）。"""
    if not sessions:
        return {
            "total_tokens": 0, "total_input_tokens": 0, "total_output_tokens": 0,
            "total_cache_creation": 0, "total_cache_read": 0, "total_sessions": 0, "total_cost": 0,
            "daily": [], "projects": [], "models": [],
            "tools": [], "files": [], "bash_commands": [], "tool_chains": [],
            "turn_duration_stats": {"count": 0, "avg_ms": 0, "p50_ms": 0, "p90_ms": 0, "max_ms": 0, "total_hours": 0, "buckets": {}},
            "thinking_stats": {"sessions_with_thinking": 0, "pct_sessions": 0, "total_turns": 0, "by_project": [], "buckets": {}},
            "agentic_stats": {"avg_ratio": 0, "highly_agentic_count": 0},
            "stability": {"total_api_errors": 0, "total_compact_events": 0, "sessions_with_errors": 0, "max_retry_seen": 0, "top_compact_projects": []},
            "permission_summary": [], "autonomy_trend": [],
            "hourly": [0]*24, "weekday": [0]*7, "hour_weekday_matrix": [[0]*24 for _ in range(7)],
            "peak_hour": 0, "streak": {"current": 0, "max": 0, "active_days": 0},
            "version_timeline": [], "hourly_timeline": [],
            "mcp_summary": [], "skill_summary": {"total_calls": 0, "unique_skills": 0, "ranking": [], "by_project": []},
            "cost_real": {"total": 0, "max_session": 0, "session_count": 0, "by_project": []},
        }

    total_input = sum(s["input_tokens"] for s in sessions)
    total_output = sum(s["output_tokens"] for s in sessions)
    total_cache_creation = sum(s["cache_creation_input_tokens"] for s in sessions)
    total_cache_read = sum(s["cache_read_input_tokens"] for s in sessions)
    total_tokens = total_input + total_output + total_cache_creation + total_cache_read
    total_cost = sum(_session_cost(s) for s in sessions)

    # 按日期汇总
    daily_data = defaultdict(lambda: {
        "input_tokens": 0, "output_tokens": 0,
        "cache_creation": 0, "cache_read": 0, "sessions": 0, "est_cost": 0
    })
    for s in sessions:
        d = s["date"]
        daily_data[d]["input_tokens"] += s["input_tokens"]
        daily_data[d]["output_tokens"] += s["output_tokens"]
        daily_data[d]["cache_creation"] += s["cache_creation_input_tokens"]
        daily_data[d]["cache_read"] += s["cache_read_input_tokens"]
        daily_data[d]["sessions"] += 1
        daily_data[d]["est_cost"] += _session_cost(s)

    daily = [
        {"date": d, **v, "total_tokens": v["input_tokens"] + v["output_tokens"] + v["cache_creation"] + v["cache_read"], "est_cost": round(v["est_cost"], 4)}
        for d, v in sorted(daily_data.items())
    ]

    # 按小时汇总（用于 hourly timeline 图表）
    # 格式与 server.js 一致：24 个固定条目 "HH:00"
    hourly_data = defaultdict(lambda: {
        "input_tokens": 0, "output_tokens": 0,
        "cache_creation": 0, "cache_read": 0, "sessions": 0,
    })
    for s in sessions:
        dt = s.get("start_time")
        if dt:
            try:
                dt_obj = datetime.fromisoformat(dt.replace("Z", "+00:00"))
                local_dt = dt_obj.astimezone()
                hour_key = f"{local_dt.hour:02d}:00"
                hourly_data[hour_key]["input_tokens"] += s["input_tokens"]
                hourly_data[hour_key]["output_tokens"] += s["output_tokens"]
                hourly_data[hour_key]["cache_creation"] += s["cache_creation_input_tokens"]
                hourly_data[hour_key]["cache_read"] += s["cache_read_input_tokens"]
                hourly_data[hour_key]["sessions"] += 1
            except Exception:
                pass

    hourly_timeline = []
    for i in range(24):
        key = f"{i:02d}:00"
        v = hourly_data.get(key, {"input_tokens": 0, "output_tokens": 0, "cache_creation": 0, "cache_read": 0, "sessions": 0})
        hourly_timeline.append({
            "hour": key,
            "input_tokens": v["input_tokens"],
            "output_tokens": v["output_tokens"],
            "cache_creation": v["cache_creation"],
            "cache_read": v["cache_read"],
            "total_tokens": v["input_tokens"] + v["output_tokens"] + v["cache_creation"] + v["cache_read"],
            "sessions": v["sessions"],
        })

    # 按项目汇总
    project_data = defaultdict(lambda: {
        "input_tokens": 0, "output_tokens": 0,
        "cache_creation": 0, "cache_read": 0, "sessions": 0, "est_cost": 0.0
    })
    for s in sessions:
        p = s["project"]
        project_data[p]["input_tokens"] += s["input_tokens"]
        project_data[p]["output_tokens"] += s["output_tokens"]
        project_data[p]["cache_creation"] += s["cache_creation_input_tokens"]
        project_data[p]["cache_read"] += s["cache_read_input_tokens"]
        project_data[p]["sessions"] += 1
        project_data[p]["est_cost"] += _session_cost(s)

    sorted_projects = sorted(project_data.items(), key=lambda x: x[1]["input_tokens"], reverse=True)
    top_projects = sorted_projects[:20]
    other_projects = sorted_projects[20:]

    project_list = []
    for p, v in top_projects:
        project_list.append({
            "project": p,
            "input_tokens": v["input_tokens"],
            "output_tokens": v["output_tokens"],
            "cache_creation": v["cache_creation"],
            "cache_read": v["cache_read"],
            "total_tokens": v["input_tokens"] + v["output_tokens"] + v["cache_creation"] + v["cache_read"],
            "sessions": v["sessions"],
            "est_cost": round(v["est_cost"], 2),
        })

    if other_projects:
        other = {"project": "其他项目", "input_tokens": 0, "output_tokens": 0,
                 "cache_creation": 0, "cache_read": 0, "sessions": 0, "est_cost": 0.0}
        for p, v in other_projects:
            other["input_tokens"] += v["input_tokens"]
            other["output_tokens"] += v["output_tokens"]
            other["cache_creation"] += v["cache_creation"]
            other["cache_read"] += v["cache_read"]
            other["sessions"] += v["sessions"]
            other["est_cost"] += v["est_cost"]
        other["total_tokens"] = other["input_tokens"] + other["output_tokens"]
        other["est_cost"] = round(other["est_cost"], 2)
        project_list.append(other)

    projects = project_list

    # 按模型汇总
    model_data = defaultdict(lambda: {
        "input_tokens": 0, "output_tokens": 0, "sessions": 0
    })
    for s in sessions:
        for model in s["models"]:
            model_data[model]["input_tokens"] += s["input_tokens"]
            model_data[model]["output_tokens"] += s["output_tokens"]
            model_data[model]["sessions"] += 1

    models = [
        {"model": m, **v}
        for m, v in sorted(model_data.items(), key=lambda x: x[1]["input_tokens"], reverse=True)
    ]

    # ── 工具统计 → Array 格式 ─────────────────────────────────────────
    tool_totals = defaultdict(lambda: {"count": 0, "errors": 0, "rejected": 0})
    for s in sessions:
        for tool_name, stats in s.get("tool_stats", {}).items():
            tool_totals[tool_name]["count"] += stats.get("count", 0)
            tool_totals[tool_name]["errors"] += stats.get("errors", 0)

    tools = []
    for name, v in sorted(tool_totals.items(), key=lambda x: x[1]["count"], reverse=True):
        sr = round((v["count"] - v["errors"]) / max(1, v["count"]) * 100, 1)
        tools.append({"name": name, "count": v["count"], "errors": v["errors"], "rejected": 0, "success_rate": sr})

    # ── 文件操作统计 ──────────────────────────────────────────────────
    file_totals = defaultdict(lambda: {"reads": 0, "writes": 0, "edits": 0, "projects": set()})
    for s in sessions:
        for fp, ops in s.get("file_operations", {}).items():
            file_totals[fp]["reads"] += ops.get("reads", 0)
            file_totals[fp]["writes"] += ops.get("writes", 0)
            file_totals[fp]["edits"] += ops.get("edits", 0)
            file_totals[fp]["projects"].add(s["project"])

    files = []
    for fp, v in sorted(file_totals.items(), key=lambda x: x[1]["reads"]+x[1]["writes"]+x[1]["edits"], reverse=True)[:30]:
        to = v["reads"] + v["writes"] + v["edits"]
        files.append({"file": fp, "reads": v["reads"], "writes": v["writes"], "edits": v["edits"], "total_ops": to, "projects": list(v["projects"])})

    # ── Bash 命令统计 ─────────────────────────────────────────────────
    bash_summary = defaultdict(lambda: {"count": 0, "errors": 0})
    for s in sessions:
        for cmd in s.get("bash_commands", []):
            ct = cmd.get("command", "unknown")
            bash_summary[ct]["count"] += 1
            if cmd.get("is_error"): bash_summary[ct]["errors"] += 1
    bash_commands = [{"command": ct, "count": v["count"], "errors": v["errors"]} for ct, v in sorted(bash_summary.items(), key=lambda x: x[1]["count"], reverse=True)[:20]]

    # ── 工具链路统计 ──────────────────────────────────────────────────
    chain_patterns = defaultdict(int)
    for s in sessions:
        chain = s.get("tool_chain", [])
        for i in range(len(chain) - 1):
            chain_patterns[f"{chain[i]} → {chain[i+1]}"] += 1
    tool_chains = [{"pattern": p, "count": c} for p, c in sorted(chain_patterns.items(), key=lambda x: x[1], reverse=True)[:20]]

    # ── Thinking 统计 ─────────────────────────────────────────────────
    thinking_sessions = [s for s in sessions if s.get("has_thinking", False)]
    total_n = len(sessions) or 1
    thinking_by_project = defaultdict(int)
    for s in thinking_sessions:
        thinking_by_project[s["project"]] += s.get("thinking_turns", 0)
    t_buckets = {"1to10": 0, "11to50": 0, "51to200": 0, "gt200": 0}
    for s in thinking_sessions:
        t = s.get("thinking_turns", 0)
        if t <= 10: t_buckets["1to10"] += 1
        elif t <= 50: t_buckets["11to50"] += 1
        elif t <= 200: t_buckets["51to200"] += 1
        else: t_buckets["gt200"] += 1
    thinking_stats = {
        "sessions_with_thinking": len(thinking_sessions),
        "pct_sessions": round(len(thinking_sessions) / total_n * 100, 1),
        "total_turns": sum(s.get("thinking_turns", 0) for s in sessions),
        "by_project": sorted([{"project": p, "turns": t} for p, t in thinking_by_project.items()], key=lambda x: x["turns"], reverse=True)[:10],
        "buckets": t_buckets,
    }

    # ── Agentic 统计 ──────────────────────────────────────────────────
    agentic_vals = []
    for s in sessions:
        sr = s.get("stop_reasons", {})
        tsr = sum(sr.values()) or 1
        agentic_vals.append(sr.get("tool_use", 0) / tsr)
    agentic_vals = [v for v in agentic_vals if v > 0]
    agentic_stats = {
        "avg_ratio": round(sum(agentic_vals) / len(agentic_vals), 3) if agentic_vals else 0,
        "highly_agentic_count": sum(1 for v in agentic_vals if v > 0.9),
    }

    # ── 权限模式汇总 ──────────────────────────────────────────────────
    permission_totals = Counter()
    for s in sessions:
        for mode, cnt in s.get("permission_modes", {}).items():
            permission_totals[mode] += cnt
    permission_summary = [{"mode": m, "count": c} for m, c in permission_totals.most_common()]

    # ── 权限按周聚合 ──────────────────────────────────────────────────
    week_permission = defaultdict(lambda: Counter())
    for s in sessions:
        if not s.get("date"): continue
        try:
            dt = datetime.strptime(s["date"], "%Y-%m-%d")
            wk = dt.strftime("%Y-W%V")
            for mode, cnt in s.get("permission_modes", {}).items():
                week_permission[wk][mode] += cnt
        except ValueError: pass
    autonomy_trend = []
    for wk in sorted(week_permission.keys()):
        wc = week_permission[wk]
        tw = sum(wc.values()) or 1
        autonomy_trend.append({"week": wk, "default": wc.get("default",0), "acceptEdits": wc.get("acceptEdits",0), "bypassPermissions": wc.get("bypassPermissions",0), "plan": wc.get("plan",0), "total": tw})

    # ── 稳定性 ────────────────────────────────────────────────────────
    total_api_errors = sum(s.get("api_errors", 0) for s in sessions)
    total_compact = sum(s.get("compact_events", 0) for s in sessions)
    sessions_with_errors = sum(1 for s in sessions if s.get("api_errors", 0) > 0)
    max_retry = max((s.get("max_retry", 0) for s in sessions), default=0)
    compact_by_project = defaultdict(int)
    for s in sessions:
        if s.get("compact_events", 0) > 0:
            compact_by_project[s["project"]] += s["compact_events"]
    top_compact = sorted([{"project": p, "count": c} for p, c in compact_by_project.items()], key=lambda x: x["count"], reverse=True)[:5]
    stability = {
        "total_api_errors": total_api_errors,
        "total_compact_events": total_compact,
        "sessions_with_errors": sessions_with_errors,
        "max_retry_seen": max_retry,
        "top_compact_projects": top_compact,
    }

    # ── 使用时段 & 星期分布 ────────────────────────────────────────────
    hourly = [0] * 24
    weekday_counts = [0] * 7
    hour_weekday_matrix = [[0] * 24 for _ in range(7)]
    for s in sessions:
        try:
            dt = datetime.fromisoformat(s["start_time"].replace("Z", "+00:00")).astimezone()
            h, w = dt.hour, dt.weekday()
            if 0 <= h < 24: hourly[h] += 1
            if 0 <= w < 7: weekday_counts[w] += 1
            if 0 <= w < 7 and 0 <= h < 24: hour_weekday_matrix[w][h] += 1
        except (ValueError, KeyError): pass
    peak_hour = hourly.index(max(hourly)) if any(hourly) else 0

    # ── Streak ────────────────────────────────────────────────────────
    from datetime import timedelta
    active_dates = sorted(set(s["date"] for s in sessions if s.get("date")))
    cur_streak, max_streak = 0, 0
    if active_dates:
        today = datetime.now().date()
        active_set = set(active_dates)
        cd = today if str(today) in active_set else today - timedelta(days=1)
        while str(cd) in active_set: cur_streak += 1; cd -= timedelta(days=1)
        st = 1
        for i in range(1, len(active_dates)):
            d1 = datetime.strptime(active_dates[i-1], "%Y-%m-%d").date()
            d2 = datetime.strptime(active_dates[i], "%Y-%m-%d").date()
            if (d2-d1).days == 1: st += 1; max_streak = max(max_streak, st)
            else: st = 1
        max_streak = max(max_streak, st)
    streak = {"current": cur_streak, "max": max_streak, "active_days": len(active_dates)}

    # ── 版本时间线 ────────────────────────────────────────────────────
    version_dates = defaultdict(list)
    for s in sessions:
        v, d = s.get("version",""), s.get("date","")
        if v and d: version_dates[v].append(d)
    version_timeline = [{"version": v, "first_seen": min(dl), "last_seen": max(dl), "session_count": len(dl)} for v, dl in sorted(version_dates.items(), key=lambda x: min(x[1]) if x[1] else "")]

    # ── MCP 汇总 ──────────────────────────────────────────────────────
    mcp_totals = Counter()
    for s in sessions:
        for srv, cnt in s.get("mcp_tools", {}).items(): mcp_totals[srv] += cnt
    mcp_summary = [{"server": k, "count": v} for k, v in mcp_totals.most_common()]

    # ── Skill 汇总 ────────────────────────────────────────────────────
    skill_totals = Counter()
    skill_by_project = defaultdict(Counter)
    for s in sessions:
        for sk, cnt in s.get("skill_calls", {}).items():
            skill_totals[sk] += cnt; skill_by_project[s["project"]][sk] += cnt
    top_sp = sorted(skill_by_project.items(), key=lambda x: sum(x[1].values()), reverse=True)[:10]
    skill_summary = {
        "total_calls": sum(skill_totals.values()), "unique_skills": len(skill_totals),
        "ranking": [{"skill": k, "count": v} for k, v in skill_totals.most_common()],
        "by_project": [{"project": p, "skills": [{"skill": sk, "count": c} for sk, c in sorted(v.items(), key=lambda x: -x[1])[:5]]} for p, v in top_sp],
    }

    # ── 真实费用 ──────────────────────────────────────────────────────
    cr_sessions = [s for s in sessions if s.get("final_cost") is not None]
    cr_by_proj = defaultdict(float)
    for s in cr_sessions: cr_by_proj[s["project"]] += s["final_cost"]
    cost_real = {
        "total": round(sum(s["final_cost"] for s in cr_sessions), 2) if cr_sessions else 0,
        "max_session": round(max((s["final_cost"] for s in cr_sessions), default=0), 2),
        "session_count": len(cr_sessions),
        "by_project": sorted([{"project": p, "cost": round(c,2)} for p,c in cr_by_proj.items()], key=lambda x: x["cost"], reverse=True)[:10],
    }

    # ── Turn duration ─────────────────────────────────────────────────
    all_avg_ms = [s["avg_turn_ms"] for s in sessions if s.get("avg_turn_ms", 0) > 0]
    if all_avg_ms:
        sorted_ms = sorted(all_avg_ms)
        n = len(sorted_ms)
        buckets = {"lt1m": 0, "1to5m": 0, "5to15m": 0, "gt15m": 0}
        for ms in all_avg_ms:
            s_val = ms / 1000
            if s_val < 60: buckets["lt1m"] += 1
            elif s_val < 300: buckets["1to5m"] += 1
            elif s_val < 900: buckets["5to15m"] += 1
            else: buckets["gt15m"] += 1
        p50 = sorted_ms[n // 2] if n > 0 else 0
        p90 = sorted_ms[int(n * 0.9)] if n > 0 else 0
        turn_duration_stats = {
            "count": n,
            "avg_ms": int(sum(all_avg_ms) / n),
            "p50_ms": p50,
            "p90_ms": p90,
            "max_ms": max(all_avg_ms),
            "total_hours": round(sum(s.get("total_turn_ms", 0) for s in sessions) / 3_600_000, 2),
            "buckets": buckets,
        }
    else:
        turn_duration_stats = {
            "count": 0, "avg_ms": 0, "p50_ms": 0, "p90_ms": 0,
            "max_ms": 0, "total_hours": 0, "buckets": {"lt1m": 0, "1to5m": 0, "5to15m": 0, "gt15m": 0},
        }
    slowest = sorted(
        [s for s in sessions if s.get("avg_turn_ms", 0) > 0],
        key=lambda x: x["avg_turn_ms"], reverse=True
    )[:5]
    turn_duration_stats["slowest_sessions"] = [
        {"id": s["id"], "project": s["project"], "date": s["date"], "avg_turn_ms": s["avg_turn_ms"]}
        for s in slowest
    ]

    return {
        "total_sessions": len(sessions),
        "total_input_tokens": total_input, "total_output_tokens": total_output,
        "total_cache_creation": total_cache_creation, "total_cache_read": total_cache_read,
        "total_tokens": total_tokens, "total_cost": round(total_cost, 2),
        "daily": daily, "projects": projects, "models": models,
        "tools": tools, "files": files, "bash_commands": bash_commands, "tool_chains": tool_chains,
        "turn_duration_stats": turn_duration_stats,
        "thinking_stats": thinking_stats, "agentic_stats": agentic_stats,
        "stability": stability, "permission_summary": permission_summary, "autonomy_trend": autonomy_trend,
        "hourly": hourly, "weekday": weekday_counts, "hour_weekday_matrix": hour_weekday_matrix,
        "peak_hour": peak_hour, "streak": streak, "version_timeline": version_timeline,
        "hourly_timeline": hourly_timeline,
        "mcp_summary": mcp_summary, "skill_summary": skill_summary, "cost_real": cost_real,
    }


def generate_report(data, output_dir):
    """生成静态 HTML 报告目录。"""
    out = Path(output_dir)
    out.mkdir(parents=True, exist_ok=True)

    templates_dir = Path(__file__).parent / "templates"

    # 生成 token_data.js
    data_js = f"window.TOKEN_DATA = {json.dumps(data, ensure_ascii=False, indent=2)};\n"
    (out / "token_data.js").write_text(data_js, encoding="utf-8")

    # 复制模板文件
    for fname in ["dashboard.html", "style.css", "app.js", "logo.svg"]:
        src = templates_dir / fname
        if src.exists():
            shutil.copy2(src, out / fname)

    # 重命名 dashboard.html 为 index.html
    if (out / "dashboard.html").exists():
        (out / "dashboard.html").rename(out / "index.html")

    return out


def main():
    """主入口函数。"""
    print("=" * 50)
    print("Token-Insights Skill - Generating static report...")
    print("=" * 50)
    print()

    # 解析会话
    print("Parsing session logs from ~/.claude/projects/...")
    sessions = parse_all_sessions()
    print(f"  Found {len(sessions)} sessions")

    # 计算汇总
    print("Computing statistics...")
    summary = compute_summary(sessions)

    print()
    print("Summary:")
    print(f"  Total tokens: {summary['total_tokens']:,}")
    print(f"  Total cost: ${summary['total_cost']:.2f}")
    print(f"  Total sessions: {summary['total_sessions']}")
    print(f"  Date range: {summary['daily'][0]['date'] if summary['daily'] else 'N/A'} ~ {summary['daily'][-1]['date'] if summary['daily'] else 'N/A'}")
    print()

    # 准备嵌入数据
    report_data = {
        "generated_at": datetime.now().isoformat(),
        "summary": summary,
        "sessions": sessions[:100],  # 限制前 100 条
    }

    # 生成 HTML 报告目录
    print("Generating HTML report...")
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    output_dir = Path(__file__).parent / "output" / f"token-insights-{timestamp}"
    out = generate_report(report_data, output_dir)

    print()
    print("=" * 50)
    print(f"✓ Report generated: {out / 'index.html'}")
    print(f"  Report directory: {out}")
    print("=" * 50)
    print()
    print(f"Open with:")
    print(f"  open {out / 'index.html'}")
    print()


if __name__ == "__main__":
    main()
