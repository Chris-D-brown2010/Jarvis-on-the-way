# 📱➡️🌍 Deploy AI BOS Using ONLY Your Phone

Goal: turn your app into a live link like `https://ai-bos.onrender.com` that works
on your phone with full **"Jarvis" voice** — all done from your phone's browser.

You'll use **2 free websites**: GitHub (stores the code) and Render (runs it + gives HTTPS).
No coding. About **10–15 minutes.**

---

## ✅ BEFORE YOU START
Download the ready-made zip from your workspace:
> **`aibos-deploy.zip`**  (it has everything, nothing extra)

Tap it → **Download** → it lands in your phone's **Downloads** folder. That's all you need.

---

## STEP 1 — Make a GitHub account & empty project (3 min)

1. In your phone browser go to **github.com** → **Sign up** (free). Verify your email.
2. After signing in, tap the **+** at the top-right → **New repository**.
3. Name it: **`ai-bos`**
4. Choose **Public**.
5. Tap **Create repository**.

You now have an empty project. Keep this page open.

---

## STEP 2 — Get the code into GitHub (the phone-friendly way)

Phones can't drag-drop a folder, so we use **GitHub's web upload**, which accepts a zip's *contents*. The simplest reliable method on mobile:

### Option A — Use the GitHub website upload (works, a bit fiddly)
1. First, **unzip** `aibos-deploy.zip` on your phone:
   - Open your **Files** app → Downloads → tap `aibos-deploy.zip` → **Extract / Unzip**.
   - You'll get a folder named **`aibos`** with `server`, `public`, `package.json`, etc. inside.
2. Back on your repo page, tap **"uploading an existing file"** (or **Add file → Upload files**).
3. Tap **choose your files** and select the files **inside** the `aibos` folder.
   - 📌 Select `package.json`, `package-lock.json`, `render.yaml`, `Dockerfile`, and the `server` and `public` folders.
   - On some phones you must enter each folder and pick its files. If folders won't upload, use **Option B** below — it's much easier on mobile.
4. Tap **Commit changes**.

### Option B — EASIEST on a phone: GitHub's import (recommended) 🟢
If uploading files one-by-one is annoying on your phone, do this instead:
1. On a computer (even briefly) or using the **GitHub mobile app**, it's far easier to drag the folder in.
2. **OR** ask me: *"put my code on a public GitHub repo for me to import"* — I can give you a single repo link you simply **Fork/Import** in one tap (no file juggling). See the note at the bottom. ⬇️

> 💡 Most people find the **GitHub mobile app** (free, Play Store) the smoothest way to upload from a phone — install it, sign in, open your `ai-bos` repo, and add files there.

---

## STEP 3 — Deploy on Render (5 min, gives HTTPS)

1. In your phone browser go to **render.com** → **Get Started** → **Sign in with GitHub** (one tap, lets them read your repos).
2. On the dashboard tap **New +** → **Web Service**.
3. Find **`ai-bos`** in the list → tap **Connect**.
4. Render reads the included `render.yaml` and fills the settings in. Just confirm:
   - **Language/Runtime:** Node
   - **Build Command:** `npm install`
   - **Start Command:** `npm start`
   - **Instance Type:** **Free**
5. Tap **Create Web Service**.
6. Wait 2–4 minutes (logs scroll by). When it shows **"Live"**, your link appears at the top:
   ```
   https://ai-bos.onrender.com
   ```

🎉 Your app is online!

---

## STEP 4 — Use it + voice on your phone 📲

1. Open your new link in **Chrome** on your phone.
2. Sign in → **demo@aibos.app** / **demo1234**
3. Tap the **🎙️ mic button** → tap **Allow** for the microphone.
4. Say **"Jarvis"** → wait for the beep → speak a command → it replies out loud! 🔊
5. Make it an app icon: Chrome **⋮ menu → Add to Home screen / Install app**.

---

## ⚠️ Notes
- **First open after idle is slow** (~30–50s) on Render's free plan — it "sleeps" when unused. Normal. ($7/mo keeps it awake if you ever want.)
- **Voice needs HTTPS** — that's exactly why we host it. (Your home Wi-Fi `http://` address won't allow phone voice; this online link will.)
- **To update later:** change files in your GitHub repo → Render auto-redeploys.

---

## 🙋 Stuck on the upload step?
Uploading folders from a phone to GitHub is the only tricky part. If it fights you:
- Tell me **"I'm stuck on the GitHub upload"** and I'll walk you through the **GitHub mobile app** method screen-by-screen, **or**
- I can prepare the project so you only need to tap **"Import/Fork"** once. Just ask.
```
```
