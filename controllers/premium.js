require('dotenv').config();
const Razorpay = require('razorpay');
const mongoose = require('mongoose')
const Order = require('../models/order');
const userController = require('./user')

exports.getBuyPremium = async (req, res, next) => {
    const session = await mongoose.startSession()
    session.startTransaction();
    try {
        if (req.user.is_premium_user == true) {
            return res.status(403).json({ Error: "You are already a premium User" })
        }
        var rzp = new Razorpay({
            key_id: process.env.RAZORPAY_KEY_ID,
            key_secret: process.env.RAZORPAY_KEY_SECRET
        })

        const amount = 2990;
        rzp.orders.create({ amount, currency: "INR" }, async (err, order) => {
            if (err) {
                throw new Error(JSON.stringify(err));
            }
            try {
                const new_order = new Order({
                    order_id: order.id,
                    status: 'PENDING',
                    user: req.user
                })
                await new_order.save({ session })
                await session.commitTransaction();
                session.endSession()
                return res.status(201).json({ order, key_id: rzp.key_id })
            }
            catch (err) {
                session.abortTransaction();
                session.endSession();
                res.status(404).json({ Error: "Something Went Wrong!! Payment Failed" })
            }
        })
    }
    catch (err) {
        res.status(404).json({ Error: "Something Went Wrong!! Nothing Found" })
    }
}

exports.postTransactionStatus = async (req, res) => {

    const { payment_id, order_id } = req.body
    try {
        const order_info = await Order.findOne({ order_id: order_id })

        order_info.payment_id = payment_id;
        order_info.status = "SUCCESS";
        await order_info.save()

        req.user.is_premium_user = true;
        await req.user.save()

        return res.status(202).json({ success: "Transaction Successful", token: userController.generateAccessToken(req.user.id, req.user.name, true) })
    }
    catch (err) {
        const order_info = await Order.findOne({ order_id: order_id })
        order_info.payment_id = payment_id;
        order_info.status = "FAILED";
        await order_info.save()

        res.status(404).json({ Error: "Something Went Wrong!! Payment Failed" })
    }
}