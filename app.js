const dotEnv = require("dotenv");
dotEnv.config();
// Import lib
const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
// Import internal
const adminRouter = require("./routes/admin");
const clientRouter = require("./routes/client");
// Run app
const app = express();
const port = process.env.PORT || 5000;

app.use(bodyParser.json());
app.use(cors());
app.use(adminRouter);
app.use(clientRouter);

mongoose
  .connect(
    "mongodb+srv://poohmandu22:xuannam23@hotel.v71xhed.mongodb.net/booking?retryWrites=true&w=majority&appName=Hotel"
  )
  .then((result) => {
    app.listen(port, () => {
      console.log(`server is running on ${port}`);
    });
  })
  .catch((err) => console.log(err));
