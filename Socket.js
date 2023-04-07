const socketio = require('socket.io');
const http = require('http');
const { Product, User } = require('./models');

const emitProduct = (product, socket) => {
  socket.emit('productinfo', product);
};
const emitAllProducts = (product, socket, productId) => {
  socket.to(productId).emit('productinfo', product);
};

const SocketManager = app => {
  const server = http.createServer(app);

  server.listen(process.env.PORT, () => {
    console.log('Server up and running');
  });

  const io = socketio(server, {
    cors: {
      origin: '*',
      methods: ['GET', 'POST', 'OPTIONS'],
    },
  });

  io.on('connection', async socket => {
    socket.on('connect-to-room', async (productId, cb) => {
      socket.join(productId);
      const product = await Product.findById(productId);
      cb(`Joined ${productId}`);
      emitProduct(product, socket);
    });

    socket.on('newBid', async (userId, productId, newBid) => {
      const product = await Product.findById(productId);
      if (!product || product.currentbid >= newBid) return;

      //Update Current highest bidder data
      const currBidder = await User.findById(userId);
      if (currBidder.balance < newBid) return;
      currBidder.balance -= newBid;
      currBidder.currentBids.push(productId);
      await currBidder.save();

      //Update Previous highest bidder data
      const prevBidder = await User.findById(product.currentHighestBidder);
      prevBidder.balance += product.currentbid;
      prevBidder.currentBids = prevBidder.currentBids.filter(
        pId => !pId.equals(productId)
      );
      await prevBidder.save();

      //Update Product data
      product.currentHighestBidder = userId;
      product.currentbid = newBid;
      product.bidHistory.push({ time: Date.now(), bid: newBid });
      await product.save();

      emitProduct(product, socket);
      emitAllProducts(product, socket, productId);
    });
  });
};

module.exports = SocketManager;
