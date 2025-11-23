import mongoose from "mongoose";

const workoutSchema = new mongoose.Schema({
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
  musclesHit: [
    {
      type: String,
      enum: ["Chest", "Back", "Legs", "Arms", "Shoulders", "Abs"],
      required: true,
    },
  ],
  exercises: [
    {
      name: String,
      sets: Number,
      reps: Number,
      weight: Number,
      notes: String,
    },
  ],
  duration: Number, // in minutes
  notes: String,
});

// Index for faster queries
workoutSchema.index({ userId: 1, date: -1 });

export default mongoose.model("Workout", workoutSchema);
