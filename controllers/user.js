const User = require("../models/user");

exports.adminLogin = (req, res, next) => {
  const isAdmin = req.body.isAdmin;
  const username = req.body.username;
  const password = req.body.password;
  const checkError = {};
  if (username.length === 0 || password.length === 0) {
    checkError.announce = "Please input your username and password";

    res.send(checkError);
  } else {
    if (isAdmin) {
      User.findOne({ username: username })
        .then((user) => {
          if (!user) {
            checkError.announce = "Your username or password is invalid";
            res.send(checkError);
          } else {
            if (user.password !== password) {
              checkError.announce = "Your username or password is invalid";
              res.send(checkError);
            } else {
              res.send(user);
            }
          }
        })
        .catch((err) => console.log(err));
    } else {
      checkError.announce = "You are not a admin";
      res.send(checkError);
    }
  }
};

exports.checkRegister = (req, res, next) => {
  const email = req.body.email;
  const password = req.body.password;
  const checkError = {};
  User.find()
    .then((users) => {
      // Check for email
      email.length == 0
        ? (checkError.email = "empty")
        : !email.includes("@")
        ? (checkError.email = "invalid")
        : users.some((user) => user.email === email)
        ? (checkError.email = "duplicate")
        : (checkError.email = "valid");
      // Check for password
      password.length == 0
        ? (checkError.password = "empty")
        : password.length < 8
        ? (checkError.password = "notEnough")
        : (checkError.password = "valid");
      if (checkError.email === "valid" && checkError.password === "valid") {
        const newUser = new User({
          username: email,
          password,
          email,
          fullName: "empty",
          phoneNumber: "empty",
          isAdmin: false,
        });
        return newUser.save();
      } else {
        return checkError;
      }
    })
    .then((result) => {
      res.send(checkError);
    })
    .catch((err) => console.log(err));
};

exports.checkLogin = (req, res, next) => {
  const email = req.body.email;
  const password = req.body.password;
  const checkError = {};
  User.findOne({ username: email })
    .then((user) => {
      // Check for email
      email.length == 0
        ? (checkError.email = "empty")
        : !user
        ? (checkError.email = "notFound")
        : (checkError.email = "valid");
      // Check for password
      password.length == 0
        ? (checkError.password = "empty")
        : password !== user.password
        ? (checkError.password = "notFound")
        : (checkError.password = "valid");
      if (checkError.email === "valid" && checkError.password === "valid") {
        return user;
      } else {
        return checkError;
      }
    })
    .then((result) => {
      res.send(result);
    })
    .catch((err) => console.log(err));
};

exports.fetchUser = (req, res, next) => {
  User.find()
    .then((users) => {
      const allUser = users.map((user) => {
        return {
          _id: user._id,
          fullName: user.fullName,
          email: user.email,
          phoneNumber: user.phoneNumber,
        };
      });
      res.send(allUser);
    })
    .catch((err) => console.log(err));
};
