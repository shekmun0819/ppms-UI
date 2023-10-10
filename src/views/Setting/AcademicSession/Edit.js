import { React, useState, useEffect } from "react";
import IconButton from "@mui/material/IconButton";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import Box from "@mui/material/Box";
import TextField from "@mui/material/TextField";
import { useHistory, useParams } from "react-router-dom";
import ArrowBackIosNewIcon from "@mui/icons-material/ArrowBackIosNew";
import InputLabel from "@mui/material/InputLabel";
import MenuItem from "@mui/material/MenuItem";
import Select from "@mui/material/Select";
import FormControl from "@mui/material/FormControl";
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
import Checkbox from "@mui/material/Checkbox";
import { DatePicker, LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs from "dayjs";
import { useCookies } from "react-cookie";
import { API_URL } from "../../../config";

function Edit(props) {
  let history = useHistory();
  const [token, setToken] = useCookies();

  const [id, setId] = useState();
  const [academicSession, setAcademicSession] = useState("");
  const [semester, setSemester] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [active, setActive] = useState("false");

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

  const selectionChangeHandler = (event) => {
    setSemester(event.target.value);
  };

  const handleCheckbox = (event) => {
    setActive(event.target.checked);
  };

  const onBack = () => {
    history.goBack();
  };

  const fetchAcademicSession = async () => {
    await axios
      .get(
         API_URL + "/api/v1/academic-session/" +
          props.match.params.id,
        {
          headers: {
            Accept: "application/json",
            Authorization: `Bearer ${token.Token}`,
          },
        }
      )
      .then((response) => {
        setId(response.data.id);
        setAcademicSession(response.data.academicSession);
        setSemester(response.data.semester);
        setStartDate(dayjs(new Date(response.data.startDate)));
        setEndDate(dayjs(new Date(response.data.endDate)));
        setActive(response.data.active);
      })
      .catch((error) => console.log(error));
  };

  const onEdit = async () => {
    let data = new FormData();
    data.append("id", id);
    //data.append("academicSession", academicSession);
    //data.append("semester", semester);
    data.append("startDate", startDate.toJSON());
    data.append("endDate", endDate.toJSON());
    //data.append("active", active);

    await axios
      .put( API_URL + "/api/v1/academic-session/update", data, {
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          Authorization: `Bearer ${token.Token}`,
        },
      })
      .then((response) => {
        setMessage({
          status: "success",
          statusText: "Academic session is successfully updated.",
        });
        setOpenSB(true);
        handleCloseConfirmBox();
      })
      .catch((error) => {
        console.log(error);
        setMessage({
          status: "error",
          statusText: "Failed to update academic session.",
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
    fetchAcademicSession();
  }, []);

  return (
    <>
      <div className="main-content-container p-4 container-fluid">
        <h3 style={{ marginBottom: "20px" }}>Academic Session</h3>
        <div
          style={{
            backgroundColor: "white",
            padding: "20px",
            borderRadius: "5px",
          }}
        >
          <Stack direction="row" alignItems="center">
            <IconButton
              sx={{ paddingLeft: "0", color: "black" }}
              onClick={onBack}
            >
              <ArrowBackIosNewIcon sx={{ fontSize: "25px" }} />
            </IconButton>
            <Typography variant="h5" sx={{ fontWeight: "bold" }}>
              Edit Academic Session
            </Typography>
          </Stack>
          <Box
            sx={{
              my: 3,
              mx: 4,
            }}
          ></Box>
          <InputLabel>Academic Session</InputLabel>
          <TextField
            required
            fullWidth
            id="academic-session"
            type="text"
            value={academicSession === null ? "" : academicSession}
            autoFocus
            disabled
            sx={{ marginBottom: "20px" }}
            onChange={(e) => {
              setAcademicSession(e.target.value);
            }}
          />
          <InputLabel>Semester</InputLabel>
          <TextField
            required
            fullWidth
            id="semester"
            type="text"
            value={semester === null ? "" : semester}
            autoFocus
            disabled
            sx={{ marginBottom: "20px" }}
          />
          {/* <FormControl sx={{ mb: "20px", width: 250 }}>
            <Select
              required
              value={semester}
              label="Semester"
              onChange={selectionChangeHandler}
            >
              <MenuItem value={1}>1</MenuItem>
              <MenuItem value={2}>2</MenuItem>
            </Select>
          </FormControl> */}
          <InputLabel>Start Date</InputLabel>
          <div style={{ marginBottom: "20px" }}>
            <LocalizationProvider dateAdapter={AdapterDayjs}>
              <DatePicker
                value={startDate === null ? "" : startDate}
                format="DD-MMM-YYYY"
                onChange={(e) => {
                  setStartDate(dayjs(new Date(e.$d)));
                }}
              />
            </LocalizationProvider>
          </div>
          <InputLabel>End Date</InputLabel>
          <div style={{ marginBottom: "20px" }}>
            <LocalizationProvider dateAdapter={AdapterDayjs}>
              <DatePicker
                value={endDate === null ? "" : endDate}
                format="DD-MMM-YYYY"
                onChange={(e) => {
                  setEndDate(dayjs(new Date(e.$d)));
                }}
              />
            </LocalizationProvider>
          </div>
          <FormGroup>
            <FormControlLabel
              control={<Checkbox />}
              label="Active"
              checked={active}
              onChange={handleCheckbox}
              disabled
            />
          </FormGroup>
          <Button
            variant="contained"
            sx={{ mt: 3, mb: 2 }}
            onClick={() => {
              if (startDate === "" || endDate === "") {
                setMessage({
                  status: "error",
                  statusText: "You are required to fill in all the details.",
                });
                setOpenSB(true);
              } else {
                handleOpenConfirmBox();
              }
            }}
            disabled={message.status === "success" ? true : false}
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
            Are you sure to update this academic session?
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
