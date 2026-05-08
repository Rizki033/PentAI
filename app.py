#!/usr/bin/env python3
"""
SIJIL AI v4 — Autonomous Bug Bounty Agent
100% FREE — LOCAL AI via Ollama
Run: ./run.sh  →  http://localhost:5000
"""

import subprocess, json, os, shutil
from datetime import datetime
from flask import Flask, render_template, request, jsonify, Response, stream_with_context
import urllib.request, urllib.error

app = Flask(__name__)

# ─── TOOLS ───────────────────────────────────────────────────────────────────
TOOLS_LIST = [
    "subfinder","amass","assetfinder","findomain","chaos","puredns","dnsx",
    "httpx","waybackurls","gau","katana","hakrawler","gospider","paramspider",
    "ffuf","feroxbuster","dirsearch","gobuster","naabu","nmap","masscan",
    "dalfox","kxss","sqlmap","ghauri","nuclei","arjun","x8",
    "trufflehog","gitleaks","bfac","gf","qsreplace","uro","anew",
    "corsy","openredirex","curl","sort","tee","wc","xargs"
]

def tool_exists(n): return shutil.which(n) is not None
def check_tools():  return {t: tool_exists(t) for t in TOOLS_LIST}

# ─── OLLAMA ───────────────────────────────────────────────────────────────────
AGENT_SYSTEM = """You are SIJIL, an expert bug bounty AI agent. Your role:
1. Analyze recon/scan output and find real vulnerabilities
2. Rate severity: [CRITICAL] [HIGH] [MEDIUM] [LOW] [INFO]
3. Suggest the top 3 next commands to run for maximum impact
4. Write PoC curl commands for confirmed findings
5. Be specific, technical, and actionable."""

def ollama_chat(prompt, model="mistral", host="http://localhost:11434"):
    payload = json.dumps({"model":model,"stream":False,
        "messages":[{"role":"system","content":AGENT_SYSTEM},
                    {"role":"user","content":prompt}]}).encode()
    req = urllib.request.Request(f"{host}/api/chat", data=payload,
        headers={"Content-Type":"application/json"}, method="POST")
    try:
        with urllib.request.urlopen(req, timeout=180) as r:
            return json.loads(r.read().decode())["message"]["content"], None
    except urllib.error.URLError as e:
        return None, f"Ollama offline — run: ollama serve ({e})"
    except Exception as e:
        return None, str(e)

def ollama_models(host="http://localhost:11434"):
    try:
        with urllib.request.urlopen(f"{host}/api/tags", timeout=5) as r:
            return [m["name"] for m in json.loads(r.read().decode()).get("models",[])]
    except: return []

# ─── COMMAND BUILDER ─────────────────────────────────────────────────────────
# Every command has:
#   1. A guard that checks if required tools exist
#   2. A guard that checks if required input files exist
#   3. Proper error messages if either is missing
#   4. Creates output/ dir automatically

