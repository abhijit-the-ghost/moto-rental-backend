const mongoose = require("mongoose");

const RentalSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    motorcycle: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Motorcycle",
      required: true,
    },
    rentStartDate: { type: Date, required: true },
    rentEndDate: { type: Date, required: true },
    totalPrice: { type: Number, required: true },
    status: {
      type: String,
      enum: ["Ongoing", "Completed"],
      default: "Ongoing",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Rental", RentalSchema);
