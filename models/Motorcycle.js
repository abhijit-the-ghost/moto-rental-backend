const mongoose = require("mongoose");

const MotorcycleSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    description: { type: String, required: true }, // ✅ Ensure description is required
    company: { type: String, required: true },
    price: { type: Number, required: true }, // ✅ Ensure price is required
    status: {
      type: String,
      enum: ["Available", "Rented"],
      default: "Available",
    },
    image: { type: String, required: true },
    addedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Motorcycle", MotorcycleSchema);
