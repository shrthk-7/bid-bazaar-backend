const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  uid: {
    type: String,
    required: true,
  },
  photoURL: {
    type: String,
  },
});

userSchema.methods.generateJWTToken = function () {
  return jwt.sign({ uid: this.uid }, process.env.JWT_SECRET);
};

const User = mongoose.model('User', userSchema);
module.exports = User;