def build_command(module, tool, target, options=None):
    t = target.strip() or "example.com"
    os.makedirs("output", exist_ok=True)

    WL_DNS   = "/usr/share/wordlists/seclists/Discovery/DNS/bitquark-subdomains-top100000.txt"
    WL_DNS1M = "/usr/share/wordlists/seclists/Discovery/DNS/subdomains-top1million-110000.txt"
    WL_DIRS  = "/usr/share/wordlists/seclists/Discovery/Web-Content/raft-medium-directories.txt"
    WL_COM   = "/usr/share/wordlists/seclists/Discovery/Web-Content/common.txt"
    WL_PAR   = "/usr/share/wordlists/seclists/Discovery/Web-Content/burp-parameter-names.txt"

    # Helper: wrap command with tool-exists + input-file checks
    def guard(cmd, tools=None, needs=None):
        parts = []
        parts.append("mkdir -p output")
        if tools:
            for tool_name in (tools if isinstance(tools, list) else [tools]):
                parts.append(f'command -v {tool_name} >/dev/null 2>&1 || {{ echo "[ERR] {tool_name} not installed. Install: sudo apt install {tool_name} OR go install github.com/projectdiscovery/{tool_name}/v2/cmd/{tool_name}@latest"; exit 1; }}')
        if needs:
            for f in (needs if isinstance(needs, list) else [needs]):
                parts.append(f'[ -f "{f}" ] || {{ echo "[ERR] Required file not found: {f} — run previous steps first!"; exit 1; }}')
                parts.append(f'[ -s "{f}" ] || {{ echo "[WARN] File is empty: {f} — previous step found no results"; exit 1; }}')
        parts.append(cmd)
        return " && ".join(parts)

    cmds = {
      # ── SUBDOMAIN ──────────────────────────────────────────────────────────
      "subdomain": {
        "subfinder":
          guard(f"subfinder -d {t} -all -silent | tee -a output/Subs_raw.txt && echo '[+] Done. Lines added to output/Subs_raw.txt'",
                tools="subfinder"),
        "amass":
          guard(f"amass enum -passive -d {t} -o output/amass_tmp.txt 2>/dev/null; cat output/amass_tmp.txt 2>/dev/null | tee -a output/Subs_raw.txt && echo '[+] Amass done'",
                tools="amass"),
        "assetfinder":
          guard(f"echo {t} | assetfinder --subs-only | tee -a output/Subs_raw.txt && echo '[+] Assetfinder done'",
                tools="assetfinder"),
        "findomain":
          guard(f"findomain -t {t} -q 2>/dev/null | tee -a output/Subs_raw.txt && echo '[+] Findomain done'",
                tools="findomain"),
        "chaos":
          guard(f"chaos -d {t} -silent 2>/dev/null | tee -a output/Subs_raw.txt && echo '[+] Chaos done'",
                tools="chaos"),
        "puredns":
          guard(f"[ -f {WL_DNS} ] || {{ echo '[ERR] Wordlist not found: {WL_DNS} — install seclists: sudo apt install seclists'; exit 1; }} && puredns bruteforce {WL_DNS} {t} 2>/dev/null | tee -a output/Subs_raw.txt",
                tools="puredns"),
        "dnsx":
          guard(f"[ -f {WL_DNS1M} ] || {{ echo '[ERR] Wordlist not found — sudo apt install seclists'; exit 1; }} && echo {t} | dnsx -silent -w {WL_DNS1M} 2>/dev/null | tee -a output/Subs_raw.txt && echo '[+] dnsx done'",
                tools="dnsx"),
        "merge+sort":
          guard(f"[ -f output/Subs_raw.txt ] || {{ echo '[ERR] Run subdomain tools first to create Subs_raw.txt'; exit 1; }} && sort -u output/Subs_raw.txt -o output/Subs.txt && echo '[+] Unique subdomains:' && wc -l output/Subs.txt",),
      },

      # ── ALIVE ──────────────────────────────────────────────────────────────
      "alive": {
        "httpx":
          guard(f"cat output/Subs.txt | httpx -silent -status-code -content-length -web-server -title -follow-redirects -threads 50 -o output/Alive.txt 2>/dev/null && echo '[+] Alive hosts:' && wc -l output/Alive.txt",
                tools="httpx", needs="output/Subs.txt"),
        "httpx-200":
          guard(f"awk '{{print $1}}' output/Alive.txt | httpx -silent -match-code 200 -threads 30 -o output/Alive200.txt 2>/dev/null && echo '[+] 200-OK hosts:' && wc -l output/Alive200.txt",
                tools="httpx", needs="output/Alive.txt"),
      },

      # ── URL DISCOVERY ──────────────────────────────────────────────────────
      "url": {
        "waybackurls":
          guard(f"awk '{{print $1}}' output/Alive.txt | waybackurls 2>/dev/null | tee -a output/URLs_raw.txt && echo '[+] Wayback done'",
                tools="waybackurls", needs="output/Alive.txt"),
        "gau":
          guard(f"awk '{{print $1}}' output/Alive.txt | gau --threads 20 2>/dev/null | tee -a output/URLs_raw.txt && echo '[+] GAU done'",
                tools="gau", needs="output/Alive.txt"),
        "katana":
          guard(f"awk '{{print $1}}' output/Alive.txt | katana -jc -d 3 -silent -f url 2>/dev/null | tee -a output/URLs_raw.txt && echo '[+] Katana done'",
                tools="katana", needs="output/Alive.txt"),
        "hakrawler":
          guard(f"awk '{{print $1}}' output/Alive.txt | hakrawler -subs -u -insecure 2>/dev/null | tee -a output/URLs_raw.txt && echo '[+] Hakrawler done'",
                tools="hakrawler", needs="output/Alive.txt"),
        "gospider":
          guard(f"gospider -S <(awk '{{print $1}}' output/Alive.txt) -t 10 -d 2 --js --sitemap --robots 2>/dev/null | grep 'http' | tee -a output/URLs_raw.txt && echo '[+] Gospider done'",
                tools="gospider", needs="output/Alive.txt"),
        "paramspider":
          guard(f"mkdir -p results && awk '{{print $1}}' output/Alive.txt | sed 's|https\\?://||' | while read h; do paramspider -d $h -q 2>/dev/null; done; find results -name '*.txt' 2>/dev/null | xargs cat 2>/dev/null | tee -a output/URLs_raw.txt && echo '[+] Paramspider done'",
                tools="paramspider", needs="output/Alive.txt"),
        "merge+filter":
          guard(f"[ -f output/URLs_raw.txt ] || {{ echo '[ERR] Run URL discovery tools first'; exit 1; }} && sort -u output/URLs_raw.txt | {{ command -v uro >/dev/null 2>&1 && uro || cat; }} | tee output/URLs.txt && echo '[+] Unique URLs:' && wc -l output/URLs.txt",),
      },

      # ── DIRECTORY FUZZING ──────────────────────────────────────────────────
      "dir": {
        "ffuf":
          guard(f"[ -f {WL_DIRS} ] || {{ echo '[ERR] Wordlist missing — sudo apt install seclists'; exit 1; }} && while read url; do echo \"[*] Fuzzing $url\" && ffuf -u \"${{url}}/FUZZ\" -w {WL_DIRS} -t 50 -mc 200,301,302,403 -ac -silent 2>/dev/null | tee -a output/dirs_all.txt; done < output/Alive200.txt && echo '[+] Ffuf done'",
                tools="ffuf", needs="output/Alive200.txt"),
        "feroxbuster":
          guard(f"[ -f {WL_DIRS} ] || {{ echo '[ERR] Wordlist missing — sudo apt install seclists'; exit 1; }} && while read url; do feroxbuster -u \"$url\" -w {WL_DIRS} -t 30 -k -d 2 -x php,html,json,js,txt,bak,zip --silent 2>/dev/null | tee -a output/dirs_all.txt; done < output/Alive200.txt",
                tools="feroxbuster", needs="output/Alive200.txt"),
        "dirsearch":
          guard(f"[ -f {WL_COM} ] || {{ echo '[ERR] Wordlist missing — sudo apt install seclists'; exit 1; }} && while read url; do dirsearch -u \"$url\" -e php,asp,aspx,jsp,json,xml,txt,log,bak,zip -i 200,301,302,403 --full-url -q 2>/dev/null | tee -a output/dirs_all.txt; done < output/Alive200.txt",
                tools="dirsearch", needs="output/Alive200.txt"),
        "gobuster":
          guard(f"[ -f {WL_COM} ] || {{ echo '[ERR] Wordlist missing — sudo apt install seclists'; exit 1; }} && while read url; do gobuster dir -u \"$url\" -w {WL_COM} -t 30 -q 2>/dev/null | tee -a output/dirs_all.txt; done < output/Alive200.txt",
                tools="gobuster", needs="output/Alive200.txt"),
      },

      # ── PORTS ──────────────────────────────────────────────────────────────
      "ports": {
        "naabu":
          guard(f"naabu -list output/Subs.txt -top-ports 1000 -silent -rate 1000 -o output/ports.txt 2>/dev/null && echo '[+] Open ports:' && wc -l output/ports.txt",
                tools="naabu", needs="output/Subs.txt"),
        "nmap":
          guard(f"[ -f output/ports.txt ] || {{ echo '[ERR] Run naabu first to get ports.txt'; exit 1; }} && awk -F: '{{print $1}}' output/ports.txt | sort -u | head -20 | xargs -I@ nmap @ -T4 -Pn -sV --open -oN output/nmap_svc.txt 2>/dev/null && echo '[+] Nmap done' && cat output/nmap_svc.txt",
                tools="nmap"),
        "masscan":
          guard(f"masscan -iL output/Subs.txt -p 80,443,8080,8443,8888,3000,3306,5432,6379,27017 --rate=5000 -oL output/masscan.txt 2>/dev/null && echo '[+] Masscan done' && cat output/masscan.txt",
                tools="masscan", needs="output/Subs.txt"),
      },

      # ── PARAMS ─────────────────────────────────────────────────────────────
      "params": {
        "arjun":
          guard(f"while read url; do arjun -u \"$url\" -oJ output/arjun_$(echo $url | md5sum | cut -c1-6).json 2>/dev/null && echo \"[+] $url\"; done < output/Alive200.txt",
                tools="arjun", needs="output/Alive200.txt"),
        "x8":
          guard(f"while read url; do x8 -u \"$url\" -o output/x8_$(echo $url | md5sum | cut -c1-6).txt 2>/dev/null && echo \"[+] $url\"; done < output/Alive200.txt",
                tools="x8", needs="output/Alive200.txt"),
        "ffuf-params":
          guard(f"[ -f {WL_PAR} ] || {{ echo '[ERR] Wordlist missing — sudo apt install seclists'; exit 1; }} && while read url; do ffuf -u \"${{url}}?FUZZ=sijiltest\" -w {WL_PAR} -mc 200 -ac -silent 2>/dev/null | tee -a output/params_found.txt; done < output/Alive200.txt",
                tools="ffuf", needs="output/Alive200.txt"),
      },

      # ── SECRETS ────────────────────────────────────────────────────────────
      "secrets": {
        "trufflehog":
          guard(f"trufflehog filesystem . --results=verified --json 2>/dev/null | tee output/trufflehog.json && echo '[+] Trufflehog done'",
                tools="trufflehog"),
        "gitleaks":
          guard(f"gitleaks detect --source . --report-format json --report-path output/gitleaks.json 2>/dev/null && echo '[+] Gitleaks done' && cat output/gitleaks.json",
                tools="gitleaks"),
        "wayback-files":
          guard(f"grep -iE '\\.xls|\\.csv|\\.sql|\\.bak|\\.env|\\.config|\\.pem|\\.key|\\.zip|\\.tar|\\.gz|\\.log' output/URLs.txt | tee output/sensitive_urls.txt && echo '[+] Sensitive files:' && wc -l output/sensitive_urls.txt",
                needs="output/URLs.txt"),
        "bfac":
          guard(f"awk '{{print $1}}' output/Alive.txt | while read url; do bfac --url \"$url\" --detection-technique all 2>/dev/null; done | tee output/bfac.txt && echo '[+] BFAC done'",
                tools="bfac", needs="output/Alive.txt"),
      },

      # ── XSS ────────────────────────────────────────────────────────────────
      "xss": {
        "filter-params":
          guard(f"gf xss output/URLs.txt 2>/dev/null | sort -u | tee output/xss_candidates.txt && echo '[+] XSS candidates:' && wc -l output/xss_candidates.txt",
                tools="gf", needs="output/URLs.txt"),
        "kxss":
          guard(f"cat output/xss_candidates.txt | kxss 2>/dev/null | tee output/xss_reflected.txt && echo '[+] Reflected XSS:' && wc -l output/xss_reflected.txt",
                tools="kxss", needs="output/xss_candidates.txt"),
        "dalfox":
          guard(f"cat output/xss_reflected.txt | dalfox pipe --silence --no-color 2>/dev/null | tee output/xss_vulns.txt && echo '[+] XSS confirmed:' && wc -l output/xss_vulns.txt",
                tools="dalfox", needs="output/xss_reflected.txt"),
      },

      # ── SQLI ───────────────────────────────────────────────────────────────
      "sqli": {
        "filter-params":
          guard(f"gf sqli output/URLs.txt 2>/dev/null | sort -u | tee output/sqli_candidates.txt && echo '[+] SQLi candidates:' && wc -l output/sqli_candidates.txt",
                tools="gf", needs="output/URLs.txt"),
        "ghauri":
          guard(f"head -20 output/sqli_candidates.txt | while read url; do echo \"[*] Testing: $url\" && ghauri -u \"$url\" --dbs --batch --level 1 2>/dev/null | tee -a output/sqli_results.txt; done && echo '[+] Ghauri done'",
                tools="ghauri", needs="output/sqli_candidates.txt"),
        "sqlmap":
          guard(f"head -10 output/sqli_candidates.txt | while read url; do echo \"[*] Testing: $url\" && sqlmap -u \"$url\" --dbs --batch --random-agent --level 1 --risk 1 --threads 3 2>/dev/null | tee -a output/sqlmap_results.txt; done && echo '[+] Sqlmap done'",
                tools="sqlmap", needs="output/sqli_candidates.txt"),
      },

      # ── SSTI ───────────────────────────────────────────────────────────────
      "ssti": {
        "filter-params":
          guard(f"gf ssti output/URLs.txt 2>/dev/null | sort -u | tee output/ssti_candidates.txt && echo '[+] SSTI candidates:' && wc -l output/ssti_candidates.txt",
                tools="gf", needs="output/URLs.txt"),
        "nuclei-ssti":
          guard(f"nuclei -l output/URLs.txt -tags ssti -silent 2>/dev/null | tee output/ssti_results.txt && echo '[+] Nuclei SSTI done'",
                tools="nuclei", needs="output/URLs.txt"),
        "manual-check":
          guard(f"cat output/ssti_candidates.txt | qsreplace '{{{{7*7}}}}' | while read url; do r=$(curl -sk \"$url\" 2>/dev/null); echo $r | grep -q '49' && echo \"[VULN] SSTI confirmed: $url\"; done | tee output/ssti_confirmed.txt && echo '[+] Manual SSTI check done'",
                tools=["qsreplace","curl"], needs="output/ssti_candidates.txt"),
      },

      # ── LFI ────────────────────────────────────────────────────────────────
      "lfi": {
        "filter-params":
          guard(f"gf lfi output/URLs.txt 2>/dev/null | sort -u | tee output/lfi_candidates.txt && echo '[+] LFI candidates:' && wc -l output/lfi_candidates.txt",
                tools="gf", needs="output/URLs.txt"),
        "nuclei-lfi":
          guard(f"nuclei -l output/lfi_candidates.txt -tags lfi -silent 2>/dev/null | tee output/lfi_results.txt && echo '[+] Nuclei LFI done'",
                tools="nuclei", needs="output/lfi_candidates.txt"),
        "path-traversal":
          guard(f"cat output/lfi_candidates.txt | qsreplace '../../../../etc/passwd' | while read url; do r=$(curl -sk \"$url\" 2>/dev/null); echo $r | grep -q 'root:x:' && echo \"[VULN] LFI confirmed: $url\"; done | tee output/lfi_confirmed.txt && echo '[+] Path traversal check done'",
                tools=["qsreplace","curl"], needs="output/lfi_candidates.txt"),
      },

      # ── SSRF ───────────────────────────────────────────────────────────────
      "ssrf": {
        "filter-params":
          guard(f"gf ssrf output/URLs.txt 2>/dev/null | sort -u | tee output/ssrf_candidates.txt && echo '[+] SSRF candidates:' && wc -l output/ssrf_candidates.txt",
                tools="gf", needs="output/URLs.txt"),
        "nuclei-ssrf":
          guard(f"nuclei -l output/ssrf_candidates.txt -tags ssrf -silent 2>/dev/null | tee output/ssrf_results.txt && echo '[+] Nuclei SSRF done'",
                tools="nuclei", needs="output/ssrf_candidates.txt"),
      },

      # ── CORS ───────────────────────────────────────────────────────────────
      "cors": {
        "nuclei-cors":
          guard(f"awk '{{print $1}}' output/Alive.txt | nuclei -tags cors -silent 2>/dev/null | tee output/cors_results.txt && echo '[+] Nuclei CORS done'",
                tools="nuclei", needs="output/Alive.txt"),
        "corsy":
          guard(f"awk '{{print $1}}' output/Alive.txt | while read url; do python3 corsy.py -u \"$url\" 2>/dev/null; done | tee output/cors_corsy.txt && echo '[+] Corsy done'",
                needs="output/Alive.txt"),
        "manual":
          guard(f"awk '{{print $1}}' output/Alive.txt | while read url; do result=$(curl -sk -I -H 'Origin: https://evil.com' \"$url\" 2>/dev/null | grep -i 'access-control-allow-origin'); [ -n \"$result\" ] && echo \"[CORS] $url => $result\"; done | tee output/cors_manual.txt && echo '[+] Manual CORS check done'",
                tools="curl", needs="output/Alive.txt"),
      },

      # ── CSRF ───────────────────────────────────────────────────────────────
      "csrf": {
        "nuclei-csrf":
          guard(f"nuclei -l output/Alive.txt -tags csrf -silent 2>/dev/null | tee output/csrf_results.txt && echo '[+] Nuclei CSRF done'",
                tools="nuclei", needs="output/Alive.txt"),
        "form-finder":
          guard(f"awk '{{print $1}}' output/Alive.txt | httpx -silent -mc 200 -ms 'form' -o output/forms.txt 2>/dev/null && echo '[+] Forms found:' && wc -l output/forms.txt",
                tools="httpx", needs="output/Alive.txt"),
      },

      # ── OPEN REDIRECT ──────────────────────────────────────────────────────
      "redirect": {
        "filter-params":
          guard(f"gf redirect output/URLs.txt 2>/dev/null | sort -u | tee output/redirect_candidates.txt && echo '[+] Redirect candidates:' && wc -l output/redirect_candidates.txt",
                tools="gf", needs="output/URLs.txt"),
        "openredirex":
          guard(f"cat output/redirect_candidates.txt | openredirex -c 20 2>/dev/null | tee output/redirect_vulns.txt && echo '[+] OpenRedirex done'",
                tools="openredirex", needs="output/redirect_candidates.txt"),
        "manual":
          guard(f"cat output/redirect_candidates.txt | qsreplace 'https://evil.com' | while read url; do loc=$(curl -sk -I \"$url\" 2>/dev/null | grep -i 'location:'); echo $loc | grep -iq 'evil.com' && echo \"[VULN] Redirect: $url => $loc\"; done | tee output/redirect_confirmed.txt && echo '[+] Manual redirect check done'",
                tools=["qsreplace","curl"], needs="output/redirect_candidates.txt"),
      },

      # ── RCE ────────────────────────────────────────────────────────────────
      "rce": {
        "nuclei-rce":
          guard(f"nuclei -l output/Alive.txt -tags rce,cmdi -severity critical,high -silent 2>/dev/null | tee output/rce_results.txt && echo '[+] Nuclei RCE done'",
                tools="nuclei", needs="output/Alive.txt"),
        "cmd-inject":
          guard(f"gf rce output/URLs.txt 2>/dev/null | qsreplace 'id;id' | while read url; do r=$(curl -sk \"$url\" 2>/dev/null); echo $r | grep -qE 'uid=[0-9]' && echo \"[VULN] CMDi: $url\"; done | tee output/cmdi_confirmed.txt && echo '[+] CMDi check done'",
                tools=["gf","qsreplace","curl"], needs="output/URLs.txt"),
      },

      # ── NUCLEI ─────────────────────────────────────────────────────────────
      "nuclei": {
        "exposures":
          guard(f"nuclei -l output/Alive.txt -t exposures -silent 2>/dev/null | tee output/exposures.txt && echo '[+] Exposures done' && wc -l output/exposures.txt",
                tools="nuclei", needs="output/Alive.txt"),
        "cves":
          guard(f"nuclei -l output/Alive.txt -t cves -severity critical,high -silent 2>/dev/null | tee output/cves.txt && echo '[+] CVE scan done' && wc -l output/cves.txt",
                tools="nuclei", needs="output/Alive.txt"),
        "misconfig":
          guard(f"nuclei -l output/Alive.txt -t misconfiguration -severity critical,high,medium -silent 2>/dev/null | tee output/misconfig.txt && echo '[+] Misconfig done' && wc -l output/misconfig.txt",
                tools="nuclei", needs="output/Alive.txt"),
        "full-http":
          guard(f"nuclei -l output/Alive.txt -t http -severity critical,high,medium -rate-limit 30 -silent 2>/dev/null | tee output/nuclei_all.txt && echo '[+] Full Nuclei done' && wc -l output/nuclei_all.txt",
                tools="nuclei", needs="output/Alive.txt"),
      },
    }

    return cmds.get(module, {}).get(tool,
        f"echo '[!] Tool \"{tool}\" not configured for module \"{module}\"'")

