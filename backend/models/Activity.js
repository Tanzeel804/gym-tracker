import mongoose from "mongoose";

const activitySchema = new mongoose.Schema({
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
  type: {
    type: String,
    enum: ["walking", "running", "cycling"],
    default: "walking",
  },
  distance: {
    type: Number, // in kilometers
    required: true,
  },
  duration: Number, // in minutes
  calories: Number, // estimated calories burned
});

activitySchema.index({ userId: 1, date: -1 });

export default mongoose.model("Activity", activitySchema);
