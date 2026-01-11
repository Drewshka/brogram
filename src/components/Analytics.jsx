import { useMemo, useState, useEffect } from "react";
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
  const [selectedExercise, setSelectedExercise] = useState("");
  const [selectedCycle, setSelectedCycle] = useState(null);

  const currentCycle = JSON.parse(localStorage.getItem("cycle")) || 1;

  useEffect(() => {
    console.log("ANALYTICS workoutHistory", workoutHistory);
  }, [workoutHistory]);

  const availableCycles = useMemo(() => {
    const set = new Set();
    workoutHistory.forEach((w) => {
      if (w?.cycle) set.add(w.cycle);
    });
    return Array.from(set).sort((a, b) => b - a);
  }, [workoutHistory]);

  useEffect(() => {
    if (availableCycles.length && selectedCycle === null) {
      setSelectedCycle(availableCycles[0]);
    }
  }, [availableCycles, selectedCycle]);

  const chartData = useMemo(() => {
    if (!selectedExercise || !selectedCycle) return [];

    const filteredHistory = workoutHistory.filter(
      (w) => (w.cycle ?? 1) === selectedCycle
    );

    const entries = getExerciseEntries(filteredHistory, selectedExercise);

    const maxData = getMaxWeightByDate(entries);
    return detectPRs(maxData);
  }, [workoutHistory, selectedExercise, selectedCycle]);

  const latest = chartData[chartData.length - 1];
  const best = Math.max(...chartData.map((d) => d.maxWeight));

  const groupedExercises = useMemo(() => {
    const groups = {
      push: new Set(),
      pull: new Set(),
      legs: new Set(),
      other: new Set(),
    };

    workoutHistory.forEach((workout) => {
      workout?.exercises?.forEach((ex) => {
        const split = workout.split ?? "other";
        groups[split]?.add(ex.name);
      });
    });

    return {
      push: Array.from(groups.push),
      pull: Array.from(groups.pull),
      legs: Array.from(groups.legs),
      other: Array.from(groups.other),
    };
  }, [workoutHistory]);

  useEffect(() => {
    if (!selectedExercise) {
      const allExercises = [
        ...groupedExercises.push,
        ...groupedExercises.pull,
        ...groupedExercises.legs,
        ...groupedExercises.other,
      ];

      if (allExercises.length) {
        setSelectedExercise(allExercises[0]);
      }
    }
  }, [groupedExercises, selectedExercise]);

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
          Cycle
          {/* <select
            value={selectedCycle ?? ""}
            onChange={(e) => setSelectedCycle(Number(e.target.value))}>
            {availableCycles.map((cycle) => (
              <option key={cycle} value={cycle}>
                Cycle {cycle}
              </option>
            ))}
          </select> */}
          <select
            value={selectedCycle ?? ""}
            onChange={(e) => setSelectedCycle(Number(e.target.value))}>
            {availableCycles.map((cycle) => (
              <option key={cycle} value={cycle}>
                Cycle {cycle}
                {cycle === currentCycle ? " (Current)" : " (Completed)"}
              </option>
            ))}
          </select>
        </label>

        <label>
          Exercise
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

            {groupedExercises.other.length > 0 && (
              <optgroup label="Other">
                {groupedExercises.other.map((ex) => (
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
        {/* <button
          onClick={() => {
            localStorage.clear();
            window.location.reload();
          }}
          style={{ marginTop: 12 }}>
          Reset App Data
        </button> */}
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
