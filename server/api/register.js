const { Router } = require('express');

const router = Router();

const User = require('../models/user');

router.get('/', (req, res) => {
  res.json('register');
});

router.post('/', (req, res) => {
  const user = new User({
    name: 'user1',
    password: 'pass1',
  });

  user.save().then((savedUser) => res.json(savedUser));
});

module.exports = router;
