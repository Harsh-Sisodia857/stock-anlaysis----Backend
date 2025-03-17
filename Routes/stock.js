const express = require("express");
const { stockDetails, getStockDetail, createStock, deleteStock, updateStock } = require("../Controller/stockController");
const { authenticated, authorizedRoles } = require("../Middleware/auth");
const router = express.Router();

// router.get('/all',[authenticated],stockDetails);
// router.get('/',[authenticated], getStockDetail)
router.get('/all',stockDetails);
router.get('/', getStockDetail)
router.post('/create',[authenticated, authorizedRoles], createStock);
router.delete('/delete/:ticker',[authenticated, authorizedRoles], deleteStock);
router.put('/update/:ticker',[authenticated, authorizedRoles], updateStock);

module.exports = router;