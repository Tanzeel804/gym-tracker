import express from "express";
import auth from "../middleware/auth.js";
import Workout from "../models/Workout.js";
import User from "../models/User.js";

const router = express.Router();

// Get all workouts for user
router.get("/", auth, async (req, res) => {
  try {
    const workouts = await Workout.find({ userId: req.userId })
      .sort({ date: -1 })
      .limit(50);
    res.json(workouts);
  } catch (error) {
    res.status(500).json({ message: "Error fetching workouts" });
  }
});

// Add workout
router.post("/", auth, async (req, res) => {
  try {
    const { musclesHit, exercises, duration, notes, date } = req.body;

    const workout = new Workout({
      userId: req.userId,
      musclesHit,
      exercises,
      duration,
      notes,
      date: date || new Date(),
    });

    await workout.save();

    // Update user streak
    await updateUserStreak(req.userId);

    res.status(201).json(workout);
  } catch (error) {
    res.status(500).json({ message: "Error creating workout" });
  }
});

// Update streak function
async function updateUserStreak(userId) {
  const user = await User.findById(userId);
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  // Check if user has worked out today and yesterday
  const todayWorkout = await Workout.findOne({
    userId,
    date: { $gte: today },
  });

  const yesterdayWorkout = await Workout.findOne({
    userId,
    date: { $gte: yesterday, $lt: today },
  });

  if (todayWorkout) {
    if (yesterdayWorkout) {
      // Continue streak
      user.currentStreak += 1;
    } else {
      // Start new streak
      user.currentStreak = 1;
    }

    // Update longest streak
    if (user.currentStreak > user.longestStreak) {
      user.longestStreak = user.currentStreak;
    }

    // Award badges
    if (user.currentStreak >= 7 && !user.badges.includes("7-day")) {
      user.badges.push("7-day");
    }
    if (user.currentStreak >= 30 && !user.badges.includes("30-day")) {
      user.badges.push("30-day");
    }
    if (user.currentStreak >= 100 && !user.badges.includes("100-day")) {
      user.badges.push("100-day");
    }

    await user.save();
  }
}

export default router;
