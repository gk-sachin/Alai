/**
 * Vidai review portal — decision logging backend.
 *
 * SETUP:
 * 1. Create a Google Sheet with a tab named "Decisions" and this header row:
 *      ClientName | Comparison | Decision | Comment | Timestamp
 * 2. In the Sheet: Extensions > Apps Script. Delete any starter code and
 *    paste this whole file in.
 * 3. Replace SHEET_ID below with your Sheet's ID (the long string in its URL,
 *    between /d/ and /edit).
 * 4. Deploy > New deployment > select type "Web app".
 *      - Execute as: Me
 *      - Who has access: Anyone
 * 5. Copy the deployment URL (ends in /exec) and paste it into
 *    CONFIG.appsScriptUrl in index.html.
 */

const SHEET_ID = "PASTE_YOUR_GOOGLE_SHEET_ID_HERE";
const SHEET_NAME = "Decisions";

function getSheet_() {
  return SpreadsheetApp.openById(SHEET_ID).getSheetByName(SHEET_NAME);
}

// Records or updates a decision. Same client + same comparison = update in place.
function doPost(e) {
  const data = JSON.parse(e.postData.contents);
  const sheet = getSheet_();
  const rows = sheet.getDataRange().getValues();

  let rowIndex = -1;
  for (let i = 1; i < rows.length; i++) {
    if (rows[i][0] === data.clientName && rows[i][1] === data.comparison) {
      rowIndex = i + 1; // 1-based, +1 for header
      break;
    }
  }

  const rowData = [data.clientName, data.comparison, data.decision, data.comment || "", new Date()];

  if (rowIndex > -1) {
    sheet.getRange(rowIndex, 1, 1, 5).setValues([rowData]);
  } else {
    sheet.appendRow(rowData);
  }

  return ContentService
    .createTextOutput(JSON.stringify({ status: "ok" }))
    .setMimeType(ContentService.MimeType.JSON);
}

// Returns all saved decisions for a given client name, so the portal can
// resume where they left off.
function doGet(e) {
  const clientName = e.parameter.clientName || "";
  const sheet = getSheet_();
  const rows = sheet.getDataRange().getValues();
  const result = [];

  for (let i = 1; i < rows.length; i++) {
    if (rows[i][0] === clientName) {
      result.push({
        comparison: rows[i][1],
        decision: rows[i][2],
        comment: rows[i][3]
      });
    }
  }

  return ContentService
    .createTextOutput(JSON.stringify(result))
    .setMimeType(ContentService.MimeType.JSON);
}
