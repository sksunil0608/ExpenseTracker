const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const orderSchema = new Schema({
        payment_id:{
            type:String,
        },
        order_id:{
            type:String,
        },
        status:{
            type:String
        },
    user: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    }
})

module.exports = mongoose.model('Order', orderSchema)

// const Sequelize = require('sequelize');
// const sequelize = require('../util/database');

// const Order = sequelize.define('order',{
//     id:{
//         type: Sequelize.INTEGER,
//         allowNull: false,
//         autoIncrement: true,
//         primaryKey: true,
//         unique: true
//     },
//     payment_id:{
//         type:String,
//     },
//     order_id:{
//         type:String,
//     },
//     status:{
//         type:String
//     }
// })

// module.exports = Order