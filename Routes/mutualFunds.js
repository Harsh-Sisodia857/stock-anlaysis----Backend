const express = require("express");
const { mutualFundDetails, getMutualFund, createMutualFund, deleteMutualFundBySchemaName, updateMutualFundBySchemaName, downloadMutualFund } = require("../Controller/mutualFundController");
const { authenticated, authorizedRoles } = require("../Middleware/auth");
const router = express.Router();

router.get('/',[authenticated], mutualFundDetails);
router.get('/download',[authenticated], downloadMutualFund)
router.get('/:name',[authenticated],getMutualFund);
router.post('/create',[authenticated, authorizedRoles("admin")],createMutualFund);
router.delete('/delete/:name',[authenticated, authorizedRoles("admin")],deleteMutualFundBySchemaName)
router.put('/update/:name',[authenticated, authorizedRoles("admin")],updateMutualFundBySchemaName)

module.exports = router;