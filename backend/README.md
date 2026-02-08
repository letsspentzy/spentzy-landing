# Waitlist duplicate check (Python backend)

This small Flask app reads your Google Sheet and returns whether an email is already on the waitlist. Use it instead of the Apps Script so the check is reliable.

## One-time setup

1. **Google Cloud**
   - Go to [Google Cloud Console](https://console.cloud.google.com/) → create or select a project.
   - **APIs & Services** → **Enable APIs** → enable **Google Sheets API**.
   - **APIs & Services** → **Credentials** → **Create credentials** → **API key**. Copy the key.

2. **Sheet**
   - Open your response spreadsheet → **Share** → set to **“Anyone with the link” can view**.

3. **Env vars** (for local or your host)
   - `GOOGLE_API_KEY` = the API key from step 1  
   - `SPREADSHEET_ID` = the ID from the sheet URL (`.../d/THIS_PART/edit`)  
   - Optional: `SPREADSHEET_RANGE` = e.g. `Form responses 1!A:Z` if your tab name is different.

## Run locally

```bash
cd backend
pip install -r requirements.txt
export GOOGLE_API_KEY="your-key"
export SPREADSHEET_ID="1jnJ72okrrvj9ijGVP5yYMdQfDqz_0byZ0xg1QWAZeZU"
flask --app app run --port 5001
```

(Use 5001 to avoid conflict with macOS AirPlay on 5000.) Then open `http://localhost:5001/check?email=test@test.com` to test.

## Deploy (e.g. Railway, Render, Fly.io)

- Set `GOOGLE_API_KEY` and `SPREADSHEET_ID` in the host’s env.
- Point the app at `app:app` (or `app.app`) and expose the port.
- Your backend URL will be something like `https://your-app.railway.app` (or similar).
- In `index.html`, set `WAITLIST_CHECK_URL` to `https://your-app.railway.app/check` (no trailing slash).

## API

- **GET /check?email=...**  
  Returns `{ "onList": true }` or `{ "onList": false }`.  
  Used by the landing page before submitting the form.

- **GET /health**  
  Returns `{ "ok": true }` for liveness checks.
