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
  //   const exerciseOptions = useMemo(() => {
  //     const set = new Set();
  //     workoutHistory.forEach((workout) => {
  //       if (!workout?.exercises) return;
  //       workout.exercises.forEach((ex) => set.add(ex.name));
  //     });
  //     return Array.from(set);
  //   }, [workoutHistory]);

  //   const [selectedExercise, setSelectedExercise] = useState(
  //     exerciseOptions[0] || ""
  //   );
  const [selectedExercise, setSelectedExercise] = useState("");

  const chartData = useMemo(() => {
    if (!selectedExercise) return [];

    const entries = getExerciseEntries(workoutHistory, selectedExercise);
    const maxData = getMaxWeightByDate(entries);
    return detectPRs(maxData);
  }, [workoutHistory, selectedExercise]);

  const latest = chartData[chartData.length - 1];
  const best = Math.max(...chartData.map((d) => d.maxWeight));
  //   const hasMultiplePoints = chartData.length > 1;

  const groupedExercises = useMemo(() => {
    const groups = {
      push: new Set(),
      pull: new Set(),
      legs: new Set(),
    };

    workoutHistory.forEach((workout) => {
      if (!workout?.exercises || !workout.split) return;

      workout.exercises.forEach((ex) => {
        groups[workout.split]?.add(ex.name);
      });
    });

    return {
      push: Array.from(groups.push),
      pull: Array.from(groups.pull),
      legs: Array.from(groups.legs),
    };
  }, [workoutHistory]);

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
          {/* <select
            value={selectedExercise}
            onChange={(e) => setSelectedExercise(e.target.value)}>
            {exerciseOptions.map((ex) => (
              <option key={ex} value={ex}>
                {ex}
              </option>
            ))}
          </select> */}
          <select
            value={selectedExercise}
            onChange={(e) => setSelectedExercise(e.target.value)}>
            <option value="" disabled>
              Select exercise
            </option>

            {groupedExercises.push.length > 0 && (
              <optgroup label="Push">
                {groupedExercises.push.map((ex) => (
                  <option key={ex} value={ex}>
                    {ex}
                  </option>
                ))}
              </optgroup>
            )}

            {groupedExercises.pull.length > 0 && (
              <optgroup label="Pull">
                {groupedExercises.pull.map((ex) => (
                  <option key={ex} value={ex}>
                    {ex}
                  </option>
                ))}
              </optgroup>
            )}

            {groupedExercises.legs.length > 0 && (
              <optgroup label="Legs">
                {groupedExercises.legs.map((ex) => (
                  <option key={ex} value={ex}>
                    {ex}
                  </option>
                ))}
              </optgroup>
            )}
          </select>
        </label>
      </div>

      {/* Chart */}
      <div className="analytics-chart">
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={chartData}>
            <Line
              dataKey="maxWeight"
              stroke="#4ade80"
              strokeWidth={2}
              strokeOpacity={chartData.length > 1 ? 1 : 0} // 👈 KEY FIX
              dot={({ cx, cy, payload }) => {
                if (cx == null || cy == null || !payload) return null;

                return (
                  <circle
                    cx={cx}
                    cy={cy}
                    r={4}
                    fill={payload.isPR ? "#4ade80" : "#888"}
                  />
                );
              }}
              activeDot={({ cx, cy, payload }) => {
                if (cx == null || cy == null || !payload) return null;

                return (
                  <circle
                    cx={cx}
                    cy={cy}
                    r={6}
                    fill={payload.isPR ? "#4ade80" : "#888"}
                    stroke="#000"
                    strokeWidth={1}
                  />
                );
              }}
              isAnimationActive={false}
            />

            <XAxis
              dataKey="date"
              tickFormatter={(iso) =>
                new Date(iso).toLocaleDateString(undefined, {
                  month: "short",
                  day: "numeric",
                })
              }
            />
            <YAxis />
            <Tooltip
              contentStyle={{
                borderRadius: "12px",
                border: "none",
                backgroundColor: "#111",
                padding: "10px 14px",
                boxShadow: "0 6px 18px rgba(0,0,0,0.3)",
              }}
              labelStyle={{ color: "#aaa" }}
              itemStyle={{ color: "#4ade80" }}
              isAnimationActive={false}
              cursor={{ strokeDasharray: "3 3" }}
              formatter={(value, name) => {
                if (name === "maxWeight") {
                  return [`${value} lbs`, "Max Weight"];
                }
                return [value, name];
              }}
              labelFormatter={(iso) =>
                new Date(iso).toLocaleDateString(undefined, {
                  weekday: "short",
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                })
              }
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Stats */}
      {latest && (
        <div
          className={`analytics-stats ${chartData.length === 1 ? "single" : ""}`}>
          <div>
            <h4>Latest</h4>
            <p>{latest.maxWeight} lbs</p>
          </div>

          {chartData.length > 1 && (
            <div>
              <h4>Best</h4>
              <p>{best} lbs</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
