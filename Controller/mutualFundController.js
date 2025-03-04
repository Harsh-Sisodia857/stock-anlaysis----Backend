const { downloadFileFromS3 } = require("../Config/fileDownload");
const { readFromCache, writeToCache } = require("../Utils/fileOperations");

async function getAllMutualFunds() {
  const mutualFundKey = process.env.MUTUAL_FUNDS_KEY;
  console.log("KEY : ", mutualFundKey);
  let fileData = readFromCache("mutualFunds.json");

  if (!fileData) {
    console.log("FILE DOES NOT EXIST IN STORAGE");

    fileData = await downloadFileFromS3(mutualFundKey);
    writeToCache(fileData, "mutualFunds.json");
  }

  return fileData;
}

module.exports.mutualFundDetails = async (req, res) => {
  try {
    let fileData = await getAllMutualFunds();

    return res.json({
      success: true,
      mutualFundData: fileData,
    });
  } catch (error) {
    console.error("Error in mutualFundDetails:", error);
    return res.json({
      success: false,
      message: "Failed to fetch mutual fund details",
    });
  }
};
