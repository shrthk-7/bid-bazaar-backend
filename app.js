require('dotenv').config({ path: './.env' });
const express = require('express');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const bodyParser = require('body-parser');
// const cors = require('./middlewares/cors');
const cors = require('cors');
const app = express();

const router = require('./routes');

// ---------------------middleware-------------------
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(helmet());
app.use(mongoSanitize());
// app.use(
//   cors({
//     origin: '*',
//     methods: ['GET', 'POST', 'OPTIONS', 'HEADER'],
//   })
// );
app.use(cors());
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  next();
});

// ---------------------routers---------------------
app.use('/user', router.userRouter);
app.use('/marketplace', router.marketplaceRouter);
app.use('/product', router.productRouter);

const { User, Product } = require('./models');

app.get('/', async (req, res, next) => {
  try {
    const userCount = await User.count({});
    const productCount = await Product.count({});

    return res.status('200').json({
      totalUsers: userCount,
      totalProducts: productCount,
    });
  } catch (error) {
    return res.status(500).json({
      status: 'error',
      message: 'something went wrong',
    });
  }
});

app.all((req, res, next) => {
  try {
    res.status(404).json({
      status: 'fail',
      message: 'endpoint not found on this server',
    });
  } catch (error) {
    return res.status(500).json({
      status: 'error',
      message: 'something went wrong',
    });
  }
});

module.exports = app;
