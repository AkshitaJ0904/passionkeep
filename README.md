# 🌟 PassionKeep

**Protect the joy of what you love.**

PassionKeep is a full-stack web app that helps passionate people — photographers, artists, dancers, writers, and musicians — track their creative sessions, monitor burnout risk, and get personalized AI coaching through Groq's LLaMA 3.3 70B model.

---

## 🎨 Features

- **Passion-specific animated UI** — each passion (photography, art, dancing, writing, music) gets a fully unique canvas-animated background that deepens as you scroll
- **Session logging** — track joy, stress, energy, mood, duration, and reflections
- **AI-powered insights** — Groq (LLaMA 3.3 70B) generates personalized session insights and weekly reflections
- **Burnout detection** — real-time pattern analysis with recovery suggestions
- **Ambient sound** — Web Audio API generates passion-specific soundscapes
- **Beautiful statistics** — visual charts for joy/stress trends, burnout distribution
- **Journal view** — filter, search, and browse all your sessions

---

## 📁 Project Structure

```
passionkeep/
├── frontend/          # React + TypeScript app
│   ├── src/
│   │   ├── components/
│   │   │   ├── backgrounds/   # Animated canvas backgrounds per passion
│   │   │   ├── dashboard/     # Stats, AI insights, journal
│   │   │   └── session/       # Session form and cards
│   │   ├── pages/             # AuthPage, Dashboard
│   │   ├── store/             # Zustand global state + API calls
│   │   └── styles/            # Global CSS with CSS variables
│   └── public/
├── backend/           # Node.js + Express + MongoDB
│   ├── models/        # User, Session schemas
│   ├── routes/        # auth, sessions, ai, user
│   └── middleware/    # JWT auth
├── setup.sh           # One-click Mac setup
├── package.json       # Root with concurrently
└── README.md
```

---

## ⚡ Quick Start (Mac M4 / VS Code)

### Prerequisites
- Node.js v18+ → https://nodejs.org
- MongoDB Community → installed automatically by setup.sh if you have Homebrew
- VS Code → https://code.visualstudio.com

---

### Step 1 — Get your FREE Groq API Key

1. Go to **https://console.groq.com**
2. Sign up (free, no credit card)
3. Click **API Keys** → **Create API Key**
4. Copy your key (starts with `gsk_...`)

---

### Step 2 — Run Setup

Open Terminal in VS Code (`Ctrl+`` `) and run:

```bash
# 1. Enter the project folder
cd passionkeep

# 2. Run the setup script (installs all deps + checks MongoDB)
chmod +x setup.sh
./setup.sh

# 3. Add your Groq API key
#    Open: backend/.env
#    Change: GROQ_API_KEY=YOUR_GROQ_API_KEY_HERE
#    To:     GROQ_API_KEY=gsk_xxxxxxxxxxxxxxxxxxxx
```

---

### Step 3 — Start the App

```bash
# Start both backend (port 5000) and frontend (port 3000) simultaneously
npm run dev
```

Then open **http://localhost:3000** in your browser 🎉

---

### Alternative: Start Each Separately

```bash
# Terminal 1 — Backend
cd backend
npm run dev

# Terminal 2 — Frontend
cd frontend
npm start
```

---

## 🔑 Where to Add Groq API Key

**File:** `backend/.env`

```env
GROQ_API_KEY=gsk_your_key_here
```

**Model used:** `llama-3.3-70b-versatile` — Groq's fastest and most capable free model. It handles all three AI features:
- Per-session insights (after logging a session)
- Weekly reflection letters
- Burnout risk analysis with recovery tips

---

## 🗄️ Database Setup

### Option A — Local MongoDB (default)

```bash
# Install MongoDB via Homebrew
brew tap mongodb/brew
brew install mongodb-community@7.0

# Start MongoDB
brew services start mongodb-community@7.0

# Verify it's running
mongosh --eval "db.adminCommand('ping')"
```

The app will auto-create the `passionkeep` database and collections on first run.

### Option B — MongoDB Atlas (Free Cloud DB, recommended for deployment)

1. Go to **https://cloud.mongodb.com**
2. Create a free cluster (M0 — always free)
3. Click **Connect** → **Drivers** → copy the connection string
4. Paste it in `backend/.env`:

```env
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/passionkeep?retryWrites=true&w=majority
```

