#!/usr/bin/env python3
"""从 ~/.claude/projects/ 目录解析 token 使用明细数据。"""

import json
import re
import time
from pathlib import Path
from datetime import datetime, timezone
from collections import defaultdict, Counter

PROJECTS_DIR = Path.home() / ".claude" / "projects"
OUTPUT_JS = Path(__file__).parent.parent / "data" / "token_data.js"
CACHE_FILE = Path(__file__).parent.parent / "data" / ".session_cache.json"
SUMMARY_CACHE_FILE = Path(__file__).parent.parent / "data" / ".summary_cache.json"
CACHE_VERSION = "v4"  # 递增此值以使旧缓存失效

# ── 模型定价（$/M tokens，唯一权威来源） ──────────────────────────
MODEL_PRICING = {
    "claude-opus-4-5":   {"input": 15.00, "output": 75.00, "cw": 18.75, "cr": 1.50},
    "claude-opus-4":     {"input": 15.00, "output": 75.00, "cw": 18.75, "cr": 1.50},
    "claude-sonnet-4-5": {"input":  3.00, "output": 15.00, "cw":  3.75, "cr": 0.30},
    "claude-sonnet-4":   {"input":  3.00, "output": 15.00, "cw":  3.75, "cr": 0.30},
    "claude-haiku-4-5":  {"input":  0.80, "output":  4.00, "cw":  1.00, "cr": 0.08},
    "claude-haiku-4":    {"input":  0.80, "output":  4.00, "cw":  1.00, "cr": 0.08},
    "claude-opus-3":     {"input": 15.00, "output": 75.00, "cw": 18.75, "cr": 1.50},
    "claude-sonnet-3":   {"input":  3.00, "output": 15.00, "cw":  3.75, "cr": 0.30},
    "claude-haiku-3":    {"input":  0.25, "output":  1.25, "cw":  0.30, "cr": 0.03},
}
_DEFAULT_P = {"input": 3.00, "output": 15.00, "cw": 3.75, "cr": 0.30}


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


def _load_cache() -> dict:
    """加载 session 解析缓存（按 mtime 跳过未变文件）。"""
    try:
        if CACHE_FILE.exists():
            raw = json.loads(CACHE_FILE.read_text(encoding="utf-8"))
            if raw.get("version") == CACHE_VERSION:
                return raw.get("sessions", {})
    except Exception:
        pass
    return {}


def _save_cache(sessions_cache: dict) -> None:
    try:
        CACHE_FILE.write_text(
            json.dumps({"version": CACHE_VERSION, "sessions": sessions_cache},
                       ensure_ascii=False),
            encoding="utf-8",
        )
    except Exception:
        pass


def _load_summary_cache():
    """返回缓存的 summary，若不存在或 key 不匹配则返回 None。"""
    try:
        if SUMMARY_CACHE_FILE.exists():
            return json.loads(SUMMARY_CACHE_FILE.read_text(encoding="utf-8"))
    except Exception:
        pass
    return None


def _save_summary_cache(summary: dict) -> None:
    try:
        SUMMARY_CACHE_FILE.write_text(
            json.dumps(summary, ensure_ascii=False),
            encoding="utf-8",
        )
    except Exception:
        pass


def parse_all_sessions():
    """
    解析所有项目的会话文件（未变文件走缓存）。
    返回 (sessions, all_cached)：
      - sessions: 有效会话列表
      - all_cached: True 表示所有文件均命中缓存（数据无变化）
    """
    sessions = []
    cache = _load_cache()
    new_cache: dict = {}
    hits = misses = 0

    for project_dir in PROJECTS_DIR.iterdir():
        if not project_dir.is_dir():
            continue

        project_name = project_dir.name

        for jsonl_file in project_dir.glob("*.jsonl"):
            cache_key = str(jsonl_file)
            try:
                mtime = jsonl_file.stat().st_mtime
                entry = cache.get(cache_key)
                if entry and entry.get("mtime") == mtime:
                    session_data = entry["data"]  # 可能为 None（空会话，已记录过）
                    hits += 1
                else:
                    session_data = parse_session_file(jsonl_file, project_name)
                    misses += 1
                # 无论 session_data 是否为 None，都写入 new_cache：
                #   - 防止空会话每次重复解析
                #   - 未出现在 new_cache 的旧 key 会被自动丢弃（清理删除的文件）
                new_cache[cache_key] = {"mtime": mtime, "data": session_data}
                if session_data:
                    sessions.append(session_data)
            except Exception as e:
                print(f"解析失败 {jsonl_file.name}: {e}")

    _save_cache(new_cache)
    all_cached = (misses == 0 and hits > 0)
    if hits or misses:
        print(f"  缓存命中 {hits}/{hits+misses} 个文件{' (全量命中)' if all_cached else ''}")

    # 按时间排序
    sessions.sort(key=lambda x: x["start_time"], reverse=True)
    return sessions, all_cached


