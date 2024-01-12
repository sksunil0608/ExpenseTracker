const Expense = require("../models/expense");
const mongoose = require('mongoose')
const UserService = require('../services/userservice')
const S3Service = require('../services/S3Service')
const path = require('path')
const Downloadlog = require('../models/download_log')

function isInValidString(str) {
  return (str == undefined || str.length == 0) ? true : false
}

exports.getadminDashboardView = (req,res)=>{
  res.sendFile(path.join(__dirname, '..', 'public', 'admin.html'));
}

exports.getExpenseReportView = (req, res) => {
    return res.sendFile(path.join(__dirname, '..', 'public', 'expense-report.html'));
}


exports.getDownloadReport = async (req,res)=>{
  const session = await mongoose.startSession();
  session.startTransaction();
  // file_path
  try{
    const expenses = await Expense.find({user:req.user})
    const stringified_expense = JSON.stringify(expenses)
    const file_name = `Expense-${req.user.name}`
    const file_type = `.txt`;
    const file_path = `${file_name}/${new Date()}${file_type}`
    const file_url = await S3Service.uploadtoS3(stringified_expense,file_path);

    const download_log = new Downloadlog({
      file_name: file_name,
      file_path: file_path,
      file_url: file_url,
      file_type:file_type,
      user:req.user
    })
    await download_log.save({session})
    await session.commitTransaction();
    session.endSession();
    res.status(201).json({file_url:file_url})

  }catch(err){
    session.abortTransaction();
    session.endSession();
    console.log(err)
    res.status(401).json({"Authorization Errror":"User is not authorized to Download"})
  }
}

exports.getAllDownloadHistory = async (req,res)=>{
    try{
      const response = await Downloadlog.find({user:req.user});
      res.status(201).json({download_history:response})
    }catch(err){
      console.log(err)
      res.status(500).json({ Error: "Internal Server Error" });
    }
}
exports.getExpense = async (req, res, next) => {
  const expenseId = req.params.expenseId;
  const expense = await Expense.findOne({_id:expenseId});
  res.json({ all_expenses: expense });
};

exports.getExpenses = async (req, res, next) => {
  const page = req.query.page || 1  
  const items_per_page = parseInt(req.query.items_per_page) || 10
  const offset = (page - 1) * items_per_page; 
  try{
  const expenses = await Expense.find({user:req.user}).skip(offset).limit(items_per_page);
  const total_expenses = await req.user.total_expenses
  const totalPages = Math.ceil(total_expenses/items_per_page)
  const user_total_expense_amount = await req.user.total_expense_amount
  res.json({ all_expenses: expenses ,total_expense:user_total_expense_amount,totalPages:totalPages});
  }
  catch(err){
    console.log("Some Error Occured while getting expeses")
    res.status(500).json({Error:"Internal Server Error"})
  }
};

exports.postAddExpense = async (req, res, next) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  const expense_name = req.body.expense_name;
  const expense_price = req.body.expense_price;
  const expense_category = req.body.expense_category;
  if(isInValidString(expense_name) ||isInValidString(expense_price)||isInValidString(expense_category)){
    return res.status(400).json({Error:"Bad Requese, Something Went Wrong"})
  }
  try {
    const response = new Expense({
      expense_name: expense_name,
      expense_price: expense_price,
      expense_category: expense_category,
      user:req.user
    }
      );
    await response.save({ session });
    const user_total_expense_amount = await req.user.total_expense_amount
    const user_total_expenses = await req.user.total_expenses
    if( user_total_expense_amount === 0 || user_total_expense_amount === null||user_total_expenses===0 ||user_total_expenses===null){
      req.user.total_expense_amount = expense_price
      req.user.total_expenses = 1
    }
    else{
      req.user.total_expense_amount = req.user.total_expense_amount + + expense_price
      req.user.total_expenses = req.user.total_expenses + + 1
    }
    await req.user.save({ session });

    // Commit the transaction
    await session.commitTransaction();
    session.endSession();

    res.json({
      all_expenses: {
        id: response.id,
        expense_name: response.expense_name,
        expense_price: response.expense_price,
        expense_category: response.expense_category,
} });
  } catch (err) {
    // If an error occurs, abort the transaction
    await session.abortTransaction();
    session.endSession();
    res.status(500).json({ Error: "Internal Server Error" });
  }
};

exports.postEditExpense = async (req, res, next) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  const expenseId = req.params.expenseId;
  const expense_name = req.body.expense_name;
  const expense_price = req.body.expense_price;
  const expense_category = req.body.expense_category;
  try {
    const expense = await Expense.findOne({ _id:expenseId});
    // Save the current expense_price before updating the expense
    const previousPrice = expense.expense_price;
    expense.expense_name = expense_name;
    expense.expense_price = expense_price;
    expense.expense_category = expense_category;

    await expense.save({session});

    // Subtract the previous expense_price from total_expensess
    req.user.total_expense_amount -= previousPrice;
    // Add the new expense_price to total_expensess
    req.user.total_expense_amount = req.user.total_expense_amount + + expense_price;
    await req.user.save({session});
    
    await session.commitTransaction();
    await session.endSession();

    res.json({ all_expenses: expense });

  } catch (err) {
    await session.abortTransaction();
    session.endSession();
    return res.status(500).json({ Error: "Internal Server Error" });
  }
};

exports.postdeleteExpenses = async (req, res, next) => {
  const session = await mongoose.startSession();
  session.startTransaction();
    try {
      const expenseId = req.params.expenseId;
      const expense = await Expense.findOne({ _id: expenseId })
      if (!expense) {
        return res.status(404).json({ Error: "Expense not found" });
      }
      const total_expense_amount = await req.user.total_expense_amount;
      const total_expense = await req.user.total_expenses;
      if (total_expense || total_expense_amount) {
        req.user.total_expense_amount -= expense.expense_price;
        req.user.total_expenses -= 1
      }
      await req.user.save({session});
      // Deleting the Expense
      await Expense.findOneAndDelete({_id:expenseId,user:req.user})
        
      await session.commitTransaction();
      session.endSession();

      res.json({ status: "Deleted Successfully" });

    } catch (err) {
        await session.abortTransaction();
        session.endSession();
        return res.status(500).json({ Error: "Internal Server Error" });
    }
};

