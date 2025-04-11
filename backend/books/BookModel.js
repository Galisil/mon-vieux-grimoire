const mongoose = require("mongoose");

const ratingSchema = mongoose.Schema(
  {
    userId: { type: String, required: true },
    grade: { type: Number, required: true, min: 0, max: 5 },
  },
  { _id: false }
);

const bookSchema = mongoose.Schema({
  title: { type: String, required: true },
  author: { type: String, required: true },
  year: { type: Number, required: true },
  imageUrl: { type: String, required: false },
  userId: { type: String, required: true },
  ratings: { type: [ratingSchema], required: false },
  averageRating: { type: Number, required: false },
});

module.exports = mongoose.model("Book", bookSchema);
