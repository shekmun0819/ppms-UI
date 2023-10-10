import { React, useState, useEffect } from "react";
import { IconButton, Typography, CircularProgress, Stack, InputLabel, TextField, FormControl, Select, MenuItem, Box, Snackbar, Alert, DialogTitle, DialogContent, DialogContentText, DialogActions, Button, Dialog } from "@mui/material";
import ArrowBackIosNewIcon from "@mui/icons-material/ArrowBackIosNew";
import axios from "axios";
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

function Edit(props) {
  let history = useHistory();
  const [token, setToken] = useCookies();

  const [userSelection, setUserSelection] = useState();
  const [selectedPres, setSelectedPres] = useState({
    id: -1,
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

  const fetchPresentation = async () => {
    await axios
      .get( API_URL + "/api/v1/presentation/edit/" + props.match.params.id, {
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${token.Token}`,
        },
      })
      .then((response) => {
        var data = response.data;
        setSelectedPres({
          id: data.id,
          title: data.title,
          student: data.student.id,
          supervisor: data.supervisor.id,
          examiner: data.examinerOne.id,
          chair: data.examinerTwo.id,
        });
      })
      .catch((error) => console.log(error));
  };

  useEffect(() => {
    fetchPresentation();
    fetchUserSelection();
  }, []);

  const onEdit = async () => {
    let data = new FormData();
    data.append("id", selectedPres.id);
    data.append("title", selectedPres.title);
    data.append("student", selectedPres.student);
    data.append("supervisor", selectedPres.supervisor);
    data.append("examiner", selectedPres.examiner);
    data.append("chair", selectedPres.chair);

    await axios
      .put( API_URL + "/api/v1/presentation/update", data, {
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          Authorization: `Bearer ${token.Token}`,
        },
      })
      .then((response) => {
        setMessage({
          status: "success",
          statusText: "Presentation is successfully updated.",
        });
        setOpenSB(true);
        handleCloseConfirmBox();
      })
      .catch((error) => {
        console.log(error);
        setMessage({
          status: "error",
          statusText: "Failed to update presentation.",
        });
        setOpenSB(true);
        handleCloseConfirmBox();
      });
  };

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
              Edit Presentation
            </Typography>
          </Stack>
          { userSelection && selectedPres.id !== -1 &&
            (
              <Box
                sx={{
                  my: 3,
                  mx: 4,
                }}
              >
                <InputLabel>Title</InputLabel>
                <TextField
                  required
                  multiline
                  fullWidth
                  id="title"
                  type="text"
                  value={ CapitalizeWord(selectedPres.title) }
                  autoFocus
                  sx={{ marginBottom: "20px" }}
                  onChange={(e) => {
                    setSelectedPres({
                      ...selectedPres,
                      title: e.target.value.toUpperCase(),
                    });
                  }}
                />
                <InputLabel>Student</InputLabel>
                <FormControl style={{ width: "100%" }}>
                  <Select
                    id="student"
                    value={selectedPres.student}
                    sx={{
                      marginBottom: "20px",
                    }}
                    MenuProps={MenuProps}
                    onChange={(e) => {
                      setSelectedPres({
                        ...selectedPres,
                        student: e.target.value,
                      });
                    }}
                  >
                    {userSelection.student.map((item) => (
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
                    value={selectedPres.supervisor}
                    sx={{ marginBottom: "20px" }}
                    MenuProps={MenuProps}
                    onChange={(e) => {
                      setSelectedPres({
                        ...selectedPres,
                        supervisor: e.target.value,
                      });
                    }}
                  >
                    {userSelection.lecturer.map((item) => (
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
                    value={selectedPres.examiner}
                    sx={{ marginBottom: "20px" }}
                    MenuProps={MenuProps}
                    onChange={(e) => {
                      setSelectedPres({
                        ...selectedPres,
                        examiner: e.target.value,
                      });
                    }}
                  >
                    {userSelection.lecturer.map((item) => (
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
                    value={selectedPres.chair}
                    sx={{ marginBottom: "20px" }}
                    MenuProps={MenuProps}
                    onChange={(e) => {
                      setSelectedPres({
                        ...selectedPres,
                        chair: e.target.value,
                      });
                    }}
                  >
                    {userSelection.lecturer.map((item) => (
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
                      selectedPres.title === "" ||
                      selectedPres.student === -1 ||
                      selectedPres.supervisor === -1 ||
                      selectedPres.examiner === -1||
                      selectedPres.chair === -1
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
                >
                  Update
                </Button>
              </Box>
            )}
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
            Are you sure to update this presentation?
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