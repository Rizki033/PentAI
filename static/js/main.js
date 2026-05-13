'use strict';

// ── MODULES ──────────────────────────────────────────────────────────────────
const MODULES = {
  subdomain: {
    title: 'SUBDOMAIN ENUMERATION', badge: 'PASSIVE + ACTIVE + BRUTEFORCE', hint: 'output/Subs.txt',
    tools: [
      { id: 'subfinder', name: 'subfinder', desc: 'passive cert+source' },
      { id: 'amass', name: 'amass', desc: 'OSINT graph enum' },
      { id: 'assetfinder', name: 'assetfinder', desc: 'fast passive' },
      { id: 'findomain', name: 'findomain', desc: 'multi-API' },
      { id: 'chaos', name: 'chaos', desc: 'ProjectDiscovery DB' },
      { id: 'puredns', name: 'puredns', desc: 'DNS bruteforce' },
      { id: 'dnsx', name: 'dnsx', desc: 'DNS resolver' },
      { id: 'merge+sort', name: 'merge+sort', desc: 'dedupe → Subs.txt' },
    ]
  },
  alive: {
    title: 'ALIVE HOST DETECTION', badge: 'HTTPX — HTTP PROBE', hint: 'output/Alive.txt',
    tools: [
      { id: 'httpx', name: 'httpx', desc: 'full probe + title' },
      { id: 'httpx-200', name: 'httpx 200', desc: '200-only filter' },
    ]
  },
  url: {
    title: 'URL DISCOVERY', badge: 'WAYBACK + GAU + KATANA + MORE', hint: 'output/URLs.txt',
    tools: [
      { id: 'waybackurls', name: 'waybackurls', desc: 'Wayback Machine' },
      { id: 'gau', name: 'gau', desc: 'OTX + WayBack' },
      { id: 'katana', name: 'katana', desc: 'JS-aware crawler' },
      { id: 'hakrawler', name: 'hakrawler', desc: 'Go web crawler' },
      { id: 'gospider', name: 'gospider', desc: 'robots+sitemap' },
      { id: 'paramspider', name: 'paramspider', desc: 'param URL spider' },
      { id: 'merge+filter', name: 'merge+filter', desc: 'dedupe → URLs.txt' },
    ]
  },
  dir: {
    title: 'DIRECTORY FUZZING', badge: 'FFUF + FEROX + DIRSEARCH', hint: 'output/dirs_all.txt',
    tools: [
      { id: 'ffuf', name: 'ffuf', desc: 'fast web fuzzer' },
      { id: 'feroxbuster', name: 'feroxbuster', desc: 'recursive browse' },
      { id: 'dirsearch', name: 'dirsearch', desc: 'advanced scanner' },
      { id: 'gobuster', name: 'gobuster', desc: 'classic Go fuzzer' },
    ]
  },
  ports: {
    title: 'PORT DISCOVERY', badge: 'NAABU + NMAP + MASSCAN', hint: 'output/ports.txt',
    tools: [
      { id: 'naabu', name: 'naabu', desc: 'fast Go scanner' },
      { id: 'nmap', name: 'nmap', desc: 'service detection' },
      { id: 'masscan', name: 'masscan', desc: 'ultra fast scan' },
    ]
  },
  params: {
    title: 'PARAMETER DISCOVERY', badge: 'ARJUN + X8 + FFUF', hint: 'output/params_found.txt',
    tools: [
      { id: 'arjun', name: 'arjun', desc: 'GET+POST discovery' },
      { id: 'x8', name: 'x8', desc: 'hidden param brute' },
      { id: 'ffuf-params', name: 'ffuf params', desc: 'FUZZ param names' },
    ]
  },
  secrets: {
    title: 'JS / SECRET HUNTING', badge: 'TRUFFLEHOG + GITLEAKS + BFAC', hint: 'output/secrets/',
    tools: [
      { id: 'trufflehog', name: 'trufflehog', desc: 'verified secrets' },
      { id: 'gitleaks', name: 'gitleaks', desc: 'git secret scan' },
      { id: 'wayback-files', name: 'wayback files', desc: 'sensitive file hunt' },
      { id: 'bfac', name: 'bfac', desc: 'backup artifacts' },
    ]
  },
  xss: {
    title: 'XSS TESTING', badge: 'GF → KXSS → DALFOX', hint: 'output/xss_vulns.txt',
    tools: [
      { id: 'filter-params', name: 'gf xss', desc: 'filter candidates' },
      { id: 'kxss', name: 'kxss', desc: 'reflection check' },
      { id: 'dalfox', name: 'dalfox', desc: 'fast XSS scanner' },
    ]
  },
  sqli: {
    title: 'SQL INJECTION', badge: 'GF → GHAURI → SQLMAP', hint: 'output/sqli_results.txt',
    tools: [
      { id: 'filter-params', name: 'gf sqli', desc: 'filter candidates' },
      { id: 'ghauri', name: 'ghauri', desc: 'advanced detector' },
      { id: 'sqlmap', name: 'sqlmap', desc: 'classic SQLi tool' },
    ]
  },
  ssti: {
    title: 'SSTI TESTING', badge: 'GF → NUCLEI → MANUAL', hint: 'output/ssti_results.txt',
    tools: [
      { id: 'filter-params', name: 'gf ssti', desc: 'filter candidates' },
      { id: 'nuclei-ssti', name: 'nuclei ssti', desc: 'template scan' },
      { id: 'manual-check', name: '{{7*7}} check', desc: 'manual confirm' },
    ]
  },
  lfi: {
    title: 'LFI / PATH TRAVERSAL', badge: 'GF → NUCLEI → CONFIRM', hint: 'output/lfi_results.txt',
    tools: [
      { id: 'filter-params', name: 'gf lfi', desc: 'filter candidates' },
      { id: 'nuclei-lfi', name: 'nuclei lfi', desc: 'template scan' },
      { id: 'path-traversal', name: 'path traversal', desc: '../etc/passwd' },
    ]
  },
  ssrf: {
    title: 'SSRF TESTING', badge: 'GF → NUCLEI', hint: 'output/ssrf_results.txt',
    tools: [
      { id: 'filter-params', name: 'gf ssrf', desc: 'filter candidates' },
      { id: 'nuclei-ssrf', name: 'nuclei ssrf', desc: 'template scan' },
    ]
  },
  cors: {
    title: 'CORS TESTING', badge: 'NUCLEI + CORSY + MANUAL', hint: 'output/cors_results.txt',
    tools: [
      { id: 'nuclei-cors', name: 'nuclei cors', desc: 'template scan' },
      { id: 'corsy', name: 'corsy', desc: 'CORS misconfig' },
      { id: 'manual', name: 'manual curl', desc: 'evil.com origin' },
    ]
  },
  csrf: {
    title: 'CSRF TESTING', badge: 'NUCLEI + FORM FINDER', hint: 'output/csrf_results.txt',
    tools: [
      { id: 'nuclei-csrf', name: 'nuclei csrf', desc: 'template scan' },
      { id: 'form-finder', name: 'form finder', desc: 'find POST forms' },
    ]
  },
  redirect: {
    title: 'OPEN REDIRECT', badge: 'GF → OPENREDIREX → MANUAL', hint: 'output/redirect_vulns.txt',
    tools: [
      { id: 'filter-params', name: 'gf redirect', desc: 'filter candidates' },
      { id: 'openredirex', name: 'openredirex', desc: 'async scanner' },
      { id: 'manual', name: 'manual curl', desc: 'evil.com confirm' },
    ]
  },
  rce: {
    title: 'RCE / CMD INJECTION', badge: 'NUCLEI + GF + MANUAL', hint: 'output/rce_results.txt',
    tools: [
      { id: 'nuclei-rce', name: 'nuclei rce', desc: 'CVE+template scan' },
      { id: 'cmd-inject', name: 'cmd inject', desc: 'gf rce → id check' },
    ]
  },
  nuclei: {
    title: 'NUCLEI FULL SCAN', badge: 'CVE + EXPOSURES + MISCONFIG', hint: 'output/nuclei_all.txt',
    tools: [
      { id: 'exposures', name: 'exposures', desc: 'leaked files+panels' },
      { id: 'cves', name: 'CVE scan', desc: 'known CVE checks' },
      { id: 'misconfig', name: 'misconfig', desc: 'security misconfigs' },
      { id: 'full-http', name: 'full scan', desc: 'all HTTP templates' },
    ]
  },
  agent: { title: 'AI AGENT — LOCAL OLLAMA', badge: 'FREE · OFFLINE · NO API KEY', hint: 'ollama local', tools: [] },
  outputs: { title: 'OUTPUT FILES', badge: 'SCAN RESULTS', hint: 'output/', tools: [] },
};

