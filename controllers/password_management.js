const uuid = require('uuid')
const bcrypt = require('bcrypt')
const path = require('path')
require('dotenv').config();
const Forgotpassword = require('../models/forgot_password')
const User = require('../models/user')
const email = require('../services/email')

const getForgotPasswordView = (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'public', 'authentication', 'forgot-password.html'));
}

const getResetPasswordView = async (req, res) => {
    try {
        const uuid = req.params.uuid
        const forget_request = await Forgotpassword.findOne({uuid:uuid})

        if (forget_request.active === false) {
            return res.status(403).json({ Error: "Reset Link Expired" })
        }
        if (forget_request) {
            forget_request.active = false;
            await forget_request.save();
            res.sendFile(path.join(__dirname, '..', 'public', 'authentication', 'reset-password.html'));

        }
    } catch (err) {
        res.status(500).json({ Error: "Internal Server Error" })
    }
}

const postForgotPassword = async (req, res) => {
    try {
        const user_email = req.body.email;
        const user = await User.findOne({ email: user_email })
        if (user) {
            const id = uuid.v4()
            const new_password = new Forgotpassword({
                uuid:id,
                active: true,
                expires_by: new Date(Date.now() + 30 * 60000),
                user: user._id
            });
            await new_password.save()
            const msg = {
                to: user_email,
                from: process.env.FROM_EMAIL, // Change to your verified sender
                subject: 'Forgot Password',
                text: 'You requested a password reset. Please follow the link to reset your password.',
                html: `<p>You requested a password reset. Please follow the link to reset your password.</p>
                <a href="http://localhost:3000/reset-password/${id}">Reset password</a>`,
            };
            const result = await email.sendEmail(msg)
            if (result.status === 202) {
                return res.status(result.status).json({ message: 'Link to reset password sent to your mail ', sucess: true })
            }
        }
        else {
            
            throw new Error('User Does Not Exist')
        }

    }
    catch (err) {
        console.log(err)
        res.status(500).json({ Error: "Internal Server Error" })
    }

}




const resetPassword = async (req,res)=>{
    try{
        const new_passwrod = req.body.password
        const resetId = req.params.uuid
        const reset_request = await Forgotpassword.findOne({uuid:resetId})
        const user = await User.findOne({_id:reset_request.user})

        if(user){
            const saltrounds = 10;
            bcrypt.genSalt(saltrounds, async (err, salt) => {
                if (!err) {
                    bcrypt.hash(new_passwrod,salt,async(err,hash)=>{
                        if(!err){
                            user.password = hash
                            await user.save()
                            return res.status(201).json({ Success: "User Updated Successfully" })
                        }
                    })
                }
                else {
                    console.log("Error")
                    throw new Error("Some Error Occured")
                }
            })
        }
        else{
            return res.status(404).json({ error: 'No user Exists', success: false })
        }

    }catch(err){
        console.log(err)
        return res.status(403).json({ err, success: false })
    }
}

module.exports = {
    getForgotPasswordView,
    postForgotPassword,
    getResetPasswordView,
    resetPassword,
    
}
