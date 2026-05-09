'use strict';

// ── MODULES ──────────────────────────────────────────────────────────────────
const MODULES = {
  subdomain:{title:'SUBDOMAIN ENUMERATION',badge:'PASSIVE + ACTIVE + BRUTEFORCE',hint:'output/Subs.txt',
    tools:[
      {id:'subfinder',   name:'subfinder',   desc:'passive cert+source'},
      {id:'amass',       name:'amass',       desc:'OSINT graph enum'},
      {id:'assetfinder', name:'assetfinder', desc:'fast passive'},
      {id:'findomain',   name:'findomain',   desc:'multi-API'},
      {id:'chaos',       name:'chaos',       desc:'ProjectDiscovery DB'},
      {id:'puredns',     name:'puredns',     desc:'DNS bruteforce'},
      {id:'dnsx',        name:'dnsx',        desc:'DNS resolver'},
      {id:'merge+sort',  name:'merge+sort',  desc:'dedupe → Subs.txt ✓'},
    ]},
  alive:{title:'ALIVE HOST DETECTION',badge:'HTTPX — HTTP PROBE',hint:'output/Alive.txt',
    tools:[
      {id:'httpx',      name:'httpx',      desc:'full probe + title'},
      {id:'httpx-200',  name:'httpx 200',  desc:'200-only filter'},
    ]},
  url:{title:'URL DISCOVERY',badge:'WAYBACK + GAU + KATANA + MORE',hint:'output/URLs.txt',
    tools:[
      {id:'waybackurls', name:'waybackurls',desc:'Wayback Machine'},
      {id:'gau',         name:'gau',        desc:'OTX + WayBack'},
      {id:'katana',      name:'katana',     desc:'JS-aware crawler'},
      {id:'hakrawler',   name:'hakrawler',  desc:'Go web crawler'},
      {id:'gospider',    name:'gospider',   desc:'robots+sitemap'},
      {id:'paramspider', name:'paramspider',desc:'param URL spider'},
      {id:'merge+filter',name:'merge+filter',desc:'dedupe → URLs.txt ✓'},
    ]},
  dir:{title:'DIRECTORY FUZZING',badge:'FFUF + FEROX + DIRSEARCH',hint:'output/dirs_all.txt',
    tools:[
      {id:'ffuf',        name:'ffuf',        desc:'fast web fuzzer'},
      {id:'feroxbuster', name:'feroxbuster', desc:'recursive browse'},
      {id:'dirsearch',   name:'dirsearch',   desc:'advanced scanner'},
      {id:'gobuster',    name:'gobuster',    desc:'classic Go fuzzer'},
    ]},
  ports:{title:'PORT DISCOVERY',badge:'NAABU + NMAP + MASSCAN',hint:'output/ports.txt',
    tools:[
      {id:'naabu',   name:'naabu',   desc:'fast Go scanner'},
      {id:'nmap',    name:'nmap',    desc:'service detection'},
      {id:'masscan', name:'masscan', desc:'ultra fast scan'},
    ]},
  params:{title:'PARAMETER DISCOVERY',badge:'ARJUN + X8 + FFUF',hint:'output/params_found.txt',
    tools:[
      {id:'arjun',      name:'arjun',      desc:'GET+POST discovery'},
      {id:'x8',         name:'x8',         desc:'hidden param brute'},
      {id:'ffuf-params',name:'ffuf params',desc:'FUZZ param names'},
    ]},
  secrets:{title:'JS / SECRET HUNTING',badge:'TRUFFLEHOG + GITLEAKS + BFAC',hint:'output/secrets/',
    tools:[
      {id:'trufflehog',   name:'trufflehog',   desc:'verified secrets'},
      {id:'gitleaks',     name:'gitleaks',     desc:'git secret scan'},
      {id:'wayback-files',name:'wayback files',desc:'sensitive file hunt'},
      {id:'bfac',         name:'bfac',         desc:'backup artifacts'},
    ]},
  xss:{title:'XSS TESTING',badge:'GF → KXSS → DALFOX',hint:'output/xss_vulns.txt',
    tools:[
      {id:'filter-params',name:'gf xss', desc:'filter candidates'},
      {id:'kxss',         name:'kxss',   desc:'reflection check'},
      {id:'dalfox',       name:'dalfox', desc:'fast XSS scanner'},
    ]},
  sqli:{title:'SQL INJECTION',badge:'GF → GHAURI → SQLMAP',hint:'output/sqli_results.txt',
    tools:[
      {id:'filter-params',name:'gf sqli', desc:'filter candidates'},
      {id:'ghauri',       name:'ghauri',  desc:'advanced detector'},
      {id:'sqlmap',       name:'sqlmap',  desc:'classic SQLi tool'},
    ]},
  ssti:{title:'SSTI TESTING',badge:'GF → NUCLEI → MANUAL',hint:'output/ssti_results.txt',
    tools:[
      {id:'filter-params',name:'gf ssti',      desc:'filter candidates'},
      {id:'nuclei-ssti',  name:'nuclei ssti',  desc:'template scan'},
      {id:'manual-check', name:'{{7*7}} check',desc:'manual confirm'},
    ]},
  lfi:{title:'LFI / PATH TRAVERSAL',badge:'GF → NUCLEI → CONFIRM',hint:'output/lfi_results.txt',
    tools:[
      {id:'filter-params',  name:'gf lfi',         desc:'filter candidates'},
      {id:'nuclei-lfi',     name:'nuclei lfi',     desc:'template scan'},
      {id:'path-traversal', name:'path traversal', desc:'../etc/passwd'},
    ]},
  ssrf:{title:'SSRF TESTING',badge:'GF → NUCLEI',hint:'output/ssrf_results.txt',
    tools:[
      {id:'filter-params',name:'gf ssrf',     desc:'filter candidates'},
      {id:'nuclei-ssrf',  name:'nuclei ssrf', desc:'template scan'},
    ]},
  cors:{title:'CORS TESTING',badge:'NUCLEI + CORSY + MANUAL',hint:'output/cors_results.txt',
    tools:[
      {id:'nuclei-cors',name:'nuclei cors',desc:'template scan'},
      {id:'corsy',      name:'corsy',      desc:'CORS misconfig'},
      {id:'manual',     name:'manual curl',desc:'evil.com origin'},
    ]},
  csrf:{title:'CSRF TESTING',badge:'NUCLEI + FORM FINDER',hint:'output/csrf_results.txt',
    tools:[
      {id:'nuclei-csrf',name:'nuclei csrf',desc:'template scan'},
      {id:'form-finder',name:'form finder',desc:'find POST forms'},
    ]},
  redirect:{title:'OPEN REDIRECT',badge:'GF → OPENREDIREX → MANUAL',hint:'output/redirect_vulns.txt',
    tools:[
      {id:'filter-params',name:'gf redirect', desc:'filter candidates'},
      {id:'openredirex',  name:'openredirex', desc:'async scanner'},
      {id:'manual',       name:'manual curl', desc:'evil.com confirm'},
    ]},
  rce:{title:'RCE / CMD INJECTION',badge:'NUCLEI + GF + MANUAL',hint:'output/rce_results.txt',
    tools:[
      {id:'nuclei-rce',name:'nuclei rce', desc:'CVE+template scan'},
      {id:'cmd-inject',name:'cmd inject', desc:'gf rce → id check'},
    ]},
  nuclei:{title:'NUCLEI FULL SCAN',badge:'CVE + EXPOSURES + MISCONFIG',hint:'output/nuclei_all.txt',
    tools:[
      {id:'exposures',name:'exposures',desc:'leaked files+panels'},
      {id:'cves',     name:'CVE scan', desc:'known CVE checks'},
      {id:'misconfig',name:'misconfig',desc:'security misconfigs'},
      {id:'full-http',name:'full scan',desc:'all HTTP templates'},
    ]},
  agent:{title:'AI AGENT — LOCAL OLLAMA',badge:'FREE · OFFLINE · NO API KEY',hint:'ollama local',tools:[]},
  outputs:{title:'OUTPUT FILES',badge:'SCAN RESULTS',hint:'output/',tools:[]},
};

