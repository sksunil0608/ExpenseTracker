const mongoose = require('mongoose')
const Schema = mongoose.Schema;

const expenseSchema = new Schema({
        expense_name: {
            type: String,
            required: true
        },
        expense_price: {
            type: Number,
            required: true,
            default: 0,
        },
        expense_category: {
            type: String,
            required:true,
        },
        user:{
            type: Schema.Types.ObjectId,
            required: true,
            ref: 'User'
        }
})

module.exports = mongoose.model('Expense',expenseSchema)

// const Sequelize = require('sequelize');
// const sequelize = require('../util/database')

// const Expense = sequelize.define('expense', {
//     id: {
//         type: Sequelize.INTEGER,
//         allowNull: false,
//         autoIncrement: true,
//         primaryKey: true,
//         unique: true
//     },
//     expense_name: {
//         type: Sequelize.STRING,
//         allowNull: false
//     },
//     expense_price: {
//         type: Sequelize.DOUBLE,
//         allowNull: false,
//         defaultValue: 0,
//     },
//     expense_category: {
//         type: Sequelize.STRING,
//         allowNull: false,
//     }
// })

// module.exports = Expense;