def parse_session_file(jsonl_path, project_name):
    """解析单个会话文件。"""
    session_id = jsonl_path.stem
    messages = []
    usage_total = {
        "input_tokens": 0,
        "output_tokens": 0,
        "cache_creation_input_tokens": 0,
        "cache_read_input_tokens": 0,
        "web_search_requests": 0,
        "web_fetch_requests": 0,
    }
    models = set()
    first_timestamp = None
    last_timestamp = None
    user_messages = 0
    assistant_messages = 0
    first_prompt = ""
    cwd = ""

    # 工具调用相关数据
    tool_calls = []  # 按顺序记录工具调用
    tool_results = {}  # tool_use_id -> result info
    tool_errors = []  # 错误记录

    # 新增字段
    turn_durations = []
    api_error_count = 0
    max_retry_attempt = 0
    compact_count = 0
    thinking_turns = 0
    permission_modes = Counter()
    git_branch_val = ""
    version_val = ""
    cost_snapshots = []
    stop_reasons = Counter()
    mcp_tools_counter = Counter()
    skill_calls_counter = Counter()

    with open(jsonl_path, "r", encoding="utf-8") as f:
        for line in f:
            try:
                data = json.loads(line.strip())
            except json.JSONDecodeError:
                continue

            record_type = data.get("type", "")
            timestamp = data.get("timestamp", "")

            # 记录时间范围
            if timestamp:
                try:
                    dt = datetime.fromisoformat(timestamp.replace("Z", "+00:00"))
                    if first_timestamp is None or dt < first_timestamp:
                        first_timestamp = dt
                    if last_timestamp is None or dt > last_timestamp:
                        last_timestamp = dt
                except (ValueError, TypeError):
                    pass  # 忽略无效时间戳

            # 获取项目路径
            if "cwd" in data and not cwd:
                cwd = data["cwd"]

            # 提取顶层元数据
            if "gitBranch" in data and not git_branch_val:
                git_branch_val = data["gitBranch"]
            if "version" in data and not version_val:
                version_val = data["version"]
            if "permissionMode" in data:
                permission_modes[data["permissionMode"]] += 1

            # system 类型记录
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

            # 统计消息数量
            if record_type == "user":
                user_messages += 1
                # 获取第一个用户 prompt
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
                            # 提取工具结果
                            elif isinstance(item, dict) and item.get("type") == "tool_result":
                                tool_id = item.get("tool_use_id", "")
                                is_error = item.get("is_error", False)
                                result_content = item.get("content", "")

                                # 判断错误类型
                                error_type = None
                                if is_error:
                                    if "doesn't want to proceed" in str(result_content):
                                        error_type = "rejected"
                                    elif "Exit code" in str(result_content):
                                        error_type = "command_failed"
                                    else:
                                        error_type = "other_error"

                                tool_results[tool_id] = {
                                    "is_error": is_error,
                                    "error_type": error_type,
                                }

            elif record_type == "assistant":
                assistant_messages += 1

                # 提取 usage 数据
                if "message" in data:
                    msg = data["message"]
                    usage = msg.get("usage", {})

                    if usage:
                        usage_total["input_tokens"] += usage.get("input_tokens", 0) or 0
                        usage_total["output_tokens"] += usage.get("output_tokens", 0) or 0
                        usage_total["cache_creation_input_tokens"] += usage.get("cache_creation_input_tokens", 0) or 0
                        usage_total["cache_read_input_tokens"] += usage.get("cache_read_input_tokens", 0) or 0

                        # server_tool_use
                        stu = usage.get("server_tool_use", {})
                        usage_total["web_search_requests"] += stu.get("web_search_requests", 0) or 0
                        usage_total["web_fetch_requests"] += stu.get("web_fetch_requests", 0) or 0

                    # 记录模型，过滤 <synthetic> 等内部占位名称
                    model = msg.get("model", "")
                    if model and not model.startswith("<"):
                        models.add(model)

                    # stop_reason
                    sr = msg.get("stop_reason", "")
                    if sr:
                        stop_reasons[sr] += 1

                    # 提取工具调用
                    content = msg.get("content", [])
                    if isinstance(content, list):
                        for item in content:
                            if isinstance(item, dict) and item.get("type") == "thinking":
                                thinking_turns += 1
                            elif isinstance(item, dict) and item.get("type") == "tool_use":
                                tool_name = item.get("name", "")
                                tool_id = item.get("id", "")
                                tool_input = item.get("input", {})

                                tool_call = {
                                    "name": tool_name,
                                    "id": tool_id,
                                    "timestamp": timestamp,
                                }

                                # 提取关键参数
                                if tool_name == "Read":
                                    tool_call["file"] = tool_input.get("file_path", "")
                                elif tool_name == "Write":
                                    tool_call["file"] = tool_input.get("file_path", "")
                                elif tool_name == "Edit":
                                    tool_call["file"] = tool_input.get("file_path", "")
                                elif tool_name == "Glob":
                                    tool_call["pattern"] = tool_input.get("pattern", "")
                                elif tool_name == "Grep":
                                    tool_call["pattern"] = tool_input.get("pattern", "")
                                elif tool_name == "Bash":
                                    tool_call["command"] = tool_input.get("command", "")

                                tool_calls.append(tool_call)

                                # MCP 工具统计
                                if tool_name.startswith("mcp__"):
                                    parts = tool_name.split("__")
                                    if len(parts) >= 2:
                                        mcp_tools_counter[parts[1]] += 1
                                # Skill 工具拆解
                                elif tool_name == "Skill":
                                    sn = tool_input.get("skill", "") if isinstance(tool_input, dict) else ""
                                    if sn:
                                        skill_calls_counter[sn] += 1

    # 如果没有任何 token 使用，跳过这个会话
    if usage_total["input_tokens"] == 0 and usage_total["output_tokens"] == 0:
        return None

    # 计算时长
    duration_minutes = 0
    if first_timestamp and last_timestamp:
        duration_minutes = int((last_timestamp - first_timestamp).total_seconds() / 60)

    # 简化项目名称
    display_project = cwd.split("/")[-1] if cwd else project_name.split("-")[-1]

    # 转本地时间后再格式化日期，避免 UTC 日期与本地日期不一致（UTC+8 下凌晨会差一天）
    local_start = first_timestamp.astimezone() if first_timestamp else None

    # 合并工具调用结果
    for tc in tool_calls:
        tool_id = tc.get("id", "")
        if tool_id in tool_results:
            result = tool_results[tool_id]
            tc["is_error"] = result["is_error"]
            tc["error_type"] = result["error_type"]
        else:
            tc["is_error"] = False
            tc["error_type"] = None

    # 计算工具统计
    tool_stats = defaultdict(lambda: {"count": 0, "errors": 0, "rejected": 0})
    for tc in tool_calls:
        name = tc.get("name", "unknown")
        tool_stats[name]["count"] += 1
        if tc.get("is_error"):
            tool_stats[name]["errors"] += 1
            if tc.get("error_type") == "rejected":
                tool_stats[name]["rejected"] += 1

    # 文件操作统计
    file_operations = defaultdict(lambda: {"reads": 0, "writes": 0, "edits": 0})
    for tc in tool_calls:
        name = tc.get("name", "")
        file_path = tc.get("file", "")
        if file_path:
            # 简化路径，只保留最后几层
            short_path = "/".join(file_path.split("/")[-3:]) if "/" in file_path else file_path
            if name == "Read":
                file_operations[short_path]["reads"] += 1
            elif name == "Write":
                file_operations[short_path]["writes"] += 1
            elif name == "Edit":
                file_operations[short_path]["edits"] += 1

    # Bash 命令统计
    bash_commands = []
    for tc in tool_calls:
        if tc.get("name") == "Bash" and tc.get("command"):
            cmd_text = tc["command"]
            bash_commands.append({
                "command": cmd_text.split()[0] if cmd_text.strip() else "unknown",
                "is_error": tc.get("is_error", False),
            })

    # 工具调用链路（按顺序）
    tool_chain = [tc["name"] for tc in tool_calls]

    result = {
        "id": session_id,
        "project": display_project,
        "project_path": cwd,
        "start_time": first_timestamp.isoformat() if first_timestamp else "",
        "start_time_str": local_start.strftime("%Y-%m-%d %H:%M") if local_start else "",
        "date": local_start.strftime("%Y-%m-%d") if local_start else "",
        "time": local_start.strftime("%H:%M") if local_start else "",
        "hour": local_start.hour if local_start else 0,
        "weekday": local_start.weekday() if local_start else 0,
        "duration_minutes": duration_minutes,
        "user_messages": user_messages,
        "assistant_messages": assistant_messages,
        "models": list(models),
        "model_str": ", ".join(sorted(models))[:30],
        **usage_total,
        "total_tokens": usage_total["input_tokens"] + usage_total["output_tokens"],
        "first_prompt": first_prompt,
        # 工具调用数据（tool_calls 原始数组仅供内部聚合使用，不输出到 JSON）
        "tool_stats": dict(tool_stats),
        "tool_chain": tool_chain,
        "file_operations": dict(file_operations),
        "bash_commands": bash_commands,
        # 新增字段
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
        "final_cost": max(cost_snapshots) if cost_snapshots else None,
        "stop_reasons": dict(stop_reasons),
        "agentic_ratio": round(
            stop_reasons.get("tool_use", 0) / max(1, sum(stop_reasons.values())), 3
        ),
        "mcp_tools": dict(mcp_tools_counter),
        "skill_calls": dict(skill_calls_counter),
    }
    result["est_cost"] = round(_session_cost(result), 6)
    return result


