import { Divider } from "@mui/material";
import React from "react";
import CheckBox from "../CheckBox/CheckBox";
import "./FilterPanel.css";

function FilterPanel(props) {
  return (
    <div>
      <p className="title">Filters:</p>

      <p className="label">Academic Session</p>
      <div>
        {props.academicSessions.map((academicSession, index) => (
          <CheckBox
            key={index}
            id={academicSession.id}
            label={academicSession.academicSession}
            name="academic session"
            handleChecked={props.handleChecked}
          />
        ))}
      </div>

      <Divider />
      <p className="label my-2">Category</p>
      <div>
        {props.categories.map((category, index) => (
          <CheckBox
            key={index}
            id={category.id}
            label={category.categoryName}
            name="category"
            handleChecked={props.handleChecked}
          />
        ))}
      </div>
    </div>
  );
}

export default FilterPanel;
