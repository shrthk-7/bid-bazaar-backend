const socketio = require('socket.io')
const http = require('http');
// var ObjectId = require('mongoose').Types.ObjectId; 
const { Product, User } = require('./models');
const { emit } = require('process');

const emitproduct = (product, socket) =>{
    socket.emit('productinfo', product)
}
const emitproductall = (product, socket, productId) =>{
    socket.to(productId).emit('productinfo', product)
}

SocketManager = (app) => {
    const server=http.createServer(app);
    server.listen(process.env.PORT,()=>{
        console.log("Server up and running")
    })
    const io=socketio(server, {
        cors: {
            origin: "*",
            methods: ["GET", "POST"]
        }
    })
    io.on('connection',async (socket)=>{
        console.log(socket.id + " has joined")
        socket.on('connect-to-room', async (productId, cb) =>{
            socket.join(productId)
            const product = await Product.findById(productId);
            console.log(product)
            cb(`Joined ${productId}`)
            emitproduct(product, socket)
        })

        socket.on('newBid', async (userId,productId, newBid) =>{
            const product = await Product.findById(productId)
            if(product.currentbid < newBid){
                //Change User Data
                const currentBidder = await User.findById(product.currentHighestBidder)
                const oldBalance = currentBidder.balance
                currentBidder.balance = oldBalance + product.currentbid;
                await currentBidder.save()

                //Change product data
                product.currentHighestBidder = userId;
                product.currentbid = newBid;
                await product.save();
                emitproduct(product, socket);
                emitproductall(product, socket, productId);
            }
        })

    })
    

}

module.exports = SocketManager