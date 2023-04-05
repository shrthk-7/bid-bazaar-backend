const express = require('express');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const bodyParser = require('body-parser');

const app = express();

// const utils = require("./utils");
// const middlewares = require("./middlewares");
// const router = require("./routes");

// ---------------------env vars---------------------
require('dotenv').config({ path: './.env' });

// ---------------------middleware-------------------
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(helmet());
app.use(mongoSanitize());

app.all('*', (req, res, next) => {
  res.send('chal raha h');
});

module.exports = app;
