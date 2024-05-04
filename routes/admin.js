const express = require("express");
const router = express.Router();

const userController = require("../controllers/user");
const transactionController = require("../controllers/transaction");
const hotelController = require("../controllers/hotel");
const roomController = require("../controllers/room");

router.post("/admin-login", userController.adminLogin);

router.get("/fetch-users", userController.fetchUser);

router.get("/fetch-all-transaction", transactionController.fetchAll);
router.get("/transaction-summary", transactionController.summary);
router.get("/recent-transactions", transactionController.recentTransaction);

router.get("/fetch-all-hotel", hotelController.fetchAll);
router.get("/fetch-full-hotel", hotelController.fetchFullHotel);
router.get("/fetch-all-room", roomController.fetchAllRoom);

router.post("/delete-hotel", hotelController.deleteHotel);
router.post("/delete-room", roomController.deleteRoom);

router.post("/new-hotel", hotelController.createHotel);
router.post("/new-room", roomController.createRoom);

router.get("/edit-hotel/:hotelId", hotelController.getEditHotel);
router.post("/edit-hotel/:hotelId", hotelController.postEditHotel);

router.get("/edit-room/:roomId", roomController.getEditRoom);
router.post("/edit-room/:roomId", roomController.postEditRoom);

module.exports = router;
