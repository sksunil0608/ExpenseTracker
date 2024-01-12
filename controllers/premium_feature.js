const Expense = require('../models/expense')
const User = require('../models/user');

exports.getLeaderboard = async (req, res) => {
    try { 
        // const user_leaderboard = await User.find({
        //     attributes:['name','total_expense_amount'],
        //     order:[['total_expense_amount','DESC']]
            
        // })
        const user_leaderboard = await User.find()
        .select('name total_expense_amount')
            .sort({total_expense_amount:-1})

        res.status(200).json({user_leaderboard})

    }
    catch (err) {
        console.log(err)
    }
}