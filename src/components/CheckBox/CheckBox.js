import { Checkbox, FormControlLabel, FormGroup } from "@mui/material";
import { React } from "react";

function CheckBox(props) {
  // const classes = useStyles({
  //   root: {
  //     "&$checked": {
  //       color: blue[500],
  //     },
  //   },
  //   checked: {},
  //   wrap: {
  //     width: "100%",
  //     display: "flex",
  //     flexDirection: "row-reverse",
  //     justifyContent: "space-between",
  //     alignItems: "center",
  //     marginLeft: 0,
  //   },
  //   label: {
  //     fontSize: ".8rem",
  //   },
  // });
  const { label, name, handleChecked } = props;

  return (
    <div>
      <FormGroup>
        <FormControlLabel
          sx={{
            ".MuiFormControlLabel-label": { fontSize: ".8rem" },
            // "&.MuiFormControlLabel-root": {
            //   width: "100%",
            //   display: "block",
            //   flexDirection: "row-reverse",
            //   justifyContent: "space-between",
            //   alignItems: "center",
            // },
          }}
          control={
            <Checkbox
              size="small"
              value={label}
              name={name}
              onChange={handleChecked}
            />
          }
          label={label}
        />
      </FormGroup>
    </div>
  );
}

export default CheckBox;
