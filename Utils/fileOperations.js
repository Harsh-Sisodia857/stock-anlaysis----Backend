const fs = require("fs");
const path = require("path");

// Utility function to get file path for cache
const getCacheFilePath = (fileName) => path.join(__dirname, "../Cache", fileName);

const readFromCache = (fileName) => {
  const filePath = getCacheFilePath(fileName);
  if (fs.existsSync(filePath)) {
    return JSON.parse(fs.readFileSync(filePath, "utf-8")); // Read and parse the JSON file
  }
  return null; // If file doesn't exist, return null
};

const writeToCache = (data, fileName) => {
  const filePath = getCacheFilePath(fileName);
  const dirPath = path.dirname(filePath);
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true }); // Creating the directory if it doesn't exist
  }
  fs.writeFileSync(filePath, JSON.stringify(data), "utf-8"); // Write data to file
};

function getFileDataByField(field, fileData, value) {
  fileData = JSON.parse(fileData)
  // Ensure stocks is an array
  if (!Array.isArray(fileData)) {
    console.error('Stocks is not an array!');
    return null;
  }

  // Find the stock by either name or ticker
  const data = fileData.find(stock => stock[field]?.toLowerCase() === value.toLowerCase());
  return data || null;  // If not found, return null
}

function deleteStockByTicker(ticker) {
  const stockIndex = stocks.findIndex(
    (stock) => stock.ticker.toLowerCase() === ticker.toLowerCase()
  );

  if (stockIndex !== -1) {
    // Remove stock from array
    stocks.splice(stockIndex, 1);
    console.log(`Stock with ticker ${ticker} has been deleted.`);
  } else {
    console.log(`Stock with ticker ${ticker} not found.`);
  }
}

function updateStockByTicker(ticker, updatedFields) {
  const stock = getStockByTicker(ticker);

  if (stock) {
    // Update the stock fields with the provided updatedFields object
    Object.assign(stock, updatedFields);
    console.log(`Stock with ticker ${ticker} has been updated.`);
  } else {
    console.log(`Stock with ticker ${ticker} not found.`);
  }
}

module.exports = {
  updateStockByTicker,
  deleteStockByTicker,
  getFileDataByField,
  readFromCache,
  writeToCache,
};
