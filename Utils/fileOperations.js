const fs = require("fs");
const path = require("path");
const { downloadFileFromS3 } = require("../Config/fileDownload");

async function getAllStock() {
  const stockKey = process.env.STOCK_KEY;
  let fileData = readFromCache("stocks.json");
  if (!fileData) {
    console.log("FILE DOES NOT EXIST IN STORAGE");
    // If no cache, fetch stock data from S3 and cache it
    fileData = await downloadFileFromS3(stockKey);
    writeToCache(fileData, "stocks.json");
  }
  return fileData;
}

const getStockByTicker = async (ticker) => {
  const stocks = await getAllStock();
  return stocks.find((stock) => stock.ticker.toLowerCase() === ticker.toLowerCase()) || null;
};

// Utility function to get file path for cache
const getCacheFilePath = (fileName) =>
  path.join(__dirname, "../Cache", fileName);

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
  fileData = JSON.parse(fileData);
  // Ensure stocks is an array
  if (!Array.isArray(fileData)) {
    console.error("Stocks is not an array!");
    return null;
  }

  // Find the stock by either name or ticker
  const data = fileData.find(
    (stock) => stock[field]?.toLowerCase() === value.toLowerCase()
  );
  return data || null; // If not found, return null
}

const deleteStockByTicker = async (ticker) => {
  let stocks = await getAllStock();
  const initialLength = stocks.length;

  stocks = stocks.filter((stock) => stock.ticker.toLowerCase() !== ticker.toLowerCase());

  if (stocks.length < initialLength) {
    writeToCache(stocks,"stocks.json")
    console.log(`Stock with ticker ${ticker} has been deleted.`);
  } else {
    console.log(`Stock with ticker ${ticker} not found.`);
  }

  return stocks;
};


const updateStockByTicker = async (ticker, updatedFields) => {
  let stocks = await getAllStock();
  const stockIndex = stocks.findIndex((stock) => stock.ticker.toLowerCase() === ticker.toLowerCase());

  if (stockIndex !== -1) {
    stocks[stockIndex] = { ...stocks[stockIndex], ...updatedFields };
    console.log(`Stock with ticker ${ticker} has been updated.`);
    writeToCache(stocks, "stocks.json")
    return stocks[stockIndex]; // Return updated stock
  } else {
    console.log(`Stock with ticker ${ticker} not found.`);
    return null;
  }
};


module.exports = {
  updateStockByTicker,
  deleteStockByTicker,
  getFileDataByField,
  readFromCache,
  writeToCache,
  getAllStock,
};