// ── STATE ─────────────────────────────────────────────────────────────────────
const S = {
  tab:'subdomain', tool:null, opts:{}, running:false, tools:{},
  model:'mistral', host:'http://localhost:11434', ollamaOk:false
};

// ── INIT ──────────────────────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('.nav-item').forEach(el =>
    el.addEventListener('click', () => setTab(el.dataset.tab))
  );
  document.getElementById('target').addEventListener('input', updatePreview);

  // Restore saved settings
  S.model = localStorage.getItem('ollama_model') || 'mistral';
  S.host  = localStorage.getItem('ollama_host')  || 'http://localhost:11434';
  document.getElementById('model-select').value = S.model;
  document.getElementById('ollama-host').value  = S.host;

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
  S.host  = document.getElementById('ollama-host').value.trim();
  localStorage.setItem('ollama_model', S.model);
  localStorage.setItem('ollama_host',  S.host);
  toggleSettings();
  addLine('info', `Ollama settings saved — model: ${S.model} | host: ${S.host}`);
  checkOllama();
}

async function testOllama() {
  const tr = document.getElementById('test-result');
  tr.style.color = 'var(--amber)';
  tr.textContent = '⏳ Testing...';
  try {
    const r = await fetch('/api/agent/test', {
      method:'POST', headers:{'Content-Type':'application/json'},
      body: JSON.stringify({model:document.getElementById('model-select').value,
                            host: document.getElementById('ollama-host').value})
    });
    const d = await r.json();
    if (d.ok) {
      tr.style.color = 'var(--green)'; tr.textContent = '✓ ONLINE — ' + d.msg;
    } else {
      tr.style.color = 'var(--red)'; tr.textContent = '✗ ' + d.msg;
    }
  } catch(e) {
    tr.style.color = 'var(--red)'; tr.textContent = '✗ ' + e.message;
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
    const dot   = document.getElementById('o-dot');
    const label = document.getElementById('o-label');
    if (d.running) {
      dot.className = 'o-dot online';
      label.textContent = `OLLAMA · ${d.models.length} MODEL${d.models.length!==1?'S':''}`;
      label.style.color = 'var(--green)';
    } else {
      dot.className = 'o-dot offline';
      label.textContent = 'OLLAMA OFFLINE';
      label.style.color = 'var(--red)';
    }
  } catch(e) {
    document.getElementById('o-dot').className = 'o-dot offline';
    document.getElementById('o-label').textContent = 'OLLAMA OFFLINE';
  }
}

