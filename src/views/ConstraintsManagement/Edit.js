import { React, useState, useEffect } from "react";
import { useHistory } from "react-router-dom";
import ArrowBackIosNewIcon from "@mui/icons-material/ArrowBackIosNew";
import { useCookies } from "react-cookie";
import { Alert, Box, Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, FormControlLabel, IconButton, InputLabel, Radio, RadioGroup, Snackbar, Stack, TextField, Typography } from "@mui/material";
import axios from "axios";
import moment from "moment";
import CapitalizeWord from '../../utils/CapitalizeWord';
import { API_URL } from "../../config";

function Edit(props) {
  let history = useHistory();
  const [token, setToken] = useCookies();

  const [id, setId] = useState();
  const [selected, setSelected] = useState();
  const [slots, setSlots] = useState([]);

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

  const onBack = () => {
    history.goBack();
  };

  const handleCloseSB = (event, reason) => {
    if (reason === "clickaway") {
      return;
    }
    setOpenSB(false);
  };

  const fetchConstraint = async () => {
    await axios
      .get( API_URL + "/api/v1/constraint/" + props.match.params.id, {
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${token.Token}`,
        },
      })
      .then((response) => {
        setSelected(response.data);
        setSlots(JSON.parse(response.data.unavailableTime));
      })
      .catch((error) => console.log(error));
  };

  useEffect(() => {
    fetchConstraint();
  }, []);

  const setColor = (row, column) => {
    let newArr = [...slots];
    var index = slots.findIndex(e => e.column === column && e.row === row)
    newArr[index].flag = (!newArr[index].flag);
    setSlots(newArr);
  }

  const onEdit = async () => {
    let formData = new FormData();
    formData.append("id", selected.id);
    formData.append("numOfConsecutiveSlots", selected.numOfConsecutiveSlots);
    formData.append("preferVenueChange", selected.preferVenueChange);
    formData.append("unavailableTime", JSON.stringify(slots));

    await axios
      .put( API_URL + "/api/v1/constraint/update", formData, {
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          Authorization: `Bearer ${token.Token}`,
        },
      })
      .then((response) => {
        setMessage({
          status: "success",
          statusText: "Constraint is successfully updated.",
        });
        setOpenSB(true);
        handleCloseConfirmBox();
      })
      .catch((error) => {
        console.log(error);
        setMessage({
          status: "error",
          statusText: "Failed to update constraint.",
        });
        setOpenSB(true);
        handleCloseConfirmBox();
      });
  };

  return (
    <>
      <div className="main-content-container p-4 container-fluid">
        <h3 style={{ marginBottom: "20px" }}>Constraint Management</h3>
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
              Edit Constraint
            </Typography>
          </Stack>
          {
            selected &&
            <Box
              sx={{
                my: 3,
                mx: 4,
              }}
            >
              <Typography variant="subtitle1" sx={{ fontWeight: "bold", textAlign: "center" }}>
                CSMInD Session
              </Typography>
              <Typography variant="subtitle1" sx={{ fontWeight: "bold", textAlign: "center" }}>
                Academic Year {selected.csmind.academicSession.academicSession}
              </Typography>
              <Typography variant="subtitle1" sx={{ fontWeight: "bold", textAlign: "center" }}>
                Semester {selected.csmind.academicSession.semester}
              </Typography>
              <Typography variant="subtitle1" sx={{ fontWeight: "bold", textAlign: "center", mb: 3 }}>
                {selected.csmind.startDate === selected.csmind.endDate ? moment(selected.csmind.startDate).format("DD MMM YYYY") : `${moment(selected.csmind.startDate).format("DD MMM YYYY")} to ${moment(selected.csmind.endDate).format("DD MMM YYYY")}`}
              </Typography>
              <Typography variant="body1" sx={{ fontWeight: "bold", mb: 2 }}>
                {selected.user.roles.includes("Lecturer") ? `Lecturer Name: ${ CapitalizeWord(selected.user.name) }` : `Student Name: ${ CapitalizeWord(selected.user.name) }`}
              </Typography>
              {
                slots.length > 0 ?
                <>
                  <InputLabel sx={{ mb: 1 }}>Select the column to mark your unavailability</InputLabel>
                  <div className="table-responsive ps-1">
                    <table className="table table-bordered " style={{ border: '1px solid black' }}>
                      <thead>
                        <tr>
                        {
                          slots.filter(s => s.row === 0 ).map( (item, index) => {
                            if(item.header.includes('x')) {
                              return <th key={index}>x</th>
                            }
                            else {
                              return <th key={index}>{item.header}</th>
                            }
                          })
                        }
                        </tr>
                      </thead>
                      <tbody>
                        {
                          slots.filter(s => s.row !== 0 && s.column === 0 ).map( (item, row) => (
                            <tr key={row}>
                              {
                                slots.filter(s => s.row === row+1 ).map( (slot, column) => {
                                  if(column === 0) {
                                    return <th key={column}>{slot.header}</th>
                                  }
                                  else {
                                    return <th key={column} style={{ border: '1px solid black', backgroundColor: slot.flag ? 'red' : 'white' }} onClick={()=> {setColor((row+1), column)}}></th>
                                  }
                                })
                              }
                            </tr>
                          ))
                        }
                      </tbody>
                    </table>
                  </div>
                  {
                    selected.user.roles.includes("Lecturer") ?
                    <>
                      <InputLabel sx={{ mt: 2 }}>Preferred number of consecutive presentation slots</InputLabel>
                      <TextField
                        required
                        fullWidth
                        id="slots"
                        type="number"
                        value={selected.numOfConsecutiveSlots}
                        sx={{ marginBottom: "20px" }}
                        onChange={(e) => {
                          setSelected({
                            ...selected,
                            numOfConsecutiveSlots: e.target.value
                          });
                        }}
                      />
                      <InputLabel>Preferred to change venue</InputLabel>
                      <RadioGroup
                        row
                        value={selected.preferVenueChange}
                        onChange={(e) => {
                          setSelected({
                            ...selected,
                            preferVenueChange: e.target.value
                          });
                        }}
                      >
                        <FormControlLabel value={true} control={<Radio />} label="Yes" />
                        <FormControlLabel value={false} control={<Radio />} label="No" />
                      </RadioGroup>
                    </> : <></>
                  }
                </> : <></>
              }
              <Button
                variant="contained"
                sx={{ mt: 3, mb: 2 }}
                onClick={() => {
                  handleOpenConfirmBox();
                }}
              >
                Update
              </Button>
            </Box>
          }
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
            Are you sure to update this constraint?
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