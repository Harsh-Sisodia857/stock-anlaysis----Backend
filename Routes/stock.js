const express = require("express");
const { stockDetails, getStockDetail, createStock, deleteStock, updateStock } = require("../Controller/stockController");
const { authenticated, authorizedRoles } = require("../Middleware/auth");
const router = express.Router();

router.get('/all',[authenticated],stockDetails);
router.get('/',[authenticated], getStockDetail)
router.post('/create',[authenticated, authorizedRoles], createStock);
router.delete('/delete',[authenticated, authorizedRoles], deleteStock);
router.put('/update',[authenticated, authorizedRoles], updateStock);

module.exports = router;