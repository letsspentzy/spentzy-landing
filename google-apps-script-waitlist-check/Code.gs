/**
 * Waitlist duplicate check - reads emails from your response spreadsheet.
 *
 * 1. Open the spreadsheet where your form responses go (Responses tab → "Link to Sheets").
 * 2. Copy the spreadsheet ID from the URL:
 *    https://docs.google.com/spreadsheets/d/THIS_PART_IS_THE_ID/edit
 * 3. Paste it below as SPREADSHEET_ID (inside the quotes).
 * 4. Save, then Deploy → Manage deployments → Edit → New version → Deploy.
 */

var SPREADSHEET_ID = '1jnJ72okrrvj9ijGVP5yYMdQfDqz_0byZ0xg1QWAZeZU';

function doGet(e) {
  var email = e.parameter && e.parameter.email;
  if (!email || typeof email !== 'string') {
    return jsonResponse({ onList: false });
  }
  email = email.trim().toLowerCase();

  if (!SPREADSHEET_ID || SPREADSHEET_ID === 'PASTE_YOUR_SPREADSHEET_ID_HERE') {
    return jsonResponse({ onList: false });
  }

  try {
    var ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    var sheet = ss.getSheets()[0];
    var lastRow = sheet.getLastRow();
    if (lastRow < 2) return jsonResponse({ onList: false });
    var headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
    var colIndex = -1;
    for (var c = 0; c < headers.length; c++) {
      var h = (headers[c] != null ? headers[c].toString() : '').trim().toLowerCase();
      if (h.indexOf('email') !== -1) {
        colIndex = c + 1;
        break;
      }
    }
    if (colIndex < 1) return jsonResponse({ onList: false });
    var emailCol = sheet.getRange(2, colIndex, lastRow, colIndex).getValues();
    for (var r = 0; r < emailCol.length; r++) {
      var cell = emailCol[r][0];
      if (cell != null && cell !== '') {
        if (cell.toString().trim().toLowerCase() === email) {
          return jsonResponse({ onList: true });
        }
      }
    }
    return jsonResponse({ onList: false });
  } catch (err) {
    return jsonResponse({ onList: false });
  }
}

function jsonResponse(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}
