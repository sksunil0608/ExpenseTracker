const mongoose = require('mongoose')
const Schema = mongoose.Schema;

const userSchema = new Schema({
    name:{
        type:String,
        required:true
    },
    email: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    is_premium_user: {
        type: Boolean,
        required: true,
        default:false
    },
    total_expense_amount: {
        type: Number,
        default:0
    },
    total_expenses: {
        type: Number,
        default:0
    },
})

module.exports = mongoose.model('User',userSchema)

// const Sequelize = require('sequelize');
// const sequelize = require('../util/database');

// const User = sequelize.define('user',{
//     id:{
//         type:Sequelize.INTEGER,
//         allowNull:false,
//         autoIncrement:true,
//         unique:true,
//         primaryKey:true
//     },
//     name:{
//         type:Sequelize.STRING,
//         allowNull:false
//     },
//     email: {
//         type: Sequelize.STRING,
//         allowNull: false,
//         unique:true
//     },
//     password:{
//         type:Sequelize.STRING,
//         allowNull:false
//     },
//     is_premium_user:{
//         type:Sequelize.BOOLEAN,
//         allowNull:false,
//         defaultValue: false,
//     },
//     total_expense_amount:{
//         type:Sequelize.INTEGER
//     },
//     total_expenses: {
//         type: Sequelize.INTEGER
//     }
// })

// module.exports = User