const { S3Client, GetObjectCommand } = require('@aws-sdk/client-s3');
const fs = require('fs');

module.exports.downloadFileFromS3 = () => {
  // Create an S3 client using v3
  const s3 = new S3Client({
    region: process.env.REGION, 
    credentials : {
      accessKeyId: process.env.ACCESS_KEY,       
      secretAccessKey: process.env.SECRET_ACCESS_KEY, 
    }
  });

  // Define download parameters
  const downloadParams = {
    Bucket: process.env.BUCKET_NAME,
    Key: "Stock Data Set.json",
  };

  return new Promise((resolve, reject) => {
    // Download the file using the GetObjectCommand in SDK v3
    const command = new GetObjectCommand(downloadParams);

    s3.send(command)
      .then((data) => {
        // The body is a stream, so we need to convert it to a string
        let fileContent = '';
        data.Body.on('data', (chunk) => {
          fileContent += chunk.toString();
        });

        data.Body.on('end', () => {
          resolve(fileContent); // Resolve with file content when done
        });
      })
      .catch((err) => {
        reject("Error downloading file:", err.message);
        console.error("Detailed Error:", err); 
      });
  });
};