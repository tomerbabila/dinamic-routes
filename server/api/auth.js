const { Router } = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');

const router = Router();

const User = require('../models/user');
const userSchema = require('../validations');

const saltRounds = 10;

// Register
router.post('/register', (req, res) => {
  try {
    const { username, password } = req.body;

    const newUser = new User({
      username,
      password: bcrypt.hashSync(password, saltRounds),
    });

    const { error } = userSchema.validate(req.body);
    if (error) return res.status(400).json({ error: error.message });

    userIsExist(username).then((existUser) =>
      existUser
        ? res.status(409).json('Username already exists.')
        : newUser.save().then((savedUser) => res.json(savedUser))
    );
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Login
router.post('/login', (req, res) => {
  try {
    const { username, password } = req.body;

    userIsExist(username).then((existUser) => {
      if (!existUser) res.status(400).json('Wrong username or password.');

      bcrypt.compare(password, existUser.password).then((match) => {
        if (!match) res.status(400).json('Wrong username or password.');

        const token = jwt.sign({ username }, process.env.JWT_SECRET, {
          expiresIn: '24h',
        });
        return res.json({ token });
      });
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Check if user is in the DB
const userIsExist = async (username) => {
  try {
    const user = await User.findOne({ username });
    return user ? user : false;
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = router;