// ── STATE ─────────────────────────────────────────────────────────────────────
const S = {
  tab: 'subdomain', tool: null, opts: {}, running: false, tools: {},
  model: 'llama3.2', host: 'http://localhost:11434', ollamaOk: false
};

// ── TOOL OPTIONS DEFINITIONS ──────────────────────────────────────────────────
// Each entry is { key, label, type:'toggle'|'number'|'select', default, values? }
const TOOL_OPTS = {
  // subdomain
  'subdomain:subfinder': [{ key: 'all', label: 'All Sources', type: 'toggle', default: true }],
  'subdomain:puredns': [{ key: 'wildcard', label: 'Wildcard Filter', type: 'toggle', default: true }],
  // alive
  'alive:httpx': [{ key: 'threads', label: 'Threads', type: 'select', default: '50', values: ['10', '25', '50', '100'] },
  { key: 'tech', label: 'Show Tech', type: 'toggle', default: false }],
  // url
  'url:katana': [{ key: 'depth', label: 'Depth', type: 'select', default: '3', values: ['2', '3', '4', '5'] },
  { key: 'js', label: 'JS Crawl', type: 'toggle', default: true }],
  'url:gau': [{ key: 'threads', label: 'Threads', type: 'select', default: '20', values: ['5', '10', '20', '50'] }],
  // dir
  'dir:ffuf': [{ key: 'threads', label: 'Threads', type: 'select', default: '50', values: ['25', '50', '100', '150'] },
  { key: 'ext', label: '+Extensions', type: 'toggle', default: false }],
  'dir:feroxbuster': [{ key: 'depth', label: 'Depth', type: 'select', default: '2', values: ['1', '2', '3', '4'] },
  { key: 'silent', label: 'Silent', type: 'toggle', default: true }],
  // ports
  'ports:naabu': [{ key: 'rate', label: 'Rate', type: 'select', default: '1000', values: ['500', '1000', '2000', '5000'] },
  { key: 'topports', label: 'Top Ports', type: 'select', default: '1000', values: ['100', '1000', '65535'] }],
  'ports:nmap': [{ key: 'timing', label: 'Timing', type: 'select', default: 'T4', values: ['T1', 'T2', 'T3', 'T4', 'T5'] },
  { key: 'scripts', label: 'Script Scan', type: 'toggle', default: false }],
  // vuln scanners
  'nuclei:cves': [{ key: 'severity', label: 'Severity', type: 'select', default: 'critical,high', values: ['critical', 'critical,high', 'critical,high,medium'] }],
  'nuclei:full-http': [{ key: 'rate', label: 'Rate Limit', type: 'select', default: '30', values: ['10', '30', '60', '100'] }],
  'xss:dalfox': [{ key: 'silence', label: 'Silent', type: 'toggle', default: true },
  { key: 'blind', label: 'Blind XSS', type: 'toggle', default: false }],
  'sqli:sqlmap': [{ key: 'level', label: 'Level', type: 'select', default: '1', values: ['1', '2', '3'] },
  { key: 'risk', label: 'Risk', type: 'select', default: '1', values: ['1', '2', '3'] }],
};