// ── TOOLS / STATS ─────────────────────────────────────────────────────────────
async function fetchTools() {
  try {
    const r = await fetch('/api/tools');
    S.tools = await r.json();
    const av = Object.values(S.tools).filter(Boolean).length;
    renderTab();
  } catch(e) {}
}

async function refreshStats() {
  try {
    const d = await (await fetch('/api/stats')).json();
    document.getElementById('s-subs').textContent  = fmt(d.subdomains||0);
    document.getElementById('s-alive').textContent = fmt(d.alive||0);
    document.getElementById('s-urls').textContent  = fmt(d.urls||0);
    document.getElementById('s-vulns').textContent = fmt((d.xss_vulns||0)+(d.sqli||0)+(d.nuclei||0));
  } catch(e){}
}

function fmt(n){ return n>=1000?(n/1000).toFixed(1)+'k':n; }

// ── TABS ──────────────────────────────────────────────────────────────────────
function setTab(tab) {
  S.tab=tab; S.tool=null; S.opts={};
  document.querySelectorAll('.nav-item').forEach(el =>
    el.classList.toggle('active', el.dataset.tab===tab));
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
    document.getElementById('opts-row').innerHTML  = '';
    document.getElementById('cmd-text').textContent = 'ls -lah output/';
    openOutputs(); return;
  }
  if (S.tab === 'agent') {
    renderAgentTab(); return;
  }

  document.getElementById('tool-grid').innerHTML = m.tools.map(t => {
    const ok = S.tools.hasOwnProperty(t.id) ? S.tools[t.id] : true;
    const av = S.tools.hasOwnProperty(t.id) ? `<span class="tc-avail ${ok?'ok':'no'}">${ok?'✓':'✗'}</span>` : '';
    return `<div class="tool-card${S.tool===t.id?' active':''}${ok===false?' unavailable':''}"
      data-tool="${t.id}" onclick="selectTool('${t.id}')">
      ${av}<div class="tc-name">${t.name}</div><div class="tc-desc">${t.desc}</div></div>`;
  }).join('');

  document.getElementById('opts-row').innerHTML =
    '<span class="opts-hint">// select a tool → copy or run the command</span>';

  updatePreview();
}

