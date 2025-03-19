const { deleteFileFromS3 } = require("../Config/deleteFile");
const { uploadToS3 } = require("../Config/fileUpload");
const fs = require('fs');
const path = require('path');
const { json2csv } = require('json-2-csv');
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
    const jsonFilePath = getCacheFilePath("stocks.json");
    
    if (!jsonFilePath) {
      return res.status(500).send({ message: 'Invalid file path' });
    }
    
    console.log("FILE PATH:", jsonFilePath);
    
    // Checking if JSON file exists
    if (!fs.existsSync(jsonFilePath)) {
      return res.status(404).send({ message: 'Stock data file not found' });
    }
    
    // Read and parse JSON file
    let jsonData = fs.readFileSync(jsonFilePath, 'utf8');
    
    try {
      jsonData = JSON.parse(jsonData);
      if (typeof jsonData === 'string') {
        jsonData = JSON.parse(jsonData); // Handle stringified JSON
      }
    } catch (error) {
      console.error("Error parsing JSON file:", error);
      return res.status(500).send({ message: 'Invalid JSON format in file' });
    }
    
    if (!Array.isArray(jsonData) || jsonData.length === 0) {
      return res.status(400).send({ message: 'No data found to convert to CSV' });
    }
    
    // Convert JSON to CSV using json-2-csv
    const csvContent = await json2csv(jsonData, {
      emptyFieldValue: '',
      keys: Object.keys(jsonData[0]), // Use keys from the first object
      delimiter: {
        field: ',',
        wrap: '"',
        eol: '\n'
      },
      prependHeader: true
    });
    
    // Generate CSV file path
    const csvFilePath = jsonFilePath.replace('.json', '.csv');
    
    // Ensure the directory exists
    const directoryPath = path.dirname(csvFilePath);
    if (!fs.existsSync(directoryPath)) {
      fs.mkdirSync(directoryPath, { recursive: true });
    }
    
    // Write CSV content to file
    fs.writeFileSync(csvFilePath, csvContent, 'utf8');
    
    // Send the CSV file
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=stocks.csv');
    
    const readStream = fs.createReadStream(csvFilePath);
    readStream.pipe(res);

    readStream.on('end', () => {
      console.log("File successfully sent, now deleting:", csvFilePath);
      fs.unlink(csvFilePath, (err) => {
        if (err) {
          console.error(`Error deleting file ${csvFilePath}:`, err);
        } else {
          console.log(`File deleted: ${csvFilePath}`);
        }
      });
    });

    readStream.on('error', (err) => {
      console.error("Error streaming file:", err);
      res.status(500).send({ message: "Error sending file" });
    });
    
  } catch (error) {
    console.error('Error converting and downloading stock file:', error);
    res.status(500).send({ message: 'Failed to download stock data as CSV' });
  }
};