// ── INIT ──────────────────────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('.nav-item').forEach(el =>
    el.addEventListener('click', () => setTab(el.dataset.tab))
  );
  document.getElementById('target').addEventListener('input', updatePreview);

  // Restore saved settings
  S.model = localStorage.getItem('ollama_model') || 'llama3.2';
  S.host = localStorage.getItem('ollama_host') || 'http://localhost:11434';
  document.getElementById('model-select').value = S.model;
  document.getElementById('ollama-host').value = S.host;

  // ── Keyboard shortcuts ──────────────────────────────────────────────────────
  document.addEventListener('keydown', e => {
    // Enter on target input → run scan
    if (e.key === 'Enter' && document.activeElement === document.getElementById('target')) {
      e.preventDefault(); runScan(); return;
    }
    if (e.ctrlKey || e.metaKey) {
      if (e.key === 'l') { e.preventDefault(); clearOutput(); return; }   // Ctrl+L → clear
      if (e.key === 'Enter') { e.preventDefault(); runScan(); return; }   // Ctrl+Enter → run
    }
    if (e.key === 'Escape' && S.running) stopScan();                       // Esc → stop
  });

  fetchTools();
  renderTab();
  checkOllama();
  setInterval(refreshStats, 6000);
  setInterval(checkOllama, 15000);
});

// ── SETTINGS ──────────────────────────────────────────────────────────────────
function toggleSettings() {
  const p = document.getElementById('settings-panel');
  p.style.display = p.style.display === 'none' ? 'block' : 'none';
}

function saveSettings() {
  S.model = document.getElementById('model-select').value;
  S.host = document.getElementById('ollama-host').value.trim();
  localStorage.setItem('ollama_model', S.model);
  localStorage.setItem('ollama_host', S.host);
  toggleSettings();
  addLine('info', `Ollama settings saved — model: ${S.model} | host: ${S.host}`);
  checkOllama();
}

