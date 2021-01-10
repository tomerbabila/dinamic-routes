const { Router } = require('express');

const router = Router();

router.use('/login', require('./login'));
router.use('/register', require('./register'));

module.exports = router;
