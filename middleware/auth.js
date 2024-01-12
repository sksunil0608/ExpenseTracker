const jwt = require('jsonwebtoken')
const User = require('../models/user')
const authenticate = async (req,res,next)=>{
    try{
        const token = req.header('Authorization');
        
        const newUser = jwt.verify(token,'secretkey')
        const user = await User.findOne({_id:newUser.userId});

        // console.log(JSON.stringify(user))
        req.user = user;
        next();
    }
    catch(err){
        console.log(err)
        return res.status(401).json({Error:"Authentication Error"})
    }
} 

module.exports = {
    authenticate
}