async function testOllama() {
  const tr = document.getElementById('test-result');
  tr.style.color = 'var(--amber)';
  tr.textContent = 'Testing...';
  try {
    const r = await fetch('/api/agent/test', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: document.getElementById('model-select').value,
        host: document.getElementById('ollama-host').value
      })
    });
    const d = await r.json();
    if (d.ok) {
      tr.style.color = 'var(--green)'; tr.textContent = 'ONLINE — ' + d.msg;
    } else {
      tr.style.color = 'var(--red)'; tr.textContent = 'ERR: ' + d.msg;
    }
  } catch (e) {
    tr.style.color = 'var(--red)'; tr.textContent = 'ERR: ' + e.message;
  }
}

function pullModel() {
  const m = document.getElementById('model-select').value;
  addLine('info', `Run in terminal: ollama pull ${m}`);
  toggleSettings();
}

async function checkOllama() {
  try {
    const r = await fetch(`/api/models?host=${encodeURIComponent(S.host)}`);
    const d = await r.json();
    S.ollamaOk = d.running;
    const dot = document.getElementById('o-dot');
    const label = document.getElementById('o-label');
    if (d.reachable && d.running) {
      dot.className = 'o-dot online';
      label.textContent = `OLLAMA · ${d.models.length} MODEL${d.models.length !== 1 ? 'S' : ''}`;
      label.style.color = 'var(--green)';
    } else if (d.reachable && !d.running) {
      // Ollama reachable but no models
      dot.className = 'o-dot offline';
      label.textContent = 'NO MODEL';
      label.style.color = 'var(--amber)';
      S.ollamaOk = false;
    } else {
      dot.className = 'o-dot offline';
      label.textContent = 'OLLAMA OFFLINE';
      label.style.color = 'var(--red)';
      S.ollamaOk = false;
    }
  } catch (e) {
    document.getElementById('o-dot').className = 'o-dot offline';
    document.getElementById('o-label').textContent = 'OLLAMA OFFLINE';
    document.getElementById('o-label').style.color = 'var(--red)';
    S.ollamaOk = false;
  }
}

// ── TOOLS / STATS ─────────────────────────────────────────────────────────────
async function fetchTools() {
  try {
    const r = await fetch('/api/tools');
    S.tools = await r.json();
    const av = Object.values(S.tools).filter(Boolean).length;
    renderTab();
  } catch (e) { }
}

async function refreshStats() {
  try {
    const d = await (await fetch('/api/stats')).json();
    document.getElementById('s-subs').textContent = fmt(d.subdomains || 0);
    document.getElementById('s-alive').textContent = fmt(d.alive || 0);
    document.getElementById('s-urls').textContent = fmt(d.urls || 0);
    document.getElementById('s-vulns').textContent = fmt((d.xss_vulns || 0) + (d.sqli || 0) + (d.nuclei || 0));
  } catch (e) { }
}

function fmt(n) { return n >= 1000 ? (n / 1000).toFixed(1) + 'k' : n; }

// ── TABS ──────────────────────────────────────────────────────────────────────
function setTab(tab) {
  S.tab = tab; S.tool = null; S.opts = {};
  document.querySelectorAll('.nav-item').forEach(el =>
    el.classList.toggle('active', el.dataset.tab === tab));
  renderTab();
}

function renderTab() {
  const m = MODULES[S.tab];
  if (!m) return;

  document.getElementById('panel-title').textContent = m.title;
  document.getElementById('panel-badge').textContent = m.badge;
  document.getElementById('flow-hint').innerHTML = `→ <code>${m.hint}</code>`;

  if (S.tab === 'outputs') {
    document.getElementById('tool-grid').innerHTML = '';
    document.getElementById('opts-row').innerHTML = '';
    document.getElementById('cmd-text').textContent = 'ls -lah output/';
    openOutputs(); return;
  }
  if (S.tab === 'agent') {
    renderAgentTab(); return;
  }

  document.getElementById('tool-grid').innerHTML = m.tools.map(t => {
    const ok = S.tools.hasOwnProperty(t.id) ? S.tools[t.id] : true;
    const av = S.tools.hasOwnProperty(t.id) ? `<span class="tc-avail ${ok ? 'ok' : 'no'}">${ok ? 'OK' : 'ERR'}</span>` : '';
    return `<div class="tool-card${S.tool === t.id ? ' active' : ''}${ok === false ? ' unavailable' : ''}"
      data-tool="${t.id}" onclick="selectTool('${t.id}')">
      ${av}<div class="tc-name">${t.name}</div><div class="tc-desc">${t.desc}</div></div>`;
  }).join('');

  document.getElementById('opts-row').innerHTML =
    '<span class="opts-hint">// select a tool → copy or run the command</span>';

  updatePreview();
}

