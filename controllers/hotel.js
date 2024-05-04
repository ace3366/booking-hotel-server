const Hotel = require("../models/hotel");
const Transaction = require("../models/transaction");
const Room = require("../models/room");
const pagination = require("../util/pagination");

let fetchedHotel = [];
exports.hotelRegionCount = (req, res, next) => {
  const cityInfo = {
    HaNoi: {
      id: "c1",
      name: "Ha Noi",
      image: "./City Image/Ha Noi.jpg",
    },
    HoChiMinh: { id: "c2", name: "Ho Chi Minh", image: "./City Image/HCM.jpg" },
    DaNang: { id: "c3", name: "Da Nang", image: "./City Image/Da Nang.jpg" },
  };
  Hotel.find({ city: "Ha Noi" })
    .then((hotels) => {
      cityInfo.HaNoi.quantity = hotels.length;
      return Hotel.find({ city: "Ho Chi Minh" });
    })
    .then((hotels) => {
      cityInfo.HoChiMinh.quantity = hotels.length;
      return Hotel.find({ city: "Da Nang" });
    })
    .then((hotels) => {
      cityInfo.DaNang.quantity = hotels.length;
      res.send(cityInfo);
    })
    .catch((err) => console.log(err));
};

exports.typeCount = (req, res, next) => {
  const typeCount = {
    hotel: {
      name: "Hotels",
      image: "./images/type_1.webp",
      id: "t1",
    },
    apartment: {
      name: "Apartments",
      image: "./images/type_2.jpg",
      id: "t2",
    },
    resort: {
      name: "Resorts",
      image: "./images/type_3.jpg",
      id: "t3",
    },
    villa: {
      name: "Villas",
      image: "./images/type_4.jpg",
      id: "t4",
    },
    cabin: {
      name: "Cabins",
      image: "./images/type_5.jpg",
      id: "t5",
    },
  };
  Hotel.find({ type: "hotel" })
    .then((type) => {
      typeCount.hotel.count = type.length;
      return Hotel.find({ type: "apartments" });
    })
    .then((type) => {
      typeCount.apartment.count = type.length;
      return Hotel.find({ type: "resorts" });
    })
    .then((type) => {
      typeCount.resort.count = type.length;
      return Hotel.find({ type: "resorts" });
    })
    .then((type) => {
      typeCount.villa.count = type.length;
      return Hotel.find({ type: "villas" });
    })
    .then((type) => {
      typeCount.cabin.count = type.length;
      return Hotel.find({ type: "cabins" });
    })
    .then((result) => {
      res.send(typeCount);
    });
};

exports.topHotel = (req, res, next) => {
  Hotel.find()
    .then((hotels) => {
      const top3Hotel = hotels.sort((a, b) => b.rating - a.rating).slice(0, 3);
      res.send(top3Hotel);
    })
    .catch((err) => console.log(err));
};

exports.findHotel = (req, res, next) => {
  const findDate = JSON.parse(req.body.date);
  findDate.startDate = Date.parse(findDate[0].startDate);
  findDate.endDate = Date.parse(findDate[0].endDate);

  Hotel.find({ city: req.body.city })
    .populate("rooms")
    .then((hotels) => {
      if (hotels.length === 0) {
        res.send({ message: "Not Found" });
      }
      // Tìm xem những hotel vừa kiếm được nằm trong transaction nào
      // Nếu không có thì có thể trả về client
      return Transaction.find({
        $or: hotels.map((hotel) => {
          return { hotel };
        }),
      }).then((transactions) => {
        if (transactions.length === 0) {
          fetchedHotel = hotels;
          res.send({ message: "Founded" });
        } else {
          // Lọc những transaction trùng date với phần client đang tìm
          const filteredTransaction = transactions.filter((transaction) => {
            const tranStart = Date.parse(transaction.dateStart);
            const tranEnd = Date.parse(transaction.dateEnd);
            return !(
              transaction.dateStart > findDate.endDate ||
              transaction.dateEnd < findDate.startDate
            );
          });
          // Nếu không có transaction nào trùng thì trả về client list hotel
          if (filteredTransaction.length === 0) {
            fetchedHotel = hotels;
            res.send({ message: "Founded" });
          } else {
            // Nếu trùng ngày thì kiểm tra xem còn phòng trống không
            let availableHotel = hotels.map((hotel) => {
              // Lấy tất cả room number của từng hotel
              let hotelRoomNumbers = hotel.rooms.map((room) =>
                room.roomNumbers.toString()
              );
              hotelRoomNumbers = hotelRoomNumbers.toString().split(",");
              // Xem những phòng nào chưa được Book
              const roomLeft = hotelRoomNumbers.filter((room) => {
                return filteredTransaction.some(
                  (transaction) => !transaction.room.includes(room)
                );
              });
              // Trả về Object bao gồm hotel và số phòng còn trống của hotel đó
              return { ...hotel._doc, roomLeft };
            });
            // Lọc những hotel còn phòng trống
            // availableHotel = availableHotel.filter(
            //   (aHotel) => aHotel.roomLeft.length > 0
            // );
            fetchedHotel = availableHotel;
            res.send({ message: "Founded" });
          }
        }
      });
    })
    .catch((err) => console.log(err));
};

exports.foundHotel = (req, res, next) => {
  res.send(fetchedHotel);
};

exports.hotelDetail = (req, res, next) => {
  Hotel.findById(req.params.hotelId)
    .populate("rooms")
    .then((hotel) => {
      res.send(hotel);
    })
    .catch((err) => console.log(err));
};

exports.fetchAll = (req, res, next) => {
  const page = parseInt(req.query.page);
  const pageNum = parseInt(req.query.pageNum);
  const hotelPage = {};
  Hotel.find()
    .then((hotels) => {
      hotelPage.maxPage = Math.ceil(hotels.length / pageNum);
      hotelPage.hotels = pagination(hotels, pageNum, page);
      res.send(hotelPage);
    })
    .catch((err) => console.log(err));
};

