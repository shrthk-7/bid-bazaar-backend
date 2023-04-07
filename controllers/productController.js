const {User, Product} = require('../models')

exports.addProduct =async (req,res,next) => {
    const product = req.body;
    const owner = User.findById(product.owner);
    if(!owner){
        return res.status(404).json({
            status: 'fail',
            message: 'user not found',
        });
    }




}