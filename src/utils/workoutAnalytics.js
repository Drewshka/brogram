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
// export function getExerciseEntries(workoutHistory = []) {
//   return workoutHistory
//     .filter((workout) => workout && Array.isArray(workout.exercises))
//     .flatMap((workout) =>
//       workout.exercises.map((exercise) => ({
//         ...exercise,
//         date: workout.date,
//         split: workout.split,
//       }))
//     );
// }

// export function getMaxWeightByDate(entries) {
//   return entries.map((entry) => ({
//     date: new Date(entry.date).toLocaleDateString(),
//     maxWeight: Math.max(...entry.sets.map((set) => set.weight)),
//   }));
// }

// export function detectPRs(data) {
//   let highest = 0;

//   return data.map((point) => {
//     const isPR = point.maxWeight > highest;
//     if (isPR) highest = point.maxWeight;
//     return { ...point, isPR };
//   });
// }

// export function detectPRs(data) {
//   let best = 0;

//   return data.map((point) => {
//     const isPR = point.maxWeight > best;
//     if (isPR) best = point.maxWeight;

//     return {
//       ...point,
//       isPR,
//     };
//   });
// }

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

export function getExerciseEntries(workoutHistory, exerciseName) {
  if (!exerciseName) return [];

  return workoutHistory.flatMap((workout) => {
    if (!workout?.exercises) return [];

    const exercise = workout.exercises.find((ex) => ex.name === exerciseName);

    if (!exercise) return [];

    return exercise.sets.map((set) => ({
      date: workout.date,
      weight: set.weight,
    }));
  });
}

export function getMaxWeightByDate(entries) {
  const map = {};

  entries.forEach(({ date, weight }) => {
    if (!map[date] || weight > map[date]) {
      map[date] = weight;
    }
  });

  return Object.entries(map).map(([date, maxWeight]) => ({
    date,
    maxWeight,
  }));
}

export function detectPRs(data) {
  let best = 0;
  const result = [];

  data.forEach((point) => {
    if (point.maxWeight > best) {
      best = point.maxWeight;
      result.push({
        ...point,
        isPR: true,
      });
    }
  });

  return result;
}
