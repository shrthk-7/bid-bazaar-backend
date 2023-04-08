const socketio = require('socket.io');
const http = require('http');
const { Product, User } = require('./models');

const emitProduct = (product, socket) => {
  socket.emit('productinfo', product);
};
const emitProductstoRoom = (product, io, productId) => {
  io.to(productId).emit('productinfo', product);
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
      if (product.bidType === 'anonymous') {
        delete product.currentbid;
      }
      emitProduct(product, socket);
    });


    socket.on('like-event', async (userId, productId, isLiked) => {
      const user = await User.findById(userId);
      if (isLiked === true) {
        const isProduct = user.likedProducts.find(function (element) {
          return element === productId;
        })
        if (isProduct !== undefined) {
          return;
        }
        else {
          const product = Product.findById(productId);
          const owner = User.findById(product.owner);
          product.reputation++;
          owner.reputation++;
          user.likedProducts.push(productId);
          await product.save();
          await user.save();
          await owner.save();
          emitProductstoRoom(product, io, productId);
        }
      }
      else {
        const isProduct = user.likedProducts.find(function (element) {
          return element === productId;
        })
        if (isProduct === undefined) {
          return;
        }
        else {
          const product = Product.findById(productId);
          const owner = User.findById(product.owner);
          product.reputation--;
          owner.reputation--;
          const filteredLikes = user.likedProducts.filter(function (element) {
            return (element !== productId);
          })
          user.likedProducts = filteredLikes
          await product.save();
          await user.save();
          await owner.save();
          emitProductstoRoom(product, io, productId);
        }
      }
    })


    socket.on('newBid', async (userId, productId, newBidinString) => {

      const product = await Product.findById(productId);


      newBid = parseInt(newBidinString);

      if (product.bidType === "standard" || product.bidType === "anonymous") {
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

      }
      else if (product.bidType === 'reverse') {
        if (!product || product.currentbid <= newBid) return;

        //Update Current Lowest Bidder
        const currBidder = await User.findById(userId);
        currBidder.currentBids.push(productId);
        await currBidder.save();


        //Update Previous Lowest Bidder
        const prevBidder = await User.findById(product.currentHighestBidder);
        prevBidder.currentBids = prevBidder.currentBids.filter(
          pId => !pId.equals(productId)
        );
        await prevBidder.save();

        //Update Product Info
        product.currentHighestBidder = userId;
        product.currentbid = newBid;
        product.bidHistory.push({ time: Date.now(), bid: newBid });
        await product.save();

      }
      else {
        return;
      }
      emitProductstoRoom(product, io, productId);

    });
  });
};

module.exports = SocketManager;
