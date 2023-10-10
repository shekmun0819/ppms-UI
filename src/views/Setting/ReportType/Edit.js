import { React, useState, useEffect } from "react";
import IconButton from "@mui/material/IconButton";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import Box from "@mui/material/Box";
import TextField from "@mui/material/TextField";
import { useHistory } from "react-router-dom";
import ArrowBackIosNewIcon from "@mui/icons-material/ArrowBackIosNew";
import InputLabel from "@mui/material/InputLabel";
import Radio from "@mui/material/Radio";
import RadioGroup from "@mui/material/RadioGroup";
import Stack from "@mui/material/Stack";
import axios from "axios";
import Snackbar from "@mui/material/Snackbar";
import Alert from "@mui/material/Alert";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogTitle from "@mui/material/DialogTitle";
import FormGroup from "@mui/material/FormGroup";
import FormControlLabel from "@mui/material/FormControlLabel";
import FormControl from "@mui/material/FormControl";
import FormLabel from "@mui/material/FormLabel";
import Checkbox from "@mui/material/Checkbox";
import { DateTimePicker, LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs from "dayjs";
import { useCookies } from "react-cookie";
import { API_URL } from "../../../config";

function Edit(props) {
  let history = useHistory();
  const [token, setToken] = useCookies();

  const [id, setId] = useState();
  const [milestone, setMilestone] = useState("");
  const [reportType, setReportType] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [active, setActive] = useState("true");

  const [message, setMessage] = useState({
    status: "info",
    statusText: "",
  });

  const [openSB, setOpenSB] = useState(false);
  const [openConfirmBox, setOpenConfirmBox] = useState(false);

  const handleOpenConfirmBox = () => {
    setOpenConfirmBox(true);
  };
  const handleCloseConfirmBox = () => {
    setOpenConfirmBox(false);
  };

  const handleCheckbox = (event) => {
    setActive(event.target.checked);
  };

  const handleMilestone = (event) => {
    setMilestone(event.target.value);
  };

  const onBack = () => {
    history.goBack();
  };

  const fetchReportType = async () => {
    await axios
      .get(API_URL + "/api/v1/report-type/" + props.match.params.id, {
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${token.Token}`,
        },
      })
      .then((response) => {
        setId(response.data.id);
        setMilestone(response.data.milestone);
        setReportType(response.data.type);
        setDueDate(dayjs(new Date(response.data.dueDate)));
        setActive(response.data.active);
      })
      .catch((error) => console.log(error));
  };

  const onEdit = async () => {
    let data = new FormData();
    data.append("id", id);
    data.append("milestone", parseInt(milestone));
    data.append("type", reportType);
    data.append("dueDate", dayjs(dueDate).format("YYYY-MM-DDTHH:mm"));
    data.append("active", active);

    await axios
      .put(API_URL + "/api/v1/report-type/update", data, {
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          Authorization: `Bearer ${token.Token}`,
        },
      })
      .then((response) => {
        setMessage({
          status: "success",
          statusText: "Report type is successfully updated.",
        });
        setOpenSB(true);
        handleCloseConfirmBox();
      })
      .catch((error) => {
        console.log(error);
        setMessage({
          status: "error",
          statusText: "Failed to update report type.",
        });
        setOpenSB(true);
        handleCloseConfirmBox();
      });
  };

  const handleCloseSB = (event, reason) => {
    if (reason === "clickaway") {
      return;
    }
    setOpenSB(false);
  };

  useEffect(() => {
    fetchReportType();
  }, []);

  return (
    <>
      <div className="main-content-container p-4 container-fluid">
        <h3 style={{ marginBottom: "20px" }}>Report Type</h3>
        <div
          style={{
            backgroundColor: "white",
            padding: "20px",
            borderRadius: "5px",
          }}
        >
          <Stack direction="row" alignItems="center">
            <IconButton
              sx={{ color: "black", paddingLeft: "0" }}
              onClick={onBack}
            >
              <ArrowBackIosNewIcon sx={{ fontSize: "25px" }} />
            </IconButton>
            <Typography variant="h5" sx={{ fontWeight: "bold" }}>
              Edit Report Type
            </Typography>
          </Stack>
          <Box
            sx={{
              my: 3,
              mx: 4,
            }}
          ></Box>
          <FormControl>
            <FormLabel id="demo-controlled-radio-buttons-group">
              Milestone
            </FormLabel>
            <RadioGroup
              row
              aria-labelledby="demo-controlled-radio-buttons-group"
              name="controlled-radio-buttons-group"
              autoFocus
              value={milestone}
              onChange={handleMilestone}
              sx={{ marginBottom: "20px" }}
            >
              <FormControlLabel value="1" control={<Radio />} label="1" />
              <FormControlLabel value="2" control={<Radio />} label="2" />
              <FormControlLabel value="3" control={<Radio />} label="3" />
            </RadioGroup>
          </FormControl>
          <InputLabel>Report Type Name</InputLabel>
          <TextField
            required
            fullWidth
            id="report-type"
            type="text"
            placeholder="ACTIVITY PLAN"
            value={reportType == null ? "" : reportType}
            sx={{ marginBottom: "20px" }}
            onChange={(e) => {
              setReportType(e.target.value.toUpperCase());
            }}
          />
          <InputLabel>Due Date</InputLabel>
          <div style={{ marginBottom: "20px" }}>
            <LocalizationProvider dateAdapter={AdapterDayjs}>
              <DateTimePicker
                value={dueDate}
                format="DD-MMM-YYYY, hh:mm a"
                onChange={(e) => setDueDate(dayjs(new Date(e.$d)))}
              />
            </LocalizationProvider>
          </div>
          <FormGroup>
            <FormControlLabel
              control={<Checkbox />}
              label="Active"
              checked={active}
              onChange={handleCheckbox}
            />
          </FormGroup>

          <Button
            variant="contained"
            sx={{ mt: 3, mb: 2 }}
            onClick={() => {
              if (reportType === "" || dueDate === "") {
                setMessage({
                  status: "error",
                  statusText: "You are required to fill in all the details.",
                });
                setOpenSB(true);
              } else {
                handleOpenConfirmBox();
              }
            }}
          >
            Update
          </Button>
        </div>
      </div>
      <Snackbar
        open={openSB}
        autoHideDuration={6000}
        onClose={handleCloseSB}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      >
        <Alert
          onClose={handleCloseSB}
          severity={message.status}
          sx={{ width: "100%" }}
        >
          {message.statusText}
        </Alert>
      </Snackbar>
      <Dialog
        open={openConfirmBox}
        onClose={handleCloseConfirmBox}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">{"Confirmation"}</DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            Are you sure you want to update this report type?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseConfirmBox}>No</Button>
          <Button onClick={onEdit} autoFocus>
            Yes
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}

export default Edit;
