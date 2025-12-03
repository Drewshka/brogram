import { workoutProgram as training_plan } from "../utils/index.js";

export default function Grid() {
  const isLocked = false;

  return (
    <div className="training-grid-plan">
      {Object.keys(training_plan).map((workout, workoutIndex) => {
        return (
          <button key={workoutIndex}>
            <div className="plan-card-header">
              <p>
                Day{" "}
                {workoutIndex / 8 <= 1
                  ? "0" + (workoutIndex + 1)
                  : workoutIndex + 1}
              </p>
            </div>
            {isLocked ? (
              <i className="fa-solid fa-lock"></i>
            ) : workoutIndex % 3 === 0 ? (
              <i className="fa-solid fa-dumbbell"></i>
            ) : workoutIndex % 3 === 1 ? (
              <i className="fa-solid fa-weight-hanging"></i>
            ) : (
              <i className="fa-solid fa-bolt"></i>
            )}
          </button>
        );
      })}
    </div>
  );
}
