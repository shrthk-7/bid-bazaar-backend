const { userController, marketplaceController } = require('../controllers');
const router = require('express').Router();

router.get('/', );
router.post('/new', userController.authenticate, marketplaceController.create);
router.get('/category/:category');

module.exports = router;
