const { S3Client, PutObjectCommand } = require("@aws-sdk/client-s3");
const fs = require("fs");

const s3Client = new S3Client({
  region: process.env.REGION, 
});

module.exports.uploadToS3 = async () => {
  try {
    const fileStream = fs.createReadStream("Stock Data Set.csv");

    const uploadParams = {
      Bucket: process.env.BUCKET_NAME,
      Key: "Stock Data Set.json",
      Body: fileStream,
    };

    const command = new PutObjectCommand(uploadParams);
    await s3Client.send(command);

    console.log("File uploaded successfully:", uploadParams.Key);
  } catch (error) {
    console.error("Error uploading file:", error);
  }
};
