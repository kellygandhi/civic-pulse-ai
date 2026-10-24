# Production Deployment Guide: CivicPulse AI

This guide shows you how to deploy the entire unified **CivicPulse AI** platform to the cloud with a public HTTPS URL.

---

## 🎯 Option 1: 1-Click Deploy to Render.com (Recommended - Free Tier)

Render can build the multi-stage `Dockerfile` directly from your GitHub repository.

### Step 1: Initialize Git and Push to GitHub
Open your terminal in `C:\Users\DELL\.gemini\antigravity\scratch\civic-pulse` and run:
```bash
git init
git add .
git commit -m "Initial CivicPulse AI Startup release"
git branch -M main
```
Create a new repository on [GitHub](https://github.com/new) (e.g. `civic-pulse-ai`), then push:
```bash
git remote add origin https://github.com/YOUR_USERNAME/civic-pulse-ai.git
git push -u origin main
```

### Step 2: Deploy on Render
1. Go to [Render.com](https://render.com) and sign in.
2. Click **New +** $\rightarrow$ **Web Service**.
3. Select **Build and deploy from a Git repository** and connect your `civic-pulse-ai` repo.
4. Render will automatically detect the [`Dockerfile`](./Dockerfile) and [`render.yaml`](./render.yaml).
5. (Optional) In **Environment Variables**, add:
   - `GEMINI_API_KEY`: *(Your key if you want live Google Gemini LLM reasoning)*
6. Click **Create Web Service**.

Within 2-3 minutes, Render builds the React frontend and Python backend, and gives you a live public URL:  
`https://civic-pulse-ai.onrender.com` 🚀

---

## 🚂 Option 2: Deploy to Railway.app

1. Go to [Railway.app](https://railway.app) and click **Start a New Project**.
2. Select **Deploy from GitHub repo** and choose your repository.
3. Railway detects the `Dockerfile` automatically.
4. Go to **Settings** $\rightarrow$ **Generate Domain** to get your public HTTPS URL.

---

## 🐳 Option 3: Deploy with Docker on Any VPS (AWS / DigitalOcean / Linode)

To run on any Ubuntu/Linux cloud server:

```bash
# Clone your repo
git clone https://github.com/YOUR_USERNAME/civic-pulse-ai.git
cd civic-pulse-ai

# Build Docker container
docker build -t civic-pulse .

# Run container on port 80 (HTTP)
docker run -d --name civic-pulse -p 80:8000 --restart always civic-pulse
```
Your platform is now live on your server's public IP address!

---

## ⚙️ Environment Variables Summary

| Variable | Required? | Description |
| :--- | :--- | :--- |
| `PORT` | Auto-set | Port on which the FastAPI server listens (default: `8000`) |
| `GEMINI_API_KEY` | Optional | Google Gemini API key for live multimodal vision. If omitted, the platform uses its built-in offline civic heuristics engine. |
