const { Router } = require('express');

const router = Router();

const User = require('../models/user');
const userSchema = require('../validations');

router.post('/', (req, res) => {
  try {
    const { username, password, email } = req.body;

    const newUser = new User({
      username,
      password,
      email,
    });

    const { error } = userSchema.validate(req.body);
    if (error) return res.status(400).json({ error: error.message });

    newUser.save().then((savedUser) => res.json(savedUser));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
