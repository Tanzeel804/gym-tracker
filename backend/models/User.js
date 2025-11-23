import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
  },
  password: {
    type: String,
    required: function () {
      return !this.googleId; // Password not required for Google OAuth users
    },
  },
  name: {
    type: String,
    required: true,
  },
  googleId: {
    type: String,
    sparse: true,
  },
  targetWeight: {
    type: Number,
    default: null,
  },
  currentStreak: {
    type: Number,
    default: 0,
  },
  longestStreak: {
    type: Number,
    default: 0,
  },
  badges: [
    {
      type: String,
      enum: ["7-day", "30-day", "100-day"],
    },
  ],
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.model("User", userSchema);
