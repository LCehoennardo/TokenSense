#!/usr/bin/env node

/**
 * TokenSense - Lightweight Server
 * Pure frontend token visualization without Python dependencies
 */

const http = require('http');
const fs = require('fs');
const path = require('path');

// Model pricing (USD per 1M tokens)
const MODEL_PRICING = {
  'claude-opus-4-5':   { input: 15.00, output: 75.00, cw: 18.75, cr: 1.50 },
  'claude-opus-4':     { input: 15.00, output: 75.00, cw: 18.75, cr: 1.50 },
  'claude-sonnet-4-6': { input:  3.00, output: 15.00, cw:  3.75, cr: 0.30 },
  'claude-sonnet-4-5': { input:  3.00, output: 15.00, cw:  3.75, cr: 0.30 },
  'claude-sonnet-4':   { input:  3.00, output: 15.00, cw:  3.75, cr: 0.30 },
  'claude-haiku-4-5':  { input:  0.80, output:  4.00, cw:  1.00, cr: 0.08 },
  'claude-haiku-4':    { input:  0.80, output:  4.00, cw:  1.00, cr: 0.08 },
  'claude-opus-3':     { input: 15.00, output: 75.00, cw: 18.75, cr: 1.50 },
  'claude-sonnet-3':   { input:  3.00, output: 15.00, cw:  3.75, cr: 0.30 },
  'claude-haiku-3':    { input:  0.25, output:  1.25, cw:  0.30, cr: 0.03 },
};
const DEFAULT_PRICING = { input: 3.00, output: 15.00, cw: 3.75, cr: 0.30 };

function getPricing(modelStr) {
  if (!modelStr) return DEFAULT_PRICING;
  const key = Object.keys(MODEL_PRICING).find(k => modelStr.includes(k));
  return key ? MODEL_PRICING[key] : DEFAULT_PRICING;
}

function calcCost(s, pricing) {
  return (s.input_tokens / 1e6) * pricing.input
       + (s.output_tokens / 1e6) * pricing.output
       + (s.cache_creation_input_tokens / 1e6) * pricing.cw
       + (s.cache_read_input_tokens / 1e6) * pricing.cr;
}

const PORT = 3000;
const PROJECTS_DIR = path.join(require('os').homedir(), '.claude', 'projects');

// MIME types
const MIME_TYPES = {
  '.html': 'text/html',
  '.js': 'text/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
};

const server = http.createServer((req, res) => {
  const url = new URL(req.url, `http://localhost:${PORT}`);

  // API: Get session data
  if (url.pathname === '/api/sessions') {
    getSessions()
      .then(data => {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(data));
      })
      .catch(err => {
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: err.message }));
      });
    return;
  }

  // Static files — serve from src/ by default, docs/ for /docs/** paths
  let filePath = path.join(__dirname, url.pathname);
  if (url.pathname === '/') {
    filePath = path.join(__dirname, 'token_visual.html');
  } else if (url.pathname.startsWith('/docs/')) {
    filePath = path.join(__dirname, '..', url.pathname);
  }

  // Path traversal prevention: ensure resolved path is within allowed directory
  const resolved = path.resolve(filePath);
  const allowedBase = url.pathname.startsWith('/docs/')
    ? path.resolve(__dirname, '..')
    : path.resolve(__dirname);
  if (!resolved.startsWith(allowedBase + path.sep) && resolved !== allowedBase) {
    res.writeHead(403);
    res.end('Forbidden');
    return;
  }

  const ext = path.extname(filePath).toLowerCase();
  const contentType = MIME_TYPES[ext] || 'application/octet-stream';

  fs.readFile(filePath, (err, content) => {
    if (err) {
      if (err.code === 'ENOENT') {
        res.writeHead(404);
        res.end('File not found');
      } else {
        res.writeHead(500);
        res.end('Server error');
      }
      return;
    }

    res.writeHead(200, { 'Content-Type': contentType });
    res.end(content);
  });
});

