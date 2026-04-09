    // ═══════════════════════════════════════════════════════════
    // i18n
    // ═══════════════════════════════════════════════════════════
    const i18n = {
      en: {
        live: 'LIVE',
        refresh_in: 'Refresh in',
        loading: 'Loading token data...',
        error_load: 'Failed to load data',
        error_make_sure: 'Make sure the server is running: node src/server.js',
        tab_tokens: 'Tokens',
        tab_costs: 'Costs',
        tab_behavior: 'Behavior',
        tab_tools: 'Tools',
        total_tokens_label: 'Total Tokens Processed',
        total_tokens_desc: 'tokens across',
        total_tokens_sessions: 'sessions',
        input: 'Input',
        output: 'Output',
        cache: 'Cache',
        est_cost: 'Est. Cost',
        today: 'Today',
        yesterday_same_time: 'Yesterday same time',
        est_api_cost: 'Est. API Cost',
        today_cost: 'Today',
        ai_compute_time: 'AI Compute Time',
        avg_per_turn: 'avg',
        min_per_turn: 'min/turn',
        extended_thinking: 'Extended Thinking',
        of_sessions: 'of sessions',
        daily_usage: 'Daily Usage',
        daily_btn: 'Daily',
        hourly_btn: 'Hourly',
        days_badge: 'days',
        activity_heatmap: 'Activity Heatmap',
        less: 'Less',
        more: 'More',
        cache_efficiency: 'Cache Efficiency',
        hit_rate: 'Hit Rate',
        cache_reads: 'Cache Reads',
        cache_writes: 'Cache Writes',
        est_savings: 'Est. Savings',
        cache_reads_pct: 'Cache reads vs total input tokens',
        top_projects: 'Top Projects',
        models: 'Models',
        tool_calls: 'Tool Calls',
        unique_tools_across: 'unique tools across',
        success: 'Success',
        errors: 'Errors',
        success_rate: 'Success Rate',
        top_tool: 'Top Tool',
        calls: 'calls',
        files_touched: 'Files Touched',
        tool_chains: 'Tool Chains',
        bash_commands: 'Bash Commands',
        tool_usage: 'Tool Usage',
        tools_badge: 'tools',
        hot_files: 'Hot Files',
        files_badge: 'files',
        errors_suffix: 'errors',
        tool_usage_ranking: 'Tool Usage',
        common_patterns: 'Common patterns',
        recent_sessions_tool: 'Recent sessions with tool usage',
        recent_sessions: 'Recent Sessions',
        date: 'Date',
        project: 'Project',
        tools_used: 'Tools Used',
        top_file: 'Top File',
        tokens: 'Tokens',
        showing: 'Showing',
        of: 'of',
        sessions: 'sessions',
        total: 'Total',
        csv: 'CSV',
        less_cols: 'Less Cols',
        more_cols: 'More Cols',
        all_projects: 'All Projects',
        duration: 'Duration',
        model: 'Model',
        avg_resp: 'Avg Resp',
        mode: 'Mode',
        think: 'Think',
        branch: 'Branch',
        err: 'Err',
        prompt: 'Prompt',
        cost_note: '* Est. Cost is the API list-price equivalent, not your actual subscription charge.',
        perm_bypass: 'auto',
        perm_accept: 'accept',
        perm_default: 'default',
        perm_plan: 'plan',
        cache_creation: 'Cache Creation',
        cache_read: 'Cache Read',
        est_cost_usd: 'Est. Cost (USD)',
        duration_min: 'Duration (min)',
        first_prompt: 'First Prompt',
        time: 'Time',
        cost_overview: 'Cost Overview',
        cost_desc: 'Estimated API cost across',
        real_recorded: 'Real Recorded',
        max_session: 'Max Session',
        avg_turn: 'Avg Turn',
        agentic: 'Agentic',
        est_total_cost: 'Est. Total Cost',
        sessions_suffix: 'sessions',
        agentic_ratio: 'Agentic Ratio',
        sessions_90: 'sessions >90%',
        daily_cost_trend: 'Daily Cost Trend',
        est_legend: 'Est.',
        real_legend: 'Real',
        est_cost_label: 'Est. Cost ($)',
        real_recorded_label: 'Real Recorded ($)',
        project_cost: 'Project Cost',
        est_btn: 'Est.',
        real_btn: 'Real',
        response_time: 'Response Time',
        no_turn_data: 'No turn duration data',
        response_time_analysis: 'Response Time Analysis',
        average: 'Average',
        median_p50: 'Median (p50)',
        p90: 'p90',
        maximum: 'Maximum',
        total_ai_time: 'Total AI Time',
        distribution: 'Distribution',
        min_1: '<1 min',
        min_1_5: '1-5 min',
        min_5_15: '5-15 min',
        min_15: '>15 min',
        slowest_sessions: 'Slowest Sessions',
        stability: 'Stability',
        api_errors: 'API Errors',
        max_retries: 'Max Retries',
        context_compacts: 'Context Compacts',
        daily_error_trend: 'Daily Error Trend (14d)',
        top_compact_projects: 'Top Compact Projects',
        cost_efficiency: 'Cost x Efficiency',
        per_k_output: '$/1K output tokens',
        est_cost_col: 'Est. Cost',
        real_cost_col: 'Real Cost',
        per_k_out: '$/1K Out',
        usage_behavior: 'Usage Behavior',
        active_days: 'Active days',
        current_streak: 'current streak',
        max_streak_label: 'max',
        peak_hour: 'Peak Hour',
        auto_mode: 'Auto Mode',
        thinking: 'Thinking',
        thinking_turns: 'Thinking Turns',
        current_streak_label: 'Current Streak',
        max_streak: 'Max Streak',
        thinking_sessions: 'Thinking Sessions',
        of_all: 'of all',
        hour_weekday_heatmap: 'Hour x Weekday Heatmap',
        session_starts: 'Session starts',
        morning: 'Morning 6-12',
        afternoon: 'Afternoon 12-18',
        evening: 'Evening 18-22',
        night: 'Night 22-6',
        working_rhythm: 'Working Rhythm',
        time_of_day: 'TIME OF DAY',
        autonomy_trend: 'Autonomy Trend',
        perm_mode_weekly: 'Permission mode by week',
        bypass_legend: 'bypass',
        acceptedits_legend: 'acceptEdits',
        default_legend: 'default',
        thinking_analysis: 'Thinking Analysis',
        thinking_turns_by_project: 'THINKING TURNS BY PROJECT',
        depth_distribution: 'DEPTH DISTRIBUTUTION',
        turns_1_10: '1-10 turns',
        turns_11_50: '11-50 turns',
        turns_51_200: '51-200 turns',
        turns_200: '>200 turns',
        total_turns: 'Total Turns',
        version_timeline: 'Version Timeline',
        versions_badge: 'versions',
        streak_calendar: 'Streak Calendar',
        no_activity: 'no activity',
        longest_streak: 'longest streak',
        mcp_ecosystem: 'MCP Ecosystem',
        servers_badge: 'servers',
        skill_ecosystem: 'Skill Ecosystem',
        skills_calls: 'skills',
        skill_ranking: 'SKILL RANKING',
        skills_by_project: 'SKILLS BY PROJECT',
        export_csv: 'Export CSV',
        prev: 'Prev',
        next: 'Next',
        mpm: 'm',
        hr: 'h',
        heatmap_7d: '7D',
        heatmap_30d: '30D',
        heatmap_365d: '365D',
        sess: 'sess',
        days_label: 'days',
        current_streak_days: 'current streak',
        max_streak_days: 'max',
        days_90: '90 days',
        no_activity: 'no activity',
        tokens_suffix: 'tokens',
        total: 'Total'
      },
      zh: {
        live: '实时',
        refresh_in: '刷新倒计时',
        loading: '正在加载 Token 数据...',
        error_load: '加载数据失败',
        error_make_sure: '请确保服务器正在运行：node src/server.js',
        tab_tokens: 'Token用量',
        tab_costs: '成本',
        tab_behavior: '行为',
        tab_tools: '工具',
        total_tokens_label: '总处理 Token 数',
        total_tokens_desc: '个 Token，共',
        total_tokens_sessions: '次会话',
        input: '输入',
        output: '输出',
        cache: '缓存',
        est_cost: '预估费用',
        today: '今日',
        yesterday_same_time: '昨日同时',
        est_api_cost: '预估 API 费用',
        today_cost: '今日',
        ai_compute_time: 'AI 计算时间',
        avg_per_turn: '平均每轮',
        min_per_turn: '分钟/轮',
        extended_thinking: '扩展思考',
        of_sessions: '的会话占比',
        daily_usage: '每日用量',
        daily_btn: '按日',
        hourly_btn: '按时',
        days_badge: '天',
        activity_heatmap: '活动热力图',
        less: '少',
        more: '多',
        cache_efficiency: '缓存效率',
        hit_rate: '命中率',
        cache_reads: '缓存读取',
        cache_writes: '缓存写入',
        est_savings: '预估节省',
        cache_reads_pct: '缓存读取占总输入 Token 比例',
        top_projects: '热门项目',
        models: '模型',
        tool_calls: '工具调用',
        unique_tools_across: '个独立工具，共',
        success: '成功',
        errors: '错误',
        success_rate: '成功率',
        top_tool: '最常用工具',
        calls: '次调用',
        files_touched: '涉及文件',
        tool_chains: '工具链',
        bash_commands: 'Bash 命令',
        tool_usage: '工具使用排行',
        tools_badge: '个工具',
        hot_files: '高频文件',
        files_badge: '个文件',
        errors_suffix: '次错误',
        tool_usage_ranking: '工具使用排行',
        common_patterns: '常见模式',
        recent_sessions_tool: '近期有工具使用的会话',
        recent_sessions: '近期会话',
        date: '日期',
        project: '项目',
        tools_used: '使用的工具',
        top_file: '主要文件',
        tokens: 'Token 数',
        showing: '显示',
        of: '共',
        sessions: '次会话',
        total: '总计',
        csv: 'CSV',
        less_cols: '隐藏列',
        more_cols: '更多列',
        all_projects: '全部项目',
        duration: '持续时间',
        model: '模型',
        avg_resp: '平均响应',
        mode: '模式',
        think: '思考',
        branch: '分支',
        err: '错误',
        prompt: '提示词',
        cost_note: '* 预估费用为 API 标价等价，非实际订阅费用。',
        perm_bypass: '自动',
        perm_accept: '接受',
        perm_default: '默认',
        perm_plan: '计划',
        cache_creation: '缓存写入',
        cache_read: '缓存读取',
        est_cost_usd: '预估费用(美元)',
        duration_min: '持续时间(分钟)',
        first_prompt: '首次提示词',
        time: '时间',
        cost_overview: '成本概览',
        cost_desc: '预估 API 费用，共',
        real_recorded: '实际记录',
        max_session: '最高单次',
        avg_turn: '平均单轮',
        agentic: '自动化率',
        est_total_cost: '预估总费用',
        sessions_suffix: '次会话',
        agentic_ratio: '自动化比例',
        sessions_90: '次会话超过 90%',
        daily_cost_trend: '每日成本趋势',
        est_legend: '预估',
        real_legend: '实际',
        est_cost_label: '预估费用($)',
        real_recorded_label: '实际记录($)',
        project_cost: '项目成本',
        est_btn: '预估',
        real_btn: '实际',
        response_time: '响应时间',
        no_turn_data: '无单轮耗时数据',
        response_time_analysis: '响应时间分析',
        average: '平均值',
        median_p50: '中位数(p50)',
        p90: 'p90',
        maximum: '最大值',
        total_ai_time: 'AI 总耗时',
        distribution: '分布',
        min_1: '<1分钟',
        min_1_5: '1-5分钟',
        min_5_15: '5-15分钟',
        min_15: '>15分钟',
        slowest_sessions: '最慢会话',
        stability: '稳定性',
        api_errors: 'API 错误',
        max_retries: '最大重试次数',
        context_compacts: '上下文压缩次数',
        daily_error_trend: '每日错误趋势(14天)',
        top_compact_projects: '压缩最多的项目',
        cost_efficiency: '成本与效率',
        per_k_output: '每千输出 Token 费用',
        est_cost_col: '预估费用',
        real_cost_col: '实际费用',
        per_k_out: '每千输出费用',
        usage_behavior: '使用行为',
        active_days: '活跃天数',
        current_streak: '当前连续',
        max_streak_label: '最高',
        peak_hour: '高峰时段',
        auto_mode: '自动模式',
        thinking: '扩展思考',
        thinking_turns: '思考轮数',
        current_streak_label: '当前连续',
        max_streak: '最长连续',
        thinking_sessions: '思考会话',
        of_all: '占全部',
        hour_weekday_heatmap: '时段与星期热力图',
        session_starts: '会话开始数',
        morning: '上午 6-12点',
        afternoon: '下午 12-18点',
        evening: '傍晚 18-22点',
        night: '夜间 22-6点',
        working_rhythm: '工作节奏',
        time_of_day: '时段分布',
        autonomy_trend: '自主性趋势',
        perm_mode_weekly: '每周权限模式',
        bypass_legend: '自动执行',
        acceptedits_legend: '接受修改',
        default_legend: '默认',
        thinking_analysis: '扩展思考分析',
        thinking_turns_by_project: '按项目的思考轮数',
        depth_distribution: '深度分布',
        turns_1_10: '1-10轮',
        turns_11_50: '11-50轮',
        turns_51_200: '51-200轮',
        turns_200: '>200轮',
        total_turns: '总轮数',
        version_timeline: '版本时间线',
        versions_badge: '个版本',
        streak_calendar: '连续打卡日历',
        no_activity: '无活动',
        longest_streak: '最长连续',
        mcp_ecosystem: 'MCP 生态系统',
        servers_badge: '个服务',
        skill_ecosystem: '技能生态系统',
        skills_calls: '个技能',
        skill_ranking: '技能排行',
        skills_by_project: '按项目的技能',
        export_csv: '导出 CSV',
        prev: '上一页',
        next: '下一页',
        mpm: '分钟',
        hr: '小时',
        heatmap_7d: '7天',
        heatmap_30d: '30天',
        heatmap_365d: '365天',
        sess: '次会话',
        days_label: '天',
        current_streak_days: '当前连续',
        max_streak_days: '最高',
        days_90: '90天',
        no_activity: '无活动',
        tokens_suffix: '个Token',
        total: '总计'
      }
    };

    function t(key) {
      const dict = i18n[state?.lang] || i18n.en;
      return dict[key] || i18n.en[key] || key;
    }

    const REFRESH_INTERVAL = 60;
    const SESSIONS_PER_PAGE = 15;
    const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

    // ═══════════════════════════════════════════════════════════
    // PRICING  (USD per 1M tokens, Claude API list price)
    // ═══════════════════════════════════════════════════════════
    // 定价表由 Python 维护，通过 summary.model_pricing 传递（此处不再硬编码）
    // computeCost 直接使用 Python 预算的 est_cost，保持调用接口不变
    function computeCost(s) {
      return s.est_cost || 0;
    }

    function formatCost(cost) {
      if (cost < 0.001) return '<$0.001';
      if (cost < 1) return '$' + cost.toFixed(3);
      return '$' + cost.toFixed(2);
    }

    let state = {
      data: null,
      sessions: [],
      sortKey: 'date',
      sortDir: 'desc',
      filterProject: '',
      currentPage: 1,
      countdown: REFRESH_INTERVAL,
      heatmapView: 'month',
      theme: localStorage.getItem('theme') || 'dark',
      lang: localStorage.getItem('lang') || 'en',
      activeTab: 'tokens',  // 'tokens' | 'costs' | 'behavior' | 'tools'
      showExtraCols: false,   // toggle extra session table columns
      projectCostView: 'est', // 'est' | 'real'
      charts: {},              // Chart.js instances keyed by name
      chartMode: 'daily',     // 'daily' | 'hourly'
      dateRangeStart: '',     // 开始日期
      dateRangeEnd: ''        // 结束日期
    };

    // ═══════════════════════════════════════════════════════════
    // THEME MANAGEMENT
    // ═══════════════════════════════════════════════════════════

    function applyTheme(theme) {
      document.documentElement.setAttribute('data-theme', theme);
      localStorage.setItem('theme', theme);
      state.theme = theme;

      // Update chart colors if chart exists
      if (state.charts.daily) {
        updateChartTheme();
      }
    }

    function toggleTheme() {
      const newTheme = state.theme === 'dark' ? 'light' : 'dark';
      applyTheme(newTheme);
    }

    function updateChartTheme() {
      const isLight = state.theme === 'light';
      const gridColor = isLight ? '#e5e3e0' : '#1e2730';
      const textColor = isLight ? '#8a8a8a' : '#4a5568';
      const legendColor = isLight ? '#5a5a5a' : '#8899a6';
      const tooltipBg = isLight ? '#ffffff' : '#151b23';
      const tooltipTitle = isLight ? '#1a1a1a' : '#f0f4f8';
      const tooltipBody = isLight ? '#5a5a5a' : '#8899a6';
      const tooltipBorder = isLight ? '#e5e3e0' : '#1e2730';

      state.charts.daily.options.scales.x.grid.color = 'transparent';
      state.charts.daily.options.scales.x.ticks.color = textColor;
      state.charts.daily.options.scales.y.grid.color = gridColor;
      state.charts.daily.options.scales.y.ticks.color = textColor;
      state.charts.daily.options.plugins.legend.labels.color = legendColor;
      state.charts.daily.options.plugins.tooltip.backgroundColor = tooltipBg;
      state.charts.daily.options.plugins.tooltip.titleColor = tooltipTitle;
      state.charts.daily.options.plugins.tooltip.bodyColor = tooltipBody;
      state.charts.daily.options.plugins.tooltip.borderColor = tooltipBorder;

      state.charts.daily.update('none');
    }

    function initTheme() {
      applyTheme(state.theme);

      const themeToggle = document.getElementById('themeToggle');
      if (themeToggle) {
        themeToggle.addEventListener('click', toggleTheme);
      }
    }

    // ═══════════════════════════════════════════════════════════
    // LANGUAGE MANAGEMENT
    // ═══════════════════════════════════════════════════════════

    function applyLang(lang) {
      state.lang = lang;
      localStorage.setItem('lang', lang);
      document.documentElement.setAttribute('data-lang', lang);

      // Update static UI elements
      updateStaticUI();

      // Update language toggle button icon
      const langToggle = document.getElementById('langToggle');
      if (langToggle) {
        langToggle.setAttribute('data-lang', lang);
      }

      // Re-render to update all dynamic content
      if (state.data) {
        render();
      }
    }

    function toggleLang() {
      const newLang = state.lang === 'en' ? 'zh' : 'en';
      applyLang(newLang);
    }

    function updateStaticUI() {
      const liveEl = document.getElementById('liveIndicator');
      if (liveEl) {
        const liveText = liveEl.querySelector('.live-text');
        if (liveText) liveText.textContent = t('live');
      }

      const refreshLabelEl = document.getElementById('refreshLabel');
      if (refreshLabelEl) {
        refreshLabelEl.textContent = t('refresh_in');
      }

      const countdownEl = document.getElementById('countdown');
      if (countdownEl) {
        countdownEl.textContent = state.countdown;
      }

      const loadingEl = document.getElementById('loadingText');
      if (loadingEl) {
        loadingEl.textContent = t('loading');
      }
    }

    function initLang() {
      applyLang(state.lang);

      const langToggle = document.getElementById('langToggle');
      if (langToggle) {
        langToggle.addEventListener('click', toggleLang);
        langToggle.setAttribute('data-lang', state.lang);
      }
    }

    // ═══════════════════════════════════════════════════════════
    // DATA PROCESSING
    // ═══════════════════════════════════════════════════════════

    function formatNumber(n) {
      if (n >= 1e9) return (n / 1e9).toFixed(2) + 'B';
      if (n >= 1e6) return (n / 1e6).toFixed(2) + 'M';
      if (n >= 1e3) return (n / 1e3).toFixed(1) + 'K';
      return n.toString();
    }

    function formatTokens(n) { return n.toLocaleString(); }

    function formatDateLocal(d) {
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    }

    function formatTime(isoString) {
      if (!isoString) return '';
      try {
        const d = new Date(isoString);
        if (isNaN(d.getTime())) return '';
        return d.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
      } catch { return ''; }
    }

    function formatDuration(mins) {
      if (mins < 1) return t('min_1');
      if (mins < 60) return mins + t('mpm');
      const h = Math.floor(mins / 60);
      const m = mins % 60;
      return h + t('hr') + (m > 0 ? m + t('mpm') : '');
    }

    function loadData() {
      if (window.TOKEN_DATA) {
        state.data = window.TOKEN_DATA;
        state.sessions = window.TOKEN_DATA.sessions || [];
        state.currentPage = 1;
        render();
        if (window.TOKEN_DATA.updated_at) {
          document.getElementById('lastUpdated').textContent = formatTime(window.TOKEN_DATA.updated_at);
        }
      } else {
        showError('Failed to load data');
      }
    }

    function refreshData() {
      // Static report mode (skill): data already loaded via script tag
      if (window.IS_STATIC_REPORT) {
        loadData();
        return;
      }
      // Server mode: trigger API fetch via token_visual.html's fetchData hook
      if (window.fetchData) window.fetchData();
    }

    // Called by token_visual.html after each API response
    window.refreshDashboard = function(data) {
      window.TOKEN_DATA = data;
      loadData();
    };

    function escapeHtml(str) {
      return String(str ?? '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
    }

    function getLevel(tokens, maxTokens) {
      if (tokens === 0) return 0;
      const ratio = tokens / maxTokens;
      if (ratio < 0.02) return 1;
      if (ratio < 0.05) return 2;
      if (ratio < 0.1) return 3;
      if (ratio < 0.2) return 4;
      if (ratio < 0.4) return 5;
      if (ratio < 0.7) return 6;
      return 7;
    }

    function render() {
      const { summary, sessions } = state.data;
      const main = document.getElementById('mainContent');

      // Set default selected date to today if not set
      if (!state.selectedDate) {
        state.selectedDate = formatDateLocal(new Date());
      }

      const tabNav = `
        <div class="tab-nav" style="grid-column: 1 / -1; margin-bottom: 8px;">
          <button class="tab-btn ${state.activeTab === 'tokens' ? 'active' : ''}" data-tab="tokens">
            <span class="tab-icon">⚡</span> ${t('tab_tokens')}
          </button>
          <button class="tab-btn ${state.activeTab === 'costs' ? 'active' : ''}" data-tab="costs">
            <span class="tab-icon">💰</span> ${t('tab_costs')}
          </button>
          <button class="tab-btn ${state.activeTab === 'behavior' ? 'active' : ''}" data-tab="behavior">
            <span class="tab-icon">🧠</span> ${t('tab_behavior')}
          </button>
          <button class="tab-btn ${state.activeTab === 'tools' ? 'active' : ''}" data-tab="tools">
            <span class="tab-icon">🔧</span> ${t('tab_tools')}
          </button>
        </div>
      `;

      if (state.activeTab === 'tokens') {
        main.innerHTML = `
          ${tabNav}
          <div class="content-left">
            ${renderHero(summary)}
            ${renderChart(summary.daily)}
            ${renderHeatmap(summary.daily)}
            ${renderSessionsTable(sessions)}
          </div>
          <div class="sidebar">
            ${renderProjects(summary.projects)}
            ${renderModels(summary.models)}
            ${renderCacheAnalysis(summary)}
          </div>
        `;

        initChart(summary.daily);
      } else if (state.activeTab === 'costs') {
        main.innerHTML = `
          ${tabNav}
          <div class="content-left">
            ${renderCostsHero(summary, sessions)}
            ${renderDailyCostTrend(summary.daily)}
            ${renderResponseTimeAnalysis(summary.turn_duration_stats || {})}
            ${renderCostEfficiencyTable(summary.projects || [], summary.cost_real || {})}
          </div>
          <div class="sidebar">
            ${renderProjectCostBreakdown(summary.projects || [], summary.cost_real || {})}
            ${renderStabilityReport(summary.stability || {}, summary.daily || [])}
          </div>
        `;
        initCostTrendChart(summary.daily);
        initRespTimeChart(summary.turn_duration_stats || {});
      } else if (state.activeTab === 'behavior') {
        main.innerHTML = `
          ${tabNav}
          <div class="content-left">
            ${renderBehaviorHero(summary)}
            ${renderHourWeekdayHeatmap(summary.hour_weekday_matrix || [])}
            ${renderAutonomyTrend()}
            ${renderThinkingAnalysis(summary.thinking_stats || {})}
            ${renderStreakCalendar(summary.daily || [], summary.streak || {})}
          </div>
          <div class="sidebar">
            ${renderWorkingRhythm(summary.weekday || [], summary.hourly || [])}
            ${renderVersionTimeline(summary.version_timeline || [])}
          </div>
        `;
        initAutonomyChart(summary.autonomy_trend || []);
        initThinkingChart(summary.thinking_stats || {});
      } else {
        main.innerHTML = `
          ${tabNav}
          <div class="content-left">
            ${renderToolsOverview(summary)}
            ${renderMcpEcosystem(summary.mcp_summary || [])}
            ${renderSkillEcosystem(summary.skill_summary || {})}
            ${renderToolChains(summary.tool_chains || [])}
            ${renderSessionsToolsTable(sessions)}
          </div>
          <div class="sidebar">
            ${renderToolsRanking(summary.tools || [])}
            ${renderFileOperations(summary.files || [])}
            ${renderBashCommands(summary.bash_commands || [])}
          </div>
        `;
      }

      attachEvents();
    }

    function getTodayData(daily) {
      const today = formatDateLocal(new Date());
      const todayData = daily.find(d => d.date === today);
      return todayData || { input_tokens: 0, output_tokens: 0, total_tokens: 0, sessions: 0 };
    }

    function getYesterdaySameTimeData(sessions) {
      const now = new Date();
      const currentHour = now.getHours();
      const currentMinute = now.getMinutes();

      // 昨天的日期
      const yesterday = new Date(now);
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayStr = formatDateLocal(yesterday);

      // 筛选昨天截止到当前时间的会话
      const yesterdaySessions = sessions.filter(s => {
        if (s.date !== yesterdayStr) return false;
        const timeParts = s.time.split(':');
        const hour = parseInt(timeParts[0]);
        const minute = parseInt(timeParts[1]);
        if (hour < currentHour) return true;
        if (hour === currentHour && minute <= currentMinute) return true;
        return false;
      });

      return yesterdaySessions.reduce((sum, s) => sum + (s.total_tokens || 0), 0);
    }

    function renderHero(s) {
      const todayData = getTodayData(s.daily);
      const yesterdaySameTime = getYesterdaySameTimeData(state.sessions);
      const totalCost = state.sessions.reduce((acc, sess) => acc + computeCost(sess), 0);
      const todayCost = state.sessions
        .filter(sess => sess.date === formatDateLocal(new Date()))
        .reduce((acc, sess) => acc + computeCost(sess), 0);

      return `
        <div class="hero">
          <div class="hero-content">
            <div class="hero-main">
              <div class="hero-label">${t('total_tokens_label')}</div>
              <div class="hero-value">${formatNumber(s.total_tokens)}</div>
              <div class="hero-unit">${formatTokens(s.total_tokens)} ${t('total_tokens_desc')} ${s.total_sessions} ${t('total_tokens_sessions')}</div>
            </div>
            <div class="hero-breakdown">
              <div class="breakdown-item input">
                <span class="breakdown-label">${t('input')}</span>
                <span class="breakdown-value">${formatNumber(s.total_input_tokens)}</span>
              </div>
              <div class="breakdown-item output">
                <span class="breakdown-label">${t('output')}</span>
                <span class="breakdown-value">${formatNumber(s.total_output_tokens)}</span>
              </div>
              <div class="breakdown-item cache">
                <span class="breakdown-label">${t('cache')}</span>
                <span class="breakdown-value">${formatNumber(s.total_cache_creation)}</span>
              </div>
              <div class="breakdown-item cost">
                <span class="breakdown-label">${t('est_cost')}</span>
                <span class="breakdown-value">${formatCost(totalCost)}</span>
              </div>
            </div>
          </div>
          <div class="metrics-grid metrics-grid-6">
            <div class="metric-card today">
              <div class="metric-icon">⚡</div>
              <div class="metric-label">${t('today')}</div>
              <div class="metric-value">${formatNumber(todayData.total_tokens)}</div>
              <div class="metric-yesterday" title="${t('yesterday_same_time')}">${formatNumber(yesterdaySameTime)}</div>
            </div>
            <div class="metric-card">
              <div class="metric-icon">↓</div>
              <div class="metric-label">${t('input')}</div>
              <div class="metric-value">${formatNumber(s.total_input_tokens)}</div>
            </div>
            <div class="metric-card">
              <div class="metric-icon">↑</div>
              <div class="metric-label">${t('output')}</div>
              <div class="metric-value">${formatNumber(s.total_output_tokens)}</div>
            </div>
            <div class="metric-card cost-card">
              <div class="metric-icon">$</div>
              <div class="metric-label">${t('est_api_cost')}</div>
              <div class="metric-value">${formatCost(totalCost)}</div>
              <div class="metric-sub">${t('today_cost')}: ${formatCost(todayCost)}</div>
            </div>
            <div class="metric-card" style="--card-accent: var(--accent-cool, #06b6d4);">
              <div class="metric-icon">⏱</div>
              <div class="metric-label">${t('ai_compute_time')}</div>
              <div class="metric-value">${s.turn_duration_stats && s.turn_duration_stats.total_hours ? s.turn_duration_stats.total_hours.toFixed(1) + t('hr') : '—'}</div>
              <div class="metric-sub">${s.turn_duration_stats && s.turn_duration_stats.avg_ms ? t('avg_per_turn') + ' ' + (s.turn_duration_stats.avg_ms / 60000).toFixed(1) + ' ' + t('min_per_turn') : ''}</div>
            </div>
            <div class="metric-card" style="--card-accent: var(--accent-purple, #a855f7);">
              <div class="metric-icon">🧠</div>
              <div class="metric-label">${t('extended_thinking')}</div>
              <div class="metric-value">${s.thinking_stats ? s.thinking_stats.sessions_with_thinking : '—'}</div>
              <div class="metric-sub">${s.thinking_stats && s.thinking_stats.pct_sessions != null ? (typeof s.thinking_stats.pct_sessions === 'string' ? s.thinking_stats.pct_sessions : s.thinking_stats.pct_sessions.toFixed(0)) + '% ' + t('of_sessions') : ''}</div>
            </div>
          </div>
        </div>
      `;
    }

    function renderChart(daily) {
      const rangeStart = state.dateRangeStart || '';
      const rangeEnd = state.dateRangeEnd || '';
      const mode = state.chartMode;

      let minDate = '', maxDate = '';
      if (daily && daily.length > 0 && daily[0].date) {
        const dates = daily.map(d => d.date).sort();
        minDate = dates[0];
        maxDate = dates[dates.length - 1];
      }

      let selectedDate = rangeStart;
      if (!selectedDate && maxDate) selectedDate = maxDate;

      const countLabel = mode === 'hourly' ? '24 hours' : daily.length + ' ' + t('days_badge');

      let datePickerHTML;
      if (mode === 'hourly') {
        datePickerHTML = `
          <input type="date" id="dateStart" class="date-picker" value="${selectedDate}" min="${minDate}" max="${maxDate}">
        `;
      } else {
        let startDate = rangeStart;
        let endDate = rangeEnd;
        if (!startDate && !endDate && maxDate) {
          endDate = maxDate;
          const d = new Date(maxDate);
          d.setDate(d.getDate() - 6);
          startDate = d.toISOString().slice(0, 10);
        }
        datePickerHTML = `
          <input type="date" id="dateStart" class="date-picker" value="${startDate}" min="${minDate}" max="${maxDate}">
          <span class="date-separator">—</span>
          <input type="date" id="dateEnd" class="date-picker" value="${endDate}" min="${minDate}" max="${maxDate}">
        `;
      }

      return `
        <div class="section">
          <div class="section-header">
            <div class="section-title">${t('daily_usage')}</div>
            <div class="chart-controls">
              <div class="date-range-picker">
                ${datePickerHTML}
              </div>
              <button class="chart-mode-btn ${mode === 'daily' ? 'active' : ''}" data-mode="daily">${t('daily_btn') || '日'}</button>
              <button class="chart-mode-btn ${mode === 'hourly' ? 'active' : ''}" data-mode="hourly">${t('hourly_btn') || '时'}</button>
            </div>
            <div class="section-badge">${countLabel}</div>
          </div>
          <div class="chart-container">
            <canvas id="dailyChart"></canvas>
          </div>
        </div>
      `;
    }

    function computeHourlyForDate(sessions, date) {
      const filtered = sessions.filter(s => s.date === date);

      const buckets = Array.from({ length: 24 }, () => ({
        input_tokens: 0, output_tokens: 0,
        cache_creation: 0, cache_read: 0,
        total_tokens: 0, sessions: 0
      }));

      for (const s of filtered) {
        const h = parseHour(s.time || '00:00');
        buckets[h].input_tokens += s.input_tokens || 0;
        buckets[h].output_tokens += s.output_tokens || 0;
        buckets[h].cache_creation += s.cache_creation_input_tokens || 0;
        buckets[h].cache_read += s.cache_read_input_tokens || 0;
        buckets[h].total_tokens += s.total_tokens || 0;
        buckets[h].sessions += 1;
      }

      return buckets.map((b, i) => ({
        hour: `${String(i).padStart(2, '0')}:00`,
        ...b
      }));
    }

    function parseHour(timeStr) {
      // Handles "HH:MM AM/PM" (e.g. "03:58 PM") and "HH:MM" (24-hour) formats
      const parts = timeStr.trim().split(/\s+/);
      const [hh] = parts[0].split(':');
      let h = parseInt(hh, 10) || 0;
      const period = parts.length > 1 ? parts[1].toUpperCase() : '';
      if (period === 'PM' && h < 12) h += 12;
      if (period === 'AM' && h === 12) h = 0;
      return h;
    }

    function initChart(daily) {
      const ctx = document.getElementById('dailyChart');
      if (!ctx) return;

      const isHourly = state.chartMode === 'hourly';

      let chartData;
      if (isHourly) {
        const selectedDate = state.dateRangeStart || '';
        chartData = computeHourlyForDate(state.sessions, selectedDate);
      } else {
        const startDate = state.dateRangeStart;
        const endDate = state.dateRangeEnd;
        chartData = daily;
        if (startDate || endDate) {
          chartData = chartData.filter(d => {
            const dateStr = d.date;
            if (startDate && dateStr < startDate) return false;
            if (endDate && dateStr > endDate) return false;
            return true;
          });
        }
        chartData.sort((a, b) => a.date.localeCompare(b.date));
      }

      const labels = chartData.map(d => isHourly ? d.hour : d.date.slice(5));
      const inputData = chartData.map(d => d.input_tokens);
      const outputData = chartData.map(d => d.output_tokens);

      if (state.charts.daily) state.charts.daily.destroy();

      const isLight = state.theme === 'light';
      const gridColor = isLight ? '#e5e3e0' : '#1e2730';
      const textColor = isLight ? '#8a8a8a' : '#4a5568';
      const legendColor = isLight ? '#5a5a5a' : '#8899a6';
      const tooltipBg = isLight ? '#ffffff' : '#151b23';
      const tooltipTitle = isLight ? '#1a1a1a' : '#f0f4f8';
      const tooltipBody = isLight ? '#5a5a5a' : '#8899a6';
      const tooltipBorder = isLight ? '#e5e3e0' : '#1e2730';

      const chartType = isHourly ? 'line' : 'bar';

      state.charts.daily = new Chart(ctx, {
        type: chartType,
        data: {
          labels,
          datasets: [
            {
              label: t('input'),
              data: inputData,
              backgroundColor: isHourly ? 'rgba(78, 205, 196, 0.1)' : '#4ecdc4',
              borderColor: '#4ecdc4',
              borderWidth: 2,
              tension: 0.3,
              fill: isHourly,
              borderRadius: isHourly ? 0 : 4,
              barPercentage: 0.7
            },
            {
              label: t('output'),
              data: outputData,
              backgroundColor: isHourly ? 'rgba(200, 255, 0, 0.1)' : '#c8ff00',
              borderColor: '#c8ff00',
              borderWidth: 2,
              tension: 0.3,
              fill: isHourly,
              borderRadius: isHourly ? 0 : 4,
              barPercentage: 0.7
            }
          ]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              position: 'top',
              align: 'end',
              labels: {
                color: legendColor,
                font: { family: 'JetBrains Mono', size: 10 },
                boxWidth: 12,
                boxHeight: 12,
                borderRadius: 3,
                useBorderRadius: true
              }
            },
            tooltip: {
              backgroundColor: tooltipBg,
              titleColor: tooltipTitle,
              bodyColor: tooltipBody,
              borderColor: tooltipBorder,
              borderWidth: 1,
              cornerRadius: 8,
              padding: 12
            }
          },
          scales: {
            x: {
              grid: { display: false },
              ticks: {
                color: textColor,
                font: { family: 'JetBrains Mono', size: 9 },
                maxTicksLimit: isHourly ? 24 : 12,
                autoSkip: isHourly ? false : true,
                maxRotation: isHourly ? 45 : 0
              }
            },
            y: {
              grid: { color: gridColor },
              ticks: {
                color: textColor,
                font: { family: 'JetBrains Mono', size: 9 },
                callback: formatNumber
              }
            }
          }
        }
      });
    }

    function renderHeatmap(daily) {
      if (!daily || daily.length === 0) return '';

      const dateMap = {};
      daily.forEach(d => { dateMap[d.date] = d.total_tokens; });

      const dates = daily.map(d => d.date).sort();
      if (dates.length === 0) return '';

      const maxTokens = Math.max(...Object.values(dateMap), 1);

      const today = new Date();
      today.setHours(23, 59, 59, 999);

      let filteredDaily = [];
      let startDate = new Date();

      if (state.heatmapView === 'week') {
        const dayOfWeek = today.getDay();
        const diff = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
        startDate = new Date(today.getFullYear(), today.getMonth(), today.getDate() - diff);

        let d = new Date(startDate);
        while (d <= today) {
          const dateStr = formatDateLocal(d);
          filteredDaily.push({
            date: dateStr,
            total_tokens: dateMap[dateStr] || 0
          });
          d.setDate(d.getDate() + 1);
        }
      } else if (state.heatmapView === 'month') {
        startDate = new Date(today.getFullYear(), today.getMonth(), 1);

        let d = new Date(startDate);
        while (d <= today) {
          const dateStr = formatDateLocal(d);
          filteredDaily.push({
            date: dateStr,
            total_tokens: dateMap[dateStr] || 0
          });
          d.setDate(d.getDate() + 1);
        }
      } else {
        startDate = new Date(today.getFullYear(), 0, 1);

        let d = new Date(startDate);
        while (d <= today) {
          const dateStr = formatDateLocal(d);
          filteredDaily.push({
            date: dateStr,
            total_tokens: dateMap[dateStr] || 0
          });
          d.setDate(d.getDate() + 1);
        }
      }

      const cellsHtml = filteredDaily.map(d => {
        const level = getLevel(d.total_tokens, maxTokens);
        return `<div class="heatmap-cell level-${level}"
          data-date="${d.date}"
          data-tokens="${d.total_tokens}"></div>`;
      }).join('');

      const legendLevels = [0, 0.02, 0.06, 0.14, 0.26, 0.44, 0.68, 1.0];
      const legendHtml = `
        <div class="heatmap-legend">
          <span>${t('less')}</span>
          ${legendLevels.map(l => {
            const label = l === 0 ? '0' : `${(l * 100).toFixed(0)}%`;
            return `<div class="legend-cell heatmap-cell level-${legendLevels.indexOf(l)}" title="${label} max"></div>`;
          }).join('')}
          <span>${t('more')}</span>
        </div>
      `;

      return `
        <div class="section">
          <div class="section-header">
            <div class="section-title">${t('activity_heatmap')}</div>
            <div class="heatmap-controls">
              <button class="heatmap-btn ${state.heatmapView === 'week' ? 'active' : ''}" data-view="week">${t('heatmap_7d')}</button>
              <button class="heatmap-btn ${state.heatmapView === 'month' ? 'active' : ''}" data-view="month">${t('heatmap_30d')}</button>
              <button class="heatmap-btn ${state.heatmapView === 'year' ? 'active' : ''}" data-view="year">${t('heatmap_365d')}</button>
            </div>
          </div>
          <div class="heatmap-grid">${cellsHtml}</div>
          ${legendHtml}
        </div>
      `;
    }

    function renderCacheAnalysis(summary) {
      const totalInput = summary.total_input_tokens;
      const totalCacheRead = summary.total_cache_read;
      const totalCacheWrite = summary.total_cache_creation;

      const hitRate = (totalInput + totalCacheRead) > 0
        ? (totalCacheRead / (totalInput + totalCacheRead) * 100).toFixed(1)
        : 0;

      // Savings: cache reads charged at $0.30 vs full input at $3.00 per 1M (Sonnet pricing)
      const savings = totalCacheRead / 1e6 * (3.00 - 0.30);

      return `
        <div class="section">
          <div class="section-header">
            <div class="section-title">${t('cache_efficiency')}</div>
          </div>
          <div class="cache-stats">
            <div class="cache-stat-item">
              <span class="cache-stat-label">${t('hit_rate')}</span>
              <span class="cache-stat-value" style="color:var(--accent-cool)">${hitRate}%</span>
            </div>
            <div class="cache-stat-item">
              <span class="cache-stat-label">${t('cache_reads')}</span>
              <span class="cache-stat-value">${formatNumber(totalCacheRead)}</span>
            </div>
            <div class="cache-stat-item">
              <span class="cache-stat-label">${t('cache_writes')}</span>
              <span class="cache-stat-value">${formatNumber(totalCacheWrite)}</span>
            </div>
            <div class="cache-stat-item">
              <span class="cache-stat-label">${t('est_savings')}</span>
              <span class="cache-stat-value" style="color:var(--accent-lime)">${formatCost(savings)}</span>
            </div>
          </div>
          <div class="cache-progress-bar">
            <div class="cache-progress-fill" style="width:${hitRate}%"></div>
          </div>
          <div style="font-size:10px;color:var(--text-muted);margin-top:6px">
            ${t('cache_reads_pct')}
          </div>
        </div>
      `;
    }

    function renderProjects(projects) {
      const items = projects.slice(0, 10).map(p => `
        <div class="project-item" data-project="${escapeHtml(p.project)}">
          <span class="project-name">${escapeHtml(p.project)}</span>
          <span class="project-tokens">${formatNumber(p.total_tokens)}</span>
          <span class="project-sessions">${p.sessions} ${t('sess')}</span>
        </div>
      `).join('');

      return `
        <div class="section">
          <div class="section-header">
            <div class="section-title">${t('top_projects')}</div>
          </div>
          <div class="project-list">${items}</div>
        </div>
      `;
    }

    function renderModels(models) {
      if (!models || models.length === 0) return '';

      function shortenModelName(name) {
        let short = name.replace(/^(claude-|anthropic-|openai-|google-|meta-|zhipu\/|volcengine\/)/, '');
        if (short.length > 20) {
          short = short.substring(0, 18) + '...';
        }
        return short || name;
      }

      const items = models.map(m => `
        <div class="model-item">
          <span class="model-name" title="${m.model}">${shortenModelName(m.model)}</span>
          <span class="model-stats">${formatNumber(m.input_tokens)} / ${formatNumber(m.output_tokens)}</span>
        </div>
      `).join('');

      return `
        <div class="section">
          <div class="section-header">
            <div class="section-title">${t('models')}</div>
          </div>
          <div class="model-list">${items}</div>
        </div>
      `;
    }

    // ═══════════════════════════════════════════════════════════
    // TOOLS TAB RENDERING
    // ═══════════════════════════════════════════════════════════

    function renderToolsOverview(summary) {
      const tools = summary.tools || [];
      const totalCalls = tools.reduce((sum, t) => sum + t.count, 0);
      const totalErrors = tools.reduce((sum, t) => sum + t.errors, 0);
      const overallRate = totalCalls > 0 ? ((totalCalls - totalErrors) / totalCalls * 100).toFixed(1) : 100;

      return `
        <div class="hero">
          <div class="hero-content">
            <div class="hero-main">
              <div class="hero-label">${t('tool_calls')}</div>
              <div class="hero-value">${formatNumber(totalCalls)}</div>
              <div class="hero-unit">${tools.length} ${t('unique_tools_across')} ${summary.total_sessions} ${t('sessions_suffix')}</div>
            </div>
            <div class="hero-breakdown">
              <div class="breakdown-item input">
                <span class="breakdown-label">${t('success')}</span>
                <span class="breakdown-value">${formatNumber(totalCalls - totalErrors)}</span>
              </div>
              <div class="breakdown-item output">
                <span class="breakdown-label">${t('errors')}</span>
                <span class="breakdown-value">${formatNumber(totalErrors)}</span>
              </div>
              <div class="breakdown-item cache">
                <span class="breakdown-label">${t('success_rate')}</span>
                <span class="breakdown-value">${overallRate}%</span>
              </div>
            </div>
          </div>
          <div class="metrics-grid">
            <div class="metric-card today">
              <div class="metric-icon">🔨</div>
              <div class="metric-label">${t('top_tool')}</div>
              <div class="metric-value" style="font-size:18px">${tools[0]?.name || '-'}</div>
              <div class="metric-sub">${formatNumber(tools[0]?.count || 0)} ${t('calls')}</div>
            </div>
            <div class="metric-card">
              <div class="metric-icon">📁</div>
              <div class="metric-label">${t('files_touched')}</div>
              <div class="metric-value">${(summary.files || []).length}</div>
            </div>
            <div class="metric-card">
              <div class="metric-icon">🔗</div>
              <div class="metric-label">${t('tool_chains')}</div>
              <div class="metric-value">${(summary.tool_chains || []).length}</div>
            </div>
            <div class="metric-card cost-card">
              <div class="metric-icon">💻</div>
              <div class="metric-label">${t('bash_commands')}</div>
              <div class="metric-value">${(summary.bash_commands || []).length}</div>
            </div>
          </div>
        </div>
      `;
    }

    function renderToolsRanking(tools) {
      if (!tools || tools.length === 0) return '';

      const maxCount = Math.max(...tools.map(t => t.count), 1);

      const items = tools.slice(0, 12).map(t => {
        const width = (t.count / maxCount * 100).toFixed(1);
        const errorPct = t.errors > 0 ? (t.errors / t.count * 100).toFixed(1) : '0';
        const errorInfo = t.errors > 0 ? ` · <span style="color:var(--accent-hot)">${t.errors} err</span>` : '';

        return `
          <div class="h-bar-item">
            <span class="h-bar-label" title="${t.name}">${t.name}</span>
            <div class="h-bar-track"><div class="h-bar-fill cool" style="width:${width}%"></div></div>
            <span class="h-bar-count">${formatNumber(t.count)}</span>
            <span class="h-bar-sub">${errorInfo ? errorInfo : ''}</span>
          </div>
        `;
      }).join('');

      return `
        <div class="section">
          <div class="section-header">
            <div class="section-title">${t('tool_usage')}</div>
            <div class="section-badge">${tools.length} ${t('tools_badge')}</div>
          </div>
          ${items}
        </div>
      `;
    }

    function renderFileOperations(files) {
      if (!files || files.length === 0) return '';

      const items = files.slice(0, 10).map(f => {
        const badges = [];
        if (f.reads > 0) badges.push(`<span class="file-badge reads">R:${f.reads}</span>`);
        if (f.writes > 0) badges.push(`<span class="file-badge writes">W:${f.writes}</span>`);
        if (f.edits > 0) badges.push(`<span class="file-badge edits">E:${f.edits}</span>`);

        return `
          <div class="file-ops-item">
            <span class="file-ops-name" title="${escapeHtml(f.file)}">${escapeHtml(f.file)}</span>
            <div class="file-ops-badges">${badges.join('')}</div>
          </div>
        `;
      }).join('');

      return `
        <div class="section">
          <div class="section-header">
            <div class="section-title">${t('hot_files')}</div>
            <div class="section-badge">${files.length} ${t('files_badge')}</div>
          </div>
          <div class="file-ops-list">${items}</div>
        </div>
      `;
    }

    function renderBashCommands(cmds) {
      if (!cmds || cmds.length === 0) return '';

      const items = cmds.slice(0, 8).map(c => `
        <div class="bash-cmd-item">
          <span class="bash-cmd-name">$ ${escapeHtml(c.command)}</span>
          <span class="bash-cmd-count">${c.count}x</span>
          ${c.errors > 0 ? `<span class="bash-cmd-errors">${c.errors} ${t('errors_suffix')}</span>` : ''}
        </div>
      `).join('');

      return `
        <div class="section">
          <div class="section-header">
            <div class="section-title">${t('bash_commands')}</div>
          </div>
          <div class="bash-cmd-list">${items}</div>
        </div>
      `;
    }

    function renderToolChains(chains) {
      if (!chains || chains.length === 0) return '';

      const items = chains.slice(0, 15).map(c => {
        const pattern = c.pattern.replace(/ → /g, '<span class="arrow">→</span>');
        return `
          <div class="chain-item">
            <span class="chain-pattern">${pattern}</span>
            <span class="chain-count">${c.count}x</span>
          </div>
        `;
      }).join('');

      return `
        <div class="section">
          <div class="section-header">
            <div class="section-title">${t('tool_chains')}</div>
            <div class="section-badge">${t('common_patterns')}</div>
          </div>
          <div class="chain-list">${items}</div>
        </div>
      `;
    }

    function renderSessionsToolsTable(sessions) {
      const items = sessions.slice(0, 30).map(s => {
        const toolStats = s.tool_stats || {};
        const tools = Object.entries(toolStats).map(([name, stats]) =>
          `${name}(${stats.count})`
        ).join(', ') || '-';

        const topFile = s.top_file || '-';

        return `
          <tr>
            <td class="col-date">${s.date} ${s.time}</td>
            <td class="col-project">${escapeHtml(s.project)}</td>
            <td style="max-width:200px;overflow:hidden;text-overflow:ellipsis;font-size:10px;color:var(--text-secondary)">${tools}</td>
            <td style="font-size:10px;color:var(--text-muted);max-width:150px;overflow:hidden;text-overflow:ellipsis">${escapeHtml(topFile)}</td>
            <td class="col-tokens">${formatTokens(s.total_tokens)}</td>
          </tr>
        `;
      }).join('');

      return `
        <div class="section sessions-section">
          <div class="table-controls">
            <div class="table-info">
              ${t('recent_sessions_tool')}
            </div>
          </div>
          <table class="sessions-table">
            <thead>
              <tr>
                <th class="col-date">${t('date')}</th>
                <th class="col-project">${t('project')}</th>
                <th>${t('tools_used')}</th>
                <th>${t('top_file')}</th>
                <th class="col-tokens">${t('tokens')}</th>
              </tr>
            </thead>
            <tbody>${items}</tbody>
          </table>
        </div>
      `;
    }

    function renderSessionsTable(sessions) {
      const filtered = state.filterProject
        ? sessions.filter(s => s.project === state.filterProject)
        : sessions;

      const sorted = [...filtered].sort((a, b) => {
        let va = a[state.sortKey];
        let vb = b[state.sortKey];
        if (typeof va === 'string') { va = va.toLowerCase(); vb = vb.toLowerCase(); }
        return state.sortDir === 'asc' ? (va > vb ? 1 : -1) : (va < vb ? 1 : -1);
      });

      const totalPages = Math.ceil(sorted.length / SESSIONS_PER_PAGE);
      const pageSessions = sorted.slice((state.currentPage - 1) * SESSIONS_PER_PAGE, state.currentPage * SESSIONS_PER_PAGE);

      const projectOptions = [...new Set(sessions.map(s => s.project))].sort()
        .map(p => `<option value="${escapeHtml(p)}" ${p === state.filterProject ? 'selected' : ''}>${escapeHtml(p)}</option>`).join('');

      const rows = pageSessions.map(s => {
        const permMap = { bypassPermissions: 'bypass', acceptEdits: 'auto', default: 'default', plan: 'plan' };
        const permLabel = permMap[s.dominant_permission] || s.dominant_permission || 'default';
        const permClass = s.dominant_permission === 'bypassPermissions' ? 'bypass' : s.dominant_permission === 'acceptEdits' ? 'accept' : s.dominant_permission || 'default';
        const permBadge = s.dominant_permission
          ? `<span class="perm-badge ${permClass}">${escapeHtml(permLabel)}</span>`
          : '-';
        const thinkingIcon = s.has_thinking ? '🧠' : '';
        const branch = s.git_branch ? `<span style="font-size:10px;color:var(--text-muted);max-width:80px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;display:inline-block" title="${escapeHtml(s.git_branch)}">${escapeHtml(s.git_branch)}</span>` : '-';
        const avgResp = s.avg_turn_ms > 0 ? (s.avg_turn_ms / 60000).toFixed(1) + 'm' : '-';
        const errCell = s.api_errors > 0 ? `<span style="color:var(--accent-hot)">${s.api_errors}</span>` : '0';
        const extraCols = state.showExtraCols ? `
          <td class="col-duration" title="${t('avg_resp')}">${avgResp}</td>
          <td>${permBadge}</td>
          <td style="text-align:center">${thinkingIcon}</td>
          <td>${branch}</td>
          <td style="text-align:center">${errCell}</td>
        ` : '';
        return `
        <tr>
          <td class="col-date">${escapeHtml(s.date)} ${escapeHtml(s.time)}</td>
          <td class="col-project">${escapeHtml(s.project)}</td>
          <td class="col-tokens col-input">${formatTokens(s.input_tokens)}</td>
          <td class="col-tokens col-output">${formatTokens(s.output_tokens)}</td>
          <td class="col-tokens col-cache">${s.cache_creation_input_tokens > 0 ? formatTokens(s.cache_creation_input_tokens) : '-'}</td>
          <td class="col-tokens">${formatTokens(s.total_tokens)}</td>
          <td class="col-cost">${formatCost(computeCost(s))}</td>
          <td class="col-duration">${formatDuration(s.duration_minutes)}</td>
          <td class="col-model">${escapeHtml(s.model_str || '-')}</td>
          ${extraCols}
          <td class="col-prompt" title="${escapeHtml(s.first_prompt || '--')}">${escapeHtml(s.first_prompt || '--')}</td>
        </tr>
      `}).join('');

      const pagination = renderPagination(totalPages);

      return `
        <div class="section sessions-section">
          <div class="table-controls">
            <div class="table-info">
              ${t('showing')} <strong>${pageSessions.length}</strong> ${t('of')} <strong>${filtered.length}</strong> ${t('sessions')}
              &nbsp;·&nbsp; ${t('total')}: <strong class="cost-highlight">${formatCost(filtered.reduce((a, s) => a + computeCost(s), 0))}</strong>
            </div>
            <div style="display:flex;gap:8px;align-items:center">
              <button class="export-btn" id="exportCsvBtn">↓ ${t('csv')}</button>
              <button class="export-btn" id="toggleExtraColsBtn" style="background:${state.showExtraCols ? 'var(--accent-cool,#06b6d4)' : 'var(--bg-elevated)'}">${state.showExtraCols ? '▲ ' + t('less_cols') : '▼ ' + t('more_cols')}</button>
              <select class="filter-select" id="projectFilter">
                <option value="">${t('all_projects')}</option>
                ${projectOptions}
              </select>
            </div>
          </div>
          <table class="sessions-table">
            <thead>
              <tr>
                <th class="col-date ${state.sortKey === 'date' ? 'sorted sorted-' + state.sortDir : ''}" data-sort="date">${t('date')}</th>
                <th class="col-project ${state.sortKey === 'project' ? 'sorted sorted-' + state.sortDir : ''}" data-sort="project">${t('project')}</th>
                <th class="col-tokens ${state.sortKey === 'input_tokens' ? 'sorted sorted-' + state.sortDir : ''}" data-sort="input_tokens">${t('input')}</th>
                <th class="col-tokens ${state.sortKey === 'output_tokens' ? 'sorted sorted-' + state.sortDir : ''}" data-sort="output_tokens">${t('output')}</th>
                <th class="col-tokens ${state.sortKey === 'cache_creation_input_tokens' ? 'sorted sorted-' + state.sortDir : ''}" data-sort="cache_creation_input_tokens">${t('cache')}</th>
                <th class="col-tokens ${state.sortKey === 'total_tokens' ? 'sorted sorted-' + state.sortDir : ''}" data-sort="total_tokens">${t('total')}</th>
                <th class="col-cost">${t('est_cost')}</th>
                <th class="col-duration ${state.sortKey === 'duration_minutes' ? 'sorted sorted-' + state.sortDir : ''}" data-sort="duration_minutes">${t('duration')}</th>
                <th class="col-model">${t('model')}</th>
                ${state.showExtraCols ? `
                <th class="col-duration">${t('avg_resp')}</th>
                <th>${t('mode')}</th>
                <th style="text-align:center">${t('think')}</th>
                <th>${t('branch')}</th>
                <th style="text-align:center">${t('err')}</th>
                ` : ''}
                <th class="col-prompt">${t('prompt')}</th>
              </tr>
            </thead>
            <tbody>${rows}</tbody>
          </table>
          ${pagination}
          <div style="margin-top:10px;font-size:10px;color:var(--text-muted)">
            ${t('cost_note')}
          </div>
        </div>
        </div>
      `;
    }

    // 局部刷新：仅替换 sessions table，不重建整个 tab
    function updateSessionsTable() {
      const container = document.getElementById('sessionsTableContainer');
      if (!container) { render(); return; }
      const html = renderSessionsTable(state.sessions);
      // renderSessionsTable 返回包含 #sessionsTableContainer 的字符串，取其内容
      const tmp = document.createElement('div');
      tmp.innerHTML = html;
      const newContainer = tmp.querySelector('#sessionsTableContainer');
      if (newContainer) {
        container.replaceWith(newContainer);
        // 重新绑定 table 内的事件
        _attachTableEvents();
      }
    }

    // table 内事件（sort / page / filter / toggleExtraCols / export）
    function _attachTableEvents() {
      document.querySelectorAll('.sessions-table th[data-sort]').forEach(th => {
        th.addEventListener('click', () => {
          if (state.sortKey === th.dataset.sort) {
            state.sortDir = state.sortDir === 'asc' ? 'desc' : 'asc';
          } else {
            state.sortKey = th.dataset.sort;
            state.sortDir = 'desc';
          }
          state.currentPage = 1;
          updateSessionsTable();
        });
      });
      document.querySelectorAll('.page-btn[data-page]').forEach(btn => {
        btn.addEventListener('click', () => {
          state.currentPage = parseInt(btn.dataset.page);
          updateSessionsTable();
        });
      });
      const filterSelect = document.getElementById('projectFilter');
      if (filterSelect) {
        filterSelect.addEventListener('change', e => {
          state.filterProject = e.target.value;
          state.currentPage = 1;
          updateSessionsTable();
        });
      }
      const exportBtn = document.getElementById('exportCsvBtn');
      if (exportBtn) exportBtn.addEventListener('click', exportCSV);
      const toggleColsBtn = document.getElementById('toggleExtraColsBtn');
      if (toggleColsBtn) {
        toggleColsBtn.addEventListener('click', () => {
          state.showExtraCols = !state.showExtraCols;
          updateSessionsTable();
        });
      }
    }

    function renderPagination(totalPages) {
      if (totalPages <= 1) return '';

      const buttons = [];
      const maxVisible = 5;
      let start = Math.max(1, state.currentPage - 2);
      let end = Math.min(totalPages, start + maxVisible - 1);
      start = Math.max(1, end - maxVisible + 1);

      if (start > 1) {
        buttons.push(`<button class="page-btn" data-page="1">1</button>`);
        if (start > 2) buttons.push(`<span style="color:var(--text-muted);padding:0 4px;">...</span>`);
      }

      for (let i = start; i <= end; i++) {
        buttons.push(`<button class="page-btn ${i === state.currentPage ? 'active' : ''}" data-page="${i}">${i}</button>`);
      }

      if (end < totalPages) {
        if (end < totalPages - 1) buttons.push(`<span style="color:var(--text-muted);padding:0 4px;">...</span>`);
        buttons.push(`<button class="page-btn" data-page="${totalPages}">${totalPages}</button>`);
      }

      return `<div class="pagination">${buttons.join('')}</div>`;
    }

    function exportCSV() {
      const filtered = state.filterProject
        ? state.sessions.filter(s => s.project === state.filterProject)
        : state.sessions;
      const sorted = [...filtered].sort((a, b) => {
        let va = a[state.sortKey], vb = b[state.sortKey];
        if (typeof va === 'string') { va = va.toLowerCase(); vb = vb.toLowerCase(); }
        return state.sortDir === 'asc' ? (va > vb ? 1 : -1) : (va < vb ? 1 : -1);
      });

      const headers = ['Date', 'Time', 'Project', 'Input', 'Output', 'Cache Creation', 'Cache Read', 'Total', 'Est. Cost (USD)', 'Duration (min)', 'Model', 'First Prompt'];
      const rows = sorted.map(s => [
        s.date, s.time, s.project,
        s.input_tokens, s.output_tokens,
        s.cache_creation_input_tokens || 0, s.cache_read_input_tokens || 0,
        s.total_tokens, computeCost(s).toFixed(4),
        s.duration_minutes, s.model_str || '',
        (s.first_prompt || '').replace(/"/g, '""')
      ].map(v => `"${v}"`).join(','));

      const csv = '\uFEFF' + [headers.join(','), ...rows].join('\n');
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `TokenSense-${formatDateLocal(new Date())}.csv`;
      a.click();
      URL.revokeObjectURL(url);
    }

    // ═══════════════════════════════════════════════════════════
    // COSTS TAB
    // ═══════════════════════════════════════════════════════════

    function renderCostsHero(summary, sessions) {
      const totalEst = sessions.reduce((a, s) => a + computeCost(s), 0);
      const costReal = summary.cost_real || {};
      const agenticStats = summary.agentic_stats || {};
      const tdStats = summary.turn_duration_stats || {};
      const avgTurnMin = tdStats.avg_ms ? (tdStats.avg_ms / 60000).toFixed(1) : '--';

      return `
        <div class="hero">
          <div class="hero-content">
            <div class="hero-main">
              <div class="hero-label">${t('cost_overview')}</div>
              <div class="hero-value">${formatCost(totalEst)}</div>
              <div class="hero-unit">${t('cost_desc')} ${summary.total_sessions} ${t('sessions_suffix')}</div>
            </div>
            <div class="hero-breakdown">
              <div class="breakdown-item">
                <span class="breakdown-label">${t('real_recorded')}</span>
                <span class="breakdown-value">${costReal.total ? '$' + costReal.total : 'N/A'}</span>
              </div>
              <div class="breakdown-item">
                <span class="breakdown-label">${t('max_session')}</span>
                <span class="breakdown-value">${costReal.max_session ? '$' + costReal.max_session : '--'}</span>
              </div>
              <div class="breakdown-item">
                <span class="breakdown-label">${t('avg_turn')}</span>
                <span class="breakdown-value">${avgTurnMin}${t('mpm')}</span>
              </div>
              <div class="breakdown-item">
                <span class="breakdown-label">${t('agentic')}</span>
                <span class="breakdown-value">${agenticStats.avg_ratio ? (agenticStats.avg_ratio * 100).toFixed(0) + '%' : '--'}</span>
              </div>
            </div>
          </div>
          <div class="metrics-grid">
            <div class="metric-card cost-card">
              <div class="metric-icon">$</div>
              <div class="metric-label">${t('est_total_cost')}</div>
              <div class="metric-value">${formatCost(totalEst)}</div>
            </div>
            <div class="metric-card" style="--card-color: var(--accent-purple)">
              <div class="metric-icon">📝</div>
              <div class="metric-label">${t('real_recorded')}</div>
              <div class="metric-value" style="color:var(--accent-purple)">${costReal.total ? '$' + costReal.total : 'N/A'}</div>
              <div class="metric-sub">${costReal.session_count || 0} ${t('sessions_suffix')}</div>
            </div>
            <div class="metric-card">
              <div class="metric-icon">⏱</div>
              <div class="metric-label">${t('ai_compute_time')}</div>
              <div class="metric-value" style="color:var(--accent-cool)">${tdStats.total_hours || 0}${t('hr')}</div>
              <div class="metric-sub">${t('avg_per_turn')} ${avgTurnMin}${t('mpm')}</div>
            </div>
            <div class="metric-card">
              <div class="metric-icon">🤖</div>
              <div class="metric-label">${t('agentic_ratio')}</div>
              <div class="metric-value" style="color:var(--accent-lime)">${agenticStats.avg_ratio ? (agenticStats.avg_ratio * 100).toFixed(0) + '%' : '--'}</div>
              <div class="metric-sub">${agenticStats.highly_agentic_count || 0} ${t('sessions_90')}</div>
            </div>
          </div>
        </div>
      `;
    }

    function renderDailyCostTrend(daily) {
      const hasReal = daily.some(d => d.real_cost != null);
      return `
        <div class="section">
          <div class="section-header">
            <div class="section-title">${t('daily_cost_trend')}</div>
            <div style="display:flex;gap:6px;align-items:center">
              <span style="display:inline-flex;align-items:center;gap:4px;font-size:10px;color:var(--text-muted)"><span style="display:inline-block;width:12px;height:2px;background:#a78bfa;border-radius:1px"></span>${t('est_legend')}</span>
              ${hasReal ? `<span style="display:inline-flex;align-items:center;gap:4px;font-size:10px;color:var(--text-muted)"><span style="display:inline-block;width:12px;height:2px;background:#f97316;border-radius:1px"></span>${t('real_legend')}</span>` : ''}
            </div>
          </div>
          <div class="chart-container" style="height:180px">
            <canvas id="costTrendChart"></canvas>
          </div>
        </div>
      `;
    }

    function initCostTrendChart(daily) {
      const ctx = document.getElementById('costTrendChart');
      if (!ctx) return;
      if (state.charts.costTrend) state.charts.costTrend.destroy();

      const recentDaily = daily.slice(-60);
      const isLight = state.theme === 'light';
      const gridColor = isLight ? '#e5e3e0' : '#1e2730';
      const textColor = isLight ? '#8a8a8a' : '#4a5568';
      const tooltipBg = isLight ? '#ffffff' : '#151b23';

      const datasets = [{
        label: t('est_cost_label'),
        data: recentDaily.map(d => +(d.est_cost || 0).toFixed(3)),
        borderColor: '#a78bfa',
        backgroundColor: 'rgba(167,139,250,0.15)',
        borderWidth: 2,
        pointRadius: 2,
        fill: true,
        tension: 0.4,
      }];

      // 真实记录折线：只在有值的点显示，null 跳过
      const realData = recentDaily.map(d => d.real_cost != null ? +d.real_cost.toFixed(3) : null);
      if (realData.some(v => v !== null)) {
        datasets.push({
          label: t('real_recorded_label'),
          data: realData,
          borderColor: '#f97316',
          backgroundColor: 'rgba(249,115,22,0.08)',
          borderWidth: 2,
          pointRadius: d => d.raw !== null ? 4 : 0,
          pointBackgroundColor: '#f97316',
          fill: false,
          tension: 0,
          spanGaps: false,
        });
      }

      state.charts.costTrend = new Chart(ctx, {
        type: 'line',
        data: {
          labels: recentDaily.map(d => d.date.slice(5)),
          datasets,
        },
        options: {
          responsive: true, maintainAspectRatio: false,
          plugins: {
            legend: { labels: { color: isLight ? '#5a5a5a' : '#8899a6', font: { family: 'JetBrains Mono', size: 10 }, boxWidth: 10 } },
            tooltip: { backgroundColor: tooltipBg, titleColor: isLight ? '#1a1a1a' : '#f0f4f8', bodyColor: isLight ? '#5a5a5a' : '#8899a6', callbacks: { label: ctx => '$' + ctx.raw.toFixed(3) } }
          },
          scales: {
            x: { grid: { color: 'transparent' }, ticks: { color: textColor, font: { size: 9 }, maxTicksLimit: 12 } },
            y: { grid: { color: gridColor }, ticks: { color: textColor, font: { size: 9 }, callback: v => '$' + v } }
          }
        }
      });
    }

    function renderProjectCostBreakdown(projects, costReal) {
      if (!projects || projects.length === 0) return '';

      const isReal = state.projectCostView === 'real';
      const realByProject = {};
      (costReal.by_project || []).forEach(r => { realByProject[r.project] = r.cost; });

      const hasRealData = Object.keys(realByProject).length > 0;

      const values = projects.slice(0, 12).map(p =>
        isReal ? (realByProject[p.project] || 0) : (p.est_cost || 0)
      );
      const maxCost = Math.max(...values, 0.001);

      const items = projects.slice(0, 12).map((p, i) => {
        const cost = values[i];
        const width = (cost / maxCost * 100).toFixed(1);
        return `
          <div class="h-bar-item">
            <span class="h-bar-label" title="${escapeHtml(p.project)}">${escapeHtml(p.project)}</span>
            <div class="h-bar-track">
              <div class="h-bar-fill cost" style="width:${width}%"></div>
            </div>
            <span class="h-bar-count">${cost > 0 ? formatCost(cost) : '-'}</span>
          </div>
        `;
      }).join('');

      return `
        <div class="section">
          <div class="section-header">
            <div class="section-title">${t('project_cost')}</div>
            <div style="display:flex;gap:4px">
              <button class="export-btn" id="projCostToggleBtn"
                style="background:${!isReal ? 'var(--accent-purple)' : 'var(--bg-elevated)'}">${t('est_btn')}</button>
              <button class="export-btn" id="projCostToggleReal"
                style="background:${isReal ? 'var(--accent-gold)' : 'var(--bg-elevated)'};${!hasRealData ? 'opacity:0.4;cursor:default' : ''}">${t('real_btn')}</button>
            </div>
          </div>
          ${items}
        </div>
      `;
    }

    function renderResponseTimeAnalysis(tdStats) {
      if (!tdStats || !tdStats.count) return `
        <div class="section">
          <div class="section-header"><div class="section-title">${t('response_time')}</div></div>
          <div style="color:var(--text-muted);font-size:11px;text-align:center;padding:20px">${t('no_turn_data')}</div>
        </div>
      `;

      const fmtMs = ms => ms < 60000 ? (ms/1000).toFixed(0)+'s' : (ms/60000).toFixed(1)+'m';
      const b = tdStats.buckets || {};

      const slowest = (tdStats.slowest_sessions || []).map(s => `
        <div class="stat-row">
          <span class="stat-row-label">${escapeHtml(s.project)} · ${escapeHtml(s.date)}</span>
          <span class="stat-row-value hot">${fmtMs(s.avg_turn_ms)}</span>
        </div>
      `).join('');

      return `
        <div class="section">
          <div class="section-header">
            <div class="section-title">${t('response_time_analysis')}</div>
            <div class="section-badge">${tdStats.count} ${t('sessions_suffix')}</div>
          </div>
          <div class="two-col">
            <div class="two-col-left">
              <div class="stat-row">
                <span class="stat-row-label">${t('average')}</span>
                <span class="stat-row-value">${fmtMs(tdStats.avg_ms)}</span>
              </div>
              <div class="stat-row">
                <span class="stat-row-label">${t('median_p50')}</span>
                <span class="stat-row-value cool">${fmtMs(tdStats.p50_ms)}</span>
              </div>
              <div class="stat-row">
                <span class="stat-row-label">${t('p90')}</span>
                <span class="stat-row-value gold">${fmtMs(tdStats.p90_ms)}</span>
              </div>
              <div class="stat-row">
                <span class="stat-row-label">${t('maximum')}</span>
                <span class="stat-row-value hot">${fmtMs(tdStats.max_ms)}</span>
              </div>
              <div class="stat-row">
                <span class="stat-row-label">${t('total_ai_time')}</span>
                <span class="stat-row-value purple">${tdStats.total_hours}${t('hr')}</span>
              </div>
            </div>
            <div class="two-col-right">
              <div style="font-size:10px;color:var(--text-muted);margin-bottom:8px">${t('distribution')}</div>
              <div class="bucket-grid">
                <div class="bucket-card"><div class="bucket-num">${b.lt1m||0}</div><div class="bucket-label">${t('min_1')}</div></div>
                <div class="bucket-card"><div class="bucket-num">${b['1to5m']||0}</div><div class="bucket-label">${t('min_1_5')}</div></div>
                <div class="bucket-card"><div class="bucket-num">${b['5to15m']||0}</div><div class="bucket-label">${t('min_5_15')}</div></div>
                <div class="bucket-card"><div class="bucket-num" style="color:var(--accent-hot)">${b.gt15m||0}</div><div class="bucket-label">${t('min_15')}</div></div>
              </div>
              <div style="font-size:10px;color:var(--text-muted);margin:12px 0 6px">${t('slowest_sessions')}</div>
              ${slowest}
            </div>
          </div>
        </div>
      `;
    }

    function renderStabilityReport(stability, daily) {
      const topProjects = (stability.top_compact_projects || []).map(p =>
        `<div class="stat-row"><span class="stat-row-label">${escapeHtml(p.project)}</span><span class="stat-row-value">${p.count}x</span></div>`
      ).join('');

      // Mini daily error sparkline via simple bars
      const recentErrors = daily.slice(-14).map(d => d.api_errors || 0);
      const maxErr = Math.max(...recentErrors, 1);
      const sparkBars = recentErrors.map(e => {
        const h = Math.max(2, (e / maxErr * 24)).toFixed(0);
        return `<div style="width:6px;height:${h}px;background:${e>0?'var(--accent-hot)':'var(--bg-elevated)'};border-radius:2px;flex-shrink:0"></div>`;
      }).join('');

      return `
        <div class="section">
          <div class="section-header">
            <div class="section-title">${t('stability')}</div>
          </div>
          <div class="stability-grid">
            <div class="stability-card">
              <div class="stability-num warn">${stability.total_api_errors || 0}</div>
              <div class="stability-label">${t('api_errors')}</div>
            </div>
            <div class="stability-card">
              <div class="stability-num">${stability.max_retry_seen || 0}</div>
              <div class="stability-label">${t('max_retries')}</div>
            </div>
            <div class="stability-card">
              <div class="stability-num">${stability.total_compact_events || 0}</div>
              <div class="stability-label">${t('context_compacts')}</div>
            </div>
          </div>
          <div style="font-size:10px;color:var(--text-muted);margin-bottom:6px">${t('daily_error_trend')}</div>
          <div style="display:flex;align-items:flex-end;gap:2px;height:28px">${sparkBars}</div>
          ${topProjects ? `<div style="font-size:10px;color:var(--text-muted);margin:12px 0 6px">${t('top_compact_projects')}</div>${topProjects}` : ''}
        </div>
      `;
    }

    function renderCostEfficiencyTable(projects, costReal) {
      if (!projects || projects.length === 0) return '';
      const realByProject = {};
      (costReal.by_project || []).forEach(r => { realByProject[r.project] = r.cost; });

      const rows = projects.slice(0, 15).map(p => {
        const cost = p.est_cost || 0;
        const outTokens = p.output_tokens || 0;
        const efficiency = outTokens > 0 ? (cost / outTokens * 1000).toFixed(4) : '--';
        const realC = realByProject[p.project];
        return `
          <tr>
            <td class="bold">${escapeHtml(p.project)}</td>
            <td class="num">${p.sessions}</td>
            <td class="num">${formatNumber(p.total_tokens || 0)}</td>
            <td class="num cost-cell">${formatCost(cost)}</td>
            <td class="num ${realC ? 'cost-cell' : 'na'}">${realC ? '$'+realC : '—'}</td>
            <td class="num">${efficiency}</td>
          </tr>
        `;
      }).join('');

      return `
        <div class="section">
          <div class="section-header">
            <div class="section-title">${t('cost_efficiency')}</div>
            <div class="section-badge">${t('per_k_output')}</div>
          </div>
          <div style="overflow-x:auto">
            <table class="eff-table">
              <thead>
                <tr>
                  <th>${t('project')}</th>
                  <th class="num">${t('sessions')}</th>
                  <th class="num">${t('tokens')}</th>
                  <th class="num">${t('est_cost_col')}</th>
                  <th class="num">${t('real_cost_col')}</th>
                  <th class="num">${t('per_k_out')}</th>
                </tr>
              </thead>
              <tbody>${rows}</tbody>
            </table>
          </div>
        </div>
      `;
    }

    function initRespTimeChart() { /* placeholder – using HTML buckets instead */ }

    // ═══════════════════════════════════════════════════════════
    // BEHAVIOR TAB
    // ═══════════════════════════════════════════════════════════

    function renderBehaviorHero(summary) {
      const streak = summary.streak || {};
      const peakH = summary.peak_hour != null ? summary.peak_hour : '--';
      const peakLabel = peakH !== '--' ? `${String(peakH).padStart(2,'0')}:00` : '--';
      const permSummary = summary.permission_summary || [];
      const totalPerm = permSummary.reduce((a, p) => a + p.count, 0) || 1;
      const bypassPct = ((permSummary.find(p => p.mode === 'bypassPermissions')?.count || 0) / totalPerm * 100).toFixed(0);
      const thinkingStats = summary.thinking_stats || {};

      return `
        <div class="hero">
          <div class="hero-content">
            <div class="hero-main">
              <div class="hero-label">${t('usage_behavior')}</div>
              <div class="hero-value">${streak.active_days || 0} <span style="font-size:16px;font-weight:400">${t('days_label')}</span></div>
              <div class="hero-unit">${t('active_days')} · ${t('current_streak')} ${streak.current || 0}${t('days_label')} · ${t('max_streak_label')} ${streak.max || 0}${t('days_label')}</div>
            </div>
            <div class="hero-breakdown">
              <div class="breakdown-item">
                <span class="breakdown-label">${t('peak_hour')}</span>
                <span class="breakdown-value">${peakLabel}</span>
              </div>
              <div class="breakdown-item">
                <span class="breakdown-label">${t('auto_mode')}</span>
                <span class="breakdown-value">${bypassPct}%</span>
              </div>
              <div class="breakdown-item">
                <span class="breakdown-label">${t('thinking')}</span>
                <span class="breakdown-value">${thinkingStats.pct_sessions || 0}%</span>
              </div>
              <div class="breakdown-item">
                <span class="breakdown-label">${t('thinking_turns')}</span>
                <span class="breakdown-value">${formatNumber(thinkingStats.total_turns || 0)}</span>
              </div>
            </div>
          </div>
          <div class="metrics-grid">
            <div class="metric-card today">
              <div class="metric-icon">🔥</div>
              <div class="metric-label">${t('current_streak_label')}</div>
              <div class="metric-value">${streak.current || 0}${t('days_label')}</div>
            </div>
            <div class="metric-card">
              <div class="metric-icon">🏆</div>
              <div class="metric-label">${t('max_streak')}</div>
              <div class="metric-value">${streak.max || 0}${t('days_label')}</div>
            </div>
            <div class="metric-card">
              <div class="metric-icon">🕐</div>
              <div class="metric-label">${t('peak_hour')}</div>
              <div class="metric-value" style="color:var(--accent-cool)">${peakLabel}</div>
            </div>
            <div class="metric-card">
              <div class="metric-icon">🧠</div>
              <div class="metric-label">${t('thinking_sessions')}</div>
              <div class="metric-value" style="color:var(--accent-purple)">${thinkingStats.sessions_with_thinking || 0}</div>
              <div class="metric-sub">${thinkingStats.pct_sessions || 0}% ${t('of_all')}</div>
            </div>
          </div>
        </div>
      `;
    }

    function renderHourWeekdayHeatmap(matrix) {
      if (!matrix || matrix.length === 0) return '';
      const days = ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'];
      const maxVal = Math.max(...matrix.flat(), 1);

      function hwLevel(v) {
        if (v === 0) return 0;
        const r = v / maxVal;
        if (r < 0.1) return 1;
        if (r < 0.25) return 2;
        if (r < 0.5) return 3;
        if (r < 0.8) return 4;
        return 5;
      }

      const hourHeaders = Array.from({length:24}, (_,h) =>
        `<td class="hw-label">${h % 3 === 0 ? String(h).padStart(2,'0') : ''}</td>`
      ).join('');

      const rows = matrix.map((row, w) => {
        const cells = row.map((v, h) =>
          `<td><div class="hw-cell" data-level="${hwLevel(v)}" title="${days[w]} ${String(h).padStart(2,'0')}:00 — ${v} ${t('sessions_suffix')}"></div></td>`
        ).join('');
        return `<tr><td class="hw-row-label">${days[w]}</td>${cells}</tr>`;
      }).join('');

      return `
        <div class="section">
          <div class="section-header">
            <div class="section-title">${t('hour_weekday_heatmap')}</div>
            <div class="section-badge">${t('session_starts')}</div>
          </div>
          <div class="hw-heatmap">
            <table class="hw-table">
              <thead><tr><td></td>${hourHeaders}</tr></thead>
              <tbody>${rows}</tbody>
            </table>
          </div>
        </div>
      `;
    }

    function renderWorkingRhythm(weekday, hourly) {
      if (!weekday || weekday.length === 0) return '';
      const dayNames = ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'];
      const maxW = Math.max(...weekday, 1);

      const wBars = weekday.map((c, i) => {
        const w = (c / maxW * 100).toFixed(1);
        return `
          <div class="h-bar-item">
            <span class="h-bar-label" style="min-width:30px">${dayNames[i]}</span>
            <div class="h-bar-track"><div class="h-bar-fill cool" style="width:${w}%"></div></div>
            <span class="h-bar-count">${c}</span>
          </div>
        `;
      }).join('');

      // Time-of-day segments
      const morning   = hourly.slice(6, 12).reduce((a,b)=>a+b,0);
      const afternoon = hourly.slice(12,18).reduce((a,b)=>a+b,0);
      const evening   = hourly.slice(18,22).reduce((a,b)=>a+b,0);
      const night     = hourly.slice(22,24).reduce((a,b)=>a+b,0) + hourly.slice(0,6).reduce((a,b)=>a+b,0);
      const totalSeg  = morning + afternoon + evening + night || 1;

      const seg = [
        { label: t('morning'), v: morning },
        { label: t('afternoon'), v: afternoon },
        { label: t('evening'), v: evening },
        { label: t('night'), v: night },
      ].map(s => `
        <div class="stat-row">
          <span class="stat-row-label">${s.label}</span>
          <span class="stat-row-value">${s.v} <span style="color:var(--text-muted);font-size:10px">(${(s.v/totalSeg*100).toFixed(0)}%)</span></span>
        </div>
      `).join('');

      return `
        <div class="section">
          <div class="section-header">
            <div class="section-title">${t('working_rhythm')}</div>
          </div>
          ${wBars}
          <div style="margin-top:16px;border-top:1px solid var(--border);padding-top:12px">
            <div style="font-size:10px;color:var(--text-muted);margin-bottom:8px">${t('time_of_day')}</div>
            ${seg}
          </div>
        </div>
      `;
    }

    function renderAutonomyTrend() {
      return `
        <div class="section">
          <div class="section-header">
            <div class="section-title">${t('autonomy_trend')}</div>
            <div class="section-badge">${t('perm_mode_weekly')}</div>
          </div>
          <div class="chart-container" style="height:160px">
            <canvas id="autonomyChart"></canvas>
          </div>
        </div>
      `;
    }

    function initAutonomyChart(trend) {
      const ctx = document.getElementById('autonomyChart');
      if (!ctx || !trend.length) return;
      if (state.charts.autonomy) state.charts.autonomy.destroy();

      const isLight = state.theme === 'light';
      const labels = trend.map(t => t.week.slice(5)); // "W03"
      state.charts.autonomy = new Chart(ctx, {
        type: 'bar',
        data: {
          labels,
          datasets: [
            { label: t('bypass_legend'), data: trend.map(t => t.bypassPermissions), backgroundColor: 'rgba(255,107,107,0.8)', stack: 'a' },
            { label: t('acceptedits_legend'), data: trend.map(t => t.acceptEdits), backgroundColor: 'rgba(78,205,196,0.8)', stack: 'a' },
            { label: t('default_legend'), data: trend.map(t => t.default), backgroundColor: 'rgba(74,85,104,0.6)', stack: 'a' },
          ]
        },
        options: {
          responsive: true, maintainAspectRatio: false,
          plugins: {
            legend: { position: 'top', align: 'end', labels: { color: isLight ? '#5a5a5a' : '#8899a6', font: { family: 'JetBrains Mono', size: 9 }, boxWidth: 10 } },
            tooltip: { mode: 'index', intersect: false }
          },
          scales: {
            x: { stacked: true, grid: { color: 'transparent' }, ticks: { color: isLight ? '#8a8a8a' : '#4a5568', font: { size: 9 } } },
            y: { stacked: true, grid: { color: isLight ? '#e5e3e0' : '#1e2730' }, ticks: { color: isLight ? '#8a8a8a' : '#4a5568', font: { size: 9 } } }
          }
        }
      });
    }

    function renderThinkingAnalysis(thinkingStats) {
      if (!thinkingStats || !thinkingStats.total_turns) return '';

      const byProject = (thinkingStats.by_project || []).slice(0, 8);
      const maxTurns = Math.max(...byProject.map(p => p.turns), 1);

      const bars = byProject.map(p => {
        const w = (p.turns / maxTurns * 100).toFixed(1);
        return `
          <div class="h-bar-item">
            <span class="h-bar-label" title="${escapeHtml(p.project)}">${escapeHtml(p.project)}</span>
            <div class="h-bar-track"><div class="h-bar-fill" style="width:${w}%;background:linear-gradient(90deg,var(--accent-purple),#e879f9)"></div></div>
            <span class="h-bar-count">${formatNumber(p.turns)}</span>
          </div>
        `;
      }).join('');

      const b = thinkingStats.buckets || {};
      return `
        <div class="section">
          <div class="section-header">
            <div class="section-title">${t('thinking_analysis')}</div>
            <div class="section-badge">${thinkingStats.sessions_with_thinking} ${t('sessions_suffix')} · ${thinkingStats.pct_sessions}%</div>
          </div>
          <div class="two-col">
            <div class="two-col-left">
              <div style="font-size:10px;color:var(--text-muted);margin-bottom:8px">${t('thinking_turns_by_project')}</div>
              ${bars}
            </div>
            <div class="two-col-right">
              <div style="font-size:10px;color:var(--text-muted);margin-bottom:8px">${t('depth_distribution')}</div>
              <div class="stat-row"><span class="stat-row-label">${t('turns_1_10')}</span><span class="stat-row-value">${b['1to10']||0}</span></div>
              <div class="stat-row"><span class="stat-row-label">${t('turns_11_50')}</span><span class="stat-row-value">${b['11to50']||0}</span></div>
              <div class="stat-row"><span class="stat-row-label">${t('turns_51_200')}</span><span class="stat-row-value gold">${b['51to200']||0}</span></div>
              <div class="stat-row"><span class="stat-row-label">${t('turns_200')}</span><span class="stat-row-value hot">${b['gt200']||0}</span></div>
              <div style="margin-top:12px">
                <div class="stat-row"><span class="stat-row-label">${t('total_turns')}</span><span class="stat-row-value purple">${formatNumber(thinkingStats.total_turns||0)}</span></div>
              </div>
            </div>
          </div>
        </div>
      `;
    }

    function initThinkingChart() { /* using HTML bars */ }

    function renderVersionTimeline(versions) {
      if (!versions || versions.length === 0) return '';

      // Show only last 8 versions to avoid overflow
      const recent = versions.slice(-8);
      const nodes = recent.map((v, i) => `
        ${i > 0 ? '<span class="version-arrow">→</span>' : ''}
        <div class="version-node">
          <div class="version-badge">${v.version}</div>
          <div class="version-date">${v.first_seen.slice(5)}</div>
        </div>
      `).join('');

      return `
        <div class="section">
          <div class="section-header">
            <div class="section-title">${t('version_timeline')}</div>
            <div class="section-badge">${versions.length} ${t('versions_badge')}</div>
          </div>
          <div class="version-timeline">${nodes}</div>
        </div>
      `;
    }

    function renderStreakCalendar(daily, streak) {
      if (!daily || daily.length === 0) return '';

      const dateMap = {};
      daily.forEach(d => { dateMap[d.date] = d.total_tokens; });
      const maxTok = Math.max(...Object.values(dateMap), 1);

      // Last 90 days
      const cells = [];
      for (let i = 89; i >= 0; i--) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        const key = d.toISOString().slice(0, 10);
        const tok = dateMap[key] || 0;
        let lvl = 0;
        if (tok > 0) {
          const r = tok / maxTok;
          lvl = r < 0.15 ? 1 : r < 0.35 ? 2 : r < 0.65 ? 3 : 4;
        }
        cells.push(`<div class="streak-cell" data-level="${lvl}" title="${key}${tok ? ': ' + formatNumber(tok) + ' ' + t('tokens_suffix') : ': ' + t('no_activity')}"></div>`);
      }

      return `
        <div class="section">
          <div class="section-header">
            <div class="section-title">${t('streak_calendar')}</div>
            <div class="section-badge">${t('days_90')}</div>
          </div>
          <div style="display:flex;gap:20px;margin-bottom:12px">
            <div><span style="font-size:22px;font-weight:800;font-family:'Outfit',sans-serif;color:var(--accent-hot)">${streak.current||0}</span><span style="font-size:10px;color:var(--text-muted);margin-left:4px">${t('current_streak')}</span></div>
            <div><span style="font-size:22px;font-weight:800;font-family:'Outfit',sans-serif;color:var(--accent-lime)">${streak.max||0}</span><span style="font-size:10px;color:var(--text-muted);margin-left:4px">${t('longest_streak')}</span></div>
          </div>
          <div class="streak-grid">${cells.join('')}</div>
        </div>
      `;
    }

    // ═══════════════════════════════════════════════════════════
    // TOOLS TAB ADDITIONS
    // ═══════════════════════════════════════════════════════════

    function renderMcpEcosystem(mcpSummary) {
      if (!mcpSummary || mcpSummary.length === 0) return '';
      const maxCount = Math.max(...mcpSummary.map(m => m.count), 1);

      const items = mcpSummary.map(m => {
        const w = (m.count / maxCount * 100).toFixed(1);
        return `
          <div class="h-bar-item">
            <span class="h-bar-label" title="${m.server}">${m.server}</span>
            <div class="h-bar-track"><div class="h-bar-fill mcp" style="width:${w}%"></div></div>
            <span class="h-bar-count">${m.count}</span>
          </div>
        `;
      }).join('');

      return `
        <div class="section">
          <div class="section-header">
            <div class="section-title">${t('mcp_ecosystem')}</div>
            <div class="section-badge">${mcpSummary.length} ${t('servers_badge')}</div>
          </div>
          ${items}
        </div>
      `;
    }

    function renderSkillEcosystem(skillSummary) {
      if (!skillSummary || !skillSummary.total_calls) return '';
      const ranking = skillSummary.ranking || [];
      const byProject = skillSummary.by_project || [];
      const maxCount = Math.max(...ranking.map(r => r.count), 1);

      const rankBars = ranking.slice(0, 12).map(r => {
        const w = (r.count / maxCount * 100).toFixed(1);
        const skillName = r.skill || r.name || '';
        return `
          <div class="h-bar-item">
            <span class="h-bar-label" title="${escapeHtml(skillName)}">${escapeHtml(skillName)}</span>
            <div class="h-bar-track"><div class="h-bar-fill skill" style="width:${w}%"></div></div>
            <span class="h-bar-count">${r.count}</span>
          </div>
        `;
      }).join('');

      const projList = byProject.slice(0, 6).map(p => {
        const tags = (p.skills || []).map(s => {
          const sn = s.skill || s.name || '';
          return `<span class="skill-tag">${escapeHtml(sn)} <span class="skill-cnt">×${s.count}</span></span>`;
        }).join('');
        return `
          <div style="margin-bottom:10px">
            <div style="font-size:10px;font-weight:700;color:var(--text-secondary);margin-bottom:4px">${escapeHtml(p.project)}</div>
            <div>${tags}</div>
          </div>
        `;
      }).join('');

      return `
        <div class="section">
          <div class="section-header">
            <div class="section-title">${t('skill_ecosystem')}</div>
            <div class="section-badge">${skillSummary.unique_skills} ${t('skills_calls')} · ${skillSummary.total_calls} ${t('calls')}</div>
          </div>
          <div class="two-col">
            <div class="two-col-left">
              <div style="font-size:10px;color:var(--text-muted);margin-bottom:8px">${t('skill_ranking')}</div>
              ${rankBars}
            </div>
            <div class="two-col-right">
              <div style="font-size:10px;color:var(--text-muted);margin-bottom:8px">${t('skills_by_project')}</div>
              ${projList}
            </div>
          </div>
        </div>
      `;
    }

    function attachEvents() {
      // Tab navigation
      document.querySelectorAll('.tab-btn[data-tab]').forEach(btn => {
        btn.addEventListener('click', () => {
          state.activeTab = btn.dataset.tab;
          render();
        });
      });

      // Sessions table events (sort, filter, page, export, toggleCols)
      _attachTableEvents();

      // Project Cost view toggle
      const projCostEst = document.getElementById('projCostToggleBtn');
      if (projCostEst) {
        projCostEst.addEventListener('click', () => {
          state.projectCostView = 'est';
          render();
        });
      }
      const projCostReal = document.getElementById('projCostToggleReal');
      if (projCostReal) {
        projCostReal.addEventListener('click', () => {
          state.projectCostView = 'real';
          render();
        });
      }

      // Projects
      document.querySelectorAll('.project-item').forEach(item => {
        item.addEventListener('click', () => {
          state.filterProject = item.dataset.project;
          state.currentPage = 1;
          render();
        });
      });

      // Heatmap view tabs (7D / 30D / 365D)
      document.querySelectorAll('.heatmap-btn[data-view]').forEach(btn => {
        btn.addEventListener('click', () => {
          state.heatmapView = btn.dataset.view;
          render();
        });
      });

      // Chart date range picker
      const dateStart = document.getElementById('dateStart');
      const dateEnd = document.getElementById('dateEnd');
      if (dateStart) {
        dateStart.addEventListener('change', (e) => {
          state.dateRangeStart = e.target.value;
          render();
        });
      }
      if (dateEnd) {
        dateEnd.addEventListener('change', (e) => {
          state.dateRangeEnd = e.target.value;
          render();
        });
      }

      // Chart mode toggle
      document.querySelectorAll('.chart-mode-btn[data-mode]').forEach(btn => {
        btn.addEventListener('click', () => {
          const newMode = btn.dataset.mode;

          // Set default date range based on mode
          if (newMode === 'daily') {
            // Daily: last 7 days
            const today = new Date();
            const weekAgo = new Date(today);
            weekAgo.setDate(weekAgo.getDate() - 6);
            state.dateRangeEnd = today.toISOString().slice(0, 10);
            state.dateRangeStart = weekAgo.toISOString().slice(0, 10);
          } else if (newMode === 'hourly') {
            // Hourly: today only
            const today = new Date().toISOString().slice(0, 10);
            state.dateRangeStart = today;
            state.dateRangeEnd = today;
          }

          state.chartMode = newMode;
          render();
        });
      });

      // Heatmap tooltips
      document.querySelectorAll('.heatmap-cell[data-date]').forEach(cell => {
        cell.addEventListener('mouseenter', () => {
          const date = cell.dataset.date;
          const tokens = parseInt(cell.dataset.tokens);
          const d = new Date(date + 'T00:00:00');  // 本地零点，避免 UTC 解析偏差一天
          const dayName = DAYS[d.getDay()];

          document.querySelectorAll('.tooltip').forEach(t => t.remove());

          const tooltip = document.createElement('div');
          tooltip.className = 'tooltip';
          tooltip.innerHTML = `
            <div class="tooltip-date">${date} (${dayName})</div>
            <div class="tooltip-value">${formatTokens(tokens)} tokens</div>
          `;
          document.body.appendChild(tooltip);

          const rect = cell.getBoundingClientRect();
          tooltip.style.left = rect.left + 'px';
          tooltip.style.top = (rect.top - tooltip.offsetHeight - 10) + 'px';
        });

        cell.addEventListener('mouseleave', () => {
          document.querySelectorAll('.tooltip').forEach(t => t.remove());
        });
      });
    }

    function startAutoRefresh() {
      // Skip auto-refresh for static reports
      if (window.IS_STATIC_REPORT) return;

      const el = document.getElementById('countdown');
      setInterval(() => {
        state.countdown--;
        el.textContent = state.countdown;
        if (state.countdown <= 0) {
          state.countdown = REFRESH_INTERVAL;
          refreshData();
        }
      }, 1000);
    }

    function showError(msg) {
      document.getElementById('mainContent').innerHTML = `
        <div class="error">
          <strong>${msg}</strong>
          <br><br><small>${t('error_make_sure')}</small>
        </div>
      `;
    }

    function init() {
      initTheme();
      initLang();
      refreshData();
      startAutoRefresh();
    }

    init();
