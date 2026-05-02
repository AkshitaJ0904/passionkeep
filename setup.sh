#!/bin/bash

# ============================================
# PassionKeep - Mac Setup Script
# ============================================

set -e

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
RED='\033[0;31m'
NC='\033[0m'

echo ""
echo -e "${CYAN}╔══════════════════════════════════════╗${NC}"
echo -e "${CYAN}║     🌟 PassionKeep Setup Script      ║${NC}"
echo -e "${CYAN}╚══════════════════════════════════════╝${NC}"
echo ""

# ---- Check Node ----
echo -e "${YELLOW}[1/6] Checking Node.js...${NC}"
if ! command -v node &> /dev/null; then
  echo -e "${RED}Node.js not found! Install from https://nodejs.org (v18+)${NC}"
  exit 1
fi
NODE_VER=$(node -v)
echo -e "${GREEN}✓ Node.js $NODE_VER found${NC}"

# ---- Check MongoDB ----
echo -e "${YELLOW}[2/6] Checking MongoDB...${NC}"
if ! command -v mongod &> /dev/null; then
  echo -e "${YELLOW}MongoDB not found. Installing via Homebrew...${NC}"
  if ! command -v brew &> /dev/null; then
    echo -e "${RED}Homebrew not found. Install from https://brew.sh${NC}"
    echo -e "${YELLOW}Or use MongoDB Atlas (free cloud DB) — see README.md${NC}"
  else
    brew tap mongodb/brew
    brew install mongodb-community@7.0
    brew services start mongodb-community@7.0
    echo -e "${GREEN}✓ MongoDB installed and started${NC}"
  fi
else
  echo -e "${GREEN}✓ MongoDB found${NC}"
  # Start MongoDB if not running
  if ! pgrep -x mongod > /dev/null; then
    echo -e "${YELLOW}Starting MongoDB...${NC}"
    brew services start mongodb-community@7.0 2>/dev/null || mongod --fork --logpath /tmp/mongod.log
  fi
fi

# ---- Install backend deps ----
echo -e "${YELLOW}[3/6] Installing backend dependencies...${NC}"
cd backend
npm install --silent
echo -e "${GREEN}✓ Backend dependencies installed${NC}"
cd ..

# ---- Install frontend deps ----
echo -e "${YELLOW}[4/6] Installing frontend dependencies...${NC}"
cd frontend
npm install --silent
echo -e "${GREEN}✓ Frontend dependencies installed${NC}"
cd ..

# ---- Check .env ----
echo -e "${YELLOW}[5/6] Checking environment files...${NC}"
if [ ! -f "backend/.env" ]; then
  cp backend/.env.example backend/.env 2>/dev/null || true
fi

# Check GROQ key
if grep -q "YOUR_GROQ_API_KEY_HERE" backend/.env 2>/dev/null; then
  echo ""
  echo -e "${RED}⚠️  GROQ API KEY NOT SET!${NC}"
  echo -e "${YELLOW}   Get your free key at: https://console.groq.com${NC}"
  echo -e "${YELLOW}   Then edit: backend/.env${NC}"
  echo -e "${YELLOW}   Replace: GROQ_API_KEY=YOUR_GROQ_API_KEY_HERE${NC}"
  echo -e "${YELLOW}   With:    GROQ_API_KEY=gsk_your_actual_key_here${NC}"
  echo ""
fi
echo -e "${GREEN}✓ Environment files checked${NC}"

echo -e "${YELLOW}[6/6] Setup complete!${NC}"
echo ""
echo -e "${CYAN}════════════════════════════════════════${NC}"
echo -e "${GREEN}✅ PassionKeep is ready to run!${NC}"
echo ""
echo -e "  Run the app:  ${CYAN}npm run dev${NC}"
echo -e "  Backend:      ${CYAN}http://localhost:5000${NC}"
echo -e "  Frontend:     ${CYAN}http://localhost:3000${NC}"
echo -e "${CYAN}════════════════════════════════════════${NC}"
echo ""
