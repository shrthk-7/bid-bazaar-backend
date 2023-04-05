const app = require('./app');
const mongoose = require('mongoose');

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

connectMongoDB().then(() => {
  app.listen(process.env.PORT, () => {
    console.log(`listening on localhost:${process.env.PORT}`);
  });
});