// Parse session files
async function getSessions() {
  const sessions = [];

  try {
    const projectDirs = await fs.promises.readdir(PROJECTS_DIR, { withFileTypes: true });

    for (const projectEntry of projectDirs) {
      if (!projectEntry.isDirectory()) continue;

      const projectName = normalizeProjectName(projectEntry.name);
      const projectPath = path.join(PROJECTS_DIR, projectEntry.name);

      // Scan main session files
      const files = await fs.promises.readdir(projectPath);
      for (const file of files) {
        if (!file.endsWith('.jsonl')) continue;

        const filePath = path.join(projectPath, file);
        const sessionData = await parseSessionFile(filePath, projectName);
        if (sessionData) {
          sessionData.project = normalizeProjectName(sessionData.project);
          sessions.push(sessionData);
        }
      }

      // Scan subagent session files
      for (const file of files) {
        if (!file.endsWith('.jsonl')) continue;

        const sessionId = path.basename(file, '.jsonl');
        const subagentsDir = path.join(projectPath, sessionId, 'subagents');

        try {
          const subagentFiles = await fs.promises.readdir(subagentsDir);
          for (const subFile of subagentFiles) {
            if (subFile.endsWith('.meta.json')) continue;
            if (!subFile.endsWith('.jsonl')) continue;

            const subPath = path.join(subagentsDir, subFile);
            const sessionData = await parseSessionFile(subPath, `${projectName} (subagent)`);
            if (sessionData) {
              sessionData.project = normalizeProjectName(sessionData.project);
              sessions.push(sessionData);
            }
          }
        } catch (e) {
          // No subagents directory
        }
      }
    }

    // Sort by time
    sessions.sort((a, b) => new Date(b.start_time) - new Date(a.start_time));

    // Fill in est_cost per session using model-specific pricing
    for (const s of sessions) {
      const pricing = getPricing(s.model_str);
      s.est_cost = calcCost(s, pricing);
    }

    return { sessions, summary: computeSummary(sessions) };
  } catch (err) {
    if (err.code === 'ENOENT') {
      return { sessions: [], summary: computeSummary([]) };
    }
    throw err;
  }
}

