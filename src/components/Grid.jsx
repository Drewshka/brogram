import { useState, useEffect, useMemo } from "react";
import { workoutProgram as training_plan } from "../utils/index.js";
import WorkoutCard from "./WorkoutCard.jsx";

export default function Grid() {
  const [savedWorkouts, setSavedWorkouts] = useState(null);
  const [selectedWorkout, setSelectedWorkout] = useState(null);
  // const completedWorkouts = Object.keys(savedWorkouts || {}).filter((val) => {
  //   const entry = savedWorkouts[val];
  //   return entry.isComplete;
  // });
  const completedWorkouts = useMemo(() => {
    return Object.keys(savedWorkouts || {}).filter((key) => {
      return savedWorkouts[key]?.isComplete;
    });
  }, [savedWorkouts]);

  //NEW CODE
  const [workoutHistory, setWorkoutHistory] = useState([]);

  console.log("workoutHistory", workoutHistory);
  function handleSave(index, data) {
    // save to local storage and modify the saved workouts state
    //Checks saved workouts for the day to see if complete
    //essentially one of the 2 have to be true. If the data isn't complete and we don't have a record of the workout being complete, then will still be false
    //object will track of every previously saved workout while modifying the current index (workout) that we're doing
    const newObj = {
      ...savedWorkouts,
      [index]: {
        ...data,
        isComplete: !!data.isComplete || !!savedWorkouts?.[index]?.isComplete,
      },
    };
    setSavedWorkouts(newObj);
    //persist local storage data across page loads
    localStorage.setItem("brogram", JSON.stringify(newObj));
    setSelectedWorkout(null);
  }

  // function handleComplete(index, data) {
  //   // save a workout (modify the completed status)
  //   const newObj = { ...data };
  //   newObj.isComplete = true;
  //   handleSave(index, newObj);
  // }

  // useEffect(() => {
  //   if (!localStorage) {
  //     return;
  //   }
  //   let savedData = {};
  //   if (localStorage.getItem("brogram")) {
  //     savedData = JSON.parse(localStorage.getItem("brogram"));
  //   }

  //   setSavedWorkouts(savedData);
  // }, []);

  //NEW CODE
  function handleComplete(index, completedWorkout) {
    // 1. Mark workout as complete (existing behavior)
    handleSave(index, {
      ...completedWorkout,
      isComplete: true,
    });

    // 2. Append to workout history
    setWorkoutHistory((prev) => {
      const updated = [...prev, completedWorkout];
      localStorage.setItem("workoutHistory", JSON.stringify(updated));
      return updated;
    });
  }

  useEffect(() => {
    if (!localStorage) return;

    const savedWorkoutsData = JSON.parse(localStorage.getItem("brogram")) || {};

    const historyData =
      JSON.parse(localStorage.getItem("workoutHistory")) || [];

    setSavedWorkouts(savedWorkoutsData);
    setWorkoutHistory(historyData);
  }, []);

  return (
    <div className="training-plan-grid">
      {Object.keys(training_plan).map((workout, workoutIndex) => {
        const isLocked =
          workoutIndex === 0
            ? false
            : !completedWorkouts.includes(`${workoutIndex - 1}`);
        console.log(workoutIndex, isLocked);

        const type =
          workoutIndex % 3 === 0
            ? "Push"
            : workoutIndex % 3 === 1
              ? "Pull"
              : "Legs";

        const trainingPlan = training_plan[workoutIndex];
        const dayNum =
          workoutIndex / 8 <= 1 ? "0" + (workoutIndex + 1) : workoutIndex + 1;
        const icon =
          workoutIndex % 3 === 0 ? (
            <i className="fa-solid fa-dumbbell"></i>
          ) : workoutIndex % 3 === 1 ? (
            <i className="fa-solid fa-weight-hanging"></i>
          ) : (
            <i className="fa-solid fa-bolt"></i>
          );

        if (workoutIndex === selectedWorkout) {
          return (
            <WorkoutCard
              savedWeights={savedWorkouts?.[workoutIndex]?.weights}
              key={workoutIndex}
              trainingPlan={trainingPlan}
              type={type}
              workoutIndex={workoutIndex}
              icon={icon}
              dayNum={dayNum}
              handleComplete={handleComplete}
              handleSave={handleSave}
            />
          );
        }

        return (
          <button
            onClick={() => {
              if (isLocked) {
                return;
              }
              setSelectedWorkout(workoutIndex);
            }}
            className={"card plan-card  " + (isLocked ? "inactive" : "")}
            key={workoutIndex}>
            <div className="plan-card-header">
              <p>Day {dayNum}</p>
              {isLocked ? <i className="fa-solid fa-lock"></i> : icon}
            </div>

            <div className="plan-card-header">
              <h4>
                <b>{type}</b>
              </h4>
            </div>
          </button>
        );
      })}
    </div>
  );
}