# ─── ROUTES ──────────────────────────────────────────────────────────────────
@app.route("/")
def index(): return render_template("index.html")

@app.route("/api/tools")
def api_tools(): return jsonify(check_tools())

@app.route("/api/models")
def api_models():
    host   = request.args.get("host","http://localhost:11434")
    models = ollama_models(host)
    return jsonify({"models":models,"running":len(models)>0})

@app.route("/api/command", methods=["POST"])
def api_command():
    d = request.json
    return jsonify({"command": build_command(
        d.get("module"), d.get("tool"),
        d.get("target","localhost"), d.get("options",{}))})

@app.route("/api/run", methods=["POST"])
def api_run():
    d   = request.json
    cmd = build_command(d.get("module"), d.get("tool"),
                        d.get("target","localhost"), d.get("options",{}))
    os.makedirs("output", exist_ok=True)

    def generate():
        yield f"data: {json.dumps({'type':'cmd','text':cmd})}\n\n"
        lines = []
        try:
            proc = subprocess.Popen(
                cmd, shell=True, executable="/bin/bash",
                stdout=subprocess.PIPE, stderr=subprocess.STDOUT,
                text=True, bufsize=1)
            for line in proc.stdout:
                line = line.rstrip()
                if not line: continue
                lines.append(line)
                low = line.lower()
                tag = "ok"
                if any(x in low for x in ["[err]","error","failed","not found","not installed","no such","exit 1","command not found"]): tag="err"
                elif any(x in low for x in ["[warn]","warn","caution","skip","empty"]): tag="warn"
                elif any(x in low for x in ["[vuln]","[+]","found","vuln","xss","sqli","cors","inject","critical","high","secret","token","password","leak"]): tag="found"
                elif any(x in low for x in ["[*]","alive","open","running","done"]): tag="info"
                yield f"data: {json.dumps({'type':'line','tag':tag,'text':line,'ts':datetime.now().strftime('%H:%M:%S')})}\n\n"
            proc.wait()
            with open("output/.last_scan.txt","w") as f:
                f.write("\n".join(lines[-500:]))
            yield f"data: {json.dumps({'type':'done','code':proc.returncode,'lines':len(lines)})}\n\n"
        except Exception as e:
            yield f"data: {json.dumps({'type':'err','text':str(e)})}\n\n"

    return Response(stream_with_context(generate()),
                    content_type="text/event-stream",
                    headers={"X-Accel-Buffering":"no","Cache-Control":"no-cache"})

