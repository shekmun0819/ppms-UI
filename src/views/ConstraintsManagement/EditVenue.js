import { Alert, Box, Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, IconButton, InputLabel, Snackbar, Stack, Typography } from '@mui/material';
import ArrowBackIosNewIcon from "@mui/icons-material/ArrowBackIosNew";
import React, { useEffect, useState } from 'react';
import axios from "axios";
import moment from "moment";
import { useHistory } from 'react-router-dom';
import { useCookies } from 'react-cookie';
import { API_URL } from "../../config";

const BREAKSTART = moment('12:30', 'HH:mm');
const BREAKEND = moment('14:00', 'HH:mm');

function EditVenue(props) {
  let history = useHistory();
  const [token, setToken] = useCookies();

  const [selected, setSelected] = useState();
  const [selectedCsmind, setSelectedCsmind] = useState();
  const [dayOfWeek, setDayOfWeek] = useState([]);
  const [totalSlots, setTotalSlots] = useState([]);
  const [columnColor, setColumnColor] = useState([]);
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

  const fetchRoom = async () => {
    await axios
      .get( API_URL + "/api/v1/venue/edit/" + props.match.params.id, {
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${token.Token}`,
        },
      })
      .then((response) => {
        setSelected(response.data);
        setSelectedCsmind(response.data.csmind);

        if(response.data.unavailableTime !== null)
          setSlots(JSON.parse(response.data.unavailableTime));
        else
          getDayOfWeeks(response.data.csmind);
      })
      .catch((error) => console.log(error));
  };

  useEffect(() => {
    fetchRoom();
  }, []);

  const getDayOfWeeks = (csmind) => {
    var days;
    var dow = [];

    if (csmind.startDate === csmind.endDate) {
      days = 1;
    }
    else {
      days = (Math.ceil((new Date(csmind.endDate).getTime() - new Date(csmind.startDate).getTime())/(1000*60*60*24)) + 1);
    }

    for (let i = 0; i < days; i++) {
      var tomorrow = new Date(csmind.startDate);
      tomorrow.setDate(tomorrow.getDate()+i);
      dow.push(tomorrow.toLocaleString("en", { weekday: "long" }));
    }

    setDayOfWeek(dow);

    var slots = createSlots(csmind.periodSlot.split('-')[0]);
    setTotalSlots(slots);
    createColumnColor(dow,slots);
  };

  const createSlots = (period) => {
    var startTime = moment('08:30', 'HH:mm');
    var endTime = moment('17:00', 'HH:mm');

    var slots = [];

    while(startTime <= endTime && slots.length < 17) {

      if(startTime <= BREAKSTART || startTime >= BREAKEND)
        slots.push(new moment(startTime).format('HH:mm'));
      
      if(startTime <= BREAKSTART) {
        var temp = moment(startTime, 'HH:mm');
        temp.add(period, 'minutes');
        if(temp > BREAKSTART && temp <= BREAKEND)
          startTime = moment('14:00', 'HH:mm');
        else {
          startTime.add(period, 'minutes');
        }
      }
      else {
        startTime.add(period, 'minutes');
      }
    }

    while(slots.length < 17) {
      slots.push('x');
    }

    return slots;
  }

  const createColumnColor = (dow, slots) => {
    if (slots.length > 0) {

      var tempArray = [];
      var header = "";
      var defaultFlagColumn = [];

      for (let i = 0; i <= dow.length; i++) {
        for (let j = 0; j < slots.length-1; j++) {

          header = (i === 0 && slots[j] === 'x') ? "x" : 
                    (i === 0 && j !== 0 && moment(slots[j], 'HH:mm') <= BREAKSTART) ? `${slots[j-1]}-${slots[j]}` : 
                    (i === 0 && j !== 0 && moment(slots[j], 'HH:mm') >= BREAKEND) ? `${slots[j]}-${slots[j+1]}` : 
                    (i !== 0 && j === 0) ? dow[i-1] : ""

          if(header.includes('x')) {
            defaultFlagColumn.push(j)
          }

          var temp = {
            row: i,
            column: j,
            flag: defaultFlagColumn.includes(j) ? true : false,
            header: header
          }

          tempArray.push(temp);
        }
      }

      setColumnColor(tempArray);
    }
  }

  const getColor = (row, column) => {
    var temp = columnColor.filter(e => e.row === row)
    temp = temp.find(e => e.column === column)
    return temp.flag;
  }

  const setColor = (row, column) => {
    let newArr = slots.length > 0 ? [...slots] : [...columnColor];
    var index =  slots.length > 0 ? slots.findIndex(e => e.column === column && e.row === row) : columnColor.findIndex(e => e.column === column && e.row === row)
    newArr[index].flag = (!newArr[index].flag);
    if(slots.length > 0)
      setSlots(newArr);
    else
      setColumnColor(newArr);
  }

  const onEdit = async () => {
    let formData = new FormData();
    formData.append("id", selected.id);
    formData.append("unavailableTime", (slots.length > 0) ? JSON.stringify(slots) : JSON.stringify(columnColor));

    await axios
      .put( API_URL + "/api/v1/venue/update", formData, {
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          Authorization: `Bearer ${token.Token}`,
        },
      })
      .then((response) => {
        setMessage({
          status: "success",
          statusText: "Venue is successfully updated.",
        });
        setOpenSB(true);
        handleCloseConfirmBox();
      })
      .catch((error) => {
        console.log(error);
        setMessage({
          status: "error",
          statusText: "Failed to update venue.",
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
              Edit Room
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
                Venue Name: {selected.name}
              </Typography>
              { columnColor.length > 0 ?
                <>
                  <InputLabel sx={{ mb: 1 }}>Select the column to mark room unavailability</InputLabel>
                  <div className="table-responsive ps-1">
                    <table className="table table-bordered" style={{ border: '1px solid black' }}>
                      <thead>
                        <tr>
                        {
                          totalSlots && totalSlots.map( (item, index) => {
                            if(index === 0) {
                              return <th key={index}></th>
                            }
                            else if(item === 'x') {
                              return <th key={index}>x</th>
                            }
                            else if(moment(item, 'HH:mm') > moment('12:30', 'HH:mm') && moment(item, 'HH:mm') <= moment('14:00', 'HH:mm')) {
                              return <></>
                            }
                            else {
                              return <th key={index}>{totalSlots[index-1]}-{item}</th>
                            }
                          })
                        }
                        </tr>
                      </thead>
                      <tbody>
                        {
                          dayOfWeek && dayOfWeek.map( (item, row) => (
                            <tr key={row}>
                              {
                                totalSlots && totalSlots.map( (slot, column) => {
                                  if(column === 0) {
                                    return <th key={column}>{item}</th>
                                  }
                                  else if(column === 16) {
                                    return <></>
                                  }
                                  else {
                                    return <th key={column} style={{ backgroundColor: getColor((row+1), column) ? 'red' : 'white' }} onClick={()=> {setColor((row+1), column)}}></th>
                                  }
                                })
                              }
                            </tr>
                          ))
                        }
                      </tbody>
                    </table>
                  </div>
                </> : <></>
              }
              {
                slots.length > 0 ?
                <>
                  <InputLabel sx={{ mb: 1 }}>Select the column to mark room unavailability</InputLabel>
                  <div className="table-responsive ps-1">
                    <table className="table table-bordered" style={{ border: '1px solid black' }}>
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
            Are you sure to update this venue?
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
  )
}

export default EditVenue;