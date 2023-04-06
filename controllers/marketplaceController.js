const { Product } = require('../models');
const { APIFeatures } = require('../utils');

const cloudinary = require('cloudinary');
const http = require('http');
const socketio = require('socket.io');

exports.getProducts = async (req, res, next) => {
  let products = await Product.find();
  return res.status(200).json({
    status: 'success',
    products: products,
  });
};

exports.create = async (req, res, next) => {
  try {
    const { title, description, photos, categories, start, end } = req.body;
    if (
      !(
        title &&
        description &&
        photos &&
        categories &&
        categories.length >= 1 &&
        start &&
        end
      )
    ) {
      return res.status(400).json({
        status: 'fail',
        message: 'provide all fields',
      });
    }

    const savedPhotos = await Promise.all(
      photos.map(photo => {
        return cloudinary.v2.uploader.upload(photo, {
          folder: 'bid-bazaar',
        });
      })
    );

    const createdProduct = new Product({
      owner: req.user._id,
      title: title,
      description: description,
      photos: savedPhotos.map(photo => photo.url),
      categories: categories,
      start: start,
      end: end,
    });

    await createdProduct.save();

    return res.status(201).json({
      status: 'success',
      message: 'product added successfully',
      product: createdProduct,
    });
  } catch (error) {
    console.log({ error });
    res.send('err');
  }
};

exports.getProducts = async (req, res, next) => {
  const features = new APIFeatures(Product.find(), req.query)
    .filter()
    .sort()
    .limitFields()
    .paginate();

  const products = await features.query;

  res.status(200).json({
    status: 'success',
    products: products,
  });
};
