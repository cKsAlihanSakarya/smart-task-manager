# TaskAI — AI-Powered Smart Task Manager

Developed by Alihan Sakarya | Üsküdar University | Software Engineering 2026

---

## Requirements

Before running the project, install the following:

- Node.js (v18 or higher) → https://nodejs.org
- Ollama → https://ollama.com

---

## Setup

### Step 1 — Download the Mistral AI Model
Open terminal and run:
ollama pull mistral
This will download the AI model (~4GB). Wait for it to complete.

### Step 2 — Install Backend Dependencies
cd backend
npm install

### Step 3 — Install Frontend Dependencies
cd frontend
npm install

---

## Running the Application

You need two terminals open at the same time.

Terminal 1 — Backend:
cd backend
node server.js
You should see: Sunucu 3000 portunda çalışıyor...

Terminal 2 — Frontend:
cd frontend
npm start
The application will open automatically at http://localhost:3001

---

## Using the Application

1. Open http://localhost:3001 in your browser
2. Click Sign Up to create a new account
3. Log in with your credentials
4. Start adding tasks on the Dashboard
5. The AI suggestion will appear automatically after adding tasks

---

## Features

- Dashboard — Task management with AI-powered prioritization suggestions
- Daily Tasks — Recurring daily habits with streak tracking
- Calendar — Visual deadline overview
- Statistics — Productivity charts with AI weekly analysis
- Settings — Tag management and AI toggle

---

## Tech Stack

- Frontend: React, React Router DOM, Axios
- Backend: Node.js, Express.js
- Database: SQLite (better-sqlite3)
- AI: Ollama + Mistral model (runs locally)
- Version Control: Git, GitHub