async function parseSessionFile(filePath, projectName) {
  const sessionId = path.basename(filePath, '.jsonl');
  const usageTotal = {
    input_tokens: 0,
    output_tokens: 0,
    cache_creation_input_tokens: 0,
    cache_read_input_tokens: 0,
  };
  const models = new Set();
  let firstTimestamp = null;
  let lastTimestamp = null;
  let cwd = '';

  // Behavior and tools data
  const toolCalls = [];
  const toolChain = []; // ordered list of tool names
  const toolResults = {};
  let thinkingTurns = 0;
  let userMessages = 0;
  let assistantMessages = 0;
  let firstPrompt = '';
  const stopReasons = {};
  const permissionModes = {};
  const mcpToolsCounter = {};
  const skillCallsCounter = {};

  // Stability and duration data
  const turnDurations = [];
  let apiErrorCount = 0;
  let maxRetryAttempt = 0;
  let compactCount = 0;

  try {
    const content = await fs.promises.readFile(filePath, 'utf-8');
    const lines = content.split('\n');

    for (const line of lines) {
      if (!line.trim()) continue;

      try {
        const data = JSON.parse(line);
        const recordType = data.type || '';
        const timestamp = data.timestamp || '';

        if (timestamp) {
          const dt = new Date(timestamp.replace('Z', '+00:00'));
          if (!isNaN(dt.getTime())) {
            if (!firstTimestamp || dt < firstTimestamp) firstTimestamp = dt;
            if (!lastTimestamp || dt > lastTimestamp) lastTimestamp = dt;
          }
        }

        if (data.cwd && !cwd) cwd = data.cwd;

        // Permission mode
        if (data.permissionMode) {
          permissionModes[data.permissionMode] = (permissionModes[data.permissionMode] || 0) + 1;
        }

        // System records: turn_duration, api_error, compact_boundary
        if (recordType === 'system') {
          const sub = data.subtype || '';
          if (sub === 'turn_duration') {
            const ms = data.durationMs || 0;
            if (ms > 0) turnDurations.push(ms);
          } else if (sub === 'api_error') {
            apiErrorCount++;
            maxRetryAttempt = Math.max(maxRetryAttempt, data.retryAttempt || 0);
          } else if (sub === 'compact_boundary') {
            compactCount++;
          }
        }

        // User messages
        if (recordType === 'user') {
          userMessages++;
          if (!firstPrompt && data.message) {
            const content = data.message.content || '';
            if (typeof content === 'string' && content && !content.startsWith('<')) {
              firstPrompt = content.slice(0, 100);
            } else if (Array.isArray(content)) {
              for (const item of content) {
                if (item.type === 'text' && item.text && !item.text.startsWith('<local-command')) {
                  firstPrompt = item.text.slice(0, 100);
                  break;
                } else if (item.type === 'tool_result') {
                  const toolId = item.tool_use_id || '';
                  toolResults[toolId] = { is_error: item.is_error || false };
                }
              }
            }
          }
        }

        // Assistant messages - extract usage and tools
        if (recordType === 'assistant' && data.message) {
          assistantMessages++;
          const msg = data.message;
          const usage = msg.usage || {};

          if (usage) {
            usageTotal.input_tokens += usage.input_tokens || 0;
            usageTotal.output_tokens += usage.output_tokens || 0;
            usageTotal.cache_creation_input_tokens += usage.cache_creation_input_tokens || 0;
            usageTotal.cache_read_input_tokens += usage.cache_read_input_tokens || 0;
          }

          const model = msg.model || '';
          if (model && !model.startsWith('<')) {
            models.add(model);
          }

          // Stop reason
          const sr = msg.stop_reason || '';
          if (sr) {
            stopReasons[sr] = (stopReasons[sr] || 0) + 1;
          }

          // Extract tools and thinking from content
          const content = msg.content || [];
          if (Array.isArray(content)) {
            for (const item of content) {
              if (item && typeof item === 'object') {
                if (item.type === 'thinking') {
                  thinkingTurns++;
                } else if (item.type === 'tool_use') {
                  const toolName = item.name || '';
                  const toolId = item.id || '';
                  const toolInput = item.input || {};

                  const toolCall = {
                    name: toolName,
                    id: toolId,
                    timestamp,
                  };

                  if (['Read', 'Write', 'Edit'].includes(toolName)) {
                    toolCall.file = toolInput.file_path || '';
                  } else if (toolName === 'Bash') {
                    toolCall.command = toolInput.command || '';
                  }

                  toolCalls.push(toolCall);
                  toolChain.push(toolName);

                  // MCP tools
                  if (toolName.startsWith('mcp__')) {
                    const parts = toolName.split('__');
                    if (parts.length >= 2) {
                      mcpToolsCounter[parts[1]] = (mcpToolsCounter[parts[1]] || 0) + 1;
                    }
                  } else if (toolName === 'Skill') {
                    const sn = toolInput.skill || '';
                    if (sn) {
                      skillCallsCounter[sn] = (skillCallsCounter[sn] || 0) + 1;
                    }
                  }
                }
              }
            }
          }
        }
      } catch (e) {
        // Skip invalid JSON lines
      }
    }
  } catch (err) {
    return null;
  }

  if (!firstTimestamp) return null;

  const durationMinutes = firstTimestamp && lastTimestamp
    ? Math.floor((lastTimestamp - firstTimestamp) / 60000)
    : 0;

  const localStart = new Date(firstTimestamp);

  // Compute tool stats
  const toolStats = {};
  const fileOperations = {};
  const bashCommands = [];

  for (const tc of toolCalls) {
    const name = tc.name || 'unknown';
    const isError = tc.id && toolResults[tc.id] ? toolResults[tc.id].is_error : false;
    if (!toolStats[name]) toolStats[name] = { count: 0, errors: 0 };
    toolStats[name].count++;
    if (isError) toolStats[name].errors++;

    // File operations
    const filePath = tc.file || '';
    if (filePath) {
      const shortPath = filePath.includes('/') ? filePath.split('/').slice(-3).join('/') : filePath;
      if (name === 'Read') {
        if (!fileOperations[shortPath]) fileOperations[shortPath] = { reads: 0, writes: 0, edits: 0 };
        fileOperations[shortPath].reads++;
      } else if (name === 'Write') {
        if (!fileOperations[shortPath]) fileOperations[shortPath] = { reads: 0, writes: 0, edits: 0 };
        fileOperations[shortPath].writes++;
      } else if (name === 'Edit') {
        if (!fileOperations[shortPath]) fileOperations[shortPath] = { reads: 0, writes: 0, edits: 0 };
        fileOperations[shortPath].edits++;
      }
    }

    // Bash commands
    if (name === 'Bash' && tc.command) {
      const cmd = tc.command.trim();
      bashCommands.push({
        command: cmd.split(/\s+/)[0] || 'unknown',
        is_error: tc.id && toolResults[tc.id] ? toolResults[tc.id].is_error : false,
      });
    }
  }

  return {
    id: sessionId,
    project: projectName,
    project_path: cwd,
    input_tokens: usageTotal.input_tokens,
    output_tokens: usageTotal.output_tokens,
    cache_creation_input_tokens: usageTotal.cache_creation_input_tokens,
    cache_read_input_tokens: usageTotal.cache_read_input_tokens,
    total_tokens: Object.values(usageTotal).reduce((a, b) => a + b, 0),
    models: Array.from(models),
    model_str: Array.from(models).join(','),
    start_time: firstTimestamp.toISOString(),
    duration_minutes: durationMinutes,
    time: localStart.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
    date: localStart.toLocaleDateString('en-CA'), // YYYY-MM-DD in local time
    // Behavior data
    user_messages: userMessages,
    assistant_messages: assistantMessages,
    thinking_turns: thinkingTurns,
    has_thinking: thinkingTurns > 0,
    first_prompt: firstPrompt,
    dominant_permission: Object.entries(permissionModes).sort((a, b) => b[1] - a[1])[0]?.[0] || 'default',
    permission_modes: permissionModes,
    stop_reasons: stopReasons,
    mcp_tools: mcpToolsCounter,
    skill_calls: skillCallsCounter,
    // Tools data
    tool_stats: toolStats,
    file_operations: fileOperations,
    bash_commands: bashCommands,
    tool_count: toolCalls.length,
    unique_files: Object.keys(fileOperations).length,
    // Cost (computed after models are known)
    est_cost: null, // filled below
    // Turn duration
    turn_count: turnDurations.length,
    avg_turn_ms: turnDurations.length > 0 ? Math.floor(turnDurations.reduce((a,b) => a+b, 0) / turnDurations.length) : 0,
    total_turn_ms: turnDurations.reduce((a,b) => a+b, 0),
    max_turn_ms: turnDurations.length > 0 ? Math.max(...turnDurations) : 0,
    // Stability
    api_errors: apiErrorCount,
    max_retry: maxRetryAttempt,
    compact_events: compactCount,
    // Agentic
    agentic_ratio: stopReasons['tool_use'] ? stopReasons['tool_use'] / Math.max(1, Object.values(stopReasons).reduce((a,b) => a+b, 0)) : 0,
    // Tool chain
    tool_chain: toolChain,
  };
}

