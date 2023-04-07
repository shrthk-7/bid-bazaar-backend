const { userController, productController } = require('../controllers');
const router = require('express').Router();

router.post("/:productId", userController.authenticate, productController.addProduct);

module.exports = router;