const fs = require("fs");

module.exports.uploadToS3 = () => {
  // Create an S3 service object
  const s3 = new AWS.S3();

  // Define upload parameters
  const uploadParams = {
    Bucket: process.env.BUCKET,
    Key: "Stock Data Set.json",
    Body: fs.createReadStream("Stock Data Set.csv"),
  };

  // Upload the file
  s3.upload(uploadParams, (err, data) => {
    if (err) {
      console.error("Error uploading file:", err);
    } else {
      console.log("File uploaded successfully:", data.Location);
    }
  });
};