// ── TOOL OPTIONS RENDERING ────────────────────────────────────────────────────
function renderOpts(toolId) {
  const key = `${S.tab}:${toolId}`;
  const defs = TOOL_OPTS[key];
  const row = document.getElementById('opts-row');
  if (!defs || !defs.length) {
    row.innerHTML = '<span class="opts-hint">// no extra options for this tool</span>';
    return;
  }
  // Reset opts to defaults on tool change
  defs.forEach(d => { if (S.opts[d.key] === undefined) S.opts[d.key] = d.default; });

  row.innerHTML = '<span class="opts-hint" style="margin-right:10px">// options:</span>' +
    defs.map(d => {
      if (d.type === 'toggle') {
        const on = S.opts[d.key];
        return `<button class="opt-chip${on ? ' on' : ''}" onclick="toggleOpt('${d.key}')">${d.label}</button>`;
      }
      if (d.type === 'select') {
        return `<select class="opt-select" onchange="setOpt('${d.key}',this.value)">
          ${d.values.map(v => `<option value="${v}"${String(S.opts[d.key]) === String(v) ? ' selected' : ''}>${d.label}: ${v}</option>`).join('')}
        </select>`;
      }
      return '';
    }).join('');
}

function toggleOpt(key) {
  S.opts[key] = !S.opts[key];
  renderOpts(S.tool);
  updatePreview();
}

function setOpt(key, val) {
  S.opts[key] = val;
  updatePreview();
}

function renderAgentTab() {
  document.getElementById('tool-grid').innerHTML = '';
  document.getElementById('opts-row').innerHTML = '';
  document.getElementById('cmd-text').textContent = `Ollama model: ${S.model}  |  host: ${S.host}`;
  document.getElementById('output-area').innerHTML = `
    <div class="agent-tab">
      <div class="agent-card">
        <div class="agent-card-title">AUTONOMOUS RECON PLAN</div>
        <p>AI generates a complete step-by-step recon + exploitation plan for your target domain.</p>
        <div class="agent-btn-row">
          <button class="btn btn-ai" onclick="agentPlan()">GENERATE PLAN</button>
        </div>
      </div>
      <div class="agent-card">
        <div class="agent-card-title">ANALYZE LAST SCAN</div>
        <p>AI reads your most recent scan output, finds vulnerabilities, rates severity, and suggests next commands.</p>
        <div class="agent-btn-row">
          <button class="btn btn-ai" onclick="agentAnalyze()">ANALYZE OUTPUT</button>
        </div>
      </div>
      <div class="agent-card">
        <div class="agent-card-title">GENERATE BUG REPORT</div>
        <p>AI consolidates all output files into a professional bug bounty report with PoC curl commands.</p>
        <div class="agent-btn-row">
          <button class="btn btn-ai" onclick="agentReport()">GENERATE REPORT</button>
        </div>
      </div>
      <div class="agent-footer">
        Model: <code>${S.model}</code>  |  Host: <code>${S.host}</code>
        &nbsp;→ change via <strong>OLLAMA</strong> button<br>
        100% local · No API key · No internet · No limits · Completely free
      </div>
    </div>`;
}

function selectTool(id) {
  S.tool = id;
  S.opts = {}; // reset opts on tool change so defaults apply fresh
  document.querySelectorAll('.tool-card').forEach(el =>
    el.classList.toggle('active', el.dataset.tool === id));
  renderOpts(id);
  updatePreview();
}

async function updatePreview() {
  if (!S.tool) { document.getElementById('cmd-text').textContent = 'select a tool above...'; return; }
  const target = document.getElementById('target').value || 'example.com';
  try {
    const d = await (await fetch('/api/command', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ module: S.tab, tool: S.tool, target, options: S.opts })
    })).json();
    document.getElementById('cmd-text').textContent = d.command || '';
  } catch (e) { }
}

// =========================================================================================
// ************************* RUN ***********************************************************
// =========================================================================================  
// ── TARGET VALIDATION ─────────────────────────────────────────────────────────
function validateTarget(t) {
  if (!t || !t.trim()) return false;
  // Accept domain, IP, CIDR, or URL
  return /^(https?:\/\/)?[a-zA-Z0-9._\-]+(:[0-9]+)?(\/.*)?$|^[0-9]{1,3}(\.[0-9]{1,3}){3}(\/[0-9]{1,2})?$/.test(t.trim());
}

