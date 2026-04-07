#!/usr/bin/env python3
"""
Token-Insights Skill - Generate a static HTML token usage report.

Unlike the dashboard version, this generates a one-time snapshot
with no auto-refresh or live updates.
"""

import json
import re
from pathlib import Path
from datetime import datetime, timezone
from collections import defaultdict, Counter

# 定价表（与主脚本一致）
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

PROJECTS_DIR = Path.home() / ".claude" / "projects"


def normalize_project_name(dir_name):
    """规范化项目名称，提取简洁易读的名称。"""
    if not dir_name:
        return "Unknown"

    # 移除 (subagent) 后缀
    base_name = dir_name.replace(" (subagent)", "").replace(" (subagent)", "")

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
        "input_tokens": 0,
        "output_tokens": 0,
        "cache_creation_input_tokens": 0,
        "cache_read_input_tokens": 0,
    }
    models = set()
    first_timestamp = None
    last_timestamp = None
    cwd = ""

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

            # Usage data is in data["message"]["usage"] for assistant messages
            if record_type == "assistant" and "message" in data:
                msg = data["message"]
                usage = msg.get("usage", {})

                if usage:
                    usage_total["input_tokens"] += usage.get("input_tokens", 0) or 0
                    usage_total["output_tokens"] += usage.get("output_tokens", 0) or 0
                    usage_total["cache_creation_input_tokens"] += usage.get("cache_creation_input_tokens", 0) or 0
                    usage_total["cache_read_input_tokens"] += usage.get("cache_read_input_tokens", 0) or 0

                    # Extract model
                    model = msg.get("model", "")
                    if model and not model.startswith("<"):
                        models.add(model)

    if first_timestamp is None:
        return None

    duration_minutes = 0
    if first_timestamp and last_timestamp:
        duration_minutes = int((last_timestamp - first_timestamp).total_seconds() / 60)

    local_start = first_timestamp.astimezone() if first_timestamp else None

    return {
        "id": session_id,
        "project": project_name,
        "project_path": cwd,
        "input_tokens": usage_total["input_tokens"],
        "output_tokens": usage_total["output_tokens"],
        "cache_creation_input_tokens": usage_total["cache_creation_input_tokens"],
        "cache_read_input_tokens": usage_total["cache_read_input_tokens"],
        "total_tokens": sum(usage_total.values()),
        "models": list(models),
        "model_str": ",".join(models) if models else "",
        "start_time": first_timestamp.isoformat(),
        "duration_minutes": duration_minutes,
        "time": local_start.strftime("%H:%M") if local_start else "",
        "date": local_start.strftime("%Y-%m-%d") if local_start else "",
    }


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
    """计算汇总统计。"""
    if not sessions:
        return {
            "total_tokens": 0,
            "total_input": 0,
            "total_output": 0,
            "total_cache_creation": 0,
            "total_cache_read": 0,
            "total_sessions": 0,
            "total_cost": 0,
            "daily": [],
            "by_project": [],
            "by_model": [],
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
        "cache_creation": 0, "cache_read": 0, "sessions": 0
    })
    for s in sessions:
        d = s["date"]
        daily_data[d]["input_tokens"] += s["input_tokens"]
        daily_data[d]["output_tokens"] += s["output_tokens"]
        daily_data[d]["cache_creation"] += s["cache_creation_input_tokens"]
        daily_data[d]["cache_read"] += s["cache_read_input_tokens"]
        daily_data[d]["sessions"] += 1

    daily = [
        {
            "date": d,
            "input_tokens": v["input_tokens"],
            "output_tokens": v["output_tokens"],
            "cache_creation": v["cache_creation"],
            "cache_read": v["cache_read"],
            "total_tokens": sum(v.values()) - v["sessions"],
            "sessions": v["sessions"],
        }
        for d, v in sorted(daily_data.items())
    ]

    # 按项目汇总
    project_data = defaultdict(lambda: {
        "input_tokens": 0, "output_tokens": 0,
        "cache_creation": 0, "cache_read": 0, "sessions": 0
    })
    for s in sessions:
        p = s["project"]
        project_data[p]["input_tokens"] += s["input_tokens"]
        project_data[p]["output_tokens"] += s["output_tokens"]
        project_data[p]["cache_creation"] += s["cache_creation_input_tokens"]
        project_data[p]["cache_read"] += s["cache_read_input_tokens"]
        project_data[p]["sessions"] += 1

    by_project = [
        {
            "project": p,
            "input_tokens": v["input_tokens"],
            "output_tokens": v["output_tokens"],
            "cache_creation": v["cache_creation"],
            "cache_read": v["cache_read"],
            "total_tokens": v["input_tokens"] + v["output_tokens"] + v["cache_creation"] + v["cache_read"],
            "sessions": v["sessions"],
            "est_cost": round(sum(
                _session_cost(s) for s in sessions if s["project"] == p
            ), 2)
        }
        for p, v in sorted(project_data.items(), key=lambda x: x[1]["input_tokens"], reverse=True)
    ]

    # 按模型汇总
    model_data = defaultdict(lambda: {
        "input_tokens": 0, "output_tokens": 0,
        "cache_creation": 0, "cache_read": 0, "sessions": 0
    })
    for s in sessions:
        for model in s["models"]:
            model_data[model]["input_tokens"] += s["input_tokens"]
            model_data[model]["output_tokens"] += s["output_tokens"]
            model_data[model]["cache_creation"] += s["cache_creation_input_tokens"]
            model_data[model]["cache_read"] += s["cache_read_input_tokens"]
            model_data[model]["sessions"] += 1

    by_model = [
        {
            "model": m,
            "input_tokens": v["input_tokens"],
            "output_tokens": v["output_tokens"],
            "cache_creation": v["cache_creation"],
            "cache_read": v["cache_read"],
            "total_tokens": v["input_tokens"] + v["output_tokens"] + v["cache_creation"] + v["cache_read"],
            "sessions": v["sessions"],
        }
        for m, v in sorted(model_data.items(), key=lambda x: x[1]["input_tokens"], reverse=True)
    ]

    return {
        "total_tokens": total_tokens,
        "total_input": total_input,
        "total_output": total_output,
        "total_cache_creation": total_cache_creation,
        "total_cache_read": total_cache_read,
        "total_sessions": len(sessions),
        "total_cost": round(total_cost, 2),
        "daily": daily,
        "by_project": by_project,
        "by_model": by_model,
    }


def generate_html(data, template_path):
    """生成静态 HTML 报告。"""
    template = Path(template_path).read_text(encoding="utf-8")

    html = template.replace(
        "{{REPORT_DATA}}",
        json.dumps(data, ensure_ascii=False)
    ).replace(
        "{{GENERATED_AT}}",
        datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    )

    return html


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

    # 生成 HTML
    print("Generating HTML report...")
    template_path = Path(__file__).parent / "templates" / "report.html"
    html = generate_html(report_data, template_path)

    # 保存输出
    output_dir = Path(__file__).parent / "output"
    output_dir.mkdir(exist_ok=True)

    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    output_file = output_dir / f"token-insights-{timestamp}.html"
    output_file.write_text(html, encoding="utf-8")

    print()
    print("=" * 50)
    print(f"✓ Report generated: {output_file}")
    print("=" * 50)
    print()
    print(f"Open with:")
    print(f"  open {output_file}")
    print()


if __name__ == "__main__":
    main()
