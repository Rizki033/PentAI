#!/bin/bash

RED='\033[0;31m'; GRN='\033[0;32m'; YLW='\033[1;33m'
CYN='\033[0;36m'; MAG='\033[0;35m'; BLD='\033[1m'; NC='\033[0m'

clear
echo -e "${GRN}${BLD}"
cat << 'BANNER'
██████╗ ███████╗███╗   ██╗████████╗ █████╗ ██╗
██╔══██╗██╔════╝████╗  ██║╚══██╔══╝██╔══██╗██║
██████╔╝█████╗  ██╔██╗ ██║   ██║   ███████║██║
██╔═══╝ ██╔══╝  ██║╚██╗██║   ██║   ██╔══██║██║
██║     ███████╗██║ ╚████║   ██║   ██║  ██║██║
╚═╝     ╚══════╝╚═╝  ╚═══╝   ╚═╝   ╚═╝  ╚═╝╚═╝

                ╔═══════════════════════╗
                ║  created by 0xRizki   ║
                ╚═══════════════════════╝
BANNER
echo -e "${NC}${MAG}  PentAI  — Building the future of offensive security with AI${NC}"
echo -e "${NC}${MAG}  github : https://github.com/Rizki033${NC}"
echo ""

#================================================================================
# ****************************** Python check ***********************************
#================================================================================

if ! command -v python3 &>/dev/null; then
  echo -e "${RED}[✗] Python3 not found${NC}"
  echo "    sudo apt install python3 python3-pip"
  exit 1
fi
echo -e "${GRN}[✓] Python3 $(python3 --version 2>&1 | cut -d' ' -f2)${NC}"

#=================================================================================
# ****************************** Flask ********************************************
#==================================================================================

echo -e "${YLW}[~] Installing Flask...${NC}"
pip3 install flask --break-system-packages -q 2>/dev/null || \
pip3 install flask -q 2>/dev/null || pip install flask -q 2>/dev/null
if python3 -c "import flask" &>/dev/null; then
  echo -e "${GRN}[✓] Flask ready${NC}"
else
  echo -e "${RED}[✗] Flask install failed — try: pip3 install flask${NC}"; exit 1
fi

#=================================================================================
# ****************************** Ollama install **********************************
#=================================================================================

echo ""
echo -e "${CYN}[~] Checking Ollama (local AI engine)...${NC}"
if ! command -v ollama &>/dev/null; then
  echo -e "${YLW}[~] Ollama not found — installing now...${NC}"
  if curl -fsSL https://ollama.com/install.sh | sh 2>/dev/null; then
    echo -e "${GRN}[✓] Ollama installed${NC}"
  else
    echo -e "${RED}[✗] Ollama auto-install failed${NC}"
    echo "    Manual install: curl -fsSL https://ollama.com/install.sh | sh"
    echo "    Or visit: https://ollama.com"
    echo ""
    echo -e "${YLW}    Continuing without Ollama (AI features disabled)...${NC}"
  fi
else
  echo -e "${GRN}[✓] Ollama $(ollama --version 2>&1 | head -1)${NC}"
fi

#================================================================================
# *********************************** Start Ollama ******************************
#================================================================================

if command -v ollama &>/dev/null; then
  if ! curl -s http://localhost:11434/api/tags &>/dev/null; then
    echo -e "${YLW}[~] Starting Ollama service...${NC}"
    ollama serve > /tmp/ollama.log 2>&1 &
    OLLAMA_PID=$!
    sleep 4
    if curl -s http://localhost:11434/api/tags &>/dev/null; then
      echo -e "${GRN}[✓] Ollama service running (PID $OLLAMA_PID)${NC}"
    else
      echo -e "${YLW}[!] Ollama service starting (may take a few more seconds)${NC}"
    fi
  else
    echo -e "${GRN}[✓] Ollama service already running${NC}"
  fi

#=====================================================================================
#*********************************  Pull  model ************************************
#=====================================================================================

  echo ""
  echo -e "${CYN}[~] Checking AI models...${NC}"
  MODELS=$(ollama list 2>/dev/null | grep -v NAME | awk '{print $1}')
  if [ -z "$MODELS" ]; then
    echo -e "${YLW}[~] No models found — downloading mistral (~4GB)...${NC}"
    echo -e "${YLW}    This is a one-time download. After this, works completely offline.${NC}"
    ollama pull mistral
    if [ $? -eq 0 ]; then
      echo -e "${GRN}[✓] Mistral ready — AI agent enabled${NC}"
    else
      echo -e "${RED}[!] Model download failed — check internet connection${NC}"
      echo -e "${YLW}    Run manually: ollama pull mistral${NC}"
    fi
  else
    echo -e "${GRN}[✓] Models available:${NC}"
    ollama list 2>/dev/null | grep -v NAME | awk '{printf "    • %s\n", $1}'
  fi
fi

#=========================================================================================
#***************************** Output directory ******************************************
#=========================================================================================

mkdir -p output
echo ""
echo -e "${GRN}[✓] output/ directory ready${NC}"

#==========================================================================================
#************************** Tool check summary ********************************************
#==========================================================================================

echo ""
echo -e "${CYN}[~] Checking recon tools...${NC}"
TOOLS=(subfinder amass assetfinder httpx waybackurls gau katana
       hakrawler ffuf feroxbuster naabu nmap nuclei dalfox sqlmap
       ghauri gf kxss trufflehog gitleaks arjun)
FOUND=0; MISSING=()
for t in "${TOOLS[@]}"; do
  if command -v "$t" &>/dev/null; then ((FOUND++))
  else MISSING+=("$t"); fi
done
echo -e "${GRN}[✓] $FOUND/${#TOOLS[@]} tools installed${NC}"
if [ ${#MISSING[@]} -gt 0 ] && [ ${#MISSING[@]} -le 8 ]; then
  echo -e "${YLW}[!] Missing: ${MISSING[*]}${NC}"
fi

#=========================================================================================
#********************************* Quick install guide ***********************************
#=========================================================================================

if [ ${#MISSING[@]} -gt 5 ]; then
  echo ""
  echo -e "${YLW}[!] Many tools missing. Quick install:${NC}"
  echo -e "    ${CYN}sudo apt install -y subfinder amass httpx-toolkit nuclei naabu ffuf nmap sqlmap${NC}"
  echo -e "    ${CYN}go install github.com/hahwul/dalfox/v2@latest${NC}"
  echo -e "    ${CYN}go install github.com/tomnomnom/gf@latest${NC}"
fi


echo ""
echo -e "${GRN}${BLD}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GRN}${BLD}  ▶  PentAI running at http://localhost:5000${NC}"
echo -e "${GRN}${BLD}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${MAG}  AI: Ollama ${NC}"
echo -e "${CYN}  Results saved to: ./output/${NC}"
echo -e "${YLW}  Press Ctrl+C to stop${NC}"
echo ""

python3 main.py
