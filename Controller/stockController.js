const { downloadFileFromS3 } = require("../Config/fileDownload");
const {
  writeToCache,
  readFromCache,
  getFileDataByField,
} = require("../Utils/fileOperations");

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

module.exports.stockDetails = async (req, res) => {
  try {
    let fileData = getAllStock();

    return res.json({
      success: true,
      stockData: fileData,
    });
  } catch (error) {
    console.error("Error in stockDetails:", error);
    return res.json({
      success: false,
      message: "Failed to fetch stock details",
    });
  }
};

module.exports.getStockDetail = async (req, res) => {
  try {
    const { name, ticker } = req.query;
    let fileData = getAllStock();

    let stock = null;
    if (name) {
      stock = getFileDataByField("name", fileData, name);
      console.log("FINAL STOCK RECEIVED : ", stock);
    } else {
      stock = getFileDataByField("ticker", fileData, ticker);
    }

    if (stock) {
      return res.json({
        success: true,
        stock,
      });
    } else {
      return res.status(404).json({
        success: false,
        message: "Stock not found",
      });
    }
  } catch (error) {
    console.error("Error in getStockDetail:", error);
    return res.json({
      success: false,
      message: "Failed to fetch stock detail",
    });
  }
};