function renderAgentTab() {
  document.getElementById('tool-grid').innerHTML = '';
  document.getElementById('opts-row').innerHTML  = '';
  document.getElementById('cmd-text').textContent = `🤖 Ollama model: ${S.model}  |  host: ${S.host}`;
  document.getElementById('output-area').innerHTML = `
    <div class="agent-tab">
      <div class="agent-card">
        <div class="agent-card-title">🗺️ AUTONOMOUS RECON PLAN</div>
        <p>AI generates a complete step-by-step recon + exploitation plan for your target domain.</p>
        <div class="agent-btn-row">
          <button class="btn btn-ai" onclick="agentPlan()">▶ GENERATE PLAN</button>
        </div>
      </div>
      <div class="agent-card">
        <div class="agent-card-title">🔍 ANALYZE LAST SCAN</div>
        <p>AI reads your most recent scan output, finds vulnerabilities, rates severity, and suggests next commands.</p>
        <div class="agent-btn-row">
          <button class="btn btn-ai" onclick="agentAnalyze()">▶ ANALYZE OUTPUT</button>
        </div>
      </div>
      <div class="agent-card">
        <div class="agent-card-title">📝 GENERATE BUG REPORT</div>
        <p>AI consolidates all output files into a professional bug bounty report with PoC curl commands.</p>
        <div class="agent-btn-row">
          <button class="btn btn-ai" onclick="agentReport()">▶ GENERATE REPORT</button>
        </div>
      </div>
      <div class="agent-footer">
        🤖 Model: <code>${S.model}</code>  |  Host: <code>${S.host}</code>
        &nbsp;→ change via <strong>⚙ OLLAMA</strong> button<br>
        100% local · No API key · No internet · No limits · Completely free
      </div>
    </div>`;
}

function selectTool(id) {
  S.tool = id;
  document.querySelectorAll('.tool-card').forEach(el =>
    el.classList.toggle('active', el.dataset.tool===id));
  updatePreview();
}

async function updatePreview() {
  if (!S.tool) { document.getElementById('cmd-text').textContent='select a tool above...'; return; }
  const target = document.getElementById('target').value || 'example.com';
  try {
    const d = await (await fetch('/api/command',{
      method:'POST', headers:{'Content-Type':'application/json'},
      body: JSON.stringify({module:S.tab, tool:S.tool, target, options:S.opts})
    })).json();
    document.getElementById('cmd-text').textContent = d.command || '';
  } catch(e) {}
}

// ── RUN ───────────────────────────────────────────────────────────────────────
function runScan() {
  if (S.running) { stopScan(); return; }
  if (!S.tool)   { addLine('warn','select a tool first'); return; }
  const target = document.getElementById('target').value || 'example.com';
  document.getElementById('output-area').innerHTML = '';
  S.running = true;
  const btn = document.getElementById('run-btn');
  btn.textContent='■ STOP'; btn.classList.remove('btn-run'); btn.classList.add('btn-clear');
  document.getElementById('progress-wrap').style.display='flex';
  animateProgress();
  fetch('/api/run',{method:'POST',headers:{'Content-Type':'application/json'},
    body:JSON.stringify({module:S.tab,tool:S.tool,target,options:S.opts})
  }).then(r=>{
    const reader=r.body.getReader(), dec=new TextDecoder(); let buf='';
    function pump(){
      reader.read().then(({done,value})=>{
        if(done){scanDone(0);return;}
        buf+=dec.decode(value,{stream:true});
        const parts=buf.split('\n'); buf=parts.pop();
        parts.forEach(l=>{
          if(l.startsWith('data: '))try{handleEvt(JSON.parse(l.slice(6)));}catch(e){}
        });
        if(S.running)pump();
      }).catch(()=>scanDone(-1));
    }
    pump();
  }).catch(e=>{addLine('err','Connect failed: '+e.message);scanDone(-1);});
}

