const { downloadFileFromS3 } = require("../Config/fileDownload")
const fs = require('fs');
const path = require('path');

module.exports.stockDetails = async (req, res) =>{
    try {
        const stockFile = await downloadFileFromS3();
        const cacheDir = path.join(__dirname, '../Cache');
        const filePath = path.join(cacheDir, 'stockIndex.json');
        fs.writeFileSync(filePath, JSON.stringify(stockFile));
        return res.json({
            "success" : true,
            "stockData" : stockFile
        })
    } catch (error) {
        console.error('Error in stockDetail:', error);
    }
}

