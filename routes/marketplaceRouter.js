const { userController, marketplaceController } = require('../controllers');
const router = require('express').Router();

router.get('/', marketplaceController.getProducts);
router.post('/new', userController.authenticate, marketplaceController.create);
router.get('/category/:category', marketplaceController.getProducts);

module.exports = router;
