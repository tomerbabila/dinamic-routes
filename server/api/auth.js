const { Router } = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');

const router = Router();

const User = require('../models/user');
const userSchema = require('../validations');
const RefreshToken = require('../models/refreshToken');

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
    if (error) res.status(400).json({ error: error.message });

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

    isUserExist(username).then((existUser) => {
      if (!existUser) res.status(400).json('Username not exists.');

      bcrypt.compare(password, existUser.password).then(async (match) => {
        const accessToken = generateAccessToken({ username });
        const refreshToken = jwt.sign(
          { username },
          process.env.REFRESH_TOKEN_SECRET
        );

        const isTokenExist = await RefreshToken.findOne({ username });
        if (!isTokenExist) {
          const newRefreshToken = new RefreshToken({
            token: refreshToken,
            username,
          });
          await newRefreshToken.save();
        } else {
          await RefreshToken.findOneAndUpdate(
            { username },
            { token: refreshToken }
          );
        }
        res.json({ accessToken, refreshToken });
      }).catch((error) => res.status(400).json('Wrong password.'));
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Check if user exists in the DB
const isUserExist = async (username) => {
  try {
    const user = await User.findOne({ username });
    return user ? user : false;
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Generate access token
const generateAccessToken = (user) => {
  return jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '24h' });
};

module.exports = router;