@app.route("/api/agent/analyze", methods=["POST"])
def api_agent_analyze():
    d = request.json
    scan_data = ""
    try:
        with open("output/.last_scan.txt") as f: scan_data = f.read()
    except:
        if os.path.isdir("output"):
            for fn in os.listdir("output"):
                if fn.startswith("."): continue
                try:
                    with open(f"output/{fn}") as f:
                        scan_data += f"\n=== {fn} ===\n" + f.read(2000)
                except: pass
    prompt = (f"Target: {d.get('target','')}\nModule: {d.get('module','')}\n"
              f"Scan output:\n{scan_data[-4000:]}\n\n"
              "Analyze for vulnerabilities, rate severity [CRITICAL/HIGH/MEDIUM/LOW], "
              "suggest 3 next commands.")
    result, err = ollama_chat(prompt, d.get("model","mistral"), d.get("host","http://localhost:11434"))
    return jsonify({"result": result or f"[Error] {err}"})

@app.route("/api/agent/plan", methods=["POST"])
def api_agent_plan():
    d = request.json
    prompt = (f"Target: {d.get('target','')}\n\n"
              "Create a complete bug bounty recon+exploit plan: exact step order, "
              "likely vuln classes, key output files to review.")
    result, err = ollama_chat(prompt, d.get("model","mistral"), d.get("host","http://localhost:11434"))
    return jsonify({"result": result or f"[Error] {err}"})

