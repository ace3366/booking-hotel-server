const Room = require("../models/room");
const Hotel = require("../models/hotel");
const Transaction = require("../models/transaction");
const pagination = require("../util/pagination");

exports.fetchAllRoom = (req, res, next) => {
  const page = parseInt(req.query.page);
  const pageNum = parseInt(req.query.pageNum);
  const roomPage = {};
  Room.find()
    .then((rooms) => {
      roomPage.maxPage = Math.ceil(rooms.length / pageNum);
      roomPage.rooms = pagination(rooms, pageNum, page);
      res.send(roomPage);
    })
    .catch((err) => console.log(err));
};

exports.deleteRoom = (req, res, next) => {
  const roomId = req.body.id;
  Transaction.find({ status: "Booked" })
    .populate("hotel")
    .then((transactions) => {
      Room.findById(roomId)
        .then((room) => {
          if (
            transactions.some(
              (transaction) =>
                transaction.hotel.rooms.includes(roomId) &&
                transaction.room.some((tranRoom) =>
                  room.roomNumbers.includes(tranRoom)
                )
            )
          ) {
            res.send({ message: "Can not delete" });
          } else {
            return Room.findByIdAndDelete(roomId);
          }
        })
        .then((result) => {
          res.send({ message: "Deleted" });
        })
        .catch((err) => console.log(err));
    })
    .catch((err) => console.log(err));
};

exports.createRoom = (req, res, next) => {
  const title = req.body.title;
  const price = req.body.price;
  const maxPeople = req.body.maxPeople;
  const desc = req.body.desc;
  const roomNumbers = req.body.roomNumbers.split(",");
  const hotel = req.body.hotel;

  const roomCheck = {};

  roomCheck.title =
    title.length === 0 ? "Please type in room's title" : "valid";
  roomCheck.price =
    price.length === 0 ? "Please type in room's price" : "valid";
  roomCheck.maxPeople =
    maxPeople.length === 0
      ? "Please type in maximum people in a room"
      : "valid";
  roomCheck.desc =
    desc.length === 0 ? "Please type in room's description" : "valid";
  roomCheck.roomNumbers =
    roomNumbers.length === 0 ? "Please type in room's number" : "valid";

  if (Object.values(roomCheck).every((value) => value === "valid")) {
    const room = new Room({ title, price, maxPeople, desc, roomNumbers });
    room
      .save()
      .then((newRoom) => {
        // Push new Room Id into Hotel model
        return Hotel.findById(hotel)
          .then((hotel) => {
            if (hotel.rooms.includes(newRoom)) {
              return null;
            } else {
              hotel.rooms.push(newRoom);
              return hotel.save();
            }
          })
          .catch((err) => console.log(err));
      })
      .then((result) => {
        res.send({ message: "New room has been created" });
      })
      .catch((err) => console.log(err));
  } else {
    res.send(roomCheck);
  }
};

exports.getEditRoom = (req, res, next) => {
  const roomId = req.params.roomId;
  Room.findById(roomId)
    .then((room) => res.send(room))
    .catch((err) => console.log(err));
};

exports.postEditRoom = (req, res, next) => {
  const title = req.body.title;
  const price = req.body.price;
  const maxPeople = req.body.maxPeople;
  const desc = req.body.desc;
  const roomNumbers = req.body.roomNumbers.split(",");
  const hotel = req.body.hotel;

  const roomCheck = {};

  roomCheck.title =
    title.length === 0 ? "Please type in room's title" : "valid";
  roomCheck.price =
    price.length === 0 ? "Please type in room's price" : "valid";
  roomCheck.maxPeople =
    maxPeople.length === 0
      ? "Please type in maximum people in a room"
      : "valid";
  roomCheck.desc =
    desc.length === 0 ? "Please type in room's description" : "valid";
  roomCheck.roomNumbers =
    roomNumbers.length === 0 ? "Please type in room's number" : "valid";

  if (Object.values(roomCheck).every((value) => value === "valid")) {
    Room.findById(req.params.roomId)
      .then((room) => {
        room.title = title;
        room.price = price;
        room.maxPeople = maxPeople;
        room.desc = desc;
        room.roomNumbers = roomNumbers;

        return room.save();
      })
      .then((newRoom) => {
        // Push new Room Id into Hotel model
        return Hotel.findById(hotel)
          .then((hotel) => {
            hotel.rooms.push(newRoom);
            return hotel.save();
          })
          .catch((err) => console.log(err));
      })
      .then((result) => {
        res.send({ message: "Room has been edited" });
      })
      .catch((err) => console.log(err));
  } else {
    res.send(roomCheck);
  }
};
