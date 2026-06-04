# 💻 Build & Run AI BOS on Your Laptop

You have two goals you can do here. Most people do **A first**, then **B** when ready.

> **A — Run it on your laptop** (test everything, including voice, in 5 minutes)
> **B — Put it online** (free HTTPS link so "Jarvis" voice works on your phone too)

Login is always: **demo@aibos.app** / **demo1234**

---

# 📥 First: get the files onto your laptop

1. Download **`aibos-deploy.zip`** from your workspace.
2. **Unzip it.**
   - **Windows:** right-click the zip → **Extract All** → Extract.
   - **Mac:** double-click the zip.
3. You now have a folder called **`aibos`** with `server`, `public`, `package.json`, etc. inside. Put it somewhere easy, like your Desktop.

---

# 🅰️ Run it on your laptop (5 min)

### 1. Install Node.js (one time, free)
Go to **https://nodejs.org** → click the big green **LTS** button → run the installer (keep clicking Next).

### 2. Start the app
- **Windows:** open the `aibos` folder, double-click **`START-HERE-Windows.bat`**
- **Mac:** open the `aibos` folder, double-click **`START-HERE.command`**
  - *(If Mac blocks it: right-click → Open → Open.)*

A window opens, sets things up the first time, and your browser opens the app automatically. 🎉

### 3. Try the voice
Click the **🎙️ button** (top-right) → **Allow** the microphone → say **"Jarvis"** → speak a command → it talks back. 🔊

> ✅ Voice works fully on your laptop in **Chrome** because `localhost` is treated as secure.
> 📱 To use voice on your **phone**, you need the online link → do part **B** below.

---

# 🅱️ Put it online (free, for phone voice) — ~10 min

This gives you a link like `https://ai-bos.onrender.com` that works anywhere.
You'll use **GitHub** (stores code) + **Render** (runs it + free HTTPS).

## Step 1 — Put the code on GitHub
**Easiest on a laptop — install GitHub Desktop (no commands):**
1. Get **GitHub Desktop**: https://desktop.github.com → install → sign in (create a free GitHub account if needed).
2. In GitHub Desktop: **File → Add Local Repository** → choose your `aibos` folder.
   - If it says "this isn't a Git repository," click **"create a repository"** → **Create Repository**.
3. Click **Publish repository** (top-right).
   - Name: `ai-bos` · keep it **Public** (simplest) · **Publish**.

Your code is now on GitHub. ✅

> 💡 Prefer the command line? In the `aibos` folder run:
> ```
> git init
> git add .
> git commit -m "AI BOS"
> ```
> then create an empty `ai-bos` repo on github.com and follow its "push an existing repository" lines.

## Step 2 — Deploy on Render
1. Go to **https://render.com** → **Get Started** → **Sign in with GitHub** (one click).
2. Dashboard → **New +** → **Web Service**.
3. Find **`ai-bos`** → **Connect**.
4. Render reads the included `render.yaml` and fills settings in. Confirm:
   - Runtime: **Node** · Build: `npm install` · Start: `npm start` · Plan: **Free**
5. Click **Create Web Service** → wait 2–4 min until it says **"Live"**.
6. Your link appears at the top, e.g. `https://ai-bos.onrender.com`. 🚀

## Step 3 — Use it on your phone 📲
1. Open the link in your phone's **Chrome** → sign in.
2. Tap **🎙️** → **Allow** mic → say **"Jarvis"** → command → it replies aloud. 🔊
3. Chrome **⋮ menu → Install app / Add to Home screen** for an app icon.

---

# ⚙️ Quick reference

| What | How |
|------|-----|
| Start app on laptop | double-click `START-HERE-...` |
| Stop app | close the black/terminal window |
| Restart later | double-click the launcher again (no reinstall) |
| Login | demo@aibos.app / demo1234 |
| Change wake word/voice | in app → **Security & Privacy → 🎙️ Voice Assistant** |
| Update online version | change files in GitHub → Render auto-redeploys |

> ⚠️ Render's **free plan sleeps** after 15 min idle, so the first visit after a while takes ~30–50s to wake. Normal.

---

## 🙋 Need help?
Tell me which step + what you see on screen (e.g. "GitHub Desktop says no repository") and I'll guide you click-by-click. I can also:
- **Wire in a real AI brain** (OpenAI/Claude/Gemini) so Jarvis gives real answers.
- **Build a true Android APK** with Capacitor once it's online.
