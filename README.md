# PentAI — Building the future of offensive security with AI 🇲🇦

AI-Powered Security Automation Platform Designed to Streamline Reconnaissance, Vulnerability Discovery, Pentesting Operations, and Offensive Security Workflows for Ethical Hackers, Red Teamers, Security Researchers, and Bug Bounty Hunters through Intelligent Local AI Agents and Automated Cybersecurity Analysis.

---

##  Quick Start

```bash
git clone https:https://github.com/Rizki033/Autonomous-pentester
cd PentAI
chmod +x run.sh
./run.sh
```

Open: **http://localhost:5000**

---

##  Features

###  Recon
- Subdomain Enumeration (subfinder, amass, assetfinder, findomain, chaos, puredns, dnsx)
- Alive Check (httpx)
- URL Discovery (gau, waybackurls, katana, hakrawler, gospider, paramspider)
- Directory Bruteforce (ffuf, feroxbuster, gobuster, dirsearch)
- Port Scanning (nmap, naabu, masscan)
- Parameter Discovery (arjun, x8)
- JS & Secret Hunting (trufflehog, gitleaks, bfac)

###  Vulnerability Testing
- XSS — Cross-Site Scripting
- SQLi — SQL Injection
- LFI / Path Traversal
- SSRF — Server-Side Request Forgery
- SSTI — Server-Side Template Injection
- CORS Misconfiguration
- CSRF
- Open Redirect
- RCE / Command Injection
- Nuclei Full Scan (CVEs, Exposures, Misconfigs)

###  AI Agent (Local — 100% Free)
- Powered by Ollama 
- Analyze scan output and detect vulnerabilities automatically
- Generate full recon plans for any target
- Write professional bug bounty reports
- Works completely offline after first model download

---

### Requirements
- Python 3.8+
- Linux

### Install Dependencies

```bash
sudo apt update
sudo apt install -y git python3 python3-pip nmap ffuf gobuster sqlmap
pip3 install flask
```

### Install Recon Tools

```bash
# ProjectDiscovery tools
sudo apt install -y subfinder httpx-toolkit nuclei naabu katana dnsx

# Go tools
go install github.com/tomnomnom/assetfinder@latest
go install github.com/tomnomnom/waybackurls@latest
go install github.com/tomnomnom/gf@latest
go install github.com/tomnomnom/qsreplace@latest
go install github.com/tomnomnom/anew@latest
go install github.com/lc/gau/v2/cmd/gau@latest
go install github.com/hakluke/hakrawler@latest
go install github.com/hahwul/dalfox/v2@latest
go install github.com/s0md3v/uro@latest

# Wordlists
sudo apt install -y seclists
```

### Install AI Agent

```bash
# Install Ollama
curl -fsSL https://ollama.com/install.sh | sh

# Pull a model (one time download)
ollama pull mistral
```

---

##  Output Structure

```
output/
 ├── Subs_raw.txt        # All subdomains 
 ├── Subs.txt            # Unique subdomains
 ├── Alive.txt           # Live hosts
 ├── Alive200.txt        # 200-OK hosts only
 ├── URLs_raw.txt        # All discovered URLs
 ├── URLs.txt            # Unique filtered URLs
 ├── ports.txt           # Open ports
 ├── params_found.txt    # Discovered parameters
 ├── xss_vulns.txt       # Confirmed XSS
 ├── sqli_results.txt    # SQLi findings
 ├── nuclei_all.txt      # Nuclei findings
 └── ...
```

---

##  Workflow

```
1. Subdomain Enumeration  →  output/Subs.txt
2. Alive Check            →  output/Alive.txt
3. URL Discovery          →  output/URLs.txt
4. Vulnerability Testing  →  output/xss_vulns.txt, sqli_results.txt ...
5. Nuclei Full Scan       →  output/nuclei_all.txt
6. AI Agent Analysis      →  Report
```

