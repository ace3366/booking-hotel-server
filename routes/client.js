const express = require("express");
const router = express.Router();
const userController = require("../controllers/user");
const hotelController = require("../controllers/hotel.js");
const transactionController = require("../controllers/transaction");

router.post("/register", userController.checkRegister);

router.post("/login", userController.checkLogin);

router.get("/hotel-count", hotelController.hotelRegionCount);

router.get("/type-count", hotelController.typeCount);

router.get("/top-hotel", hotelController.topHotel);

router.post("/find-hotel", hotelController.findHotel);
router.get("/find-hotel", hotelController.foundHotel);

router.get("/hotel-detail/:hotelId", hotelController.hotelDetail);

router.post("/reserve", transactionController.receiveTransaction);
router.get(
  "/fetch-transaction/:userId",
  transactionController.fetchTransaction
);
module.exports = router;
