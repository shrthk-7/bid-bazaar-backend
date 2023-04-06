const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  productTitle: {
    type: String,
    required: true,
  },
  productDescription: {
    type: String,
  },
  productPhotos: {
    type: [String],
    validate: {
      validator: function () {
        return this.productPhotos.length >= 1;
      },
    },
    message: ' Atleast one image required',
  },
  Categories: {
    type: [String],
    validate: {
      validator: function () {
        return this.Categories.length >= 1;
      },
    },
    message: ' Atleast one category required',
  },
  startingbid: {
    type: Number,
    required: true,
  },
  currentbid: {
    type: Number,
    require: true,
  },
  currentHighestBidder: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  isLive: {
    type: Boolean,
    required: true,
  },
  startingTime: {
    type: Date,
    default: Date.now,
  },
  endingDate: {
    type: Date,
    default: Date.now,
  },
  reputation: {
    type: Number,
    required: true,
  },
});

const Product = mongoose.model('Product', productSchema);

module.exports = Product;
