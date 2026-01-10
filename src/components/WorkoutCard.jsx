import React, { useState, useEffect } from "react";
import Modal from "./Modal";
import { exerciseDescriptions } from "../utils";

export default function WorkoutCard(props) {
  const {
    trainingPlan,
    workoutIndex,
    type,
    dayNum,
    icon,
    savedWeights,
    handleSave,
    handleComplete,
  } = props;

  const { warmup, workout } = trainingPlan || {};
  const [showExerciseDescription, setShowExerciseDescription] = useState(null);
  // const [weights, setWeights] = useState(savedWeights || {});
  const [exerciseWeights, setExerciseWeights] = useState(savedWeights || {});
  // const workoutDate = new Date(workout.date);

  function handleAddWeight(title, weight) {
    console.log(title, weight);
    const newObj = {
      ...exerciseWeights,
      [title]: weight,
    };
    setExerciseWeights(newObj);
  }

  const isComplete = workout.every(
    (ex) => exerciseWeights[ex.name] && Number(exerciseWeights[ex.name]) > 0
  );

  useEffect(() => {
    setExerciseWeights(savedWeights || {});
  }, [savedWeights]);

  return (
    <div className="workout-container">
      {showExerciseDescription && (
        <Modal
          showExerciseDescription={showExerciseDescription}
          handleCloseModal={() => {
            setShowExerciseDescription(null);
          }}
        />
      )}
      <div className="workout-card card">
        <div className="plan-card-header">
          <p>Day {dayNum}</p>
          {icon}
        </div>
        <div className="plan-card-header">
          <h2>
            <b>{type} Workout</b>
          </h2>
        </div>
      </div>

      <div className="workout-grid">
        <div className="exercise-name">
          <h4>Warmup</h4>
        </div>
        <h6>Sets</h6>
        <h6>Reps</h6>
        <h6 className="weight-input">Max Weight</h6>
        {warmup.map((warmupExercise, warmupIndex) => {
          return (
            <React.Fragment key={warmupIndex}>
              <div className="exercise-name">
                <p>
                  {warmupIndex + 1}. {warmupExercise.name}
                </p>
                <button
                  onClick={() => {
                    setShowExerciseDescription({
                      name: warmupExercise.name,
                      description: exerciseDescriptions[warmupExercise.name],
                    });
                  }}
                  className="help-icon">
                  <i className="fa-regular fa-circle-question" />
                </button>
              </div>
              <p className="exercise-info">{warmupExercise.sets}</p>
              <p className="exercise-info">{warmupExercise.reps}</p>
              <input className="weight-input" placeholder="N/A" disabled />
            </React.Fragment>
          );
        })}
      </div>

      <div className="workout-grid">
        <div className="exercise-name">
          <h4>Workout</h4>
        </div>
        <h6>Sets</h6>
        <h6>Reps</h6>
        <h6 className="weight-input">Max Weight</h6>
        {workout.map((workoutExercise, wIndex) => {
          return (
            <React.Fragment key={wIndex}>
              <div className="exercise-name">
                <p>
                  {wIndex + 1}. {workoutExercise.name}
                </p>
                <button
                  onClick={() => {
                    setShowExerciseDescription({
                      name: workoutExercise.name,
                      description: exerciseDescriptions[workoutExercise.name],
                    });
                  }}
                  className="help-icon">
                  <i className="fa-regular fa-circle-question" />
                </button>
              </div>
              <p className="exercise-info">{workoutExercise.sets}</p>
              <p className="exercise-info">{workoutExercise.reps}</p>
              <input
                value={exerciseWeights[workoutExercise.name] || ""}
                onChange={(e) => {
                  handleAddWeight(workoutExercise.name, e.target.value);
                }}
                className="weight-input"
                placeholder="14"
              />
            </React.Fragment>
          );
        })}
      </div>

      <div className="workout-buttons">
        <button
          onClick={() => {
            // handleSave(workoutIndex, { exerciseWeights });
            handleSave(workoutIndex, { weights: exerciseWeights });
          }}>
          Save & Exit
        </button>
        <button
          onClick={() => {
            //OLD CODE
            // handleComplete(workoutIndex, { weights });
            //NEW CODE: I kept the UI simple but normalized the data so I could support future analytics like volume and PR tracking without rewriting the input flow.
            // handleComplete(workoutIndex, {
            //   date: new Date().toISOString(),
            //   split: type.toLowerCase(),
            //   exercises: workout.map((exercise) => ({
            //     name: exercise.name,
            //     sets: Array.from({ length: exercise.sets }, () => ({
            //       reps: exercise.reps,
            //       weight: Number(exerciseWeights[exercise.name]),
            //     })),
            //   })),
            // });
            handleComplete(workoutIndex, {
              weights: exerciseWeights,
              workoutData: {
                date: new Date().toISOString(),
                split: type.toLowerCase(),
                exercises: workout.map((exercise) => ({
                  name: exercise.name,
                  sets: Array.from({ length: exercise.sets }, () => ({
                    reps: exercise.reps,
                    weight: Number(exerciseWeights[exercise.name]),
                  })),
                })),
              },
            });
          }}
          // disabled={Object.keys(exerciseWeights).length !== workout.length}
          disabled={!isComplete}>
          Complete
        </button>
      </div>
    </div>
  );
}
