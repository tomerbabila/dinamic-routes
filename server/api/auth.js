const { Router } = require('express');
const bcrypt = require('bcrypt');

const router = Router();

const User = require('../models/user');
const userSchema = require('../validations');

const saltRounds = 10;

// Create new user
router.post('/', (req, res) => {
  try {
    const { username, password, email } = req.body;

    const newUser = new User({
      username,
      password: bcrypt.hashSync(password, saltRounds),
      email,
    });

    const { error } = userSchema.validate(req.body);
    if (error) return res.status(400).json({ error: error.message });

    userIsExist(username).then((checker) =>
      checker
        ? res.status(409).json('User already exists.')
        : newUser.save().then((savedUser) => res.json(savedUser))
    );
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// check if user is in the DB
const userIsExist = async (username) => {
  try {
    const user = await User.findOne({ username });
    return user ? user.toJSON() : false;
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = router;
