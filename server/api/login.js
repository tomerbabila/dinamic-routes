const { Router } = require('express');

const router = Router();

router.use('/', (req, res) => {
  res.send('login');
});

module.exports = router;
