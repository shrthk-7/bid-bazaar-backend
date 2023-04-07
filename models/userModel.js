const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');

const socialsSchema = new mongoose.Schema({
  instagram: String,
  facebook: String,
  linkedIn: String,
  twitter: String,
});

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
  socials: {
    type: socialsSchema,
    default: {},
  },
  description: {
    type: String,
  },
  listedProducts: {
    type: [mongoose.Schema.Types.ObjectId],
    ref: 'Product',
  },
  boughtProducts: {
    type: [mongoose.Schema.Types.ObjectId],
    ref: 'Product',
  },
  currentBids: {
    type: [mongoose.Schema.Types.ObjectId],
    ref: 'Product',
  },
  balance: {
    type: Number,
    default: 1000,
    required: true,
  },
  reputation: {
    type: Number,
    default: 0,
  },
},
{collection:"users"});

userSchema.methods.generateJWTToken = function () {
  return jwt.sign({ uid: this.uid }, process.env.JWT_SECRET);
};

const User = mongoose.model('User', userSchema);
module.exports = User;
