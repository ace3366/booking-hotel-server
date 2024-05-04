const Transaction = require("../models/transaction");
const User = require("../models/user");
const pagination = require("../util/pagination");

exports.receiveTransaction = (req, res, next) => {
  const user = req.body.userId;
  const hotel = req.body.hotelId;
  const room = req.body.totalRoomNumber.split(",");
  const dateStart = req.body.dateStart;
  const dateEnd = req.body.dateEnd;
  const price = req.body.total;
  const payment = req.body.payment;
  const status = "Booked";

  const name = req.body.name;
  const email = req.body.email;
  const phoneNumber = req.body.phoneNumber;
  const idNumber = req.body.idNumber;

  // Check form value
  const formCheck = {};
  formCheck.name = name.length === 0 ? "Please type in your name" : "valid";
  formCheck.email =
    email.length === 0
      ? "Please type in your email"
      : !email.includes("@")
      ? "Please type in a valid email"
      : "valid";
  formCheck.phoneNumber =
    phoneNumber.length === 0 ? "Please type in your phone number" : "valid";
  formCheck.idNumber =
    idNumber.length === 0 ? "Please type in your id number" : "valid";
  formCheck.room = room.length === 0 ? "Please choose your room" : "valid";
  formCheck.payment =
    payment === "Select Payment Method"
      ? "Please choose your payment method"
      : "valid";
  // If all the conditions is met, save transaction data and User sub info
  if (Object.values(formCheck).every((value) => value === "valid")) {
    const transaction = new Transaction({
      user,
      hotel,
      room,
      dateStart,
      dateEnd,
      price,
      payment,
      status,
    });
    transaction
      .save()
      .then((result) => {
        return User.findById(user);
      })
      .then((fetchedUser) => {
        fetchedUser.fullName = name;
        fetchedUser.phoneNumber = phoneNumber;
        return fetchedUser.save();
      })
      .then((result) => {
        formCheck.valid = true;
        res.send(formCheck);
      })
      .catch((err) => console.log(err));
  } else {
    formCheck.valid = false;
    res.send(formCheck);
  }
};

exports.fetchTransaction = (req, res, next) => {
  Transaction.find({ user: req.params.userId })
    .populate("hotel")
    .then((transactions) => {
      res.send(transactions);
    })
    .catch((err) => console.log(err));
};

exports.summary = (req, res, next) => {
  const summary = {};
  Transaction.find()
    .then((transactions) => {
      summary.orderCount = transactions.length;
      summary.earnings = transactions.reduce(
        (acc, transaction) => (acc += transaction.price),
        0
      );
      summary.balance = summary.earnings;
      return User.find();
    })
    .then((users) => {
      const clientUser = users.filter((user) => user.isAdmin === false);
      summary.userCount = clientUser.length;
      res.send(summary);
    })
    .catch((err) => console.log(err));
};

exports.fetchAll = (req, res, next) => {
  const page = parseInt(req.query.page);
  const pageNum = parseInt(req.query.pageNum);
  const transactionPage = {};
  Transaction.find()
    .populate("hotel")
    .populate("user")
    .then((transactions) => {
      transactionPage.maxPage = Math.ceil(transactions.length / pageNum);
      transactionPage.transactions = pagination(transactions, pageNum, page);
      res.send(transactionPage);
    })
    .catch((err) => console.log(err));
};

exports.recentTransaction = (req, res, next) => {
  Transaction.find()
    .populate("hotel")
    .populate("user")
    .then((transactions) => {
      transactions.reverse();
      const recentTransactions = transactions.slice(0, 8);
      res.send(recentTransactions);
    })
    .catch((err) => console.log(err));
};
