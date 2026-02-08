# Waitlist duplicate check (Google Apps Script)

This script reads your **response spreadsheet** to see if an email is already on the waitlist.

## One-time setup

1. **Get your spreadsheet ID**  
   Open the spreadsheet where your form responses go (Form → Responses → "Link to Sheets" if needed).  
   From the URL `https://docs.google.com/spreadsheets/d/XXXXXXXXXX/edit` copy the middle part: **XXXXXXXXXX**.

2. Go to [script.google.com](https://script.google.com) → open your project (or New project).
3. Open `Code.gs` and set **SPREADSHEET_ID** at the top:
   ```javascript
   var SPREADSHEET_ID = 'XXXXXXXXXX';   // your actual ID
   ```
4. Save (Ctrl/Cmd+S).
5. **Deploy** → **Manage deployments** → pencil (Edit) → **Version** → **New version** → **Deploy**.

The script reads the first sheet, finds the column whose header contains "email", and checks every row.

---

## Server-side: auto-remove duplicate rows (recommended)

So duplicates never stick even if the web check fails (e.g. cache, wrong deployment):

1. Open your **response spreadsheet** (the one that receives form responses).
2. **Extensions → Apps Script.** Delete any default code.
3. Paste the contents of **OnFormSubmit-removeDuplicates.gs** from this folder. Save.
4. Click the **clock icon (Triggers)** → **+ Add Trigger**:
   - Function: **onFormSubmit**
   - Event: **From spreadsheet** → **On form submit**
   - Save and authorize when asked.

When someone submits the form, the script runs. If that email already exists in an earlier row, the new row is **deleted**. Your sheet stays free of duplicates no matter what.