function handleEvt(d) {
  if (d.type==='cmd')  addLine('cmd',  d.text);
  else if (d.type==='line') addLine(d.tag||'ok', d.text, d.ts);
  else if (d.type==='done') scanDone(d.code);
  else if (d.type==='err')  { addLine('err',d.text); scanDone(-1); }
}

function scanDone(code) {
  S.running=false;
  const btn=document.getElementById('run-btn');
  btn.textContent='▶ RUN'; btn.classList.remove('btn-clear'); btn.classList.add('btn-run');
  const pf=document.getElementById('progress-fill');
  pf.style.width='100%'; pf.style.background=code===0?'var(--green)':'var(--red)';
  document.getElementById('progress-label').textContent=code===0?'COMPLETED':`EXIT ${code}`;
  addLine('done',code===0?'scan finished — results in output/':'process exited '+code);
  refreshStats();
}

function stopScan() { S.running=false; scanDone(-1); }

let progTimer=null;
function animateProgress() {
  const pf=document.getElementById('progress-fill');
  pf.style.width='0%'; pf.style.background='var(--grad)';
  let p=0; if(progTimer)clearInterval(progTimer);
  progTimer=setInterval(()=>{
    if(!S.running){clearInterval(progTimer);return;}
    p+=Math.random()*2.2; if(p>92)p=92;
    pf.style.width=p+'%';
    document.getElementById('progress-label').textContent=`RUNNING ${Math.round(p)}%`;
  },400);
}

// ── OUTPUT ────────────────────────────────────────────────────────────────────
function addLine(tag, text, ts) {
  const oa=document.getElementById('output-area');
  const ph=oa.querySelector('.output-placeholder'); if(ph)ph.remove();
  const t=ts||new Date().toTimeString().slice(0,8);
  const div=document.createElement('div'); div.className='output-line';
  div.innerHTML=`<span class="o-ts">[${t}]</span><span class="o-tag ${tag}">${tag.toUpperCase()}</span><span class="o-text">${esc(text)}</span>`;
  oa.appendChild(div);
  let cur=oa.querySelector('.cursor');
  if(!cur){cur=document.createElement('span');cur.className='cursor';oa.appendChild(cur);}
  oa.scrollTop=oa.scrollHeight;
}

