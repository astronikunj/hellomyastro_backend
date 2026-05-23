'use strict';

const express = require('express');
const router = express.Router();
const astromallController = require('../controllers/astromallController');
const { protect } = require('../middleware/authMiddleware');

// Product Categories
router.post('/getproductCategory', astromallController.getProductCategories);
router.post('/getTopProductCategory', astromallController.getTopProductCategories);

// Products
router.post('/getAstromallProduct', astromallController.getAstromallProducts);
router.post('/getAstromallProductById', astromallController.getAstromallProductById);
router.post('/searchAstromallProductCategory', astromallController.searchInProductCategory);

// Protected routes (User Order & Address)
router.use(protect);

router.post('/orderAddress/add', astromallController.addOrderAddress);
router.post('/orderAddress/update/:id', astromallController.updateOrderAddress);
router.post('/getOrderAddress', astromallController.getOrderAddresses);

router.post('/userOrder/add', astromallController.addUserOrder);
router.post('/userOrder/cancel', astromallController.cancelOrder);

module.exports = router;
