require('dotenv').config({ path: './.env' });
const express = require('express');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const bodyParser = require('body-parser');
const app = express();

const router = require('./routes');

// ---------------------middleware-------------------
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(helmet());
app.use(mongoSanitize());

// ---------------------routers---------------------
app.use('/user', router.userRouter);

app.all((req, res, next) => {
  res.status(404).json({
    status: 'fail',
    message: 'endpoint not found on this server',
  });
});

module.exports = app;
