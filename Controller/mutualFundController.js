const { deleteFileFromS3 } = require("../Config/deleteFile");
const { uploadToS3 } = require("../Config/fileUpload");
const fs = require('fs');
const {
  deleteMutualFund,
  writeToCache,
  getFileDataByField,
  getAllMutualFunds,
  updateMutualFund,
  getCacheFilePath,
} = require("../Utils/fileOperations");
const path = require("path");


module.exports.mutualFundDetails = async (req, res) => {
  try {
    const mutualFundKey = process.env.MUTUAL_FUNDS_KEY;
    let fileData = await getAllMutualFunds(mutualFundKey);

    return res.json({
      success: true,
      mutualFundData: fileData,
    });
  } catch (error) {
    console.error("Error while getting all mutual funds details :", error);
    return res.json({
      success: false,
      message: "Failed to fetch mutual fund details",
    });
  }
};

module.exports.getMutualFund = async (req, res) => {
  try {
    const { name } = req.params;
    const mutualFundKey = process.env.MUTUAL_FUNDS_KEY;
    let fileData = await getAllMutualFunds(mutualFundKey);

    let mutualFund = getFileDataByField("scheme_name", fileData, name);
    if (mutualFund) {
      return res.json({
        success: true,
        mutualFund,
      });
    } else {
      return res.status(404).json({
        success: false,
        message: "Mutual Fund not found - while reading",
      });
    }
  } catch (error) {
    console.error("Error while getting MutualFund detail :", error);
    return res.json({
      success: false,
      message: "Failed to fetch mutual fund details",
    });
  }
};

module.exports.createMutualFund = async (req, res) => {
  try {
    const mutualFund = req.body;
    const mutualFundKey = process.env.MUTUAL_FUNDS_KEY;
    
    let fileData = await getAllMutualFunds(mutualFundKey);
    if (typeof fileData === "string") {
      fileData = JSON.parse(fileData); 
    }
    fileData.push(mutualFund); 
    writeToCache(JSON.stringify(fileData), "mutualFunds.json");
    // await deleteFileFromS3(mutualFundKey);
    // await uploadToS3(mutualFundKey, "mutualFunds.json");

    return res.json({
      success: true,
      fileData,
    });

  } catch (error) {
    console.error("Error while creating mutual fund:", error);
    return res.json({
      success: false,
      message: "Failed to create mutual fund",
    });
  }
};

module.exports.deleteMutualFundBySchemaName =async (req,res) => {
  try{
    const {name : scheme_name} = req.params;
    const mutualFundKey = process.env.MUTUAL_FUNDS_KEY;
    const updatedData = await deleteMutualFund(scheme_name, mutualFundKey);
    if(updatedData == null)  throw new Error(`Mutual Fund with ${scheme_name} is not found`)
    await deleteFileFromS3(mutualFundKey);
    await uploadToS3(mutualFundKey, "mutualFunds.json");
    return res.json({
      success: true,
      updatedData,
    });
  }catch(error){
    console.error("Error while Deleting a Mutual fund :", error);
    return res.json({
      success: false,
      message: "Failed to Delete the stock",
    });
  }
}

module.exports.updateMutualFundBySchemaName = async (req, res) => {
  try {
    const { name: scheme_name } = req.params;
    const updatedFields = req.body; 
    const mutualFundKey = process.env.MUTUAL_FUNDS_KEY;

    const updatedData = await updateMutualFund(scheme_name, updatedFields, mutualFundKey);

    if (!updatedData) {
      return res.status(404).json({
        success: false,
        message: "Mutual Fund not found - while updating",
      });
    }

    await deleteFileFromS3(mutualFundKey);
    await uploadToS3(mutualFundKey, "mutualFunds.json");

    return res.json({
      success: true,
      updatedData,
    });
  } catch (error) {
    console.error("Error while updating a Mutual Fund:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to update the Mutual Fund",
    });
  }
};

module.exports.downloadMutualFund = async (req, res) => {
  try {
    const jsonFilePath = getCacheFilePath("mutualFunds.json");

    if (!jsonFilePath) {
      return res.status(500).send({ message: 'Invalid file path' });
    }

    console.log("FILE PATH:", jsonFilePath);

    // Checking if JSON file exists
    if (!fs.existsSync(jsonFilePath)) {
      return res.status(404).send({ message: 'Mutual Fund file not found' });
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

    // Generate CSV file path
    const csvFilePath = jsonFilePath.replace('.json', '.csv');

    // Ensure the directory exists
    const directoryPath = path.dirname(csvFilePath);
    if (!fs.existsSync(directoryPath)) {
      fs.mkdirSync(directoryPath, { recursive: true });
    }

    // Extract headers from the first object
    const headers = Object.keys(jsonData[0]);
    let csvContent = headers.join(',') + '\n';

    // Convert JSON to CSV format
    jsonData.forEach(item => {
      const row = headers.map(header => {
        const value = item[header];
        const cellValue = value === null || value === undefined ? '' : String(value);
        
        return cellValue.includes(',') || cellValue.includes('"') || cellValue.includes('\n') 
          ? `"${cellValue.replace(/"/g, '""')}"` 
          : cellValue;
      });

      csvContent += row.join(',') + '\n';
    });

    // Write CSV content to file
    fs.writeFileSync(csvFilePath, csvContent, 'utf8');

    // Send the CSV file
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=mutualFunds.csv');

    const readStream = fs.createReadStream(csvFilePath);
    readStream.pipe(res);

  } catch (error) {
    console.error('Error converting and downloading Mutual Fund file:', error);
    res.status(500).send({ message: 'Failed to download Mutual Fund data as CSV' });
  }

}