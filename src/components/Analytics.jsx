// import { useMemo } from "react";
// import {
//   getExerciseEntries,
//   getMaxWeightByDate,
//   detectPRs,
// } from "../utils/workoutAnalytics";
// import { LineChart, Line, XAxis, YAxis, Tooltip } from "recharts";

// export default function Analytics({ workoutHistory }) {
//   const exerciseName = "Barbell squat"; // hardcode for now

//   const data = useMemo(() => {
//     const entries = getExerciseEntries(workoutHistory, exerciseName);
//     const maxData = getMaxWeightByDate(entries);
//     return detectPRs(maxData);
//   }, [workoutHistory]);

//   return (
//     <div>
//       <h2>{exerciseName} Progress</h2>
//       {data.map((point) => (
//         <div key={point.date}>
//           {point.date} — {point.maxWeight} lbs
//           {point.isPR && " 🏆"}
//         </div>
//       ))}
//       <LineChart width={500} height={300} data={data}>
//         <Line dataKey="maxWeight" />
//         <XAxis dataKey="date" />
//         <YAxis />
//         <Tooltip />
//       </LineChart>
//     </div>
//   );
// }

import { useMemo, useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

import {
  getExerciseEntries,
  getMaxWeightByDate,
  detectPRs,
} from "../utils/workoutAnalytics";

export default function Analytics({ workoutHistory }) {
  const exerciseOptions = useMemo(() => {
    const set = new Set();
    workoutHistory.forEach((workout) => {
      if (!workout?.exercises) return;
      workout.exercises.forEach((ex) => set.add(ex.name));
    });
    return Array.from(set);
  }, [workoutHistory]);

  const [selectedExercise, setSelectedExercise] = useState(
    exerciseOptions[0] || ""
  );

  const chartData = useMemo(() => {
    if (!selectedExercise) return [];

    const entries = getExerciseEntries(workoutHistory, selectedExercise);
    const maxData = getMaxWeightByDate(entries);
    return detectPRs(maxData);
  }, [workoutHistory, selectedExercise]);

  const latest = chartData[chartData.length - 1];
  const best = Math.max(...chartData.map((d) => d.maxWeight));

  return (
    <div className="analytics-card">
      {/* Header */}
      <div className="analytics-header">
        <h2>Progress Analytics</h2>
        <p>Track strength progression over time</p>
      </div>

      {/* Controls */}
      <div className="analytics-controls">
        <label>
          Exercise
          <select
            value={selectedExercise}
            onChange={(e) => setSelectedExercise(e.target.value)}>
            {exerciseOptions.map((ex) => (
              <option key={ex} value={ex}>
                {ex}
              </option>
            ))}
          </select>
        </label>
      </div>

      {/* Chart */}
      <div className="analytics-chart">
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={chartData}>
            <Line
              dataKey="maxWeight"
              strokeWidth={2}
              dot={({ payload }) =>
                payload.isPR ? (
                  <circle r={5} fill="#4ade80" />
                ) : (
                  <circle r={3} fill="#888" />
                )
              }
            />
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Stats */}
      {latest && (
        <div className="analytics-stats">
          <div>
            <h4>Latest</h4>
            <p>{latest.maxWeight} lbs</p>
          </div>
          <div>
            <h4>Best</h4>
            <p>{best} lbs</p>
          </div>
        </div>
      )}
    </div>
  );
}
