const { Product } = require('../models');
const http = require('http');
const socketio = require('socket.io');

exports.getProducts = async (req, res, next) => {
  let products = await Product.find();
  return res.status(200).json({
    status: 'success',
    products: products,
  });
};
