import React, { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import { TrendingUp, Dumbbell, Calendar, Target, Award } from "lucide-react";
import axios from "axios";
import { format, subDays } from "date-fns";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
} from "recharts";

export default function Dashboard() {
  const { user } = useAuth();
  const [todayData, setTodayData] = useState({
    weight: null,
    workout: false,
    exercises: [],
    distance: 0,
  });
  const [weeklyData, setWeeklyData] = useState([]);
  const [muscleData, setMuscleData] = useState([]);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [workoutsRes, weightsRes, activitiesRes] = await Promise.all([
        axios.get("/api/workouts"),
        axios.get("/api/weights?limit=30"),
        axios.get("/api/activities?limit=7"),
      ]);

      const today = new Date().toDateString();

      // Today's workout
      const todayWorkout = workoutsRes.data.find(
        (w) => new Date(w.date).toDateString() === today
      );

      // Today's weight
      const todayWeight = weightsRes.data.find(
        (w) => new Date(w.date).toDateString() === today
      );

      // Today's activity
      const todayActivity = activitiesRes.data.find(
        (a) => new Date(a.date).toDateString() === today
      );

      setTodayData({
        weight: todayWeight?.weight || null,
        workout: !!todayWorkout,
        exercises: todayWorkout?.musclesHit || [],
        distance: todayActivity?.distance || 0,
      });

      // Weekly chart data
      const last7Days = Array.from({ length: 7 }, (_, i) => {
        const date = subDays(new Date(), i);
        return {
          date: format(date, "EEE"),
          workouts: workoutsRes.data.filter(
            (w) => new Date(w.date).toDateString() === date.toDateString()
          ).length,
          fullDate: date,
        };
      }).reverse();

      setWeeklyData(last7Days);

      // Muscle group frequency
      const muscleGroups = [
        "Chest",
        "Back",
        "Legs",
        "Arms",
        "Shoulders",
        "Abs",
      ];
      const muscleCounts = muscleGroups.map((muscle) => ({
        muscle,
        count: workoutsRes.data.filter((w) => w.musclesHit.includes(muscle))
          .length,
      }));
      setMuscleData(muscleCounts);
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    }
  };

  return (
    <div className="p-4 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Welcome back, {user?.name}!
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            {format(new Date(), "EEEE, MMMM do")}
          </p>
        </div>
        <div className="flex items-center space-x-2 bg-blue-100 dark:bg-blue-900 px-4 py-2 rounded-lg">
          <Award className="w-5 h-5 text-blue-600 dark:text-blue-400" />
          <span className="font-semibold text-blue-600 dark:text-blue-400">
            {user?.currentStreak || 0} day streak
          </span>
        </div>
      </div>

      {/* Today's Overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Weight</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {todayData.weight ? `${todayData.weight} kg` : "--"}
              </p>
            </div>
            <TrendingUp className="w-8 h-8 text-green-500" />
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Workout
              </p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {todayData.workout ? "✓ Done" : "✗ Rest"}
              </p>
            </div>
            <Dumbbell className="w-8 h-8 text-blue-500" />
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Muscles
              </p>
              <p className="text-lg font-bold text-gray-900 dark:text-white">
                {todayData.exercises.length > 0
                  ? todayData.exercises.join(", ")
                  : "None"}
              </p>
            </div>
            <Target className="w-8 h-8 text-red-500" />
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Distance
              </p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {todayData.distance} km
              </p>
            </div>
            <Calendar className="w-8 h-8 text-purple-500" />
          </div>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Weekly Attendance */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow">
          <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
            Weekly Attendance
          </h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={weeklyData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="workouts" fill="#3B82F6" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Muscle Group Frequency */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow">
          <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
            Muscle Balance
          </h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={muscleData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="muscle" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="count" fill="#10B981" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Goal Progress */}
      {user?.targetWeight && (
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow">
          <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
            Weight Goal Progress
          </h3>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Current: {todayData.weight || "--"} kg</span>
              <span>Target: {user.targetWeight} kg</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-4 dark:bg-gray-700">
              <div
                className="bg-green-500 h-4 rounded-full transition-all duration-300"
                style={{
                  width: todayData.weight
                    ? `${Math.min(
                        100,
                        (todayData.weight / user.targetWeight) * 100
                      )}%`
                    : "0%",
                }}
              ></div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
