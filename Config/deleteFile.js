const { S3Client, DeleteObjectCommand } = require("@aws-sdk/client-s3");
const { HeadObjectCommand } = require("@aws-sdk/client-s3");
const { ListBucketsCommand } = require("@aws-sdk/client-s3");
const { ListObjectsV2Command } = require("@aws-sdk/client-s3");

// console.log("Region:", process.env.REGION);
// console.log("Bucket Name:", process.env.BUCKET_NAME);
// console.log("Access Key Exists:", process.env.ACCESS_KEY);
// console.log("Secret Key Exists:", process.env.SECRET_ACCESS_KEY);

const s3Client = new S3Client({
  region: process.env.REGION,
  credentials : {
    accessKeyId: process.env.ACCESS_KEY,       
    secretAccessKey: process.env.SECRET_ACCESS_KEY, 
  } 
});


// (async () => {
//   try {
//     const response = await s3Client.send(new ListBucketsCommand({}));
//     console.log("✅ ListBucketsCommand Response:", response);
//   } catch (error) {
//     console.error("❌ AWS SDK Error:", error);
//   }
// })();





const checkIfObjectExists = async (Key) => {
  console.log("🔍 Checking if object exists:", Key);
  try {
    console.log("🛠️ Sending HeadObjectCommand...");
    const response = await s3Client.send(new HeadObjectCommand({
      Bucket: process.env.BUCKET_NAME,
      Key,
    }));
    console.log("✅ HeadObjectCommand Response:", response);
    return true;
  } catch (error) {
    console.log("❌ HeadObjectCommand Error:", error);

    console.log("❌ Error Name:", error.name);
    console.log("❌ Error Code:", error.$metadata?.httpStatusCode);
    console.log("❌ Full Error:", JSON.stringify(error, null, 2));

    if (error.name === "NotFound") {
      console.log("🚫 Object does not exist:", Key);
      return false;
    }

    throw error;
  }
};






module.exports.deleteFileFromS3 = async (Key) => {
  // Validate input
  if (!Key) {
    throw new Error("Invalid Key: Key is required for S3 deletion");
  }

  try {
    const deleteParams = {
      Bucket: process.env.BUCKET_NAME,
      Key,
    };
    const command = new DeleteObjectCommand(deleteParams);
    const response = await s3Client.send(command);
    console.log("✅ File deleted successfully:", Key);
    return {
      success: true,
      response,
      key: Key,
    };
  } catch (error) {
    console.error("❌ Error deleting file:", error);

    // Propagate the error to the caller
    throw error;
  }
};
