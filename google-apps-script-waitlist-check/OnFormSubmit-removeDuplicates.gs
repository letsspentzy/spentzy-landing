/**
 * REMOVE DUPLICATES WHEN FORM IS SUBMITTED
 * Install this in your RESPONSE SPREADSHEET (not the standalone web app project).
 *
 * 1. Open your response spreadsheet:
 *    https://docs.google.com/spreadsheets/d/1jnJ72okrrvj9ijGVP5yYMdQfDqz_0byZ0xg1QWAZeZU/edit
 * 2. Extensions → Apps Script
 * 3. Delete any default code and paste this entire file. Save.
 * 4. Click the clock icon (Triggers) → + Add Trigger:
 *    - Choose function: onFormSubmit
 *    - Event: From spreadsheet → On form submit
 *    - Save, authorize when asked
 *
 * When someone submits the form, this runs. If the email is already in the sheet
 * (in an earlier row), the new row is deleted so duplicates never stay.
 */

var EMAIL_COLUMN = 2; // B = 2 (Timestamp=1, email=2)

function onFormSubmit(e) {
  if (!e || !e.range) return;
  var sheet = e.range.getSheet();
  var newRow = e.range.getRow();
  if (newRow < 2) return; // header is row 1
  var values = e.values; // [Timestamp, email, ...]
  if (!values || values.length < EMAIL_COLUMN) return;
  var newEmail = (values[EMAIL_COLUMN - 1] || '').toString().trim().toLowerCase();
  if (!newEmail) return;

  var data = sheet.getRange(2, EMAIL_COLUMN, newRow - 1, EMAIL_COLUMN).getValues();
  for (var i = 0; i < data.length; i++) {
    var existing = (data[i][0] || '').toString().trim().toLowerCase();
    if (existing === newEmail) {
      sheet.deleteRow(newRow);
      return;
    }
  }
}
