const app = require('./app');
const mongoose = require('mongoose');
const cloudinary = require('cloudinary');
const SocketManager = require('./Socket.js');

const connectMongoDB = async () => {
  try {
    mongoose
      .connect(process.env.MONGODB_URL, {
        useUnifiedTopology: true,
        useNewUrlParser: true,
      })
      .then(res => console.log(`Connected to ${res.connection.host}`));
  } catch (error) {
    console.log(error);
    process.exit(1);
  }
};

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

connectMongoDB().then(() => {
  SocketManager(app);
});
