const express = require("express");
const { mutualFundDetails, getMutualFund, createMutualFund, deleteMutualFundBySchemaName, updateMutualFundBySchemaName, downloadMutualFund } = require("../Controller/mutualFundController");
const router = express.Router();

router.get('/', mutualFundDetails);
router.get('/download', downloadMutualFund)
router.get('/:name',getMutualFund);
router.post('/create',createMutualFund);
router.delete('/delete/:name',deleteMutualFundBySchemaName)
router.put('/update/:name',updateMutualFundBySchemaName)

module.exports = router;