function runScan() {
  if (S.running) { stopScan(); return; }
  if (!S.tool) { addLine('warn', 'select a tool first'); return; }
  const targetEl = document.getElementById('target');
  const target = targetEl.value.trim() || 'example.com';
  // Visual feedback if target looks empty or like a placeholder
  if (!target || target === 'example.com') {
    targetEl.style.outline = '2px solid var(--neon-amber)';
    addLine('warn', 'tip: set a real target — using example.com as placeholder');
    setTimeout(() => targetEl.style.outline = '', 2000);
  } else if (!validateTarget(target)) {
    targetEl.style.outline = '2px solid var(--neon-red)';
    addLine('err', `invalid target: "${target}" — expected domain, IP, or URL`);
    setTimeout(() => targetEl.style.outline = '', 2500);
    return;
  } else {
    targetEl.style.outline = '2px solid var(--neon-green)';
    setTimeout(() => targetEl.style.outline = '', 1500);
  }
  document.getElementById('output-area').innerHTML = '';
  S.running = true;
  const btn = document.getElementById('run-btn');
  btn.textContent = 'STOP'; btn.classList.remove('btn-run'); btn.classList.add('btn-clear');
  document.getElementById('progress-wrap').style.display = 'flex';
  const spinner = document.querySelector('.progress-spinner');
  if (spinner) spinner.style.display = 'block';
  animateProgress();
  fetch('/api/run', {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ module: S.tab, tool: S.tool, target, options: S.opts })
  }).then(r => {
    const reader = r.body.getReader(), dec = new TextDecoder(); let buf = '';
    function pump() {
      reader.read().then(({ done, value }) => {
        if (done) { scanDone(0); return; }
        buf += dec.decode(value, { stream: true });
        const parts = buf.split('\n'); buf = parts.pop();
        parts.forEach(l => {
          if (l.startsWith('data: ')) try { handleEvt(JSON.parse(l.slice(6))); } catch (e) { }
        });
        if (S.running) pump();
      }).catch(() => scanDone(-1));
    }
    pump();
  }).catch(e => { addLine('err', 'Connect failed: ' + e.message); scanDone(-1); });
}

function handleEvt(d) {
  if (d.type === 'cmd') addLine('cmd', d.text);
  else if (d.type === 'line') addLine(d.tag || 'ok', d.text, d.ts);
  else if (d.type === 'done') scanDone(d.code);
  else if (d.type === 'err') { addLine('err', d.text); scanDone(-1); }
}

function scanDone(code) {
  S.running = false;
  const btn = document.getElementById('run-btn');
  btn.textContent = 'EXECUTE'; btn.classList.remove('btn-clear'); btn.classList.add('btn-run');
  const pf = document.getElementById('progress-fill');
  pf.style.width = '100%'; pf.style.background = code === 0 ? 'var(--neon-green)' : 'var(--neon-red)';
  document.getElementById('progress-label').textContent = code === 0 ? 'COMPLETED' : 'EXIT ' + code;
  document.querySelector('.progress-spinner').style.display = 'none';
  addLine('done', code === 0 ? 'scan finished — results in output/' : 'process exited ' + code);
  refreshStats();
}

function stopScan() { S.running = false; scanDone(-1); }

let progTimer = null;
function animateProgress() {
  const pf = document.getElementById('progress-fill');
  pf.style.width = '0%'; pf.style.background = 'var(--grad)';
  let p = 0; if (progTimer) clearInterval(progTimer);
  progTimer = setInterval(() => {
    if (!S.running) { clearInterval(progTimer); return; }
    p += Math.random() * 2.2; if (p > 92) p = 92;
    pf.style.width = p + '%';
    document.getElementById('progress-label').textContent = `RUNNING ${Math.round(p)}%`;
  }, 400);
}

// ── OUTPUT ────────────────────────────────────────────────────────────────────
const MAX_OUTPUT_LINES = 500;
let scrollPending = false;

function addLine(tag, text, ts) {
  const oa = document.getElementById('output-area');
  const ph = oa.querySelector('.output-placeholder'); if (ph) ph.remove();

  // Optimization 1: Limit DOM nodes to prevent browser freeze
  while (oa.children.length > MAX_OUTPUT_LINES) {
    oa.removeChild(oa.firstChild);
  }

  const t = ts || new Date().toTimeString().slice(0, 8);
  const div = document.createElement('div'); div.className = 'output-line';
  div.innerHTML = `<span class="o-ts">[${t}]</span><span class="o-tag ${tag}">${tag.toUpperCase()}</span><span class="o-text">${esc(text)}</span>`;
  oa.appendChild(div);

  // Re-add cursor if it was removed by line limit
  let cur = oa.querySelector('.cursor');
  if (!cur) { cur = document.createElement('span'); cur.className = 'cursor'; oa.appendChild(cur); }

  // Optimization 2: Throttle scroll updates to prevent Layout Thrashing
  if (!scrollPending) {
    scrollPending = true;
    requestAnimationFrame(() => {
      oa.scrollTop = oa.scrollHeight;
      scrollPending = false;
    });
  }
}

