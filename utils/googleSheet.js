const { google } = require("googleapis");

async function appendToGoogleSheet(sheetId, data, credentials) {
  const auth = new google.auth.JWT(
    credentials.client_email,
    null,
    credentials.private_key.replace(/\\n/g, '\n'),
    ["https://www.googleapis.com/auth/spreadsheets"]
  );

  const sheets = google.sheets({ version: "v4", auth });

  try {
    const response = await sheets.spreadsheets.values.append({
      spreadsheetId: sheetId,
      range: "Sheet1!A1",
      valueInputOption: "RAW",
      insertDataOption: "INSERT_ROWS",
      requestBody: {
        values: [data]
      }
    });
    return response.data;
  } catch (err) {
    console.error("Lỗi khi ghi vào Google Sheet:", err);
    throw err;
  }
}

module.exports = { appendToGoogleSheet };