---

## 🚀 Deployment

### Deploy Backend to Render (Free)

1. Push to GitHub:
```bash
git init
git add .
git commit -m "Initial commit"
gh repo create passionkeep --public --push
```

2. Go to **https://render.com** → New → Web Service
3. Connect your GitHub repo
4. Settings:
   - **Root Directory:** `backend`
   - **Build Command:** `npm install`
   - **Start Command:** `node server.js`
5. Add Environment Variables:
   ```
   NODE_ENV=production
   MONGODB_URI=<your Atlas connection string>
   JWT_SECRET=<a long random string>
   GROQ_API_KEY=<your Groq key>
   FRONTEND_URL=<your Vercel URL>
   ```
6. Click **Deploy** — you'll get a URL like `https://passionkeep-api.onrender.com`

---

### Deploy Frontend to Vercel (Free)

1. Go to **https://vercel.com** → New Project
2. Import your GitHub repo
3. Settings:
   - **Framework:** Create React App
   - **Root Directory:** `frontend`
4. Add Environment Variable:
   ```
   REACT_APP_API_URL=https://passionkeep-api.onrender.com/api
   ```
5. Click **Deploy** — you'll get a URL like `https://passionkeep.vercel.app`

6. Go back to **Render** and update `FRONTEND_URL` to your Vercel URL

---

## 🔧 VS Code Tips

Install these extensions for the best dev experience:
- **ES7+ React/Redux/React-Native snippets**
- **Tailwind CSS IntelliSense** (not used but useful)
- **MongoDB for VS Code** — browse your DB directly in VS Code
- **Thunder Client** — test your API endpoints

---

## 📡 API Endpoints

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/auth/register` | No | Register with passion selection |
| POST | `/api/auth/login` | No | Login |
| GET | `/api/auth/me` | Yes | Get current user |
| POST | `/api/sessions` | Yes | Create session |
| GET | `/api/sessions` | Yes | Get all sessions |
| GET | `/api/sessions/stats` | Yes | Get stats & trends |
| DELETE | `/api/sessions/:id` | Yes | Delete session |
| POST | `/api/ai/insight` | Yes | Get AI session insight |
| GET | `/api/ai/weekly-report` | Yes | Get weekly AI report |
| POST | `/api/ai/burnout-check` | Yes | Get burnout analysis |

---

## 🎭 The 5 Passions & Their UI

| Passion | Background | Color | Sound |
|---------|-----------|-------|-------|
| 📸 Photography | Night city with bokeh & buildings | Cyan `#00d4ff` | City hum |
| 🎨 Art | Paint drips, brush strokes, color blobs | Orange `#ff6b35` | Brush strokes |
| 💃 Dancing | Aurora waves, stage spotlights, ribbons | Purple `#c77dff` | Rhythm beats |
| ✍️ Writing | Library shelves, floating words, ink | Blue `#58a6ff` | Fireplace noise |
| 🎵 Music | Equalizer bars, vinyl record, music notes | Green `#00ff88` | Musical chords |

The background **deepens as you scroll** — more atmosphere the further you go.

---

## 🛠️ Troubleshooting

**Port 3000 already in use:**
```bash
lsof -ti:3000 | xargs kill
```

**Port 5000 already in use:**
```bash
lsof -ti:5000 | xargs kill
```

**MongoDB connection error:**
```bash
brew services restart mongodb-community@7.0
```

**Groq API not working:**
- Check your key is correct in `backend/.env`
- Check Groq console for usage/errors: https://console.groq.com
- The app gracefully falls back to a default message if Groq is unavailable

**Frontend can't connect to backend:**
- Make sure backend is running on port 5000
- Check `frontend/.env` has `REACT_APP_API_URL=http://localhost:5000/api`

---

## 📊 Survey Data Insights Used

Based on 200 real responses collected for this project:
- 84.4% of users are students
- 63.3% started their passion "to achieve something big"
- 46.7% now find their passion "sometimes stressful"
- 40% say "external expectations" changed the most over time
- 76.7% feel guilty when they take a break
- 37.9% think "I'm not good enough" when burnt out

These insights directly inspired PassionKeep's features.

---

## 👥 Team

Built with ❤️ by Group 3

---

*"When my passion became something I had to prove instead of something I loved to do."*
— Survey respondent, PassionKeep 2024
