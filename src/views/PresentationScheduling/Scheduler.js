import { Alert, Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, Divider, FormControl, InputLabel, MenuItem, Select, Snackbar, Stack, TextField, Typography } from "@mui/material";
import { React, useState, useEffect } from "react";
import { useCookies } from 'react-cookie';
import axios from "axios";
import moment from "moment";
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

function Scheduler() {

  const [token, setToken] = useCookies();

  const [csmindSelection, setCsmindSelection] = useState([]);
  const [selectedCsmind, setSelectedCsmind] = useState();
  const [scheduleMessage, setScheduleMessage] = useState("");

  const [message, setMessage] = useState({
    status: "info",
    statusText: "",
  });
  const [openSB, setOpenSB] = useState(false);
  const [openConfirmBox, setOpenConfirmBox] = useState(false);
  const [generating, setGenerating] = useState(false);

  const handleOpenConfirmBox = () => {
    setGenerating(false);
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

  const onCheckConstraints = async () => {
    await axios.get( API_URL + "/api/v1/constraint/checkConstraints/" + selectedCsmind.id, {
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${token.Token}`,
      },
    })
    .then((response) => {
      let valid = response.data;
      if (valid) {
        setGenerating(true);
        onGenerateSchedule();
      }
      else {
        setMessage({
          status: "error",
          statusText: "Please update the room unavailability and it should have at least 4 rooms.",
        });
        setOpenSB(true);
        handleCloseConfirmBox();
      }
    })
    .catch((error) => {
      console.log(error);
    });
  };

  const onGenerateSchedule = async () => {
    await axios
      .put( API_URL + "/api/v1/csmind/generateSchedule/" + selectedCsmind.id, "", {
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          Authorization: `Bearer ${token.Token}`,
        },
      })
      .then((response) => {
        setScheduleMessage(response.data);
        setMessage({
          status: "success",
          statusText: "Master Schedule generated successfully.",
        });
        setOpenSB(true);
        handleCloseConfirmBox();
      })
      .catch((error) => {
        console.log(error);
        setMessage({
          status: "error",
          statusText: "Failed to generate Master Schedule.",
        });
        setOpenSB(true);
        handleCloseConfirmBox();
      });
  };

  useEffect(() => {
    fetchCsminds();
  }, []);

  return (
    <>
      <div className="main-content-container p-4 container-fluid">
        <h3 style={{ marginBottom: "20px" }}>Scheduler</h3>
        <div
          style={{
            backgroundColor: "white",
            padding: "20px",
            borderRadius: "5px",
          }}
        >
          <Typography
            variant="h5"
            sx={{ fontWeight: "bold", paddingLeft: "5px" }}
          >
            Generate Master Schedule
          </Typography>
          <Typography
            sx={{ fontWeight: "bold", paddingLeft: "5px", mt: 1, fontSize: 18 }}
          >
            Notes:
          </Typography>
          <ol>
            <li>
              <Typography
                sx={{ paddingLeft: "5px", mt: 1 }}
              >
                Please make sure all venues of the selected CSMInD session are updated at least once. You may update through Constraints Management page.
              </Typography>
            </li>
            <li>
              <Typography
                sx={{ paddingLeft: "5px", mt: 1 }}
              >
                Please make sure all lecturers that involved in the selected CSMInD session have inputted their time unavailability. You may check through Constraints Management page.
              </Typography>
            </li>
            <li>
              <Typography
                sx={{ paddingLeft: "5px", mt: 1 }}
              >
                Failure to do the above, may affect the result of scheduling.
              </Typography>
            </li>
          </ol>
          <div style={{ paddingLeft: "5px" }}>
            <InputLabel>Choose a CSMInD session</InputLabel>
            <FormControl style={{width: '50%'}}>
              <Select
                id="csmind"
                sx={{
                  marginBottom: "10px",
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
          </div>
          <div style={{ paddingLeft: "5px" }}>
            <Button
              sx={{ mt: 1 }}
              variant="contained"
              onClick={() => {
                if (selectedCsmind == null) {
                  setMessage({
                    status: "error",
                    statusText: "You are required to select a CSMInD session.",
                  });
                  setOpenSB(true);
                } else {
                  handleOpenConfirmBox();
                }
              }}
            >
              Generate Master Schedule
            </Button>
            {
              scheduleMessage &&
              <Typography sx={{ mt: 2 }}>
                {scheduleMessage} Please proceed to the Master Schedule page.
              </Typography>
            }
          </div> 
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
        onClose={!generating && handleCloseConfirmBox}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">{generating ? "Message" : "Confirmation"}</DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            { generating ? "Master schedule is generating, please stay in this page and wait for a few minutes." : "Are you sure to generate the master schedule for this CSMInD session?"}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          {
            generating ? 
            <>
              <Button onClick={handleCloseConfirmBox}>Ok</Button>
            </> :
            <>
              <Button onClick={handleCloseConfirmBox}>No</Button>
              <Button onClick={onCheckConstraints}>Yes</Button>
            </>
          }
        </DialogActions>
      </Dialog>
    </>
  );
}

export default Scheduler;
