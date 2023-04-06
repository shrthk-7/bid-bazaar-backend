const jwt = require('jsonwebtoken');
const { User } = require('../models');
const { promisify } = require('util');

exports.getUser = async (req, res, next) => {
  req.user.uid = undefined;
  return res.status(200).json({
    status: 'success',
    user: req.user,
  });
};

exports.login = async (req, res, next) => {
  try {
    const { displayName, email, photoURL, uid } = req.body;

    let user = await User.findOne({ uid });

    if (!user) {
      user = new User({
        email: email,
        uid: uid,
        name: displayName,
        photoURL: photoURL,
      });
      await user.save();
    }

    const token = user.generateJWTToken();

    res.status(200).json({
      status: 'success',
      message: 'user logged in successfully',
      token,
      user,
    });
  } catch (error) {
    console.log({ error });
    res.send('err');
  }
};

exports.authenticate = async (req, res, next) => {
  try {
    const decoded = await promisify(jwt.verify)(
      req.body.token,
      process.env.JWT_SECRET
    );
    const user = await User.findOne({ uid: decoded.uid });
    if (!user) {
      return res.status(404).json({
        status: 'fail',
        message: 'user not found',
      });
    }
    req.user = user;
    next();
  } catch (error) {
    console.log({ error });
    res.send('err');
  }
};