def _compute_basic_totals(sessions):
    """计算基本 Token 总量和日期范围。"""
    total_input = sum(s["input_tokens"] for s in sessions)
    total_output = sum(s["output_tokens"] for s in sessions)
    total_cache_creation = sum(s["cache_creation_input_tokens"] for s in sessions)
    total_cache_read = sum(s["cache_read_input_tokens"] for s in sessions)

    dates = [s["date"] for s in sessions if s["date"]]
    date_range = {
        "start": min(dates) if dates else "",
        "end": max(dates) if dates else "",
    }

    return {
        "total_input_tokens": total_input,
        "total_output_tokens": total_output,
        "total_cache_creation": total_cache_creation,
        "total_cache_read": total_cache_read,
        "total_tokens": total_input + total_output,
        "date_range": date_range,
    }


def _compute_daily_stats(sessions):
    """计算每日聚合统计（含费用）。"""
    daily = defaultdict(lambda: {
        "input_tokens": 0, "output_tokens": 0, "cache_creation": 0,
        "cache_read": 0, "sessions": 0, "duration": 0,
    })
    for s in sessions:
        d = s["date"]
        if d:
            daily[d]["input_tokens"] += s["input_tokens"]
            daily[d]["output_tokens"] += s["output_tokens"]
            daily[d]["cache_creation"] += s["cache_creation_input_tokens"]
            daily[d]["cache_read"] += s["cache_read_input_tokens"]
            daily[d]["sessions"] += 1
            daily[d]["duration"] += s["duration_minutes"]

    daily_cost_map = defaultdict(float)
    daily_errors_map = defaultdict(int)
    daily_real_cost_map = defaultdict(float)

    daily_list = []
    for d in sorted(daily.keys()):
        v = daily[d]
        # 收集费用数据
        for s in sessions:
            if s.get("date") == d:
                daily_cost_map[d] += s.get("est_cost") or 0
                daily_errors_map[d] += s.get("api_errors", 0)
                if s.get("final_cost") is not None:
                    daily_real_cost_map[d] += s["final_cost"]

        item = {
            "date": d,
            "input_tokens": v["input_tokens"],
            "output_tokens": v["output_tokens"],
            "cache_creation": v["cache_creation"],
            "cache_read": v["cache_read"],
            "total_tokens": v["input_tokens"] + v["output_tokens"],
            "sessions": v["sessions"],
            "duration_minutes": v["duration"],
            "est_cost": round(daily_cost_map.get(d, 0), 4),
            "api_errors": daily_errors_map.get(d, 0),
        }
        rc = daily_real_cost_map.get(d)
        item["real_cost"] = round(rc, 4) if rc else None
        daily_list.append(item)

    return daily_list


def _compute_project_stats(sessions):
    """计算项目聚合统计（含费用）。"""
    projects = defaultdict(lambda: {
        "input_tokens": 0, "output_tokens": 0,
        "cache_creation": 0, "cache_read": 0, "sessions": 0,
    })
    for s in sessions:
        p = s["project"]
        projects[p]["input_tokens"] += s["input_tokens"]
        projects[p]["output_tokens"] += s["output_tokens"]
        projects[p]["cache_creation"] += s["cache_creation_input_tokens"]
        projects[p]["cache_read"] += s["cache_read_input_tokens"]
        projects[p]["sessions"] += 1

    sorted_projects = sorted(projects.items(), key=lambda x: x[1]["input_tokens"], reverse=True)
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
            "total_tokens": v["input_tokens"] + v["output_tokens"],
            "sessions": v["sessions"],
        })

    if other_projects:
        other = {"project": "其他项目", "input_tokens": 0, "output_tokens": 0,
                 "cache_creation": 0, "cache_read": 0, "total_tokens": 0, "sessions": 0}
        for p, v in other_projects:
            for k in ("input_tokens", "output_tokens", "cache_creation", "cache_read", "sessions"):
                other[k] += v[k]
        other["total_tokens"] = other["input_tokens"] + other["output_tokens"]
        project_list.append(other)

    # 追加项目费用
    session_cost_by_project = defaultdict(float)
    for s in sessions:
        session_cost_by_project[s["project"]] += s.get("est_cost") or 0
    top_project_names = {item["project"] for item in project_list if item["project"] != "其他项目"}
    for item in project_list:
        if item["project"] == "其他项目":
            top_cost = sum(session_cost_by_project.get(p, 0) for p in top_project_names)
            all_cost = sum(session_cost_by_project.values())
            item["est_cost"] = round(all_cost - top_cost, 2)
        else:
            item["est_cost"] = round(session_cost_by_project.get(item["project"], 0), 2)

    return project_list


def _compute_model_stats(sessions):
    """计算模型使用统计。"""
    models = defaultdict(lambda: {"input_tokens": 0, "output_tokens": 0, "sessions": set()})
    for s in sessions:
        for m in s.get("models", []):
            models[m]["input_tokens"] += s["input_tokens"]
            models[m]["output_tokens"] += s["output_tokens"]
            models[m]["sessions"].add(s["id"])

    return [
        {"model": m, "input_tokens": v["input_tokens"], "output_tokens": v["output_tokens"],
         "sessions": len(v["sessions"])}
        for m, v in sorted(models.items(), key=lambda x: x[1]["input_tokens"], reverse=True)
    ]