function esc(s) { return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;'); }

function clearOutput() {
  document.getElementById('output-area').innerHTML = '<div class="output-placeholder">// output cleared</div>';
  document.getElementById('progress-wrap').style.display = 'none';
}

function copyCmd() {
  navigator.clipboard.writeText(document.getElementById('cmd-text').textContent).then(() => {
    const b = document.querySelector('.btn-copy'), o = b.textContent;
    b.textContent = 'COPIED'; setTimeout(() => b.textContent = o, 1500);
  }).catch(() => { });
}

// ── AI AGENT ──────────────────────────────────────────────────────────────────
function clearAI() {
  document.getElementById('ai-output').innerHTML = '<div class="ai-placeholder">AI output cleared.</div>';
}

function setAI(html) {
  const el = document.getElementById('ai-output');
  el.innerHTML = html; el.scrollTop = 0;
}

function aiLoading(msg = 'Ollama thinking...') {
  setAI(`<div class="ai-loading">${msg}<br><br><small style="color:var(--text3)">Local AI may take 10-60s depending on model and hardware.</small></div>`);
}

async function callAgent(endpoint, extra = {}) {
  if (!S.ollamaOk) {
    // Fetch detailed status to know WHY it's offline
    let diagMsg = 'Cannot reach Ollama — run: <code>ollama serve</code>';
    let outputMsg = 'Ollama offline — run in terminal: ollama serve';
    try {
      const s = await (await fetch(`/api/agent/status?host=${encodeURIComponent(S.host)}&model=${encodeURIComponent(S.model)}`)).json();
      if (!s.ollama.reachable) {
        diagMsg = `Cannot reach Ollama at <code>${esc(S.host)}</code><br><br>` +
          `<strong>Fix:</strong> open a terminal and run:<br><code>ollama serve</code><br><br>` +
          `Then pull a model:<br><code>ollama pull ${esc(S.model)}</code>`;
        outputMsg = `Ollama offline at ${S.host} — run: ollama serve`;
      } else if (s.ollama.reachable && !s.ollama.model_ok) {
        diagMsg = `Ollama is running but model <code>${esc(S.model)}</code> is not installed.<br><br>` +
          `<strong>Fix:</strong><br><code>ollama pull ${esc(S.model)}</code><br><br>` +
          `Available models: <code>${s.ollama.models.join(', ') || 'none'}</code>`;
        outputMsg = `Model '${S.model}' not found — run: ollama pull ${S.model}`;
        S.ollamaOk = true; // Ollama IS running, just wrong model
      }
    } catch (_) { }
    setAI(`<div style="color:var(--red);font-size:11px;line-height:1.9">
      <div style="font-size:14px;margin-bottom:12px">⚠ AI OFFLINE</div>
      ${diagMsg}
      <br><br>
      <button class="btn btn-outline" style="font-size:10px" onclick="checkOllama().then(()=>location.reload())">↻ RETRY</button>
    </div>`);
    addLine('err', outputMsg);
    return;
  }
  aiLoading();
  const target = document.getElementById('target').value || 'example.com';
  try {
    const resp = await fetch(endpoint, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ model: S.model, host: S.host, target, module: S.tab, ...extra })
    });
    if (!resp.ok) {
      const txt = await resp.text();
      throw new Error(`HTTP ${resp.status}: ${txt.slice(0, 200)}`);
    }
    const d = await resp.json();
    if (!d.result || d.result.startsWith('[Error]')) {
      const errMsg = d.result || 'No result returned';
      setAI(`<div style="color:var(--red);font-size:11px;line-height:1.9">
        <div style="font-size:13px;margin-bottom:10px">⚠ AI ERROR</div>
        <code>${esc(errMsg)}</code>
        <br><br>
        <button class="btn btn-outline" style="font-size:10px" onclick="checkOllama()">↻ CHECK OLLAMA</button>
      </div>`);
      addLine('err', 'AI error: ' + errMsg);
    } else {
      setAI('<pre style="white-space:pre-wrap;font-size:10px;line-height:1.85">' + esc(d.result) + '</pre>');
      addLine('found', 'AI analysis complete — see AI panel →');
    }
  } catch (e) {
    setAI(`<div style="color:var(--red);font-size:11px">Network error: ${esc(e.message)}</div>`);
    addLine('err', 'AI request failed: ' + e.message);
  }
}