@app.route("/api/agent/report", methods=["POST"])
def api_agent_report():
    d = request.json
    summary = ""
    if os.path.isdir("output"):
        for fn in sorted(os.listdir("output")):
            if fn.startswith("."): continue
            try:
                with open(f"output/{fn}") as f:
                    c = f.read(1500)
                    if c.strip(): summary += f"\n=== {fn} ===\n{c}\n"
            except: pass
    prompt = (f"Target: {d.get('target','')}\nFindings:\n{summary[:8000]}\n\n"
              "Write a professional bug bounty report: Executive Summary, "
              "findings table (Vuln|Severity|URL|Impact), top 3 PoC curl commands, remediations.")
    result, err = ollama_chat(prompt, d.get("model","mistral"), d.get("host","http://localhost:11434"))
    return jsonify({"result": result or f"[Error] {err}"})

@app.route("/api/agent/test", methods=["POST"])
def api_agent_test():
    d = request.json
    result, err = ollama_chat("Reply exactly with: SIJIL ONLINE",
                              d.get("model","mistral"),
                              d.get("host","http://localhost:11434"))
    return jsonify({"ok":bool(result),"msg":result or err})

@app.route("/api/outputs")
def api_outputs():
    files = []
    if os.path.isdir("output"):
        for f in sorted(os.listdir("output")):
            if f.startswith("."): continue
            fp = os.path.join("output",f)
            if os.path.isfile(fp):
                files.append({"name":f,"size":os.path.getsize(fp),
                               "modified":datetime.fromtimestamp(
                                   os.path.getmtime(fp)).strftime("%H:%M:%S")})
    return jsonify(files)

@app.route("/api/read/<filename>")
def api_read(filename):
    fp = os.path.join("output", filename)
    if not os.path.exists(fp) or ".." in filename:
        return jsonify({"error":"not found"}),404
    with open(fp,"r",errors="replace") as fh:
        return jsonify({"content":fh.read(100000)})

@app.route("/api/stats")
def api_stats():
    stats = {}
    for k,fp in [("subdomains","output/Subs.txt"),("alive","output/Alive.txt"),
                 ("urls","output/URLs.txt"),("xss_vulns","output/xss_vulns.txt"),
                 ("sqli","output/sqli_results.txt"),("nuclei","output/nuclei_all.txt")]:
        try:
            with open(fp) as f: stats[k] = sum(1 for l in f if l.strip())
        except: stats[k] = 0
    return jsonify(stats)

if __name__ == "__main__":
    os.makedirs("output", exist_ok=True)
    print("\n" + "="*52)
    print("  SIJIL AI v4 — Local AI Bug Bounty Agent")
    print("  http://localhost:5000")
    print("  AI: Ollama (free, offline, no API key)")
    print("="*52 + "\n")
    app.run(host="0.0.0.0", port=5000, debug=False, threaded=True)

