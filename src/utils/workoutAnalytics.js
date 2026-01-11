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

export function getExerciseEntries(workouts, exerciseName) {
  return workouts.flatMap((workout) =>
    workout.exercises
      .filter((ex) => ex.name === exerciseName)
      .flatMap((ex) =>
        ex.sets.map((set) => ({
          date: workout.date,
          workoutId: workout.id, // 👈 CRITICAL
          weight: set.weight,
        }))
      )
  );
}

export function getMaxWeightByDate(entries) {
  const map = new Map();

  entries.forEach(({ workoutId, date, weight }) => {
    const prev = map.get(workoutId) ?? 0;
    map.set(workoutId, Math.max(prev, weight));
  });

  return Array.from(map.entries()).map(([workoutId, maxWeight]) => {
    const entry = entries.find((e) => e.workoutId === workoutId);
    return {
      date: entry.date,
      maxWeight,
    };
  });
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
