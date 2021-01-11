const mongoose = require('mongoose');

const refreshTokenSchema = new mongoose.Schema({
  username: { type: String, required: true },
  token: { type: String, required: true },
});

module.exports = mongoose.model('User', refreshTokenSchema);
