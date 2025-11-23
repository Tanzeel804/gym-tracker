import mongoose from "mongoose";

const weightSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  date: {
    type: Date,
    required: true,
    default: Date.now,
  },
  weight: {
    type: Number,
    required: true,
  },
  unit: {
    type: String,
    enum: ["kg", "lbs"],
    default: "kg",
  },
});

// Ensure one weight entry per user per day
weightSchema.index({ userId: 1, date: 1 }, { unique: true });

export default mongoose.model("Weight", weightSchema);
