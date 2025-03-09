const { S3Client, DeleteObjectCommand } = require("@aws-sdk/client-s3");

const s3Client = new S3Client({
  region: process.env.REGION,
});

module.exports.deleteFileFromS3 = async () => {
  try {
    const deleteParams = {
      Bucket: process.env.BUCKET,
      Key: "Stock Data Set.json",
    };

    const command = new DeleteObjectCommand(deleteParams);
    await s3Client.send(command);

    console.log("File deleted successfully:", deleteParams.Key);
  } catch (error) {
    console.error("Error deleting file:", error);
  }
};
