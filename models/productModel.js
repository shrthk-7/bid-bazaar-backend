const mongoose = require('mongoose');

const pastBidSchema = new mongoose.Schema(
  {
    time: {
      type: Date,
    },
    bid: {
      type: Number,
    },
  },
  { id: false }
);

const productSchema = new mongoose.Schema({
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
  },
  photos: {
    type: [String],
    validate: {
      validator: function () {
        return this.photos.length >= 1;
      },
    },
    message: 'Atleast one image required',
  },
  bidType: {
    type: String,
    default: 'standard',
  },
  category: {
    type: String,
  },
  currentbid: {
    type: Number,
  },
  bidHistory: {
    type: [pastBidSchema],
  },
  currentHighestBidder: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  currentHighestBid: {
    type: Number,
    default: 0,
  },
  reputation: {
    type: Number,
    default: 0,
  },
  isLive: {
    type: Boolean,
    default: true,
  },
  start: {
    type: Date,
    default: Date.now,
  },
  end: {
    type: Date,
    default: Date.now,
  },
  reputation: {
    type: Number,
    default: 0,
  },
});

const Product = mongoose.model('Product', productSchema);

module.exports = Product;
