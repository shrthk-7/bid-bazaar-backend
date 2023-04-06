const { userController } = require('../controllers');
const router = require('express').Router();

router.post('/login', userController.login);
router.get('/', userController.authenticate, userController.getUser);

module.exports = router;
