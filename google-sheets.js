const { google } = require("googleapis");

async function appendToGoogleSheet(sheetId, dataRow, credentials) {
  const auth = new google.auth.JWT(
    credentials.client_email,
    null,
    credentials.private_key.replace(/\\n/g, '\n'),
    ["https://www.googleapis.com/auth/spreadsheets"]
  );

  const sheets = google.sheets({ version: "v4", auth });

  try {
    // Lấy số dòng hiện có trong Sheet (dùng để tính STT)
    const readRes = await sheets.spreadsheets.values.get({
      spreadsheetId: sheetId,
      range: "A:A", // Cột STT
    });

    const existingRows = readRes.data.values || [];
    const stt = existingRows.length; // Dòng tiêu đề là dòng 1, STT bắt đầu từ 1

    const newRow = [stt, ...dataRow]; // Thêm STT vào đầu dòng dữ liệu

    const response = await sheets.spreadsheets.values.append({
      spreadsheetId: sheetId,
      range: "A1",
      valueInputOption: "USER_ENTERED",
      insertDataOption: "INSERT_ROWS",
      requestBody: {
        values: [newRow],
      },
    });

    return response.data;
  } catch (err) {
    console.error("❌ Lỗi khi ghi vào Google Sheet:", err);
    throw err;
  }
}

module.exports = { appendToGoogleSheet };