function agentAnalyze() {
  addLine('info', `AI analyzing — model: ${S.model} @ ${S.host}`);
  callAgent('/api/agent/analyze');
}
function agentPlan() {
  addLine('info', `AI generating recon plan — model: ${S.model}`);
  callAgent('/api/agent/plan');
}
function agentReport() {
  addLine('info', `AI generating bug bounty report — model: ${S.model}`);
  callAgent('/api/agent/report');
}

// ── OUTPUTS MODAL ─────────────────────────────────────────────────────────────
async function openOutputs() {
  document.getElementById('modal-bg').style.display = 'flex';
  const body = document.getElementById('modal-body');
  body.innerHTML = '<div style="padding:1rem;color:var(--text3);font-family:\'JetBrains Mono\',monospace;font-size:11px">Loading...</div>';
  try {
    const files = await (await fetch('/api/outputs')).json();
    if (!files.length) {
      body.innerHTML = '<div style="padding:1rem;color:var(--text3);font-family:\'JetBrains Mono\',monospace;font-size:11px">// no output files yet — run some scans first</div>';
      return;
    }
    body.innerHTML = files.map(f =>
      `<div class="file-item" onclick="readFile('${esc(f.name)}')">
        <span class="file-name">${esc(f.name)}</span>
        <span class="file-size">${fmtSz(f.size)}</span>
        <span class="file-ts">${f.modified}</span>
      </div>`).join('');
  } catch (e) {
    body.innerHTML = `<div style="padding:1rem;color:var(--red);font-size:11px">Error: ${esc(e.message)}</div>`;
  }
}

async function readFile(name) {
  const body = document.getElementById('modal-body');
  const ex = body.querySelector('.file-content'); if (ex) ex.remove();
  try {
    const d = await (await fetch('/api/read/' + encodeURIComponent(name))).json();
    const pre = document.createElement('div');
    pre.className = 'file-content'; pre.textContent = d.content || '(empty)';
    body.appendChild(pre);
  } catch (e) { }
}

async function generateReport() {
  const target = document.getElementById('target').value || 'example.com';
  const body = document.getElementById('modal-body');

  // Check Ollama status with diagnostics
  if (!S.ollamaOk) {
    let hint = 'ollama serve';
    try {
      const s = await (await fetch(`/api/agent/status?host=${encodeURIComponent(S.host)}&model=${encodeURIComponent(S.model)}`)).json();
      if (s.ollama.reachable && !s.ollama.model_ok)
        hint = `ollama pull ${S.model}`;
    } catch (_) { }
    body.innerHTML += `<div style="padding:1rem;color:var(--red);font-family:'JetBrains Mono',monospace;font-size:11px">
      ⚠ Ollama not ready — run in a terminal:<br><br>
      <code style="color:var(--accent)">${esc(hint)}</code><br><br>
      Then click AI REPORT again.
    </div>`;
    return;
  }

  // Show loading indicator
  const loadDiv = document.createElement('div');
  loadDiv.style.cssText = 'padding:1rem;color:var(--purple);font-family:\'JetBrains Mono\',monospace;font-size:11px';
  loadDiv.textContent = `⏳ Generating AI report with ${S.model}... (may take 30-120s)`;
  body.appendChild(loadDiv);

  try {
    const resp = await fetch('/api/agent/report', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ model: S.model, host: S.host, target })
    });
    loadDiv.remove();

    if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
    const d = await resp.json();

    if (!d.result || d.result.startsWith('[Error]')) {
      const errDiv = document.createElement('div');
      errDiv.style.cssText = 'padding:1rem;color:var(--red);font-family:\'JetBrains Mono\',monospace;font-size:11px';
      errDiv.innerHTML = `⚠ AI Error: <code>${esc(d.result || 'No result')}</code>`;
      body.appendChild(errDiv);
    } else {
      const pre = document.createElement('div');
      pre.className = 'file-content';
      pre.style.borderColor = 'rgba(139,92,246,.3)';
      pre.style.color = '#c4b5fd';
      pre.textContent = d.result;
      body.appendChild(pre);
    }
  } catch (e) {
    loadDiv.remove();
    body.innerHTML += `<div style="padding:.5rem 1rem;color:var(--red);font-size:11px">Network error: ${esc(e.message)}</div>`;
  }
}

function closeModal() { document.getElementById('modal-bg').style.display = 'none'; }

function fmtSz(b) {
  if (b < 1024) return b + 'B';
  if (b < 1048576) return (b / 1024).toFixed(1) + 'KB';
  return (b / 1048576).toFixed(1) + 'MB';
}
