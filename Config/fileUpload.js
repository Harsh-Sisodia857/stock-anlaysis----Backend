const { S3Client, PutObjectCommand } = require("@aws-sdk/client-s3");
const fs = require("fs");
const path = require("path");

const s3Client = new S3Client({
  region: process.env.REGION,
  credentials : {
    accessKeyId: process.env.ACCESS_KEY,       
    secretAccessKey: process.env.SECRET_ACCESS_KEY, 
  } 
});

module.exports.uploadToS3 = async (Key, fileName) => {
  try {
    const filePath = path.join(__dirname, "../Cache", fileName);

    // Check if file exists
    if (!fs.existsSync(filePath)) {
      throw new Error(`File not found at path: ${filePath}`);
    }

    const fileStream = fs.createReadStream(filePath);

    const uploadParams = {
      Bucket: process.env.BUCKET_NAME,
      Key: Key,
      Body: fileStream,
    };

    const command = new PutObjectCommand(uploadParams);
    await s3Client.send(command);

    console.log("✅ File uploaded successfully:", uploadParams.Key);
  } catch (error) {
    console.error("❌ Error uploading file:", error);
  }

};
