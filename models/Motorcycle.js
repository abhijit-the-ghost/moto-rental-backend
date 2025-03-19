const mongoose = require("mongoose");

const MotorcycleSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    description: { type: String, required: true },
    company: { type: String, required: true },
    price: { type: Number, required: true },
    status: {
      type: String,
      enum: ["Available", "Rented"],
      default: "Available",
    }, // ✅ Default Status
    addedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    }, // ✅ Admin who added it
  },
  { timestamps: true }
);

module.exports = mongoose.model("Motorcycle", MotorcycleSchema);
