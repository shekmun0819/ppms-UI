import { React, useState, useEffect } from "react";
import { IconButton, Typography, CircularProgress, Stack, InputLabel, TextField, FormControl, Select, MenuItem, Box, Snackbar, Alert, DialogTitle, DialogContent, DialogContentText, DialogActions, Button, Dialog } from "@mui/material";
import ArrowBackIosNewIcon from "@mui/icons-material/ArrowBackIosNew";
import axios from "axios";
import moment from "moment";
import { useHistory } from "react-router-dom";
import { useCookies } from "react-cookie";
import CapitalizeWord from "../../utils/CapitalizeWord";
import { API_URL } from "../../config";

const ITEM_HEIGHT = 48;
const MenuProps = {
  PaperProps: {
    style: {
      maxHeight: ITEM_HEIGHT * 4.5,
      width: 250,
    },
  },
};

function Create() {
  let history = useHistory();
  const [token, setToken] = useCookies();

  const [csmindSelection, setCsmindSelection] = useState([]);
  const [selectedCsmind, setSelectedCsmind] = useState();
  const [userSelection, setUserSelection] = useState();
  const [presentation, setPresentation] = useState({
    title: "",
    student: -1,
    supervisor: -1,
    examiner: -1,
    chair: -1,
  });

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

  const onCreate = async () => {
    let data = new FormData();
    data.append("id", selectedCsmind.id);
    data.append("title", presentation.title);
    data.append("student", presentation.student);
    data.append("supervisor", presentation.supervisor);
    data.append("examiner", presentation.examiner);
    data.append("chair", presentation.chair);

    await axios
      .post( API_URL + "/api/v1/presentation/create", data, {
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          Authorization: `Bearer ${token.Token}`,
        },
      })
      .then((response) => {
        setMessage({
          status: "success",
          statusText: "Presentation is successfully created.",
        });
        setOpenSB(true);
        handleCloseConfirmBox();
      })
      .catch((error) => {
        console.log(error);
        setMessage({
          status: "error",
          statusText: "Failed to create presentation.",
        });
        setOpenSB(true);
        handleCloseConfirmBox();
      });
  };

  const onReset = () => {
    window.location.reload();
  };

  const fetchCsminds = async () => {
    await axios
      .get( API_URL + "/api/v1/csmind/getAll", {
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${token.Token}`,
        },
      })
      .then((response) => {
        var data = response.data;
        setCsmindSelection(data);
        setSelectedCsmind(data[0]);
      })
      .catch((error) => console.log(error));
  };

  const fetchUserSelection = async () => {
    await axios
      .get( API_URL + "/api/v1/user/getUserSelection", {
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${token.Token}`,
        },
      })
      .then((response) => {
        var data = response.data;
        setUserSelection(data);
      })
      .catch((error) => console.log(error));
  };

  useEffect(() => {
    fetchCsminds();
    fetchUserSelection();
  }, []);

  return (
    <>
      <div className="main-content-container p-4 container-fluid">
        <h3 style={{ marginBottom: "20px" }}>Presentation</h3>
        <div
          style={{
            backgroundColor: "white",
            padding: "20px",
            borderRadius: "5px",
          }}
        >
          <Stack direction="row" alignItems="center">
            <IconButton
              sx={{ paddingLeft: '0', color: "black" }}
              onClick={onBack}
            >
              <ArrowBackIosNewIcon sx={{ fontSize: "25px" }} />
            </IconButton>
            <Typography variant="h5" sx={{ fontWeight: "bold" }}>
              Create Presentation
            </Typography>
          </Stack>
          <Box
            sx={{
              my: 3,
              mx: 4,
            }}
          >
            <InputLabel>Choose a CSMInD session</InputLabel>
            <FormControl style={{width: '100%'}}>
              <Select
                id="csmind"
                sx={{
                  marginBottom: "20px",
                }}
                value={selectedCsmind == null ? "" : selectedCsmind.id}
                MenuProps={MenuProps}
                onChange={(e) => {
                  setSelectedCsmind(csmindSelection.find((element) => {
                    return element.id === e.target.value;
                  }))
                }}
              >
                {
                  csmindSelection && csmindSelection.map((item) => (
                    <MenuItem key={item.id} value={item.id}>{moment(item.startDate).format("DD-MMM-YYYY")}</MenuItem>
                  ))
                }
              </Select>
            </FormControl>
            <InputLabel>Title</InputLabel>
            <TextField
              required
              multiline
              fullWidth
              id="title"
              type="text"
              value={ CapitalizeWord(presentation.title) }
              autoFocus
              sx={{ marginBottom: "20px" }}
              onChange={(e) => {
                setPresentation({
                  ...presentation,
                  title: e.target.value.toUpperCase(),
                });
              }}
            />
            <InputLabel>Student</InputLabel>
            <FormControl style={{ width: "100%" }}>
              <Select
                id="student"
                value={presentation.student}
                sx={{
                  marginBottom: "20px",
                }}
                MenuProps={MenuProps}
                onChange={(e) => {
                  setPresentation({
                    ...presentation,
                    student: e.target.value,
                  });
                }}
              >
                {userSelection && userSelection.student.map((item) => (
                  <MenuItem key={item.userId} value={item.userId}>
                    { CapitalizeWord(item.fullname) }
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <InputLabel>Supervisor</InputLabel>
            <FormControl style={{ width: "100%" }}>
              <Select
                id="supervisor"
                value={presentation.supervisor}
                sx={{ marginBottom: "20px" }}
                MenuProps={MenuProps}
                onChange={(e) => {
                  setPresentation({
                    ...presentation,
                    supervisor: e.target.value,
                  });
                }}
              >
                {userSelection && userSelection.lecturer.map((item) => (
                  <MenuItem key={item.userId} value={item.userId}>
                    { CapitalizeWord(item.fullname) }
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <InputLabel>Examiner</InputLabel>
            <FormControl style={{ width: "100%" }}>
              <Select
                id="examiner"
                value={presentation.examiner}
                sx={{ marginBottom: "20px" }}
                MenuProps={MenuProps}
                onChange={(e) => {
                  setPresentation({
                    ...presentation,
                    examiner: e.target.value,
                  });
                }}
              >
                {userSelection && userSelection.lecturer.map((item) => (
                  <MenuItem key={item.userId} value={item.userId}>
                    { CapitalizeWord(item.fullname) }
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <InputLabel>Chair</InputLabel>
            <FormControl style={{ width: "100%" }}>
              <Select
                id="chair"
                value={presentation.chair}
                sx={{ marginBottom: "20px" }}
                MenuProps={MenuProps}
                onChange={(e) => {
                  setPresentation({
                    ...presentation,
                    chair: e.target.value,
                  });
                }}
              >
                {userSelection && userSelection.lecturer.map((item) => (
                  <MenuItem key={item.userId} value={item.userId}>
                    { CapitalizeWord(item.fullname) }
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <Button
              variant="contained"
              sx={{ mt: 3, mb: 2 }}
              onClick={() => {
                if (
                  selectedCsmind === null ||
                  presentation.title === "" ||
                  presentation.student === -1 ||
                  presentation.supervisor === -1 ||
                  presentation.examiner === -1||
                  presentation.chair === -1
                ) {
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
              Create
            </Button>
            <Button
              variant="outlined"
              sx={{ mt: 3, mb: 2, mx: 2 }}
              onClick={onReset}
            >
              Reset
            </Button>
          </Box>
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
            Are you sure to create this presentation?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseConfirmBox}>No</Button>
          <Button onClick={onCreate} autoFocus>
            Yes
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}

export default Create;