function esc(s){return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');}

function clearOutput() {
  document.getElementById('output-area').innerHTML='<div class="output-placeholder">// output cleared</div>';
  document.getElementById('progress-wrap').style.display='none';
}

function copyCmd() {
  navigator.clipboard.writeText(document.getElementById('cmd-text').textContent).then(()=>{
    const b=document.querySelector('.btn-copy'), o=b.textContent;
    b.textContent='✓ COPIED'; setTimeout(()=>b.textContent=o,1500);
  }).catch(()=>{});
}

// ── AI AGENT ──────────────────────────────────────────────────────────────────
function clearAI() {
  document.getElementById('ai-output').innerHTML='<div class="ai-placeholder">AI output cleared.</div>';
}

function setAI(html) {
  const el=document.getElementById('ai-output');
  el.innerHTML=html; el.scrollTop=0;
}

function aiLoading(msg='🤖 Ollama thinking...') {
  setAI(`<div class="ai-loading">${msg}<br><br><small style="color:var(--text3)">Local AI may take 10-60s depending on model and hardware.</small></div>`);
}

async function callAgent(endpoint, extra={}) {
  if (!S.ollamaOk) {
    setAI('<div style="color:var(--red);font-size:10px">⚠ Ollama is offline.<br><br>Start it with:<br><code style="color:var(--accent)">ollama serve</code><br><br>Then pull a model:<br><code style="color:var(--accent)">ollama pull mistral</code></div>');
    return;
  }
  aiLoading();
  const target=document.getElementById('target').value||'example.com';
  try {
    const d=await(await fetch(endpoint,{
      method:'POST', headers:{'Content-Type':'application/json'},
      body:JSON.stringify({model:S.model, host:S.host, target, module:S.tab, ...extra})
    })).json();
    setAI('<pre style="white-space:pre-wrap;font-size:10px;line-height:1.85">'+esc(d.result||'No result')+'</pre>');
  } catch(e) {
    setAI(`<div style="color:var(--red)">Error: ${esc(e.message)}</div>`);
  }
}

function agentAnalyze() { callAgent('/api/agent/analyze'); }
function agentPlan()    { addLine('info','AI generating plan...'); callAgent('/api/agent/plan'); }
function agentReport()  { addLine('info','AI generating report...'); callAgent('/api/agent/report'); }

// ── OUTPUTS MODAL ─────────────────────────────────────────────────────────────
async function openOutputs() {
  document.getElementById('modal-bg').style.display='flex';
  const body=document.getElementById('modal-body');
  body.innerHTML='<div style="padding:1rem;color:var(--text3);font-family:\'JetBrains Mono\',monospace;font-size:11px">Loading...</div>';
  try {
    const files=await(await fetch('/api/outputs')).json();
    if(!files.length){
      body.innerHTML='<div style="padding:1rem;color:var(--text3);font-family:\'JetBrains Mono\',monospace;font-size:11px">// no output files yet — run some scans first</div>';
      return;
    }
    body.innerHTML=files.map(f=>
      `<div class="file-item" onclick="readFile('${esc(f.name)}')">
        <span class="file-name">${esc(f.name)}</span>
        <span class="file-size">${fmtSz(f.size)}</span>
        <span class="file-ts">${f.modified}</span>
      </div>`).join('');
  } catch(e) {
    body.innerHTML=`<div style="padding:1rem;color:var(--red);font-size:11px">Error: ${esc(e.message)}</div>`;
  }
}

async function readFile(name) {
  const body=document.getElementById('modal-body');
  const ex=body.querySelector('.file-content'); if(ex)ex.remove();
  try {
    const d=await(await fetch('/api/read/'+encodeURIComponent(name))).json();
    const pre=document.createElement('div');
    pre.className='file-content'; pre.textContent=d.content||'(empty)';
    body.appendChild(pre);
  } catch(e){}
}

async function generateReport() {
  if(!S.ollamaOk){alert('Start Ollama first: ollama serve');return;}
  const target=document.getElementById('target').value||'example.com';
  const body=document.getElementById('modal-body');
  body.innerHTML+='<div style="padding:1rem;color:var(--purple);font-family:\'JetBrains Mono\',monospace;font-size:11px">🤖 Generating AI report... (may take 30-60s)</div>';
  try {
    const d=await(await fetch('/api/agent/report',{
      method:'POST',headers:{'Content-Type':'application/json'},
      body:JSON.stringify({model:S.model,host:S.host,target})
    })).json();
    const pre=document.createElement('div');
    pre.className='file-content';
    pre.style.borderColor='rgba(139,92,246,.3)'; pre.style.color='#c4b5fd';
    pre.textContent=d.result||'No result';
    body.appendChild(pre);
  } catch(e) {
    body.innerHTML+=`<div style="padding:.5rem 1rem;color:var(--red);font-size:11px">Error: ${esc(e.message)}</div>`;
  }
}

function closeModal(){document.getElementById('modal-bg').style.display='none';}

function fmtSz(b){
  if(b<1024)return b+'B';
  if(b<1048576)return(b/1024).toFixed(1)+'KB';
  return(b/1048576).toFixed(1)+'MB';
}
