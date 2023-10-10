import { React, useState, useEffect } from "react";
import IconButton from "@mui/material/IconButton";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import Box from "@mui/material/Box";
import TextField from "@mui/material/TextField";
import { useHistory } from "react-router-dom";
import ArrowBackIosNewIcon from "@mui/icons-material/ArrowBackIosNew";
import InputLabel from "@mui/material/InputLabel";
import Stack from "@mui/material/Stack";
import axios from "axios";
import Snackbar from "@mui/material/Snackbar";
import Alert from "@mui/material/Alert";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogTitle from "@mui/material/DialogTitle";
import { DatePicker, LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs from "dayjs";
import { useCookies } from "react-cookie";
import { API_URL } from "../../../config";
import CapitalizeWord from "../../../utils/CapitalizeWord";

function Edit(props) {
  let history = useHistory();
  const [token, setToken] = useCookies();

  const [id, setId] = useState("");
  const [requester, setRequester] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("");
  const [title, setTitle] = useState("");
  const [author, setAuthor] = useState("");
  const [file, setFile] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

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

  const handleCloseSB = (event, reason) => {
    if (reason === "clickaway") {
      return;
    }
    setOpenSB(false);
  };

  const onBack = () => {
    history.goBack();
  };

  const onReset = () => {
    window.location.reload();
  };

  const fetchReportAccess = async () => {
    await axios
      .get(API_URL + "/api/v1/report-access/" + props.match.params.id, {
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${token.Token}`,
        },
      })
      .then((response) => {
        setId(response.data.id);
        setRequester(response.data.user.name);
        setEmail(response.data.user.email);
        setRole(response.data.user.roles);
        setTitle(response.data.report.project.name);
        setAuthor(response.data.report.user.name);
        setFile(response.data.report.fileName);
        setStartDate(dayjs(new Date(response.data.startDate)));
        setEndDate(dayjs(new Date(response.data.endDate)));
      })
      .catch((error) => console.log(error));
  };

  const onEdit = async () => {
    let data = new FormData();
    data.append("id", id);
    data.append("startDate", startDate.toJSON());
    data.append("endDate", endDate.toJSON());

    await axios
      .put(API_URL + "/api/v1/report-access/update", data, {
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          Authorization: `Bearer ${token.Token}`,
        },
      })
      .then((response) => {
        setMessage({
          status: "success",
          statusText: "Request's details has been updated successfully.",
        });
        handleCloseConfirmBox();
        setOpenSB(true);
      })
      .catch((error) => {
        console.log(error);
        setMessage({
          status: "error",
          statusText: "Failed to update request's details.",
        });
        setOpenSB(true);
        handleCloseConfirmBox();
      });
  };

  useEffect(() => {
    fetchReportAccess();
  }, []);

  return (
    <>
      <div className="main-content-container p-4 container-fluid">
        <h3 style={{ marginBottom: "20px" }}>Report Access</h3>
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
              Edit Report Access
            </Typography>
          </Stack>
          <Box
            sx={{
              my: 3,
              mx: 4,
            }}
          />
          <InputLabel>Requester's Name</InputLabel>
          <TextField
            fullWidth
            value={requester === null ? "" : CapitalizeWord(requester)}
            sx={{ marginBottom: "20px" }}
            disabled
          />
          <InputLabel>Requester's Email</InputLabel>
          <TextField
            fullWidth
            value={email === null ? "" : email}
            sx={{ marginBottom: "20px" }}
            disabled
          />
          <InputLabel>Report Title</InputLabel>
          <TextField
            fullWidth
            value={title === null ? "" : CapitalizeWord(title)}
            sx={{ marginBottom: "20px" }}
            multiline
            disabled
          />
          <InputLabel>Report Author</InputLabel>
          <TextField
            fullWidth
            value={author == null ? "" : CapitalizeWord(author)}
            sx={{ marginBottom: "20px" }}
            disabled
          />
          {/* <InputLabel>File</InputLabel>
          <TextField
            fullWidth
            value={file === null ? "" : file}
            sx={{ marginBottom: "20px" }}
            InputProps={{
              readOnly: true,
            }}
          /> */}
          <InputLabel>Role</InputLabel>
          <TextField
            fullWidth
            value={role === null ? "" : role}
            sx={{ marginBottom: "20px" }}
            disabled
          />
          <InputLabel>Start Date</InputLabel>
          <div style={{ marginBottom: "20px" }}>
            <LocalizationProvider dateAdapter={AdapterDayjs}>
              <DatePicker format="DD-MMM-YYYY" value={startDate} disabled />
            </LocalizationProvider>
          </div>

          <InputLabel>End Date</InputLabel>
          <div style={{ marginBottom: "20px" }}>
            <LocalizationProvider dateAdapter={AdapterDayjs}>
              <DatePicker
                format="DD-MMM-YYYY"
                value={endDate}
                disablePast
                onChange={(e) => {
                  setEndDate(dayjs(new Date(e.$d)));
                }}
              />
            </LocalizationProvider>
          </div>

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
            Save
          </Button>
          <Button
            variant="outlined"
            sx={{ mt: 3, mb: 2, mx: 2 }}
            onClick={onReset}
            disabled={message.status === "success" ? true : false}
          >
            Reset
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
            Are you sure you want to update this request details?
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
