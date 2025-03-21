const mongoose = require("mongoose");

const bookSchema = mongoose.Schema({
  title: { type: String, required: true },
  author: { type: String, required: true },
  year: { type: Number, required: true },
  imageUrl: { type: String, required: false },
  userId: { type: String, required: true },
  ratings: { type: Array, required: false },
  averageRating: { type: Number, required: false },
});

module.exports = mongoose.model("Book", bookSchema);
