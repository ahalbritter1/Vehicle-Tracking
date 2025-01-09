const express = require("express");
const { google } = require("googleapis");
const cors = require("cors");

const app = express();
const port = 3000;

// Load environment variables from .env file
require("dotenv").config();

// Enable CORS
app.use(cors());

// Google Sheets API setup
const auth = new google.auth.GoogleAuth({
  scopes: ["https://www.googleapis.com/auth/spreadsheets.readonly"],
});

// Replace with your Google Sheet ID
const spreadsheetId = process.env.SPREADSHEET_ID;

// API route to fetch data from the first sheet dynamically
app.get("/api/data", async (req, res) => {
  try {
    const client = await auth.getClient();
    const sheets = google.sheets({ version: "v4", auth: client });

    // Get metadata for all sheets
    const metadataResponse = await sheets.spreadsheets.get({
      spreadsheetId,
      auth: client,
    });

    // Get the first sheet's name
    const firstSheetName =
      metadataResponse.data.sheets?.[0]?.properties?.title || "Unknown Sheet";
    console.log("First sheet name:", firstSheetName);

    // Fetch data from the first sheet
    const dataResponse = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: `${firstSheetName}!A2:I1000`, // Adjust range based on your columns
      auth: client,
    });

    // Return the sheet data as JSON along with the sheet name
    res.json({
      sheetName: firstSheetName,
      rows: dataResponse.data.values || [], // Ensure rows defaults to an empty array
    });
  } catch (error) {
    console.error("Error fetching data:", error);
    res.status(500).send("Failed to fetch data from Google Sheets.");
  }
});

// Root route for basic API info
app.get("/", (req, res) => {
  res.send(
    "Welcome to the Vehicle Transport Tracker API! Use /api/data to fetch data."
  );
});

// Start the server
app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});
