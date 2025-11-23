import React, { useState, useEffect } from "react";
import { Plus, Trash2, Calendar } from "lucide-react";
import axios from "axios";
import { format } from "date-fns";

const MUSCLE_GROUPS = ["Chest", "Back", "Legs", "Arms", "Shoulders", "Abs"];

export default function WorkoutLog() {
  const [workouts, setWorkouts] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    musclesHit: [],
    exercises: [{ name: "", sets: "", reps: "", weight: "" }],
    duration: "",
    notes: "",
  });

  useEffect(() => {
    fetchWorkouts();
  }, []);

  const fetchWorkouts = async () => {
    try {
      const response = await axios.get("/api/workouts");
      setWorkouts(response.data);
    } catch (error) {
      console.error("Error fetching workouts:", error);
    }
  };

  const handleMuscleToggle = (muscle) => {
    setFormData((prev) => ({
      ...prev,
      musclesHit: prev.musclesHit.includes(muscle)
        ? prev.musclesHit.filter((m) => m !== muscle)
        : [...prev.musclesHit, muscle],
    }));
  };

  const handleExerciseChange = (index, field, value) => {
    const updatedExercises = [...formData.exercises];
    updatedExercises[index][field] = value;
    setFormData((prev) => ({ ...prev, exercises: updatedExercises }));
  };

  const addExercise = () => {
    setFormData((prev) => ({
      ...prev,
      exercises: [
        ...prev.exercises,
        { name: "", sets: "", reps: "", weight: "" },
      ],
    }));
  };

  const removeExercise = (index) => {
    if (formData.exercises.length > 1) {
      const updatedExercises = formData.exercises.filter((_, i) => i !== index);
      setFormData((prev) => ({ ...prev, exercises: updatedExercises }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post("/api/workouts", {
        ...formData,
        exercises: formData.exercises.filter((ex) => ex.name.trim() !== ""),
      });
      setShowForm(false);
      setFormData({
        musclesHit: [],
        exercises: [{ name: "", sets: "", reps: "", weight: "" }],
        duration: "",
        notes: "",
      });
      fetchWorkouts();
    } catch (error) {
      console.error("Error creating workout:", error);
    }
  };

  const deleteWorkout = async (workoutId) => {
    try {
      await axios.delete(`/api/workouts/${workoutId}`);
      fetchWorkouts();
    } catch (error) {
      console.error("Error deleting workout:", error);
    }
  };

  return (
    <div className="p-4 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Workout Log
        </h1>
        <button
          onClick={() => setShowForm(true)}
          className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2"
        >
          <Plus className="w-4 h-4" />
          <span>Add Workout</span>
        </button>
      </div>

      {/* Workout Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">
              Log Today's Workout
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Muscle Groups */}
              <div>
                <label className="block text-sm font-medium mb-2 text-gray-900 dark:text-white">
                  Muscle Groups Trained
                </label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                  {MUSCLE_GROUPS.map((muscle) => (
                    <button
                      key={muscle}
                      type="button"
                      onClick={() => handleMuscleToggle(muscle)}
                      className={`p-3 rounded-lg border-2 text-center transition-colors ${
                        formData.musclesHit.includes(muscle)
                          ? "border-blue-500 bg-blue-50 dark:bg-blue-900 text-blue-700 dark:text-blue-300"
                          : "border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300"
                      }`}
                    >
                      {muscle}
                    </button>
                  ))}
                </div>
              </div>

              {/* Exercises */}
              <div>
                <label className="block text-sm font-medium mb-2 text-gray-900 dark:text-white">
                  Exercises
                </label>
                {formData.exercises.map((exercise, index) => (
                  <div key={index} className="flex space-x-2 mb-2">
                    <input
                      type="text"
                      placeholder="Exercise name"
                      value={exercise.name}
                      onChange={(e) =>
                        handleExerciseChange(index, "name", e.target.value)
                      }
                      className="flex-1 p-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
                    />
                    <input
                      type="number"
                      placeholder="Sets"
                      value={exercise.sets}
                      onChange={(e) =>
                        handleExerciseChange(index, "sets", e.target.value)
                      }
                      className="w-20 p-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
                    />
                    <input
                      type="number"
                      placeholder="Reps"
                      value={exercise.reps}
                      onChange={(e) =>
                        handleExerciseChange(index, "reps", e.target.value)
                      }
                      className="w-20 p-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
                    />
                    <input
                      type="number"
                      placeholder="Weight"
                      value={exercise.weight}
                      onChange={(e) =>
                        handleExerciseChange(index, "weight", e.target.value)
                      }
                      className="w-24 p-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
                    />
                    {formData.exercises.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeExercise(index)}
                        className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900 rounded-lg"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                ))}
                <button
                  type="button"
                  onClick={addExercise}
                  className="text-blue-500 hover:text-blue-600 text-sm flex items-center space-x-1"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Exercise</span>
                </button>
              </div>

              {/* Duration & Notes */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-900 dark:text-white">
                    Duration (minutes)
                  </label>
                  <input
                    type="number"
                    value={formData.duration}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        duration: e.target.value,
                      }))
                    }
                    className="w-full p-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-900 dark:text-white">
                    Notes
                  </label>
                  <input
                    type="text"
                    value={formData.notes}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        notes: e.target.value,
                      }))
                    }
                    className="w-full p-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
                  />
                </div>
              </div>

              {/* Form Actions */}
              <div className="flex space-x-3 pt-4">
                <button
                  type="submit"
                  className="flex-1 bg-blue-500 hover:bg-blue-600 text-white py-2 rounded-lg"
                >
                  Save Workout
                </button>
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="flex-1 bg-gray-500 hover:bg-gray-600 text-white py-2 rounded-lg"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Workout History */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow">
        <h2 className="text-xl font-semibold p-4 border-b dark:border-gray-700 text-gray-900 dark:text-white">
          Workout History
        </h2>
        <div className="divide-y dark:divide-gray-700">
          {workouts.length === 0 ? (
            <div className="p-8 text-center text-gray-500 dark:text-gray-400">
              <Dumbbell className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>No workouts logged yet.</p>
              <p className="text-sm">Add your first workout to get started!</p>
            </div>
          ) : (
            workouts.map((workout) => (
              <div key={workout._id} className="p-4">
                <div className="flex justify-between items-start">
                  <div className="flex items-center space-x-3">
                    <Calendar className="w-5 h-5 text-gray-400" />
                    <div>
                      <p className="font-semibold text-gray-900 dark:text-white">
                        {format(new Date(workout.date), "MMM dd, yyyy")}
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {workout.musclesHit.join(", ")}
                      </p>
                      {workout.duration && (
                        <p className="text-sm text-gray-500">
                          Duration: {workout.duration} min
                        </p>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={() => deleteWorkout(workout._id)}
                    className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900 rounded-lg"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
                {workout.exercises.length > 0 && (
                  <div className="mt-3 space-y-2">
                    {workout.exercises.map((exercise, index) => (
                      <div
                        key={index}
                        className="text-sm bg-gray-50 dark:bg-gray-700 p-2 rounded"
                      >
                        <span className="font-medium">{exercise.name}</span>
                        {exercise.sets && (
                          <span>
                            {" "}
                            - {exercise.sets}x{exercise.reps}
                          </span>
                        )}
                        {exercise.weight && <span> @ {exercise.weight}kg</span>}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
