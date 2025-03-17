const { uploadToS3 } = require("../Config/fileUpload");
const {
  writeToCache,
  getFileDataByField,
  updateStockByTicker,
  getAllStock,
  deleteStockByTicker,
} = require("../Utils/fileOperations");



module.exports.stockDetails = async (req, res) => {
  try {
    let fileData = await getAllStock();
    
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
    let fileData = await getAllStock();

    let stock = null;
    if (name) {
      stock = getFileDataByField("name", fileData, name);
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

// admin controller

module.exports.createStock = async (req, res) => {
  try {
    //  const {name,ticker,sector, subSector, closePrice, marketCap, QuickRatio, ReserveSurplus, TotalCurrent, Equity, Assets, Liability, CapEx} = req.body;
    const stock = req.body;
    let fileData = await getAllStock();
    const stockKey = process.env.STOCK_KEY;
    fileData.push(stock);
    writeToCache(fileData, "stocks.json");
    await deleteFileFromS3(stockKey);
    await uploadToS3(stockKey,"stocks.json");
    return res.json({
      success: true,
      fileData,
    });
  } catch (error) {
    
  }
};

module.exports.deleteStock = async (req,res) => {
  try{
    const {ticker} = req.params;
    let updatedData = await deleteStockByTicker(ticker);
    const stockKey = process.env.STOCK_KEY;
    await deleteFileFromS3(stockKey);
    await uploadToS3(stockKey,"stocks.json");
    return res.json({
      success: true,
      updatedData,
    });
  }catch(error){
    console.error("Error while Deleting stock :", error);
    return res.json({
      success: false,
      message: "Failed to Delete the stock",
    });
  }
}

module.exports.updateStock = async(req,res) => {
  try{
    const {ticker} = req.params;
    const stock = req.body;
    const updatedData = await updateStockByTicker(ticker, stock);
    const stockKey = process.env.STOCK_KEY;
    await deleteFileFromS3(stockKey);
    await uploadToS3(stockKey,"stocks.json");
    return res.json({
      success: true,
      updatedData,
    });
  }catch(error){

  }
}