const express = require("express");
const { stockDetails, getStockDetail, createStock, deleteStock, updateStock, downloadStock } = require("../Controller/stockController");
const { authenticated, authorizedRoles } = require("../Middleware/auth");
const router = express.Router();

// router.get('/all',[authenticated],stockDetails);
// router.get('/',[authenticated], getStockDetail)
router.get('/all',stockDetails);
router.get('/', getStockDetail)
router.post('/create', createStock);
router.delete('/delete/:ticker', deleteStock);
router.put('/update/:ticker', updateStock);
router.get('/download', downloadStock);
  

module.exports = router;