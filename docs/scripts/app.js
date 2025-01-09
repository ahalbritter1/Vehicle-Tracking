import axios from "axios";

// Map status to CSS class for styling
const statusSymbolMap = {
  Received: "📦", // Package for "Received"
  "In Transit": "🚚", // Truck for "In Transit"
  Delivered: "✔️", // Check for "Delivered"
};

// DOM Elements
const tableBody = document.getElementById("vehicle-table-body");
const searchInput = document.getElementById("search-input");
const vehicleCount = document.getElementById("vehicle-count"); // Reference to the vehicle count element
let allRows = []; // Store all rows fetched from the backend
let sheetName = ""; // Store the sheet name

// Function to update the vehicle count
function updateVehicleCount(rows) {
  // Count only rows where VIN#, Year, Make, and Model are populated
  const populatedCount = rows.filter((row) => {
    const [vin, year, make, model] = row; // Destructure relevant columns
    return vin && year && make && model; // Check if all key columns are populated
  }).length;

  // Update the count display with the sheet name
  vehicleCount.textContent = `${sheetName} - Vehicles: ${populatedCount}`;
}

// Function to populate the table with rows
function populateTable(rows = []) {
  tableBody.innerHTML = "";
  updateVehicleCount(rows);

  rows.forEach((row) => {
    const [
      vin, // Column A
      year, // Column B
      make, // Column C
      model, // Column D
      pickup, // Column E
      delivery, // Column F
      pickupDateEstimate, // Column G
      deliveryDateEstimate, // Column H
      status, // Column I (Update: Corrected for Status)
    ] = row;

    if (!vin || !year || !make || !model) {
      return; // Skip rows with missing key data
    }

    // Updated Status Logic
    let displayStatus = "Received"; // Default to "Received"
    if (status === "P") {
      displayStatus = "In Transit";
    } else if (status === "D") {
      displayStatus = "Delivered";
    }

    console.log("Row data:", row);
    console.log("Parsed status:", status);

    const tableRow = document.createElement("tr");
    tableRow.innerHTML = `
    <td>${vin}</td>
    <td>${year}</td>
    <td>${make}</td>
    <td>${model}</td>
    <td>${pickup || ""}</td>
    <td>${delivery || ""}</td>
    <td>${pickupDateEstimate || ""}</td>
    <td>${deliveryDateEstimate || ""}</td>
    <td>
      <span class="status-circle ${
        statusSymbolMap[displayStatus] || ""
      } ${displayStatus}}"></span>
      ${statusSymbolMap[displayStatus] || ""} ${displayStatus}
    </td>
    `;
    tableBody.appendChild(tableRow);
  });
}

// Fetch data from backend
async function fetchAndPopulateTable() {
  try {
    const response = await axios.get(
      "https://vehicle-tracking-3.onrender.com/api/data"
    );
    sheetName = response.data.sheetName; // Store the sheet name
    allRows = response.data.rows; // Store all rows for filtering
    populateTable(allRows); // Populate the table with all rows initially
  } catch (error) {
    console.error("Error fetching data:", error);
  }
}

// Function to filter rows based on the search query
function filterRows(query) {
  const filteredRows = allRows.filter((row) => {
    const vin = row[0]; // VIN# is the first column
    return vin && vin.toLowerCase().includes(query.toLowerCase());
  });

  populateTable(filteredRows);
}

// Event listener for search input
searchInput.addEventListener("input", (e) => {
  const query = e.target.value;
  filterRows(query);
});

// Fetch and populate the table when the page loads
fetchAndPopulateTable();
