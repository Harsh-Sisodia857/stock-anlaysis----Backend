const AWS = require('aws-sdk');

module.exports.deleteFileFromS3 = () => {
  const s3 = new AWS.S3();
  // Define delete parameters
  const deleteParams = {
    Bucket: process.env.BUCKET,
    Key: "Stock Data Set.json", 
  };

  // Delete the file
  s3.deleteObject(deleteParams, (err, data) => {
    if (err) {
      console.error("Error deleting file:", err);
    } else {
      console.log("File deleted successfully:", data);
    }
  });
};
