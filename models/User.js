const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema(
  {
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    dob: { type: Date, required: true },
    phoneNumber: { type: String, required: true },
    isForeigner: { type: Boolean, required: true },
    role: { type: String, enum: ["user", "admin"], default: "user" },
    verified: { type: Boolean, default: false },
    drivingLicense: { type: String, default: "" }, // Remains optional
    passport: { type: String, default: "" }, // Remains optional
    rentedMotorcycles: [
      {
        motorcycle: { type: mongoose.Schema.Types.ObjectId, ref: "Motorcycle" },
        rentStartDate: { type: Date, required: true },
        rentEndDate: { type: Date, required: true },
        status: {
          type: String,
          enum: ["Available", "Rented"],
          default: "Rented",
        },
        totalCost: { type: Number, required: true },
        image: { type: String, default: "" },
      },
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", UserSchema);
