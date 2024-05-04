const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const transactionSchema = new Schema({
  user: { type: String, required: true, ref: "User" },
  hotel: { type: Schema.Types.ObjectId, required: true, ref: "Hotel" },
  room: [{ type: Number, required: true }],
  dateStart: { type: Date, required: true },
  dateEnd: { type: Date, required: true },
  price: { type: Number, required: true },
  payment: { type: String, required: true },
  status: { type: String, required: true },
});
module.exports = mongoose.model("Transaction", transactionSchema);
