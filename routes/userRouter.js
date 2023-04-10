const { userController } = require('../controllers');
const router = require('express').Router();

router.post('/login', userController.login);
router.patch('/update', userController.authenticate, userController.update);
router.post('/', userController.authenticate, userController.getUser);

module.exports = router;
