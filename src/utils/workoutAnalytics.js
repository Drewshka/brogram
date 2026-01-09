export function getExerciseHistory(workoutHistory, exerciseName) {
  return workoutHistory.flatMap((workout) =>
    workout.exercises
      .filter((ex) => ex.name === exerciseName)
      .map((ex) => ({
        date: workout.date,
        sets: ex.sets,
      }))
  );
}