def _compute_tool_stats(sessions):
    """计算工具、文件、Bash、工具链统计。"""
    # 工具统计
    tool_totals = defaultdict(lambda: {"count": 0, "errors": 0, "rejected": 0})
    for s in sessions:
        for tool_name, stats in s.get("tool_stats", {}).items():
            tool_totals[tool_name]["count"] += stats["count"]
            tool_totals[tool_name]["errors"] += stats["errors"]
            tool_totals[tool_name]["rejected"] += stats["rejected"]

    tool_list = []
    for name, v in sorted(tool_totals.items(), key=lambda x: x[1]["count"], reverse=True):
        success_rate = (v["count"] - v["errors"]) / v["count"] * 100 if v["count"] > 0 else 100
        tool_list.append({
            "name": name, "count": v["count"], "errors": v["errors"],
            "rejected": v["rejected"], "success_rate": round(success_rate, 1),
        })

    # 文件操作统计
    file_totals = defaultdict(lambda: {"reads": 0, "writes": 0, "edits": 0, "projects": set()})
    for s in sessions:
        for file_path, ops in s.get("file_operations", {}).items():
            file_totals[file_path]["reads"] += ops["reads"]
            file_totals[file_path]["writes"] += ops["writes"]
            file_totals[file_path]["edits"] += ops["edits"]
            file_totals[file_path]["projects"].add(s["project"])

    file_list = []
    for file_path, v in sorted(file_totals.items(),
                                key=lambda x: x[1]["reads"] + x[1]["writes"] + x[1]["edits"],
                                reverse=True)[:30]:
        total_ops = v["reads"] + v["writes"] + v["edits"]
        file_list.append({
            "file": file_path, "reads": v["reads"], "writes": v["writes"],
            "edits": v["edits"], "total_ops": total_ops, "projects": len(v["projects"]),
        })

    # Bash 命令统计
    bash_summary = defaultdict(lambda: {"count": 0, "errors": 0})
    for s in sessions:
        for cmd in s.get("bash_commands", []):
            cmd_type = cmd.get("command", "unknown")
            bash_summary[cmd_type]["count"] += 1
            if cmd.get("is_error"):
                bash_summary[cmd_type]["errors"] += 1

    bash_list = [
        {"command": cmd_type, "count": v["count"], "errors": v["errors"]}
        for cmd_type, v in sorted(bash_summary.items(), key=lambda x: x[1]["count"], reverse=True)[:20]
    ]

    # 工具链路统计
    chain_patterns = defaultdict(int)
    for s in sessions:
        chain = s.get("tool_chain", [])
        for i in range(len(chain) - 1):
            chain_patterns[f"{chain[i]} → {chain[i+1]}"] += 1
        for i in range(len(chain) - 2):
            chain_patterns[f"{chain[i]} → {chain[i+1]} → {chain[i+2]}"] += 1

    chain_list = [
        {"pattern": pattern, "count": count}
        for pattern, count in sorted(chain_patterns.items(), key=lambda x: x[1], reverse=True)[:20]
    ]

    return {"tools": tool_list, "files": file_list, "bash_commands": bash_list, "tool_chains": chain_list}


