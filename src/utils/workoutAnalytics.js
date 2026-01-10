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

// export function getExerciseEntries(workoutHistory, exerciseName) {
//   return workoutHistory.flatMap((workout) =>
//     workout.exercises
//       .filter((ex) => ex.name === exerciseName)
//       .map((ex) => ({
//         date: workout.date,
//         sets: ex.sets,
//       }))
//   );
// }
export function getExerciseEntries(workoutHistory = []) {
  return workoutHistory
    .filter((workout) => workout && Array.isArray(workout.exercises))
    .flatMap((workout) =>
      workout.exercises.map((exercise) => ({
        ...exercise,
        date: workout.date,
        split: workout.split,
      }))
    );
}

export function getMaxWeightByDate(entries) {
  return entries.map((entry) => ({
    date: new Date(entry.date).toLocaleDateString(),
    maxWeight: Math.max(...entry.sets.map((set) => set.weight)),
  }));
}

export function detectPRs(data) {
  let highest = 0;

  return data.map((point) => {
    const isPR = point.maxWeight > highest;
    if (isPR) highest = point.maxWeight;
    return { ...point, isPR };
  });
}
