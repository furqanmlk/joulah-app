# Google Apps Script Setup for Editing Sheets

## Step 1: Create the Apps Script

1. Open your Google Sheet: https://docs.google.com/spreadsheets/d/1wELnopZrABn6xx_6bdGBwGzJ7yMhMlRoUqOvyb2zyNc/edit

2. Click **Extensions** → **Apps Script**

3. Delete any existing code and paste this:

```javascript
function doGet(e) {
  try {
    const sheetGid = e.parameter.sheetGid;
    const rowIndex = parseInt(e.parameter.rowIndex); // 0-based index (excluding header)
    const rowData = JSON.parse(e.parameter.rowData);
    
    if (!sheetGid || rowIndex === undefined || !rowData) {
      return ContentService.createTextOutput(
        '<h1>Error</h1><p>Missing required parameters</p>'
      ).setMimeType(ContentService.MimeType.HTML);
    }
    
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    
    // Get sheet by GID
    let sheet = null;
    const sheets = ss.getSheets();
    for (let i = 0; i < sheets.length; i++) {
      if (sheets[i].getSheetId().toString() === sheetGid.toString()) {
        sheet = sheets[i];
        break;
      }
    }
    
    if (!sheet) {
      return ContentService.createTextOutput(
        '<h1>Error</h1><p>Sheet not found with GID: ' + sheetGid + '</p>'
      ).setMimeType(ContentService.MimeType.HTML);
    }
    
    // Row index + 2 because: +1 for header, +1 for 0-based to 1-based
    const actualRowNumber = rowIndex + 2;
    
    // Update the row
    const range = sheet.getRange(actualRowNumber, 1, 1, rowData.length);
    range.setValues([rowData]);
    
    return ContentService.createTextOutput(
      '<h1>✅ Success!</h1>' +
      '<p>Row ' + actualRowNumber + ' updated in sheet: <strong>' + sheet.getName() + '</strong></p>' +
      '<p>This window will close automatically...</p>' +
      '<script>setTimeout(() => window.close(), 2000)</script>'
    ).setMimeType(ContentService.MimeType.HTML);
    
  } catch (error) {
    return ContentService.createTextOutput(
      '<h1>❌ Error</h1><p>' + error.toString() + '</p>'
    ).setMimeType(ContentService.MimeType.HTML);
  }
}

function doPost(e) {
  // Redirect POST to GET handler
  return doGet(e);
}
```

4. Click **Save** (💾 icon) and name it "Sheet Editor"

## Step 2: Deploy as Web App

1. Click **Deploy** → **New deployment**

2. Click the gear icon ⚙️ next to "Select type" and choose **Web app**

3. Configure:
   - **Description**: "Sheet Editor API"
   - **Execute as**: Me (your email)
   - **Who has access**: Anyone

4. Click **Deploy**

5. Click **Authorize access**
   - Choose your Google account
   - Click **Advanced** → **Go to Sheet Editor (unsafe)**
   - Click **Allow**

6. **COPY THE WEB APP URL** - it looks like:
   ```
   https://script.google.com/macros/s/XXXXX.../exec
   ```

## Step 3: Update Your React App

I'll update the code with a placeholder for the URL. You'll paste your actual URL there.

## That's it!

Once deployed, your React app will be able to save changes back to Google Sheets! 🎉
