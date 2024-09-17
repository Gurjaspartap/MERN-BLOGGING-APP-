import mongoose from "mongoose";
import validator from "validator";
const { Schema } = mongoose;
const userSchema = new Schema({
  name: { type: String, required: true },
  email: {
    type: String,
    required: true,
    unique: true,
    validate: [validator.isEmail, "Please enter a valis email"],
  },
  phone: {
    type: Number,
    required: true,
    unique: true,
  },
  photo: {
    public_id: {
      type: String,
      required: true,
    },
    url: {
      type: String,
      required: true,
    },
  },
  password: { type: String, required: true },
  role: { type: String, required: true, enum: ["user", "admin"] },
  createdAt: { type: Date, default: Date.now },
});
export const User = mongoose.model("User", userSchema);
