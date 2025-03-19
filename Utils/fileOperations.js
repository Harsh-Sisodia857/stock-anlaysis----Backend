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

const getAllMutualFunds = async (mutualFundKey) => {
  let fileData = readFromCache("mutualFunds.json");
  if (!fileData) {
    console.log("FILE DOES NOT EXIST IN STORAGE");

    fileData = await downloadFileFromS3(mutualFundKey);
    writeToCache(fileData, "mutualFunds.json");
  }

  return fileData;
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
  try {
    const filePath = getCacheFilePath(fileName);
    const dirPath = path.dirname(filePath);

    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath, { recursive: true });
    }

    // Ensure data is properly formatted
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), "utf-8");
  } catch (error) {
    console.error(`Error writing to cache: ${error.message}`);
  }
};

function getFileDataByField(field, fileData, value) {
  if (typeof fileData === "string") {
    fileData = JSON.parse(fileData);
  }
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

  stocks = stocks.filter(
    (stock) => stock.ticker.toLowerCase() !== ticker.toLowerCase()
  );

  if (stocks.length < initialLength) {
    writeToCache(stocks, "stocks.json");
    console.log(`Stock with ticker ${ticker} has been deleted.`);
  } else {
    console.log(`Stock with ticker ${ticker} not found.`);
  }

  return stocks;
};

const deleteMutualFund = async (schemeName, mutualFundKey) => {
  try {
    let fileData = await getAllMutualFunds(mutualFundKey);

    if (!fileData) {
      console.log("No mutual fund data found.");
      return;
    }

    if (typeof fileData === "string") {
      fileData = JSON.parse(fileData);
    }

    if (!Array.isArray(fileData)) {
      console.log("Invalid mutual fund data format.");
      return;
    }

    let mutualFund = fileData;
    const initialLength = mutualFund.length;

    // Filter only valid objects and match names safely
    mutualFund = mutualFund.filter(
      (mf) =>
        mf?.scheme_name &&
        mf.scheme_name.toLowerCase() !== schemeName.toLowerCase()
    );

    if (mutualFund.length < initialLength) {
      writeToCache(JSON.stringify(mutualFund), "mutualFunds.json");
      console.log(
        `Mutual Fund with scheme name ${schemeName} has been deleted.`
      );
      return mutualFund;
    }
    console.log(`Mutual Fund with scheme name ${schemeName} not found.`);
    return null
    
    
  } catch (error) {
    console.error("Error deleting mutual fund:", error);
  }
};
const updateMutualFund = async (schemeName, updatedFields, mutualFundKey) => {
  try {
    let fileData = await getAllMutualFunds(mutualFundKey);

    if (!fileData) {
      console.log("No mutual fund data found.");
      return null;
    }

    if (typeof fileData === "string") {
      fileData = JSON.parse(fileData);
    }

    if (!Array.isArray(fileData)) {
      console.log("Invalid mutual fund data format.");
      return null;
    }

    let mutualFundUpdated = false;

    let mutualFund = fileData.map((mf) => {
      if (
        mf?.scheme_name &&
        mf.scheme_name.toLowerCase() === schemeName.toLowerCase()
      ) {
        mutualFundUpdated = true;
        return { ...mf, ...updatedFields }; // Merge updated fields
      }
      return mf;
    });

    if (mutualFundUpdated) {
      await writeToCache(JSON.stringify(mutualFund), "mutualFunds.json");
      console.log(
        `Mutual Fund with scheme name ${schemeName} has been updated.`
      );
      return mutualFund;
    } else {
      console.log(`Mutual Fund with scheme name ${schemeName} not found.`);
      return null;
    }
  } catch (error) {
    console.error("Error updating mutual fund:", error);
    return null;
  }
};

const updateStockByTicker = async (ticker, updatedFields) => {
  let stocks = await getAllStock();
  const stockIndex = stocks.findIndex(
    (stock) => stock.ticker.toLowerCase() === ticker.toLowerCase()
  );

  if (stockIndex !== -1) {
    stocks[stockIndex] = { ...stocks[stockIndex], ...updatedFields };
    console.log(`Stock with ticker ${ticker} has been updated.`);
    writeToCache(stocks, "stocks.json");
    return stocks[stockIndex]; // Return updated stock
  } else {
    console.log(`Stock with ticker ${ticker} not found.`);
    return null;
  }
};

const deleteFile = (filePath) => {
  fs.unlink(filePath, (err) => {
    if (err) {
      console.error(`Error deleting file ${filePath}:`, err);
    } else {
      console.log(`File deleted: ${filePath}`);
    }
  });
};

module.exports = {
  updateStockByTicker,
  deleteStockByTicker,
  getFileDataByField,
  readFromCache,
  writeToCache,
  getAllStock,
  getAllMutualFunds,
  deleteMutualFund,
  updateMutualFund,
  getCacheFilePath,
  deleteFile
};
