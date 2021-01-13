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

    isUserExist(username).then((existUser) =>
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

      bcrypt
        .compare(password, existUser.password)
        .then(async (match) => {
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
        })
        .catch((error) => res.status(400).json('Wrong password.'));
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create new token by refresh token
router.post('/token', async (req, res) => {
  try {
    const { token } = req.body;
    if (token == null) res.status(401).json('Token not exists.');

    const refreshToken = await RefreshToken.findOne({ token });
    if (!refreshToken) res.status(403).json('Token not exists.');

    jwt.verify(token, process.env.REFRESH_TOKEN_SECRET, (error, user) => {
      if (error) res.status(403).json('Token is not valid.');
      const accessToken = generateAccessToken({ username: user.username });
      res.json({ accessToken });
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Logout
router.delete('/logout', async (req, res) => {
  try {
    const { token } = req.body;
    const deletedToken = await RefreshToken.findOneAndDelete({ token });
    if (!deletedToken) res.status(400).json('Refresh Token is required.');
    res.status(204).json('Token deleted successfully.');
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
