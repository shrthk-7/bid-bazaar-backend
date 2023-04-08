const { userController,  marketplaceController } = require('../controllers');
const router = require('express').Router();

router.post("/:productId", userController.authenticate, marketplaceController.create);

module.exports = router;