exports.fetchFullHotel = (req, res, next) => {
  Hotel.find()
    .then((hotels) => {
      res.send(hotels);
    })
    .catch((err) => console.log(err));
};

exports.deleteHotel = (req, res, next) => {
  Transaction.find({ hotel: req.body.id })
    .then((hotel) => {
      if (hotel.length !== 0) {
        res.send({ message: "Can not delete" });
      } else {
        return Hotel.findByIdAndDelete(req.body.id);
      }
    })
    .then((result) => {
      res.send({ message: "Deleted" });
    })
    .catch((err) => console.log(err));
  //
};

exports.createHotel = (req, res, next) => {
  const name = req.body.name;
  const type = req.body.type;
  const city = req.body.city;
  const title = req.body.title;
  const cheapestPrice = req.body.price;
  const address = req.body.address;
  const distance = req.body.distance;
  const photos = req.body.images.split("\n");
  const desc = req.body.desc;
  const featured = req.body.featured;
  const fetchedRooms = req.body.rooms.split(",");

  const hotelCheck = {};

  hotelCheck.name = name.length === 0 ? "Please type in hotel's name" : "valid";
  hotelCheck.type = type.length === 0 ? "Please type in hotel's type" : "valid";
  hotelCheck.city = city.length === 0 ? "Please type in hotel's city" : "valid";
  hotelCheck.price =
    cheapestPrice.length === 0 ? "Please type in hotel's price" : "valid";
  hotelCheck.address =
    address.length === 0 ? "Please type in hotel's address" : "valid";
  hotelCheck.distance =
    distance.length === 0 ? "Please type in distance to center" : "valid";
  hotelCheck.images =
    req.body.images.length === 0 ? "Please type in hotel's photos" : "valid";
  hotelCheck.desc =
    desc.length === 0 ? "Please type in hotel's description" : "valid";
  hotelCheck.title =
    title.length === 0 ? "Please type in hotel's title" : "valid";
  hotelCheck.rooms =
    req.body.rooms.length === 0 ? "Please type in hotel's rooms" : "valid";
  if (Object.values(hotelCheck).every((value) => value === "valid")) {
    // Filter room base on room title
    Room.find()
      .then((allRooms) => {
        const filterdRooms = allRooms.filter((room) =>
          fetchedRooms.some((fetchedRoom) => fetchedRoom === room.title)
        );
        const rooms = filterdRooms.map((filterdRoom) => filterdRoom._id);
        const hotel = new Hotel({
          title,
          cheapestPrice,
          name,
          type,
          city,
          address,
          distance,
          photos,
          desc,
          featured,
          rooms,
        });
        return hotel.save();
      })
      .then((result) => {
        res.send({ message: "New hotel has been created" });
      })
      .catch((err) => console.log(err));
  } else {
    res.send(hotelCheck);
  }
};

exports.getEditHotel = (req, res, next) => {
  const hotelId = req.params.hotelId;
  Hotel.findById(hotelId)
    .populate("rooms")
    .then((hotel) => {
      res.send(hotel);
    })
    .catch((err) => {
      console.log(err);
    });
};

exports.postEditHotel = (req, res, next) => {
  const name = req.body.name;
  const type = req.body.type;
  const city = req.body.city;
  const title = req.body.title;
  const cheapestPrice = req.body.price;
  const address = req.body.address;
  const distance = req.body.distance;
  const photos = req.body.images.split("\n");
  const desc = req.body.desc;
  const featured = req.body.featured;
  const fetchedRooms = req.body.rooms.split("\n");

  const hotelCheck = {};

  hotelCheck.name = name.length === 0 ? "Please type in hotel's name" : "valid";
  hotelCheck.type = type.length === 0 ? "Please type in hotel's type" : "valid";
  hotelCheck.city = city.length === 0 ? "Please type in hotel's city" : "valid";
  hotelCheck.price =
    cheapestPrice.length === 0 ? "Please type in hotel's price" : "valid";
  hotelCheck.address =
    address.length === 0 ? "Please type in hotel's address" : "valid";
  hotelCheck.distance =
    distance.length === 0 ? "Please type in distance to center" : "valid";
  hotelCheck.images =
    req.body.images.length === 0 ? "Please type in hotel's photos" : "valid";
  hotelCheck.desc =
    desc.length === 0 ? "Please type in hotel's description" : "valid";
  hotelCheck.title =
    title.length === 0 ? "Please type in hotel's title" : "valid";
  hotelCheck.rooms =
    req.body.rooms.length === 0 ? "Please type in hotel's rooms" : "valid";
  if (Object.values(hotelCheck).every((value) => value === "valid")) {
    // Filter room base on room title
    Room.find()
      .then((allRooms) => {
        const filterdRooms = allRooms.filter((room) =>
          fetchedRooms.some((fetchedRoom) => fetchedRoom === room.title)
        );
        const rooms = filterdRooms.map((filterdRoom) => filterdRoom._id);
        return Hotel.findById(req.params.hotelId).then((hotel) => {
          hotel.title = title;
          hotel.cheapestPrice = cheapestPrice;
          hotel.name = name;
          hotel.type = type;
          hotel.city = city;
          hotel.address = address;
          hotel.distance = distance;
          hotel.photos = photos;
          hotel.desc = desc;
          hotel.featured = featured;
          hotel.rooms = rooms;
          return hotel.save();
        });
      })

      .then((result) => {
        res.send({ message: "Hotel has been edited" });
      })
      .catch((err) => console.log(err));
  } else {
    res.send(hotelCheck);
  }
};
