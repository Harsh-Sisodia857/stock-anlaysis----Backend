const express = require("express");
const { stockDetails, getStockDetail, createStock, deleteStock, updateStock, downloadStock } = require("../Controller/stockController");
const { authenticated, authorizedRoles } = require("../Middleware/auth");
const router = express.Router();

router.get('/all',[authenticated],stockDetails);
router.get('/',[authenticated], getStockDetail)
router.post('/create',[authenticated, authorizedRoles("admin")], createStock);
router.delete('/delete/:ticker',[authenticated, authorizedRoles("admin")], deleteStock);
router.put('/update/:ticker',[authenticated, authorizedRoles("admin")], updateStock);
router.get('/download',[authenticated, authorizedRoles("admin")], downloadStock);
  

module.exports = router;