function normalizeProjectName(dirName) {
  if (!dirName) return 'Unknown';

  let baseName = dirName.replace(' (subagent)', '').trim();

  if (baseName.startsWith('-Users-')) {
    const parts = baseName.split('-');
    if (parts.length >= 5) {
      baseName = parts.slice(4).join('-');
    } else if (parts.length >= 4) {
      baseName = parts[3];
    }
  } else if (baseName.includes('/')) {
    baseName = baseName.split('/').pop();
  }

  baseName = baseName.replace(/-+/g, '-').replace(/^-+|-+$/g, '');
  return baseName || 'Unknown';
}

function getISOWeekNumber(date) {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
}

function computeSummary(sessions) {
  if (!sessions.length) {
    return {
      total_tokens: 0, total_input_tokens: 0, total_output_tokens: 0,
      total_cache_creation: 0, total_cache_read: 0, total_sessions: 0, total_cost: 0,
      daily: [], projects: [], models: [], tools: [], files: [], bash_commands: [],
      tool_chains: [], hourly_timeline: [], hourly: Array(24).fill(0),
      weekday: Array(7).fill(0), hour_weekday_matrix: Array(7).fill(null).map(() => Array(24).fill(0)),
      thinking_stats: {}, stability: {}, permission_summary: [], agentic_stats: {},
      streak: {}, mcp_summary: [], skill_summary: {}, cost_real: {}, autonomy_trend: [],
      version_timeline: [], turn_duration_stats: {},
    };
  }

  const totalInput = sessions.reduce((a, s) => a + s.input_tokens, 0);
  const totalOutput = sessions.reduce((a, s) => a + s.output_tokens, 0);
  const totalCacheCreation = sessions.reduce((a, s) => a + s.cache_creation_input_tokens, 0);
  const totalCacheRead = sessions.reduce((a, s) => a + s.cache_read_input_tokens, 0);
  const totalTokens = totalInput + totalOutput + totalCacheCreation + totalCacheRead;
  const totalCost = sessions.reduce((a, s) => a + (s.est_cost || 0), 0);

  // Daily aggregation
  const dailyMap = {};
  for (const s of sessions) {
    const d = s.date;
    if (!dailyMap[d]) dailyMap[d] = { input: 0, output: 0, cc: 0, cr: 0, sessions: 0, cost: 0 };
    dailyMap[d].input += s.input_tokens;
    dailyMap[d].output += s.output_tokens;
    dailyMap[d].cc += s.cache_creation_input_tokens;
    dailyMap[d].cr += s.cache_read_input_tokens;
    dailyMap[d].sessions += 1;
    dailyMap[d].cost += s.est_cost || 0;
  }
  const daily = Object.entries(dailyMap)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, v]) => ({
      date,
      input_tokens: v.input, output_tokens: v.output,
      cache_creation: v.cc, cache_read: v.cr,
      total_tokens: v.input + v.output + v.cc + v.cr,
      sessions: v.sessions, est_cost: v.cost,
    }));

  // Project aggregation (top 20 + "其他项目")
  const projectMap = {};
  for (const s of sessions) {
    const p = s.project;
    if (!projectMap[p]) projectMap[p] = { input: 0, output: 0, cc: 0, cr: 0, sessions: 0, cost: 0 };
    projectMap[p].input += s.input_tokens;
    projectMap[p].output += s.output_tokens;
    projectMap[p].cc += s.cache_creation_input_tokens;
    projectMap[p].cr += s.cache_read_input_tokens;
    projectMap[p].sessions += 1;
    projectMap[p].cost += s.est_cost || 0;
  }
  const allProjects = Object.entries(projectMap)
    .sort(([, a], [, b]) => (b.input + b.output + b.cc + b.cr) - (a.input + a.output + a.cc + a.cr))
    .map(([project, v]) => ({
      project, input_tokens: v.input, output_tokens: v.output,
      cache_creation: v.cc, cache_read: v.cr,
      total_tokens: v.input + v.output + v.cc + v.cr,
      sessions: v.sessions, est_cost: v.cost,
    }));
  let projects = allProjects;
  if (allProjects.length > 20) {
    const top = allProjects.slice(0, 20);
    const rest = allProjects.slice(20);
    const other = rest.reduce((acc, p) => ({
      project: '其他项目',
      input_tokens: acc.input_tokens + p.input_tokens,
      output_tokens: acc.output_tokens + p.output_tokens,
      cache_creation: acc.cache_creation + p.cache_creation,
      cache_read: acc.cache_read + p.cache_read,
      total_tokens: acc.total_tokens + p.total_tokens,
      sessions: acc.sessions + p.sessions,
      est_cost: acc.est_cost + p.est_cost,
    }), { project: '其他项目', input_tokens: 0, output_tokens: 0, cache_creation: 0, cache_read: 0, total_tokens: 0, sessions: 0, est_cost: 0 });
    projects = [...top, other];
  }

  // Model aggregation
  const modelMap = {};
  for (const s of sessions) {
    for (const model of s.models) {
      if (!modelMap[model]) modelMap[model] = { input: 0, output: 0, sessions: 0 };
      modelMap[model].input += s.input_tokens;
      modelMap[model].output += s.output_tokens;
      modelMap[model].sessions += 1;
    }
  }
  const models = Object.entries(modelMap)
    .sort(([, a], [, b]) => b.input - a.input)
    .map(([model, v]) => ({ model, input_tokens: v.input, output_tokens: v.output, sessions: v.sessions }));

  // Tools aggregation
  const toolsMap = {};
  const filesMap = {};
  const bashMap = {};
  for (const s of sessions) {
    for (const [name, stat] of Object.entries(s.tool_stats || {})) {
      if (!toolsMap[name]) toolsMap[name] = { count: 0, errors: 0 };
      toolsMap[name].count += stat.count;
      toolsMap[name].errors += stat.errors || 0;
    }
    for (const [file, ops] of Object.entries(s.file_operations || {})) {
      if (!filesMap[file]) filesMap[file] = { reads: 0, writes: 0, edits: 0, projects: new Set() };
      filesMap[file].reads += ops.reads || 0;
      filesMap[file].writes += ops.writes || 0;
      filesMap[file].edits += ops.edits || 0;
      filesMap[file].projects.add(s.project);
    }
    for (const bc of s.bash_commands || []) {
      const cmd = bc.command || 'unknown';
      if (!bashMap[cmd]) bashMap[cmd] = { count: 0, errors: 0 };
      bashMap[cmd].count += 1;
      if (bc.is_error) bashMap[cmd].errors += 1;
    }
  }
  const tools = Object.entries(toolsMap)
    .sort(([, a], [, b]) => b.count - a.count)
    .map(([name, v]) => ({
      name, count: v.count, errors: v.errors,
      success_rate: v.count > 0 ? ((v.count - v.errors) / v.count * 100).toFixed(1) : '100.0',
    }));
  const files = Object.entries(filesMap)
    .sort(([, a], [, b]) => (b.reads + b.writes + b.edits) - (a.reads + a.writes + a.edits))
    .slice(0, 50)
    .map(([file, v]) => ({
      file, reads: v.reads, writes: v.writes, edits: v.edits,
      total_ops: v.reads + v.writes + v.edits,
      projects: Array.from(v.projects),
    }));
  const bash_commands = Object.entries(bashMap)
    .sort(([, a], [, b]) => b.count - a.count)
    .slice(0, 30)
    .map(([command, v]) => ({ command, count: v.count, errors: v.errors }));

  // MCP and skill aggregation
  const mcpMap = {};
  const skillMap = {};
  const skillByProject = {};
  for (const s of sessions) {
    for (const [srv, cnt] of Object.entries(s.mcp_tools || {})) {
      mcpMap[srv] = (mcpMap[srv] || 0) + cnt;
    }
    for (const [sk, cnt] of Object.entries(s.skill_calls || {})) {
      skillMap[sk] = (skillMap[sk] || 0) + cnt;
      if (!skillByProject[s.project]) skillByProject[s.project] = {};
      skillByProject[s.project][sk] = (skillByProject[s.project][sk] || 0) + cnt;
    }
  }
  const mcp_summary = Object.entries(mcpMap)
    .sort(([, a], [, b]) => b - a)
    .map(([server, count]) => ({ server, count }));
  const skillTotal = Object.values(skillMap).reduce((a, b) => a + b, 0);
  const skill_summary = {
    total_calls: skillTotal,
    unique_skills: Object.keys(skillMap).length,
    ranking: Object.entries(skillMap).sort(([, a], [, b]) => b - a).map(([skill, count]) => ({ skill, count })),
    by_project: Object.entries(skillByProject)
      .map(([project, skills]) => ({
        project,
        total: Object.values(skills).reduce((a, b) => a + b, 0),
        skills: Object.entries(skills).sort(([, a], [, b]) => b - a).map(([skill, count]) => ({ skill, count })),
      }))
      .sort((a, b) => b.total - a.total),
  };

  // Permission summary
  const permMap = {};
  for (const s of sessions) {
    for (const [mode, cnt] of Object.entries(s.permission_modes || {})) {
      permMap[mode] = (permMap[mode] || 0) + cnt;
    }
  }
  const permission_summary = Object.entries(permMap)
    .sort(([, a], [, b]) => b - a)
    .map(([mode, count]) => ({ mode, count }));

  // ── 工具链路统计 ──────────────────────────────────────────────────
  const chainPatterns = {};
  for (const s of sessions) {
    const chain = s.tool_chain || [];
    for (let i = 0; i < chain.length - 1; i++) {
      const pattern = `${chain[i]} → ${chain[i+1]}`;
      chainPatterns[pattern] = (chainPatterns[pattern] || 0) + 1;
    }
  }
  const tool_chains = Object.entries(chainPatterns)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 20)
    .map(([pattern, count]) => ({ pattern, count }));

  // ── Thinking 统计 ─────────────────────────────────────────────────
  const sessionsWithThinking = sessions.filter(s => s.has_thinking);
  const thinkingByProject = {};
  const tBuckets = { "1to10": 0, "11to50": 0, "51to200": 0, "gt200": 0 };
  for (const s of sessions) {
    if (s.thinking_turns > 0) {
      if (!thinkingByProject[s.project]) thinkingByProject[s.project] = 0;
      thinkingByProject[s.project] += s.thinking_turns;
      const t = s.thinking_turns;
      if (t <= 10) tBuckets["1to10"]++;
      else if (t <= 50) tBuckets["11to50"]++;
      else if (t <= 200) tBuckets["51to200"]++;
      else tBuckets["gt200"]++;
    }
  }
  const thinking_stats = {
    sessions_with_thinking: sessionsWithThinking.length,
    pct_sessions: sessions.length > 0 ? (sessionsWithThinking.length / sessions.length * 100).toFixed(1) : '0.0',
    total_turns: sessions.reduce((a, s) => a + (s.thinking_turns || 0), 0),
    by_project: Object.entries(thinkingByProject)
      .sort(([, a], [, b]) => b - a)
      .map(([project, turns]) => ({ project, turns }))
      .slice(0, 10),
    buckets: tBuckets,
  };

  // ── Agentic 统计 ──────────────────────────────────────────────────
  const agenticVals = [];
  for (const s of sessions) {
    const sr = s.stop_reasons || {};
    const tsr = Object.values(sr).reduce((a,b) => a+b, 0) || 1;
    const ratio = (sr['tool_use'] || 0) / tsr;
    if (ratio > 0) agenticVals.push(ratio);
  }
  const agentic_stats = {
    avg_ratio: agenticVals.length > 0 ? Math.round(agenticVals.reduce((a,b) => a+b, 0) / agenticVals.length * 1000) / 1000 : 0,
    highly_agentic_count: agenticVals.filter(v => v > 0.9).length,
  };

  // ── 权限按周聚合 (autonomy_trend) ─────────────────────────────────
  const weekPermission = {};
  for (const s of sessions) {
    if (!s.date) continue;
    const dt = new Date(s.date + 'T00:00:00');
    if (isNaN(dt.getTime())) continue;
    // ISO week: get Thursday of the week
    const dayOfWeek = dt.getDay();
    const thu = new Date(dt);
    thu.setDate(dt.getDate() + (4 - dayOfWeek + 7) % 7);
    const weekNum = getISOWeekNumber(thu);
    const wk = `${thu.getFullYear()}-W${String(weekNum).padStart(2, '0')}`;
    if (!weekPermission[wk]) weekPermission[wk] = {};
    for (const [mode, cnt] of Object.entries(s.permission_modes || {})) {
      weekPermission[wk][mode] = (weekPermission[wk][mode] || 0) + cnt;
    }
  }
  const autonomy_trend = Object.entries(weekPermission)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([wk, wc]) => ({
      week: wk,
      default: wc.default || 0,
      acceptEdits: wc.acceptEdits || 0,
      bypassPermissions: wc.bypassPermissions || 0,
      plan: wc.plan || 0,
      total: Object.values(wc).reduce((a,b) => a+b, 0) || 1,
    }));

  // ── 稳定性 ────────────────────────────────────────────────────────
  const totalApiErrors = sessions.reduce((a, s) => a + (s.api_errors || 0), 0);
  const totalCompact = sessions.reduce((a, s) => a + (s.compact_events || 0), 0);
  const sessionsWithErrors = sessions.filter(s => s.api_errors > 0).length;
  const maxRetry = Math.max(0, ...sessions.map(s => s.max_retry || 0));
  const compactByProject = {};
  for (const s of sessions) {
    if (s.compact_events > 0) {
      compactByProject[s.project] = (compactByProject[s.project] || 0) + s.compact_events;
    }
  }
  const topCompact = Object.entries(compactByProject)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5)
    .map(([project, count]) => ({ project, count }));
  const stability = {
    total_api_errors: totalApiErrors,
    total_compact_events: totalCompact,
    sessions_with_errors: sessionsWithErrors,
    max_retry_seen: maxRetry,
    top_compact_projects: topCompact,
  };

  // ── Turn duration 统计 ────────────────────────────────────────────
  const allAvgMs = sessions.filter(s => s.avg_turn_ms > 0).map(s => s.avg_turn_ms);
  let turn_duration_stats;
  if (allAvgMs.length > 0) {
    const sorted = [...allAvgMs].sort((a,b) => a-b);
    const n = sorted.length;
    const buckets = { "lt1m": 0, "1to5m": 0, "5to15m": 0, "gt15m": 0 };
    for (const ms of allAvgMs) {
      const sVal = ms / 1000;
      if (sVal < 60) buckets["lt1m"]++;
      else if (sVal < 300) buckets["1to5m"]++;
      else if (sVal < 900) buckets["5to15m"]++;
      else buckets["gt15m"]++;
    }
    const totalHours = sessions.reduce((a, s) => a + (s.total_turn_ms || 0), 0) / 3_600_000;
    const slowest = sessions
      .filter(s => s.avg_turn_ms > 0)
      .sort((a,b) => b.avg_turn_ms - a.avg_turn_ms)
      .slice(0, 5);
    turn_duration_stats = {
      count: n,
      avg_ms: Math.floor(allAvgMs.reduce((a,b) => a+b, 0) / n),
      p50_ms: sorted[Math.floor(n/2)],
      p90_ms: sorted[Math.floor(n*0.9)],
      max_ms: Math.max(...allAvgMs),
      total_hours: Math.round(totalHours * 100) / 100,
      buckets,
      slowest_sessions: slowest.map(s => ({
        id: s.id, project: s.project, date: s.date, avg_turn_ms: s.avg_turn_ms,
      })),
    };
  } else {
    turn_duration_stats = {
      count: 0, avg_ms: 0, p50_ms: 0, p90_ms: 0,
      max_ms: 0, total_hours: 0,
      buckets: { "lt1m": 0, "1to5m": 0, "5to15m": 0, "gt15m": 0 },
      slowest_sessions: [],
    };
  }

  // Hourly and weekday distributions (local time)
  const hourly = Array(24).fill(0);
  const weekday = Array(7).fill(0);
  const hour_weekday_matrix = Array(7).fill(null).map(() => Array(24).fill(0));
  const hourlyTimelineMap = {};
  for (const s of sessions) {
    const dt = new Date(s.start_time);
    const h = dt.getHours();
    const w = dt.getDay();
    const weekdayIdx = w === 0 ? 6 : w - 1; // Convert 0=Sunday to 0=Monday
    hourly[h] += s.total_tokens;
    weekday[weekdayIdx] += s.total_tokens;
    hour_weekday_matrix[weekdayIdx][h] += s.total_tokens;

    const hKey = `${String(h).padStart(2, '0')}:00`;
    if (!hourlyTimelineMap[hKey]) hourlyTimelineMap[hKey] = { input: 0, output: 0, cc: 0, cr: 0, sessions: 0 };
    hourlyTimelineMap[hKey].input += s.input_tokens;
    hourlyTimelineMap[hKey].output += s.output_tokens;
    hourlyTimelineMap[hKey].cc += s.cache_creation_input_tokens;
    hourlyTimelineMap[hKey].cr += s.cache_read_input_tokens;
    hourlyTimelineMap[hKey].sessions += 1;
  }
  const hourly_timeline = Array.from({ length: 24 }, (_, i) => {
    const key = `${String(i).padStart(2, '0')}:00`;
    const v = hourlyTimelineMap[key] || { input: 0, output: 0, cc: 0, cr: 0, sessions: 0 };
    return {
      hour: key,
      input_tokens: v.input, output_tokens: v.output,
      cache_creation: v.cc, cache_read: v.cr,
      total_tokens: v.input + v.output + v.cc + v.cr,
      sessions: v.sessions,
    };
  });
  const peak_hour = hourly.indexOf(Math.max(...hourly));

  // Streak
  const activeDates = new Set(sessions.map(s => s.date));
  const sortedDates = Array.from(activeDates).sort();
  let currentStreak = 0, maxStreak = 0, streak = 0;
  const today = new Date().toLocaleDateString('en-CA');
  const yesterday = new Date(Date.now() - 86400000).toLocaleDateString('en-CA');
  if (activeDates.has(today) || activeDates.has(yesterday)) {
    let d = activeDates.has(today) ? new Date() : new Date(Date.now() - 86400000);
    while (true) {
      const key = d.toLocaleDateString('en-CA');
      if (!activeDates.has(key)) break;
      currentStreak++;
      d = new Date(d.getTime() - 86400000);
    }
  }
  for (let i = 0; i < sortedDates.length; i++) {
    if (i === 0) { streak = 1; }
    else {
      const prev = new Date(sortedDates[i - 1]);
      const curr = new Date(sortedDates[i]);
      const diff = (curr - prev) / 86400000;
      streak = diff === 1 ? streak + 1 : 1;
    }
    maxStreak = Math.max(maxStreak, streak);
  }

  // cost_real: use est_cost as proxy (no final_cost in server mode)
  const costByProject = {};
  for (const s of sessions) {
    if (!costByProject[s.project]) costByProject[s.project] = 0;
    costByProject[s.project] += s.est_cost || 0;
  }
  const cost_real = {
    total: Math.round(totalCost * 100) / 100,
    max_session: Math.round(Math.max(...sessions.map(s => s.est_cost || 0)) * 100) / 100,
    session_count: sessions.length,
    by_project: Object.entries(costByProject)
      .sort(([, a], [, b]) => b - a)
      .map(([project, cost]) => ({ project, cost: Math.round(cost * 100) / 100 })),
  };

  return {
    total_tokens: totalTokens,
    total_input_tokens: totalInput,
    total_output_tokens: totalOutput,
    total_cache_creation: totalCacheCreation,
    total_cache_read: totalCacheRead,
    total_sessions: sessions.length,
    total_cost: totalCost,
    daily, projects, models,
    tools, files, bash_commands, tool_chains,
    hourly_timeline, hourly, weekday, hour_weekday_matrix, peak_hour,
    thinking_stats,
    stability,
    permission_summary,
    agentic_stats,
    streak: { current: currentStreak, max: maxStreak, active_days: activeDates.size },
    mcp_summary, skill_summary,
    cost_real,
    autonomy_trend, version_timeline: [],
    turn_duration_stats,
  };
}

server.listen(PORT, () => {
  console.log(`TokenSense server running at http://localhost:${PORT}`);
  console.log(`Press Ctrl+C to stop`);
});
