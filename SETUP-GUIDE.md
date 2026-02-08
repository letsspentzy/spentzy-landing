# Spentzy waitlist – full setup guide

Follow these steps in order. You’ll: get a Google API key, share your sheet, run the Python backend (locally or deployed), then point the landing page at it.

---

## Step 1: Google Cloud – create API key

1. Go to **https://console.cloud.google.com/**
2. Sign in with the same Google account that owns your waitlist spreadsheet.
3. At the top, click the project dropdown → **New project** → name it (e.g. “Spentzy”) → **Create**.
4. Make sure that project is selected (top bar).
5. Open **APIs & Services** → **Library** (left menu).
6. Search for **“Google Sheets API”** → open it → **Enable**.
7. Go to **APIs & Services** → **Credentials** → **+ Create credentials** → **API key**.
8. Copy the key (e.g. `AIza...`). You can close the dialog; you can also **Edit** the key later to restrict it (optional: “HTTP referrers” with your site URL).
9. **Save the key somewhere safe** – you’ll use it as `GOOGLE_API_KEY`.

---

## Step 2: Share your response spreadsheet

1. Open your waitlist response sheet:  
   **https://docs.google.com/spreadsheets/d/1jnJ72okrrvj9ijGVP5yYMdQfDqz_0byZ0xg1QWAZeZU/edit**
2. Click **Share** (top right).
3. Under “General access”, change **Restricted** to **“Anyone with the link”** and set to **Viewer**.
4. Click **Done**.

The Python backend will read this sheet using the API key; it only needs view access.

---

## Step 3: Python backend – run it

### Option A: Run on your computer (for testing)

1. Open **Terminal** (Mac) or Command Prompt.
2. Go to the project folder and into `backend`:
   ```bash
   cd /Users/maxgoldenberg/Downloads/MaxDev/Spentzy/spentzy-landing/backend
   ```
3. Create a virtual environment and install dependencies (one-time):
   ```bash
   python3 -m venv venv
   source venv/bin/activate
   pip install -r requirements.txt
   ```
   (On Windows: `venv\Scripts\activate` instead of `source venv/bin/activate`.)
4. Set your API key and spreadsheet ID (replace `YOUR_API_KEY` with the key from Step 1):
   ```bash
   export GOOGLE_API_KEY="YOUR_API_KEY"
   export SPREADSHEET_ID="1jnJ72okrrvj9ijGVP5yYMdQfDqz_0byZ0xg1QWAZeZU"
   ```
5. Start the app:
   ```bash
   flask --app app run --port 5001
   ```
   (We use 5001 because macOS often uses 5000 for AirPlay and can return 403.)
6. In the browser open: **http://localhost:5001/check?email=max@max.com**  
   You should see something like `{"onList":true}` or `{"onList":false}`.  
   Leave this terminal open while testing.

### Option B: Deploy online (Railway – free tier)

1. Go to **https://railway.app** and sign in (e.g. with GitHub).
2. **New project** → **Deploy from GitHub repo**. Connect GitHub if needed, then choose the repo that contains `spentzy-landing` (or upload the project; see Railway docs).
3. In Railway **Settings** for the service, set **Root Directory** to `backend` (so it sees `app.py`, `requirements.txt`, and `Procfile`). If your repo root is already the `backend` folder, leave this blank.
4. In the project, open **Variables** and add:
   - `GOOGLE_API_KEY` = your API key from Step 1  
   - `SPREADSHEET_ID` = `1jnJ72okrrvj9ijGVP5yYMdQfDqz_0byZ0xg1QWAZeZU`
5. Under **Settings** → **Networking** → **Generate domain**. Note the URL (e.g. `https://spentzy-landing-production.up.railway.app`).
6. Your check URL is: **that URL + `/check`**, e.g.  
   `https://spentzy-landing-production.up.railway.app/check`

If you use **Render** or **Fly.io** instead, same idea: deploy the `backend` folder, set the two env vars, and use the URL they give you + `/check`.

---

## Step 4: Point the landing page at the backend

1. Open **index.html** in your editor.
2. Find this line (around line 122):
   ```javascript
   var WAITLIST_CHECK_URL = '';
   ```
3. Set it to your backend’s check URL:
   - **Local testing:**  
     `var WAITLIST_CHECK_URL = 'http://localhost:5001/check';`
   - **Deployed (e.g. Railway):**  
     `var WAITLIST_CHECK_URL = 'https://your-app.up.railway.app/check';`  
     (Use the real URL from Step 3B, with `/check` at the end, no trailing slash.)
4. Save **index.html**.

---

## Step 5: Test the full flow

1. Open your landing page (locally or deployed).
2. Enter an email that’s **already** in your sheet (e.g. `max@max.com`) and click **Join the waitlist**.  
   You should see: **“You’re already on the waitlist!”** and the form should **not** submit.
3. Enter an email that’s **not** in the sheet and submit.  
   You should see **“Thanks for joining the waitlist!”** and the new row should appear in the sheet.
4. Submit the same new email again.  
   You should again see **“You’re already on the waitlist!”**.

If anything doesn’t match this, check: API key and spreadsheet ID in the backend, sheet shared as “Anyone with the link”, and `WAITLIST_CHECK_URL` in **index.html** (correct URL + `/check`).

---

## Checklist

- [ ] Google Cloud project created, Sheets API enabled, API key copied  
- [ ] Response spreadsheet shared: “Anyone with the link” can view  
- [ ] Backend running (local or deployed) with `GOOGLE_API_KEY` and `SPREADSHEET_ID` set  
- [ ] `index.html` has `WAITLIST_CHECK_URL` set to your backend URL + `/check`  
- [ ] Test: existing email → “You’re already on the waitlist!”  
- [ ] Test: new email → “Thanks for joining” and row in sheet  
- [ ] Test: same new email again → “You’re already on the waitlist!”

---

## Production: deploy and publish

1. **Deploy the backend** (e.g. Railway, Render, Fly.io).
   - Connect the repo (or push `backend/` so the host can build it).
   - Set **Root directory** to `backend` so the host sees `app.py`, `requirements.txt`, `Procfile`.
   - In the host’s **Variables** (env), set:
     - `GOOGLE_API_KEY` = your Google API key  
     - `SPREADSHEET_ID` = `1jnJ72okrrvj9ijGVP5yYMdQfDqz_0byZ0xg1QWAZeZU`
   - Deploy and copy the app URL (e.g. `https://spentzy-waitlist.up.railway.app`).

2. **Point the landing page at the backend**
   - In **index.html**, set:
     ```javascript
     var WAITLIST_CHECK_URL = 'https://YOUR-BACKEND-URL/check';
     ```
     (Replace `YOUR-BACKEND-URL` with the URL from step 1, no trailing slash.)

3. **Commit and push**
   - Do **not** commit `.env` or any file containing your API key (`.gitignore` is set for that).
   - Commit and push:
     ```bash
     git add .
     git status   # confirm no .env or secrets
     git commit -m "Production: waitlist with duplicate check"
     git push origin main
     ```

4. **Deploy the landing page**
   - If you use **GitHub Pages**: push to `main` and the site updates from the repo (Settings → Pages).
   - If you use **Vercel / Netlify**: connect the repo; the site deploys on push. Your live site will call the backend URL you set in `index.html`.
