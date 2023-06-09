const { Product, User } = require('../models');
const { APIFeatures, Cache } = require('../utils');

const cloudinary = require('cloudinary');

exports.getProducts = async (req, res, next) => {
  try {
    let products = Cache.get('all-products');

    if (!products) {
      products = await Product.find();
      Cache.set('all-products', JSON.stringify(products));
    } else {
      products = JSON.parse(products);
    }

    return res.status(200).json({
      status: 'success',
      products: products,
    });
  } catch (error) {
    console.log({ error });
    return res.status(500).json({
      status: 'error',
      message: 'something went wrong',
    });
  }
};

exports.create = async (req, res, next) => {
  try {
    const { title, photos, bidType, category, start, end } = req.body;
    if (!(title && photos && bidType && category && start && end)) {
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
      description: 'abc',
      photos: savedPhotos.map(photo => photo.url),
      bidType: bidType,
      category: category,
      start: start,
      end: end,
    });

    await createdProduct.save();
    Cache.del('all-products');

    req.user.listedProducts.push(createdProduct._id);
    await req.user.save();

    res.status(201).json({
      status: 'success',
      message: 'product added successfully',
      product: createdProduct,
    });
  } catch (error) {
    console.log({ error });
    res.send('err');
  }
};
