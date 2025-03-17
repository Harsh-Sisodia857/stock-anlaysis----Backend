const { S3Client, DeleteObjectCommand } = require("@aws-sdk/client-s3");

const s3Client = new S3Client({
  region: process.env.REGION,
  credentials : {
    accessKeyId: process.env.ACCESS_KEY,       
    secretAccessKey: process.env.SECRET_ACCESS_KEY, 
  } 
});

module.exports.deleteFileFromS3 = async (Key) => {
  try {
    const deleteParams = {
      Bucket: process.env.BUCKET_NAME,
      Key,
    };

    const command = new DeleteObjectCommand(deleteParams);
    await s3Client.send(command);

    console.log("File deleted successfully:", deleteParams.Key);
  } catch (error) {
    console.error("Error deleting file:", error);
  }
};
