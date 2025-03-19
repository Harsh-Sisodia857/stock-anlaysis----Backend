const { deleteFileFromS3 } = require("../Config/deleteFile");
const { uploadToS3 } = require("../Config/fileUpload");
const fs = require('fs');
const {
  writeToCache,
  getFileDataByField,
  updateStockByTicker,
  getAllStock,
  deleteStockByTicker,
  getCacheFilePath,
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
    const { ticker } = req.query;
    let fileData = await getAllStock();

    let stock = getFileDataByField("ticker", fileData, ticker);

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
    if (typeof fileData === "string") {
      fileData = JSON.parse(fileData); 
    }
    fileData.push(stock);
    writeToCache(fileData, "stocks.json");
    console.log("Written to cache")
    await deleteFileFromS3(stockKey);
    console.log("DELETED");
    await uploadToS3(stockKey,"stocks.json");
    console.log("UPLOADED");
    return res.json({
      success: true,
      fileData,
    });
  } catch (error) {
    console.log("ERROR : ", error)
    return res.status(404).json({
      success: false,
      message: "Failed to Create the stock",
    });
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
    // const stockKey = process.env.STOCK_KEY;
    // await deleteFileFromS3(stockKey);
    // await uploadToS3(stockKey,"stocks.json");
    return res.json({
      success: true,
      updatedData,
    });
  }catch(error){
    return res.json({
      success: false,
      message : "Unable to update the stock data",
    });
  }
}

module.exports.downloadStock = async (req, res) => {
  try {
    const filePath = getCacheFilePath("stocks.json")
    console.log("FILE PATH : ",filePath)
    // Checking if file exists
    if (!fs.existsSync(filePath)) {
      return res.status(404).send({ message: 'Stock data file not found' });
    }
    
    // Set appropriate headers
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', 'attachment; filename=stock.json');
    
    // Stream the file as the response
    const fileStream = fs.createReadStream(filePath);
    fileStream.pipe(res);
  } catch (error) {
    console.error('Error downloading stock file:', error);
    res.status(500).send({ message: 'Failed to download stock data' });
  }
}