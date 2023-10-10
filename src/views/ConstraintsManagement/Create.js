import { Alert, Box, Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, Divider, FormControl, FormControlLabel, IconButton, InputLabel, MenuItem, Radio, RadioGroup, Select, Snackbar, Stack, TextField, Typography } from "@mui/material";
import { React, useState, useEffect } from "react";
import ArrowBackIosNewIcon from "@mui/icons-material/ArrowBackIosNew";
import { useHistory } from "react-router-dom";
import axios from "axios";
import { useCookies } from "react-cookie";
import moment from "moment";
import CapitalizeWord from '../../utils/CapitalizeWord';
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
const BREAKSTART = moment('12:30', 'HH:mm');
const BREAKEND = moment('14:00', 'HH:mm');

function Create() {

  let history = useHistory();
  const [token, setToken] = useCookies();

  const [csmindSelection, setCsmindSelection] = useState([]);
  const [userSelection, setUserSelection] = useState();
  const [constraint, setConstraint] = useState({
    role: "lecturer",
    csmindId: 0,
    userId: 0,
    consecutive: 4,
    change: false
  });
  const [selectedCsmind, setSelectedCsmind] = useState();
  const [dayOfWeek, setDayOfWeek] = useState([]);
  const [totalSlots, setTotalSlots] = useState([]);
  const [columnColor, setColumnColor] = useState([]);

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
        setConstraint({
          ...constraint,
          csmindId: data[0].id
        })
        setSelectedCsmind(data[0]);
        getDayOfWeeks(data[0]);
      })
      .catch((error) => console.log(error));
  };

  useEffect(() => {
    fetchCsminds();
    fetchUserSelection();
  }, []);

  const getDayOfWeeks = (selected) => {
    var days;
    var dow = [];

    if (selected.startDate === selected.endDate) {
      days = 1;
    }
    else {
      days = (Math.ceil((new Date(selected.endDate).getTime() - new Date(selected.startDate).getTime())/(1000*60*60*24)) + 1);
    }

    for (let i = 0; i < days; i++) {
      var tomorrow = new Date(selected.startDate);
      tomorrow.setDate(tomorrow.getDate()+i);
      dow.push(tomorrow.toLocaleString("en", { weekday: "long" }));
    }

    setDayOfWeek(dow);

    var slots = createSlots(selected.periodSlot.split('-')[0]);
    setTotalSlots(slots);
    createColumnColor(dow,slots)
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
    let newArr = [...columnColor];
    var index = columnColor.findIndex(e => e.column === column && e.row === row)
    newArr[index].flag = (!newArr[index].flag);
    setColumnColor(newArr);
  }

  const onCreate = async () => {
    let formData = new FormData();
    formData.append("role", constraint.role);
    formData.append("csmindId", constraint.csmindId);
    formData.append("userId", constraint.userId);
    formData.append("numOfConsecutiveSlots", constraint.consecutive);
    formData.append("preferVenueChange", constraint.change);
    formData.append("unavailableTime", JSON.stringify(columnColor));

    await axios
      .post( API_URL + "/api/v1/constraint/create", formData, {
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          Authorization: `Bearer ${token.Token}`,
        },
      })
      .then((response) => {
        setMessage({
          status: "success",
          statusText: "Constraint is successfully created.",
        });
        setOpenSB(true);
        handleCloseConfirmBox();
      })
      .catch((error) => {
        console.log(error);
        setMessage({
          status: "error",
          statusText: "Failed to create constraint. Please check whether there is an exist constraint for this CSMInD session.",
        });
        setOpenSB(true);
        handleCloseConfirmBox();
      });
  };

  return (
    <>
      <div className="main-content-container p-4 container-fluid">
        <h3 style={{ marginBottom: "20px" }}>Constraints Management</h3>
        <div
          style={{
            backgroundColor: "white",
            padding: "20px",
            borderRadius: "5px",
          }}
        >
          <Stack direction="row" alignItems="center">
            <IconButton
              sx={{ color: "black", paddingLeft: '0' }}
              onClick={onBack}
            >
              <ArrowBackIosNewIcon sx={{ fontSize: "25px" }} />
            </IconButton>
            <Typography variant="h5" sx={{ fontWeight: "bold" }}>
              Create Constraint
            </Typography>
          </Stack>
          <Box
            sx={{
              my: 3,
              mx: 4,
            }}
          >
            <InputLabel>Choose a role</InputLabel>
            <RadioGroup
              row
              value={constraint.role}
              onChange={(e) => {
                setConstraint({
                  ...constraint,
                  role: e.target.value
                });
              }}
            >
              <FormControlLabel value="lecturer" control={<Radio />} label="Lecturer" />
              <FormControlLabel value="student" control={<Radio />} label="Student" />
            </RadioGroup>
            <Divider sx={{ mt: 2, mb: 3 }}/>
            <InputLabel>Select a CSMInD session</InputLabel>
            <FormControl style={{width: '100%'}}>
              <Select
                id="csmind"
                sx={{
                  marginBottom: "20px",
                }}
                value={constraint.csmindId}
                MenuProps={MenuProps}
                onChange={(e) => {
                  setConstraint({
                    ...constraint,
                    csmindId: e.target.value
                  });
                  setSelectedCsmind(csmindSelection.find((element) => {
                    return element.id === e.target.value;
                  }))
                  getDayOfWeeks(csmindSelection.find((element) => {
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
            <InputLabel>Select a {constraint.role}</InputLabel>
            <FormControl style={{width: '100%'}}>
              <Select
                id="user"
                sx={{
                  marginBottom: "20px",
                }}
                value={constraint.userId}
                MenuProps={MenuProps}
                onChange={(e) => {
                  setConstraint({
                    ...constraint,
                    userId: e.target.value
                  });
                }}
              >
                {
                  constraint.role === "lecturer" ?
                  userSelection && userSelection.lecturer.map((item) => (
                    <MenuItem key={item.userId} value={item.userId}>{ CapitalizeWord(item.fullname) }</MenuItem>
                  )) :
                  userSelection && userSelection.student.map((item) => (
                    <MenuItem key={item.userId} value={item.userId}>{ CapitalizeWord(item.fullname) }</MenuItem>
                  ))
                }
              </Select>
            </FormControl>
            { columnColor.length > 0 ?
              <>
                <InputLabel sx={{ mb: 1 }}>Select the column to mark your unavailability</InputLabel>
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
                                  return <th key={column} style={{ border: '1px solid black', backgroundColor: getColor((row+1), column) ? 'red' : 'white' }} onClick={()=> {setColor((row+1), column)}}></th>
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
              constraint.role === "lecturer" ?
              <>
                <InputLabel sx={{ mt: 3 }}>Preferred number of consecutive presentation slots</InputLabel>
                <TextField
                  required
                  fullWidth
                  id="slots"
                  type="number"
                  value={constraint.consecutive}
                  sx={{ marginBottom: "20px" }}
                  onChange={(e) => {
                    setConstraint({
                      ...constraint,
                      consecutive: e.target.value
                    });
                  }}
                />
                <InputLabel>Preferred to change venue</InputLabel>
                <RadioGroup
                  row
                  value={constraint.change}
                  onChange={(e) => {
                    setConstraint({
                      ...constraint,
                      change: e.target.value
                    });
                  }}
                >
                  <FormControlLabel value={true} control={<Radio />} label="Yes" />
                  <FormControlLabel value={false} control={<Radio />} label="No" />
                </RadioGroup>
              </> : <></>
            }
            <Button
              variant="contained"
              sx={{ mt: 3, mb: 2 }}
              onClick={() => {
                if (
                  constraint.csmindId === 0 ||
                  constraint.userId === 0
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
            Are you sure to create this constraint?
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
