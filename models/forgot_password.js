const mongoose = require('mongoose')
const Schema = mongoose.Schema;

const forgot_passwordSchema = new Schema ({
    uuid:{
        type:'UUID',
        required:true
    },
    active:{
        type:Boolean,
        requied:true
    },
    expires_by:{
        type:Date
    },
    user:{
        type:Schema.Types.ObjectId,
        ref:'User',
        required:true
    }
})

module.exports = mongoose.model('forgot_password',forgot_passwordSchema)

// const Sequelize = require('sequelize');
// const sequelize = require('../util/database');


// const Forgotpassword = sequelize.define('forgot_password', {
//     id: {
//         type: Sequelize.UUID,
//         allowNull: false,
//         primaryKey: true
//     },
//     active: Sequelize.BOOLEAN,
//     expires_by: Sequelize.DATE
// })

// module.exports = Forgotpassword;