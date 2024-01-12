const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const downloadlogSchema = new Schema({
    file_name: {
            type: String,
            required:true
        },
    file_path: {
        type: String,
        required: true
    },
    file_url: {
        type: String,
        required: true
    }, 
    file_size: {
        type: String
    }, 
    file_type: {
        type: String,
        required: true
    },
    updatedAt: {
        type: Date,
        default: Date.now
    },
    user: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    }
})

module.exports = mongoose.model('Downloadlog',downloadlogSchema)
// const Sequelize = require('sequelize');
// const sequelize = require('../util/database'); 

// const Downloadlog = sequelize.define('download_log', {
//     id: {
//         type: Sequelize.INTEGER,
//         primaryKey: true,
//         autoIncrement: true,
//     },
//     file_name: {
//         type: String,
//         allowNull: false,
//     },
//     file_path:{
//         type: String,
//         allowNull: false,
//     },
//     file_url: {
//         type: String,
//         allowNull: false,
//     },
//     file_size: {
//         type: Sequelize.INTEGER,
//     },
//     file_type: {
//         type: String,
//     }
// });

// module.exports = Downloadlog;
