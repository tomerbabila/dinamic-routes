const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const userSchema = new mongoose.Schema({
  username: { type: String, required: true },
  email: {type: String, required: true},
  password: { type: String, required: true },
});

// Encrypting the password for the database
userSchema.pre('save', function (next) {
  try {
    const salt = bcrypt.genSaltSync(10);
    const hashedPassword = bcrypt.hashSync(this.password, salt);
    this.password = hashedPassword;
    next();
  } catch (error) {
    console.log('Error connecting to MongoDB:', error.message);
  }
});

module.exports = mongoose.model('User', userSchema);
