import { useState, useEffect, useMemo } from "react";
import { workoutProgram as training_plan } from "../utils/index.js";
import WorkoutCard from "./WorkoutCard.jsx";
import Analytics from "./Analytics.jsx";

export default function Grid() {
  const [savedWorkouts, setSavedWorkouts] = useState(null);
  const [selectedWorkout, setSelectedWorkout] = useState(null);
  const completedWorkouts = useMemo(() => {
    return Object.keys(savedWorkouts || {}).filter((key) => {
      return savedWorkouts[key]?.isComplete;
    });
  }, [savedWorkouts]);

  //NEW CODE
  const [workoutHistory, setWorkoutHistory] = useState([]);
  const TOTAL_WORKOUTS = Object.keys(training_plan).length;
  const isProgramComplete = completedWorkouts.length === TOTAL_WORKOUTS;

  const cycle = JSON.parse(localStorage.getItem("cycle")) || 1;

  console.log("workoutHistory", workoutHistory);

  function handleSave(index, data) {
    const prevWorkout = savedWorkouts?.[index] || {};
    // save to local storage and modify the saved workouts state
    //Checks saved workouts for the day to see if complete
    //essentially one of the 2 have to be true. If the data isn't complete and we don't have a record of the workout being complete, then will still be false
    //object will track of every previously saved workout while modifying the current index (workout) that we're doing

    const newObj = {
      ...savedWorkouts,
      [index]: {
        ...prevWorkout,

        // merge weights instead of replacing
        weights: {
          ...(prevWorkout.weights || {}),
          ...(data.weights || {}),
        },
        // once complete, always complete
        isComplete: prevWorkout.isComplete || data.isComplete || false,
      },
    };

    setSavedWorkouts(newObj);
    localStorage.setItem("brogram", JSON.stringify(newObj));
    setSelectedWorkout(null);
  }

  //NEW CODE
  function handleComplete(index, data) {
    if (!data?.weights || Object.keys(data.weights).length === 0) {
      console.warn("Completing workout with no saved weights", data);
    }

    if (!data?.exercises?.length) {
      console.warn("Workout saved without exercises", data);
      return; // optional: prevents corrupt analytics data
    }

    const cycle = JSON.parse(localStorage.getItem("cycle")) || 1;

    // 1. Save UI state
    handleSave(index, {
      weights: data.weights,
      isComplete: true,
    });

    // 2. Save analytics entry WITH cycle
    setWorkoutHistory((prev) => {
      const updated = [
        ...prev,
        {
          ...data,
          cycle,
        },
      ];
      localStorage.setItem("workoutHistory", JSON.stringify(updated));
      return updated;
    });
  }

  const handleResetProgram = () => {
    const currentCycle = JSON.parse(localStorage.getItem("cycle")) || 1;
    const nextCycle = currentCycle + 1;

    // 1. Update cycle
    localStorage.setItem("cycle", JSON.stringify(nextCycle));

    // 2. Clear UI progress
    localStorage.removeItem("brogram");
    setSavedWorkouts({});

    // 3. Reset selection
    setSelectedWorkout(null);

    // 3. Scroll back to Day 1
    setTimeout(() => {
      document.querySelector(".training-plan-grid")?.scrollIntoView({
        behavior: "smooth",
      });
    }, 100);
  };

  useEffect(() => {
    if (!localStorage) return;

    const savedWorkoutsData = JSON.parse(localStorage.getItem("brogram")) || {};

    const rawHistory = JSON.parse(localStorage.getItem("workoutHistory")) || [];

    const normalizedHistory = rawHistory.map((w) => ({
      ...w,
      cycle: w.cycle ?? 1, // 👈 DEFAULT OLD DATA TO CYCLE 1
    }));

    setSavedWorkouts(savedWorkoutsData);
    setWorkoutHistory(normalizedHistory);
  }, []);

  return (
    <>
      {workoutHistory.length > 0 && (
        <Analytics workoutHistory={workoutHistory} />
      )}
      {isProgramComplete && (
        <div className="program-reset">
          <p>🎉 Program complete! Ready to start again?</p>
          <button onClick={handleResetProgram}>Reset Program</button>
        </div>
      )}

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
                cycle={cycle}
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
    </>
  );
}
