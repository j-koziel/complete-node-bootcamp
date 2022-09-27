const mongoose = require("mongoose");

const reviewSchema = new mongoose.Schema({
  review: {
    type: String,
    required: [true, "Review can not be empty!"],
  },
  rating: { type: Number, min: 1, max: 5, optional: true },
  createdAt: { type: Date, required: true, defualt: Date.now },
  tour: [{ type: mongoose.Schema.ObjectId, ref: "Tour" }],
  user: [{ type: mongoose.Schema.ObjectId, ref: "User" }],
});

const Review = mongoose.model("Tour", reviewSchema);

module.exports = Review;
