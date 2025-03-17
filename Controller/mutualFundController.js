const { deleteFileFromS3 } = require("../Config/deleteFile");
const { downloadFileFromS3 } = require("../Config/fileDownload");
const { uploadToS3 } = require("../Config/fileUpload");
const {
  deleteMutualFund,
  writeToCache,
  getFileDataByField,
  getAllMutualFunds,
  updateMutualFund,
} = require("../Utils/fileOperations");


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
        message: "Mutual Fund not found",
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
    // Save the updated array
    // writeToCache(JSON.stringify(fileData), "mutualFunds.json");
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
        message: "Mutual Fund not found",
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