def _compute_turn_duration_stats(sessions):
    """计算响应时间统计。"""
    all_turn_ms = [s["avg_turn_ms"] for s in sessions if s.get("avg_turn_ms", 0) > 0]
    if all_turn_ms:
        sorted_ms = sorted(all_turn_ms)
        n = len(sorted_ms)
        buckets = {"lt1m": 0, "1to5m": 0, "5to15m": 0, "gt15m": 0}
        for ms in all_turn_ms:
            s_val = ms / 1000
            if s_val < 60:
                buckets["lt1m"] += 1
            elif s_val < 300:
                buckets["1to5m"] += 1
            elif s_val < 900:
                buckets["5to15m"] += 1
            else:
                buckets["gt15m"] += 1

        slowest = sorted(
            [s for s in sessions if s.get("avg_turn_ms", 0) > 0],
            key=lambda x: x["avg_turn_ms"], reverse=True
        )[:5]

        return {
            "count": n,
            "avg_ms": int(sum(all_turn_ms) / n),
            "p50_ms": sorted_ms[n // 2],
            "p90_ms": sorted_ms[int(n * 0.9)],
            "max_ms": max(all_turn_ms),
            "total_hours": round(sum(s.get("total_turn_ms", 0) for s in sessions) / 3_600_000, 2),
            "buckets": buckets,
            "slowest_sessions": [
                {"id": s["id"], "project": s["project"], "date": s["date"], "avg_turn_ms": s["avg_turn_ms"]}
                for s in slowest
            ],
        }
    return {
        "count": 0, "avg_ms": 0, "p50_ms": 0, "p90_ms": 0,
        "max_ms": 0, "total_hours": 0, "buckets": {"lt1m": 0, "1to5m": 0, "5to15m": 0, "gt15m": 0},
        "slowest_sessions": [],
    }


def _compute_thinking_stats(sessions):
    """计算扩展思考统计。"""
    thinking_sessions = [s for s in sessions if s.get("has_thinking")]
    total_sessions_n = len(sessions) or 1

    thinking_by_project = defaultdict(int)
    for s in thinking_sessions:
        thinking_by_project[s["project"]] += s.get("thinking_turns", 0)

    t_buckets = {"1to10": 0, "11to50": 0, "51to200": 0, "gt200": 0}
    for s in thinking_sessions:
        t = s.get("thinking_turns", 0)
        if t <= 10:
            t_buckets["1to10"] += 1
        elif t <= 50:
            t_buckets["11to50"] += 1
        elif t <= 200:
            t_buckets["51to200"] += 1
        else:
            t_buckets["gt200"] += 1

    return {
        "sessions_with_thinking": len(thinking_sessions),
        "pct_sessions": round(len(thinking_sessions) / total_sessions_n * 100, 1),
        "total_turns": sum(s.get("thinking_turns", 0) for s in sessions),
        "by_project": sorted(
            [{"project": p, "turns": t} for p, t in thinking_by_project.items()],
            key=lambda x: x["turns"], reverse=True
        )[:10],
        "buckets": t_buckets,
    }


def _compute_agentic_stats(sessions):
    """计算 Agentic 统计。"""
    agentic_vals = [s["agentic_ratio"] for s in sessions if s.get("agentic_ratio", 0) > 0]
    return {
        "avg_ratio": round(sum(agentic_vals) / len(agentic_vals), 3) if agentic_vals else 0,
        "highly_agentic_count": sum(1 for v in agentic_vals if v > 0.9),
    }


def _compute_stability_stats(sessions):
    """计算稳定性统计。"""
    stability = {
        "total_api_errors": sum(s.get("api_errors", 0) for s in sessions),
        "total_compact_events": sum(s.get("compact_events", 0) for s in sessions),
        "sessions_with_errors": sum(1 for s in sessions if s.get("api_errors", 0) > 0),
        "max_retry_seen": max((s.get("max_retry", 0) for s in sessions), default=0),
    }

    compact_by_project = defaultdict(int)
    for s in sessions:
        if s.get("compact_events", 0) > 0:
            compact_by_project[s["project"]] += s["compact_events"]

    stability["top_compact_projects"] = sorted(
        [{"project": p, "count": c} for p, c in compact_by_project.items()],
        key=lambda x: x["count"], reverse=True
    )[:3]

    return stability


def _compute_permission_stats(sessions):
    """计算权限模式分布和按周趋势。"""
    permission_totals = Counter()
    for s in sessions:
        for mode, cnt in s.get("permission_modes", {}).items():
            permission_totals[mode] += cnt

    permission_summary = [{"mode": m, "count": c} for m, c in permission_totals.most_common()]

    # 按周聚合
    week_permission = defaultdict(lambda: Counter())
    for s in sessions:
        if not s.get("date"):
            continue
        try:
            dt = datetime.strptime(s["date"], "%Y-%m-%d")
            week_key = dt.strftime("%Y-W%V")
            for mode, cnt in s.get("permission_modes", {}).items():
                week_permission[week_key][mode] += cnt
        except ValueError:
            pass

    autonomy_trend = []
    for wk in sorted(week_permission.keys()):
        wc = week_permission[wk]
        total_w = sum(wc.values()) or 1
        autonomy_trend.append({
            "week": wk, "default": wc.get("default", 0),
            "acceptEdits": wc.get("acceptEdits", 0),
            "bypassPermissions": wc.get("bypassPermissions", 0),
            "plan": wc.get("plan", 0), "total": total_w,
        })

    return {"permission_summary": permission_summary, "autonomy_trend": autonomy_trend}


def _compute_time_stats(sessions):
    """计算使用时段、星期分布和连续使用。"""
    hourly = [0] * 24
    weekday_counts = [0] * 7
    hour_weekday_matrix = [[0] * 24 for _ in range(7)]

    for s in sessions:
        h = s.get("hour", 0)
        w = s.get("weekday", 0)
        if 0 <= h < 24:
            hourly[h] += 1
        if 0 <= w < 7:
            weekday_counts[w] += 1
        if 0 <= w < 7 and 0 <= h < 24:
            hour_weekday_matrix[w][h] += 1

    peak_hour = hourly.index(max(hourly)) if any(hourly) else 0

    # Streak 计算
    active_dates = sorted(set(s["date"] for s in sessions if s.get("date")))
    from datetime import timedelta
    current_streak = max_streak = 0
    if active_dates:
        today = datetime.now().date()
        yesterday = today - timedelta(days=1)
        active_set = set(active_dates)
        check_date = today if str(today) in active_set else yesterday
        while str(check_date) in active_set:
            current_streak += 1
            check_date -= timedelta(days=1)
        streak = 1
        for i in range(1, len(active_dates)):
            d1 = datetime.strptime(active_dates[i - 1], "%Y-%m-%d").date()
            d2 = datetime.strptime(active_dates[i], "%Y-%m-%d").date()
            if (d2 - d1).days == 1:
                streak += 1
                max_streak = max(max_streak, streak)
            else:
                streak = 1
        max_streak = max(max_streak, streak)

    return {
        "hourly": hourly, "weekday": weekday_counts,
        "hour_weekday_matrix": hour_weekday_matrix, "peak_hour": peak_hour,
        "streak": {"current": current_streak, "max": max_streak, "active_days": len(active_dates)},
    }


def _compute_version_stats(sessions):
    """计算版本时间线。"""
    version_dates = defaultdict(list)
    for s in sessions:
        v = s.get("version", "")
        d = s.get("date", "")
        if v and d:
            version_dates[v].append(d)

    return [
        {"version": v, "first_seen": min(dates_list), "last_seen": max(dates_list),
         "session_count": len(dates_list)}
        for v, dates_list in sorted(version_dates.items(), key=lambda x: min(x[1]) if x[1] else "")
    ]


def _compute_mcp_stats(sessions):
    """计算 MCP 统计。"""
    mcp_totals = Counter()
    for s in sessions:
        for server, cnt in s.get("mcp_tools", {}).items():
            mcp_totals[server] += cnt
    return [{"server": k, "count": v} for k, v in mcp_totals.most_common()]


def _compute_skill_stats(sessions):
    """计算 Skill 统计。"""
    skill_totals = Counter()
    skill_by_project = defaultdict(Counter)
    for s in sessions:
        for sk, cnt in s.get("skill_calls", {}).items():
            skill_totals[sk] += cnt
            skill_by_project[s["project"]][sk] += cnt

    top_skill_projects = sorted(
        skill_by_project.items(), key=lambda x: sum(x[1].values()), reverse=True
    )[:10]

    return {
        "total_calls": sum(skill_totals.values()),
        "unique_skills": len(skill_totals),
        "ranking": [{"skill": k, "count": v} for k, v in skill_totals.most_common()],
        "by_project": [
            {"project": p, "skills": [{"skill": sk, "count": c} for sk, c in sorted(v.items(), key=lambda x: -x[1])[:5]]}
            for p, v in top_skill_projects
        ],
    }


def _compute_cost_stats(sessions):
    """计算真实费用统计。"""
    cost_real_by_project = defaultdict(float)
    cost_real_sessions = [s for s in sessions if s.get("final_cost") is not None]
    for s in cost_real_sessions:
        cost_real_by_project[s["project"]] += s["final_cost"]

    return {
        "total": round(sum(s["final_cost"] for s in cost_real_sessions), 2),
        "max_session": round(max((s["final_cost"] for s in cost_real_sessions), default=0), 2),
        "session_count": len(cost_real_sessions),
        "by_project": sorted(
            [{"project": p, "cost": round(c, 2)} for p, c in cost_real_by_project.items()],
            key=lambda x: x["cost"], reverse=True
        )[:10],
    }


def compute_summary(sessions):
    """计算汇总数据（委托给各子函数）。"""
    basic = _compute_basic_totals(sessions)
    daily_list = _compute_daily_stats(sessions)
    project_list = _compute_project_stats(sessions)
    model_list = _compute_model_stats(sessions)
    tool_stats = _compute_tool_stats(sessions)
    turn_duration_stats = _compute_turn_duration_stats(sessions)
    thinking_stats = _compute_thinking_stats(sessions)
    agentic_stats = _compute_agentic_stats(sessions)
    stability = _compute_stability_stats(sessions)
    perm_stats = _compute_permission_stats(sessions)
    time_stats = _compute_time_stats(sessions)
    version_timeline = _compute_version_stats(sessions)
    mcp_summary = _compute_mcp_stats(sessions)
    skill_summary = _compute_skill_stats(sessions)
    cost_real = _compute_cost_stats(sessions)

    return {
        "total_sessions": len(sessions),
        **basic,
        "model_pricing": MODEL_PRICING,
        "daily": daily_list,
        "projects": project_list,
        "models": model_list,
        **tool_stats,
        "turn_duration_stats": turn_duration_stats,
        "thinking_stats": thinking_stats,
        "agentic_stats": agentic_stats,
        "stability": stability,
        "permission_summary": perm_stats["permission_summary"],
        "autonomy_trend": perm_stats["autonomy_trend"],
        "hourly": time_stats["hourly"],
        "weekday": time_stats["weekday"],
        "hour_weekday_matrix": time_stats["hour_weekday_matrix"],
        "peak_hour": time_stats["peak_hour"],
        "streak": time_stats["streak"],
        "version_timeline": version_timeline,
        "mcp_summary": mcp_summary,
        "skill_summary": skill_summary,
        "cost_real": cost_real,
    }


def _slim_session_for_output(s: dict) -> dict:
    """
    剔除仅供 compute_summary() 内部使用的大字段，保留前端所需的最小集合。
    tool_chain / bash_commands / file_operations / tool_calls 的聚合结果已经在 summary 里，
    session 级别不需要再带这些原始数组/字典。
    """
    # top_file: renderSessionsToolsTable 需要一个文件名，取最高频的那个
    file_ops = s.get("file_operations", {})
    top_file = max(
        file_ops,
        key=lambda p: file_ops[p].get("reads", 0) + file_ops[p].get("writes", 0) + file_ops[p].get("edits", 0),
        default="",
    )
    # 剔除大字段：tool_calls (4.5MB), tool_chain, bash_commands, file_operations
    slim = {k: v for k, v in s.items()
            if k not in ("tool_calls", "tool_chain", "bash_commands", "file_operations")}
    slim["top_file"] = top_file
    return slim


def refresh_once():
    """单次刷新数据，生成 JS 数据文件。"""
    print("正在解析会话数据...")
    projects = defaultdict(lambda: {
        "input_tokens": 0,
        "output_tokens": 0,
        "cache_creation": 0,
        "cache_read": 0,
        "sessions": 0,
    })
    for s in sessions:
        p = s["project"]
        projects[p]["input_tokens"] += s["input_tokens"]
        projects[p]["output_tokens"] += s["output_tokens"]
        projects[p]["cache_creation"] += s["cache_creation_input_tokens"]
        projects[p]["cache_read"] += s["cache_read_input_tokens"]
        projects[p]["sessions"] += 1

    # 取前 20 项目 + 聚合其余
    sorted_projects = sorted(projects.items(), key=lambda x: x[1]["input_tokens"], reverse=True)
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
            "total_tokens": v["input_tokens"] + v["output_tokens"],
            "sessions": v["sessions"],
        })
    # 聚合其他项目
    if other_projects:
        other = {"project": "其他项目", "input_tokens": 0, "output_tokens": 0,
                  "cache_creation": 0, "cache_read": 0, "total_tokens": 0, "sessions": 0}
        for p, v in other_projects:
            for k in ("input_tokens", "output_tokens", "cache_creation", "cache_read", "sessions"):
                other[k] += v[k]
        other["total_tokens"] = other["input_tokens"] + other["output_tokens"]
        project_list.append(other)

    # 模型汇总
    models = defaultdict(lambda: {"input_tokens": 0, "output_tokens": 0, "sessions": set()})
    for s in sessions:
        for m in s.get("models", []):
            models[m]["input_tokens"] += s["input_tokens"]
            models[m]["output_tokens"] += s["output_tokens"]
            models[m]["sessions"].add(s["id"])

    model_list = []
    for m, v in sorted(models.items(), key=lambda x: x[1]["input_tokens"], reverse=True):
        model_list.append({
            "model": m,
            "input_tokens": v["input_tokens"],
            "output_tokens": v["output_tokens"],
            "sessions": len(v["sessions"]),
        })

    # 工具使用汇总
    tool_totals = defaultdict(lambda: {"count": 0, "errors": 0, "rejected": 0})
    for s in sessions:
        for tool_name, stats in s.get("tool_stats", {}).items():
            tool_totals[tool_name]["count"] += stats["count"]
            tool_totals[tool_name]["errors"] += stats["errors"]
            tool_totals[tool_name]["rejected"] += stats["rejected"]

    tool_list = []
    for name, v in sorted(tool_totals.items(), key=lambda x: x[1]["count"], reverse=True):
        success_rate = (v["count"] - v["errors"]) / v["count"] * 100 if v["count"] > 0 else 100
        tool_list.append({
            "name": name,
            "count": v["count"],
            "errors": v["errors"],
            "rejected": v["rejected"],
            "success_rate": round(success_rate, 1),
        })

    # 文件操作汇总（热门文件）
    file_totals = defaultdict(lambda: {"reads": 0, "writes": 0, "edits": 0, "projects": set()})
    for s in sessions:
        for file_path, ops in s.get("file_operations", {}).items():
            file_totals[file_path]["reads"] += ops["reads"]
            file_totals[file_path]["writes"] += ops["writes"]
            file_totals[file_path]["edits"] += ops["edits"]
            file_totals[file_path]["projects"].add(s["project"])

    file_list = []
    for file_path, v in sorted(file_totals.items(), key=lambda x: x[1]["reads"] + x[1]["writes"] + x[1]["edits"], reverse=True)[:30]:
        total_ops = v["reads"] + v["writes"] + v["edits"]
        file_list.append({
            "file": file_path,
            "reads": v["reads"],
            "writes": v["writes"],
            "edits": v["edits"],
            "total_ops": total_ops,
            "projects": len(v["projects"]),
        })

    # Bash 命令汇总（bash_commands 已在 parse_session_file 中 trim 到首词）
    bash_summary = defaultdict(lambda: {"count": 0, "errors": 0})
    for s in sessions:
        for cmd in s.get("bash_commands", []):
            cmd_type = cmd.get("command", "unknown")
            bash_summary[cmd_type]["count"] += 1
            if cmd.get("is_error"):
                bash_summary[cmd_type]["errors"] += 1

    bash_list = []
    for cmd_type, v in sorted(bash_summary.items(), key=lambda x: x[1]["count"], reverse=True)[:20]:
        bash_list.append({
            "command": cmd_type,
            "count": v["count"],
            "errors": v["errors"],
        })

    # 工具链路模式分析（统计常见的工具序列）
    chain_patterns = defaultdict(int)
    for s in sessions:
        chain = s.get("tool_chain", [])
        # 统计 2-3 个工具的组合模式
        for i in range(len(chain) - 1):
            pattern_2 = f"{chain[i]} → {chain[i+1]}"
            chain_patterns[pattern_2] += 1
        for i in range(len(chain) - 2):
            pattern_3 = f"{chain[i]} → {chain[i+1]} → {chain[i+2]}"
            chain_patterns[pattern_3] += 1

    chain_list = []
    for pattern, count in sorted(chain_patterns.items(), key=lambda x: x[1], reverse=True)[:20]:
        chain_list.append({
            "pattern": pattern,
            "count": count,
        })

    # ── 模型定价（用于估算费用）──────────────────────────────────────
    # ── 每日估算费用 & API 错误 & 真实费用 追加到 daily_list ──────────
    daily_cost_map = defaultdict(float)
    daily_errors_map = defaultdict(int)
    daily_real_cost_map = defaultdict(float)
    for s in sessions:
        d = s.get("date", "")
        if d:
            daily_cost_map[d] += s.get("est_cost") or 0
            daily_errors_map[d] += s.get("api_errors", 0)
            if s.get("final_cost") is not None:
                daily_real_cost_map[d] += s["final_cost"]
    for item in daily_list:
        item["est_cost"] = round(daily_cost_map.get(item["date"], 0), 4)
        item["api_errors"] = daily_errors_map.get(item["date"], 0)
        rc = daily_real_cost_map.get(item["date"])
        item["real_cost"] = round(rc, 4) if rc else None

    # ── 响应时间统计 ─────────────────────────────────────────────────
    all_turn_ms = [s["avg_turn_ms"] for s in sessions if s.get("avg_turn_ms", 0) > 0]
    if all_turn_ms:
        sorted_ms = sorted(all_turn_ms)
        n = len(sorted_ms)
        p50 = sorted_ms[n // 2]
        p90 = sorted_ms[int(n * 0.9)]
        buckets = {"lt1m": 0, "1to5m": 0, "5to15m": 0, "gt15m": 0}
        for ms in all_turn_ms:
            s_val = ms / 1000
            if s_val < 60:
                buckets["lt1m"] += 1
            elif s_val < 300:
                buckets["1to5m"] += 1
            elif s_val < 900:
                buckets["5to15m"] += 1
            else:
                buckets["gt15m"] += 1
        turn_duration_stats = {
            "count": n,
            "avg_ms": int(sum(all_turn_ms) / n),
            "p50_ms": p50,
            "p90_ms": p90,
            "max_ms": max(all_turn_ms),
            "total_hours": round(sum(s.get("total_turn_ms", 0) for s in sessions) / 3_600_000, 2),
            "buckets": buckets,
        }
    else:
        turn_duration_stats = {
            "count": 0, "avg_ms": 0, "p50_ms": 0, "p90_ms": 0,
            "max_ms": 0, "total_hours": 0, "buckets": {"lt1m": 0, "1to5m": 0, "5to15m": 0, "gt15m": 0},
        }

    # 最慢 Top 5 sessions
    slowest = sorted(
        [s for s in sessions if s.get("avg_turn_ms", 0) > 0],
        key=lambda x: x["avg_turn_ms"], reverse=True
    )[:5]
    turn_duration_stats["slowest_sessions"] = [
        {"id": s["id"], "project": s["project"], "date": s["date"], "avg_turn_ms": s["avg_turn_ms"]}
        for s in slowest
    ]

    # ── Thinking 统计 ────────────────────────────────────────────────
    thinking_sessions = [s for s in sessions if s.get("has_thinking")]
    total_sessions_n = len(sessions) or 1
    thinking_by_project = defaultdict(int)
    for s in thinking_sessions:
        thinking_by_project[s["project"]] += s.get("thinking_turns", 0)
    thinking_by_project_list = sorted(
        [{"project": p, "turns": t} for p, t in thinking_by_project.items()],
        key=lambda x: x["turns"], reverse=True
    )[:10]

    # thinking turns distribution buckets
    t_buckets = {"1to10": 0, "11to50": 0, "51to200": 0, "gt200": 0}
    for s in thinking_sessions:
        t = s.get("thinking_turns", 0)
        if t <= 10:
            t_buckets["1to10"] += 1
        elif t <= 50:
            t_buckets["11to50"] += 1
        elif t <= 200:
            t_buckets["51to200"] += 1
        else:
            t_buckets["gt200"] += 1

    thinking_stats = {
        "sessions_with_thinking": len(thinking_sessions),
        "pct_sessions": round(len(thinking_sessions) / total_sessions_n * 100, 1),
        "total_turns": sum(s.get("thinking_turns", 0) for s in sessions),
        "by_project": thinking_by_project_list,
        "buckets": t_buckets,
    }

    # ── Agentic 统计 ─────────────────────────────────────────────────
    agentic_vals = [s["agentic_ratio"] for s in sessions if s.get("agentic_ratio", 0) > 0]
    agentic_stats = {
        "avg_ratio": round(sum(agentic_vals) / len(agentic_vals), 3) if agentic_vals else 0,
        "highly_agentic_count": sum(1 for v in agentic_vals if v > 0.9),
    }

    # ── 稳定性统计 ───────────────────────────────────────────────────
    stability = {
        "total_api_errors": sum(s.get("api_errors", 0) for s in sessions),
        "total_compact_events": sum(s.get("compact_events", 0) for s in sessions),
        "sessions_with_errors": sum(1 for s in sessions if s.get("api_errors", 0) > 0),
        "max_retry_seen": max((s.get("max_retry", 0) for s in sessions), default=0),
    }
    # 触发 compact 最多的项目
    compact_by_project = defaultdict(int)
    for s in sessions:
        if s.get("compact_events", 0) > 0:
            compact_by_project[s["project"]] += s["compact_events"]
    stability["top_compact_projects"] = sorted(
        [{"project": p, "count": c} for p, c in compact_by_project.items()],
        key=lambda x: x["count"], reverse=True
    )[:3]

    # ── PermissionMode 分布 ──────────────────────────────────────────
    permission_totals = Counter()
    for s in sessions:
        for mode, cnt in s.get("permission_modes", {}).items():
            permission_totals[mode] += cnt
    permission_summary = [
        {"mode": m, "count": c}
        for m, c in permission_totals.most_common()
    ]

    # permission 按周聚合（用于 Autonomy Trend 图）
    week_permission = defaultdict(lambda: Counter())
    for s in sessions:
        if not s.get("date"):
            continue
        try:
            dt = datetime.strptime(s["date"], "%Y-%m-%d")
            # ISO week key: e.g., "2025-W03"
            week_key = dt.strftime("%Y-W%V")
            for mode, cnt in s.get("permission_modes", {}).items():
                week_permission[week_key][mode] += cnt
        except ValueError:
            pass
    autonomy_trend = []
    for wk in sorted(week_permission.keys()):
        wc = week_permission[wk]
        total_w = sum(wc.values()) or 1
        autonomy_trend.append({
            "week": wk,
            "default": wc.get("default", 0),
            "acceptEdits": wc.get("acceptEdits", 0),
            "bypassPermissions": wc.get("bypassPermissions", 0),
            "plan": wc.get("plan", 0),
            "total": total_w,
        })

    # ── 使用时段 & 星期分布 ──────────────────────────────────────────
    hourly = [0] * 24
    weekday_counts = [0] * 7
    hour_weekday_matrix = [[0] * 24 for _ in range(7)]
    for s in sessions:
        h = s.get("hour", 0)
        w = s.get("weekday", 0)
        if 0 <= h < 24:
            hourly[h] += 1
        if 0 <= w < 7:
            weekday_counts[w] += 1
        if 0 <= w < 7 and 0 <= h < 24:
            hour_weekday_matrix[w][h] += 1

    # 找惯用时段（最高峰小时）
    peak_hour = hourly.index(max(hourly)) if any(hourly) else 0

    # ── Streak & 连续使用 ────────────────────────────────────────────
    active_dates = sorted(set(s["date"] for s in sessions if s.get("date")))
    from datetime import timedelta
    current_streak = 0
    max_streak = 0
    if active_dates:
        today = datetime.now().date()
        yesterday = today - timedelta(days=1)
        active_set = set(active_dates)
        # 当前 streak（从今天或昨天向前数）
        check_date = today if str(today) in active_set else yesterday
        while str(check_date) in active_set:
            current_streak += 1
            check_date -= timedelta(days=1)
        # 最长 streak
        streak = 1
        for i in range(1, len(active_dates)):
            d1 = datetime.strptime(active_dates[i - 1], "%Y-%m-%d").date()
            d2 = datetime.strptime(active_dates[i], "%Y-%m-%d").date()
            if (d2 - d1).days == 1:
                streak += 1
                max_streak = max(max_streak, streak)
            else:
                streak = 1
        max_streak = max(max_streak, streak)

    # ── 版本时间线 ───────────────────────────────────────────────────
    version_dates = defaultdict(list)
    for s in sessions:
        v = s.get("version", "")
        d = s.get("date", "")
        if v and d:
            version_dates[v].append(d)
    version_timeline = []
    for v, dates_list in sorted(version_dates.items(),
                                key=lambda x: min(x[1]) if x[1] else ""):
        version_timeline.append({
            "version": v,
            "first_seen": min(dates_list),
            "last_seen": max(dates_list),
            "session_count": len(dates_list),
        })

    # ── MCP 汇总 ─────────────────────────────────────────────────────
    mcp_totals = Counter()
    for s in sessions:
        for server, cnt in s.get("mcp_tools", {}).items():
            mcp_totals[server] += cnt
    mcp_summary = [{"server": k, "count": v} for k, v in mcp_totals.most_common()]

    # ── Skill 汇总 ───────────────────────────────────────────────────
    skill_totals = Counter()
    skill_by_project = defaultdict(Counter)
    for s in sessions:
        for sk, cnt in s.get("skill_calls", {}).items():
            skill_totals[sk] += cnt
            skill_by_project[s["project"]][sk] += cnt
    # 取 top 10 项目 × skill
    top_skill_projects = sorted(
        skill_by_project.items(),
        key=lambda x: sum(x[1].values()), reverse=True
    )[:10]
    skill_by_project_list = [
        {
            "project": p,
            "skills": [{"skill": sk, "count": c} for sk, c in sorted(v.items(), key=lambda x: -x[1])[:5]]
        }
        for p, v in top_skill_projects
    ]
    skill_summary = {
        "total_calls": sum(skill_totals.values()),
        "unique_skills": len(skill_totals),
        "ranking": [{"skill": k, "count": v} for k, v in skill_totals.most_common()],
        "by_project": skill_by_project_list,
    }

    # ── 真实费用汇总 ─────────────────────────────────────────────────
    cost_real_by_project = defaultdict(float)
    cost_real_sessions = [s for s in sessions if s.get("final_cost") is not None]
    for s in cost_real_sessions:
        cost_real_by_project[s["project"]] += s["final_cost"]
    cost_real = {
        "total": round(sum(s["final_cost"] for s in cost_real_sessions), 2),
        "max_session": round(max((s["final_cost"] for s in cost_real_sessions), default=0), 2),
        "session_count": len(cost_real_sessions),
        "by_project": sorted(
            [{"project": p, "cost": round(c, 2)} for p, c in cost_real_by_project.items()],
            key=lambda x: x["cost"], reverse=True
        )[:10],
    }

    # ── 项目费用汇总（估算）追加到 project_list ───────────────────────
    # 先聚合所有 session 的费用到实际项目名
    session_cost_by_project = defaultdict(float)
    for s in sessions:
        session_cost_by_project[s["project"]] += s.get("est_cost") or 0
    # 取 top 20 项目名集合
    top_project_names = {item["project"] for item in project_list if item["project"] != "其他项目"}
    for item in project_list:
        if item["project"] == "其他项目":
            # 其他项目 = 所有 session 总费用 - top 20 费用
            top_cost = sum(session_cost_by_project.get(p, 0) for p in top_project_names)
            all_cost = sum(session_cost_by_project.values())
            item["est_cost"] = round(all_cost - top_cost, 2)
        else:
            item["est_cost"] = round(session_cost_by_project.get(item["project"], 0), 2)

    return {
        "total_sessions": len(sessions),
        "total_input_tokens": total_input,
        "total_output_tokens": total_output,
        "total_cache_creation": total_cache_creation,
        "total_cache_read": total_cache_read,
        "total_tokens": total_input + total_output,
        "date_range": date_range,
        "model_pricing": MODEL_PRICING,  # JS 唯一定价来源
        "daily": daily_list,
        "projects": project_list,
        "models": model_list,
        # 工具统计
        "tools": tool_list,
        "files": file_list,
        "bash_commands": bash_list,
        "tool_chains": chain_list,
        # 新增聚合
        "turn_duration_stats": turn_duration_stats,
        "thinking_stats": thinking_stats,
        "agentic_stats": agentic_stats,
        "stability": stability,
        "permission_summary": permission_summary,
        "autonomy_trend": autonomy_trend,
        "hourly": hourly,
        "weekday": weekday_counts,
        "hour_weekday_matrix": hour_weekday_matrix,
        "peak_hour": peak_hour,
        "streak": {"current": current_streak, "max": max_streak, "active_days": len(active_dates)},
        "version_timeline": version_timeline,
        "mcp_summary": mcp_summary,
        "skill_summary": skill_summary,
        "cost_real": cost_real,
    }


def _slim_session_for_output(s: dict) -> dict:
    """
    剔除仅供 compute_summary() 内部使用的大字段，保留前端所需的最小集合。
    tool_chain / bash_commands / file_operations / tool_calls 的聚合结果已经在 summary 里，
    session 级别不需要再带这些原始数组/字典。
    """
    # top_file: renderSessionsToolsTable 需要一个文件名，取最高频的那个
    file_ops = s.get("file_operations", {})
    top_file = max(
        file_ops,
        key=lambda p: file_ops[p].get("reads", 0) + file_ops[p].get("writes", 0) + file_ops[p].get("edits", 0),
        default="",
    )
    # 剔除大字段：tool_calls (4.5MB), tool_chain, bash_commands, file_operations
    slim = {k: v for k, v in s.items()
            if k not in ("tool_calls", "tool_chain", "bash_commands", "file_operations")}
    slim["top_file"] = top_file
    return slim


def refresh_once():
    """单次刷新数据，生成 JS 数据文件。"""
    print("正在解析会话数据...")
    sessions, all_cached = parse_all_sessions()
    print(f"共解析 {len(sessions)} 个有效会话")

    # 全量缓存命中时跳过 compute_summary（数据没变，summary 也没变）
    cached_summary = _load_summary_cache() if all_cached else None
    if cached_summary:
        summary = cached_summary
        print("  汇总统计：复用 summary 缓存，跳过重新计算")
    else:
        summary = compute_summary(sessions)
        _save_summary_cache(summary)

    data = {
        "updated_at": datetime.now().astimezone().isoformat(),
        "summary": summary,
        "sessions": [_slim_session_for_output(s) for s in sessions],
    }

    json_str = json.dumps(data, ensure_ascii=False, indent=2)
    js_content = f"// Auto-generated at {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}\n"
    js_content += "window.TOKEN_DATA = " + json_str + ";"

    with open(OUTPUT_JS, "w", encoding="utf-8") as f:
        f.write(js_content)
    print(f"[{datetime.now().strftime('%H:%M:%S')}] 数据文件 → {OUTPUT_JS}")

    # 打印汇总
    print(f"\n{'='*50}")
    print(f"  总会话数: {summary['total_sessions']}")
    print(f"  Input tokens: {summary['total_input_tokens']:,}")
    print(f"  Output tokens: {summary['total_output_tokens']:,}")
    print(f"  Cache creation: {summary['total_cache_creation']:,}")
    print(f"  Cache read: {summary['total_cache_read']:,}")
    print(f"  日期范围: {summary['date_range']['start']} ~ {summary['date_range']['end']}")
    print(f"{'='*50}")

    return len(sessions)


def main_loop(interval_seconds=60):
    """后台循环刷新。"""
    print(f"启动数据刷新循环，每 {interval_seconds} 秒更新一次")
    print(f"输出: {OUTPUT_JS}")
    print("按 Ctrl+C 停止")
    print("-" * 40)

    refresh_once()

    while True:
        time.sleep(interval_seconds)
        refresh_once()


if __name__ == "__main__":
    import sys

    if len(sys.argv) > 1 and sys.argv[1] == "--once":
        refresh_once()
    else:
        main_loop()
