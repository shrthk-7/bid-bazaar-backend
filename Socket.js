const socketio = require('socket.io');
const { Product, User } = require('./models');
const { Events } = require('./utils');

const emitProduct = (product, socket) => {
  socket.emit(Events.productInfo, product);
};
const emitProductstoRoom = (product, io, productId) => {
  io.to(productId).emit(Events.productInfo, product);
};

const SocketManager = server => {
  const io = socketio(server, {
    cors: {
      origin: '*',
      methods: ['GET', 'POST', 'OPTIONS'],
    },
  });

  io.on(Events.connection, async socket => {
    socket.on(Events.connectToRoom, async ({ productId }) => {
      socket.join(productId);
      const product = await Product.findById(productId);
      if (product.bidType === 'anonymous') {
        delete product.currentHighestBidder;
      }
      emitProduct(product, socket);
    });

    socket.on(Events.likeProduct, async ({ userId, productId, isLiked }) => {
      const user = await User.findById(userId);
      if (isLiked === true) {
        const isProduct = user.likedProducts.find(function (element) {
          return element === productId;
        });
        if (isProduct !== undefined) {
          return;
        } else {
          const product = Product.findById(productId);
          const owner = User.findById(product.owner);
          product.reputation++;
          owner.reputation++;
          user.likedProducts.push(productId);
          await Promise.all([product.save(), user.save(), owner.save()]);
          emitProductstoRoom(product, io, productId);
        }
      } else {
        const isProduct = user.likedProducts.find(function (element) {
          return element === productId;
        });

        if (isProduct === undefined) return;

        const product = Product.findById(productId);
        const owner = User.findById(product.owner);
        product.reputation--;
        owner.reputation--;
        const filteredLikes = user.likedProducts.filter(function (element) {
          return element !== productId;
        });
        user.likedProducts = filteredLikes;
        await product.save();
        await user.save();
        await owner.save();
        emitProductstoRoom(product, io, productId);
      }
    });

    socket.on(Events.newBid, async ({ userId, productId, newBid }) => {
      const product = await Product.findById(productId);
      newBid = parseInt(newBid);

      if (product.bidType === 'standard' || product.bidType === 'anonymous') {
        if (!product || product.currentHighestBid >= newBid) return;

        //Update Current highest bidder data
        const currBidder = await User.findById(userId);
        if (!currBidder) return;
        // if (currBidder.balance < newBid) return;
        currBidder.balance -= newBid;
        currBidder.currentBids.push(productId);
        await currBidder.save();

        //Update Previous highest bidder data
        const prevBidder = await User.findById(product.currentHighestBidder);
        if (prevBidder) {
          prevBidder.balance += product.currentHighestBid;
          prevBidder.currentBids = prevBidder.currentBids.filter(
            pId => !pId.equals(productId)
          );
          await prevBidder.save();
        }

        //Update Product data
        product.currentHighestBidder = userId;
        product.currentHighestBid = newBid;
        product.bidHistory.push({ time: Date.now(), bid: newBid });
        await product.save();
      } else if (product.bidType === 'reverse') {
        if (!product || product.currentHighestBid <= newBid) return;

        //Update Current Lowest Bidder
        const currBidder = await User.findById(userId);
        currBidder.currentBids.push(productId);
        await currBidder.save();

        //Update Previous Lowest Bidder
        const prevBidder = await User.findById(product.currentHighestBidder);
        if (prevBidder) {
          prevBidder.currentBids = prevBidder.currentBids.filter(
            pId => !pId.equals(productId)
          );
          await prevBidder.save();
        }

        //Update Product Info
        product.currentHighestBidder = userId;
        product.currentHighestBid = newBid;
        product.bidHistory.push({ time: Date.now(), bid: newBid });
        await (await product.save()).populate('currentHighestBidder owner');
      } else {
        return;
      }
      emitProductstoRoom(product, io, productId);
    });
  });
};

module.exports = SocketManager;
