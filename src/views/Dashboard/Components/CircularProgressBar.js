import { React } from "react";
import "./StyleSheets/CircularProgressBar.css";

function CircularProgressBar(props) {
  const { title, percentage, circleWidth } = props;
  const radius = 60;
  const dashArray = radius * Math.PI * 2;
  const dashOffSet = dashArray - (dashArray * percentage) / 100;

  return (
    <div>
      <svg
        width={circleWidth}
        height={circleWidth}
        viewBox={`0 0 ${circleWidth} ${circleWidth}`}
      >
        <circle
          cx={circleWidth / 2}
          cy={circleWidth / 2}
          strokeWidth="15px"
          r={radius}
          className="circle-background"
        />
        <circle
          cx={circleWidth / 2}
          cy={circleWidth / 2}
          strokeWidth="15px"
          r={radius}
          className="circle-progress"
          style={{
            strokeDasharray: dashArray,
            strokeDashoffset: dashOffSet,
          }}
          transform={`rotate(-90 ${circleWidth / 2} ${circleWidth / 2})`}
        />
        <text
          x="50%"
          y="50%"
          dy="0.3em"
          textAnchor="middle"
          className="circle-text"
        >
          {percentage}%
        </text>
      </svg>
      <text style={{ fontSize: "20px" }}>{title}</text>
    </div>
  );
}

export default CircularProgressBar;
