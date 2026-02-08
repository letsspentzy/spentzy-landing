"""
Waitlist duplicate check: reads your Google Sheet and returns whether an email is already on the list.

Set env vars:
  GOOGLE_API_KEY   - from Google Cloud Console (Sheets API enabled)
  SPREADSHEET_ID   - your response sheet ID (from the sheet URL)
  SPREADSHEET_RANGE - optional, e.g. "Form responses 1!A:Z" (default: first sheet, cols A–Z)

Share the sheet: "Anyone with the link can view".
"""

import json
import os
import re
import urllib.request
from urllib.parse import quote

from flask import Flask, request, jsonify

app = Flask(__name__)

SPREADSHEET_ID = os.environ.get("SPREADSHEET_ID", "").strip()
GOOGLE_API_KEY = os.environ.get("GOOGLE_API_KEY", "").strip()
SPREADSHEET_RANGE = (os.environ.get("SPREADSHEET_RANGE", "").strip() or "").strip() or None


def _api_get(path, params=None):
    if not SPREADSHEET_ID or not GOOGLE_API_KEY:
        return None, "missing config"
    params = params or {}
    params["key"] = GOOGLE_API_KEY
    q = "&".join(f"{k}={quote(str(v))}" for k, v in params.items())
    url = f"https://sheets.googleapis.com/v4/spreadsheets/{SPREADSHEET_ID}{path}?{q}"
    try:
        req = urllib.request.Request(url)
        with urllib.request.urlopen(req, timeout=15) as resp:
            return json.loads(resp.read().decode()), None
    except urllib.error.HTTPError as e:
        return None, f"API {e.code}"
    except Exception as e:
        return None, str(e)


def _get_first_sheet_name():
    data, err = _api_get("", {"fields": "sheets.properties.title"})
    if err or not data or "sheets" not in data or not data["sheets"]:
        return None
    return data["sheets"][0]["properties"].get("title")


def fetch_sheet_values():
    range_ = SPREADSHEET_RANGE
    if not range_:
        first = _get_first_sheet_name()
        if not first:
            return None, "no sheet"
        range_ = f"{first}!A:Z"
    data, err = _api_get(f"/values/{quote(range_, safe='')}")
    if err:
        return None, err
    if not data or "values" not in data:
        return None, "no values"
    return data, None


def email_on_list(email):
    if not email:
        return False, None
    email = email.strip().lower()
    if not re.match(r"[^@]+@[^@]+\.[^@]+", email):
        return False, None
    result, err = fetch_sheet_values()
    if err or not result:
        return None, err or "could not read sheet"
    rows = result.get("values") or []
    if not rows:
        return False, None
    headers = [str(h).strip().lower() for h in rows[0]]
    col = -1
    for i, h in enumerate(headers):
        if "email" in h:
            col = i
            break
    if col < 0:
        return None, "no email column"
    for row in rows[1:]:
        if col < len(row) and row[col]:
            if str(row[col]).strip().lower() == email:
                return True, None
    return False, None


@app.after_request
def cors(resp):
    resp.headers["Access-Control-Allow-Origin"] = "*"
    return resp


@app.route("/check")
def check():
    email = request.args.get("email", "").strip()
    on_list, err = email_on_list(email) if email else (False, None)
    if err is not None:
        return jsonify({"onList": False, "error": err}), 503
    return jsonify({"onList": on_list})


@app.route("/health")
def health():
    return jsonify({"ok": True})
