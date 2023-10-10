import { React, useState, useEffect } from "react";
import { IconButton, Typography, CircularProgress, Stack, FormControl, InputLabel, MenuItem, Select, Box, Snackbar, Alert, DialogTitle, DialogContent, DialogContentText, DialogActions, Button, Dialog, Divider } from "@mui/material";
import ArrowBackIosNewIcon from "@mui/icons-material/ArrowBackIosNew";
import axios from "axios";
import moment from "moment";
import { useHistory } from "react-router-dom";
import { useCookies } from "react-cookie";
import { DataGrid, gridClasses } from "@mui/x-data-grid";
import { COLORS } from "./Color";
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

function EditMasterSchedule(props) {
  let history = useHistory();
  const [token, setToken] = useCookies();

  const [selectedCsmind, setSelectedCsmind] = useState({
    id: 0,
    schedule: null,
    academicSession: null,
    semester: 0,
    courseCode: null,
    startDate: null,
    endDate: null
  })
  const [slots, setSlots] = useState([]);
  const [dayOfSlots, setDayOfSlots] = useState([]);
  const [dayDate, setDayDate] = useState([]);
  const [numVenue, setNumVenue] = useState(0);

  const [pageSize, setPageSize] = useState(10);
  const [presentations, setPresentations] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [students, setStudents] = useState([]);
  const [isLoading, setLoading] = useState(false);
  const [chairSelection, setChairSelection] = useState();
  const [selectedChair, setSelectedChair] = useState(0);
  const [selectedSlots, setSelectedSlots] = useState([]);
  const [presColor, setPresColor] = useState([]);
  const [roomConstraints, setRoomConstraints] = useState([]);
  const [roomUnavailableSlot, setRoomUnavailableSlot] = useState([]);

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

  const fetchCsmind = async () => {
    await axios
      .get( API_URL + "/api/v1/csmind/" + props.match.params.id, {
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${token.Token}`,
        },
      })
      .then((response) => {
        var data = response.data;
        setSelectedCsmind({
          ...selectedCsmind,
          id: data.id,
          schedule: data.schedule,
          academicSession: data.academicSession.academicSession,
          semester: data.academicSession.semester,
          courseCode: data.courseCode,
          startDate: data.startDate,
          endDate: data.endDate
        })
        setSlots(JSON.parse(data.schedule));
      })
      .catch((error) => console.log(error));
  };

  const getRowId = (params) => params.id;

  const columns = [
    { field: "presIdentity", headerName: "#", description: "#", flex: 1, headerAlign: "center", align: "center" },
    {
      field: "matricNum",
      headerName: "Matric No.",
      description: "Matric No.",
      flex: 1,
      headerAlign: "center", 
      align: "center",
      renderCell: (cellValues) => {
        return (
          <span style={{ overflow: "hidden" }}>
            { students.length > 0 && students.find( (s) => s.user.id === cellValues.row.student.id).matricNum }
          </span>
        );
      },
    },
    {
      field: "student",
      headerName: "Student",
      description: "Student",
      flex: 2,
      renderCell: (cellValues) => {
        return (
          <span style={{ overflow: "hidden" }}>
            { CapitalizeWord(cellValues.row.student.name) }
          </span>
        );
      },
    },
    { field: "title", headerName: "Title", description: "Title", flex: 3,
      renderCell: (cellValues) => {
        return (
          <span style={{ overflow: "hidden" }}>
            { CapitalizeWord(cellValues.value) }
          </span>
        );
      },
    },
    {
      field: "supervisor",
      headerName: "Supervisor",
      description: "Supervisor",
      flex: 2,
      renderCell: (cellValues) => {
        return (
          <span style={{ overflow: "hidden" }}>
            { CapitalizeWord(cellValues.row.supervisor.name) }
          </span>
        );
      },
    },
    {
      field: "examinerOne",
      headerName: "Examiner",
      description: "Examiner",
      flex: 2,
      renderCell: (cellValues) => {
        return (
          <span style={{ overflow: "hidden" }}>
            { CapitalizeWord(cellValues.row.examinerOne.name) }
          </span>
        );
      },
    },
    {
      field: "examinerTwo",
      headerName: "Chair",
      description: "Chair",
      flex: 2,
      renderCell: (cellValues) => {
        return (
          <span style={{ overflow: "hidden" }}>
            { CapitalizeWord(cellValues.row.examinerTwo.name) }
          </span>
        );
      },
    },
    {
      field: "venue",
      headerName: "Time & Venue",
      description: "Time & Venue",
      flex: 2,
      renderCell: (cellValues) => {
        return (
          <span style={{ overflow: "hidden" }}>
            {cellValues.row.timeSlot}
            <br></br>
            {cellValues.row.day}
            <br></br>
            {cellValues.row.date}
            <br></br>
            {cellValues.row.venue}
          </span>
        );
      },
    }
  ];

  const fetchPresentations = async () => {
    setLoading(true);
    await axios
      .get( API_URL + "/api/v1/presentation/" + selectedCsmind.id, {
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${token.Token}`,
        },
      })
      .then((response) => {
        var data = response.data;
        setPresentations(data.presentations);
        setStudents(data.students);
        setFiltered(data.presentations);
        setLoading(false);
      })
      .catch((error) => console.log(error));
  };

  useEffect(() => {
    fetchCsmind();
  }, []);

  useEffect(() => {
    if(selectedChair !== 0) {
      let filteredPres = presentations.filter(p => p.examinerTwo.id === selectedChair );
      setFiltered(filteredPres);
    }
    else {
      setFiltered(presentations);
    }
  }, [selectedChair]);

  useEffect(() => {
    if(selectedCsmind.id !== 0) {
      fetchChairSelection();
      fetchPresentations();
      fetchRooms();
    }
  }, [selectedCsmind]);

  useEffect(() => {
    if(slots.length > 0) {
      setNumVenue(slots[slots.length-1].row);
      var size = (slots[slots.length-1].row + 1) * 16;
      var numOfDay = (slots.length / 16) / (slots[slots.length-1].row + 1);
      var arrayOfArrays = [];
      var dayDate = [];
      
      for (var i=0; i < slots.length; i+=size) {
        arrayOfArrays.push(slots.slice(i,i+size));
      }

      for (var i=0; i < numOfDay; i++) {
        var tomorrow = new Date(selectedCsmind.startDate);
        tomorrow.setDate(tomorrow.getDate()+i);
        dayDate.push(moment(tomorrow).format("DD MMM YYYY, ") + tomorrow.toLocaleString("en", { weekday: "long" }));
      }

      setDayOfSlots(arrayOfArrays);
      setDayDate(dayDate);
    }
  }, [slots]);

  const onEdit = async () => {
    let formData = new FormData();
    formData.append("schedule", JSON.stringify(slots));

    await axios
      .put( API_URL + "/api/v1/csmind/updateSchedule/" + props.match.params.id, formData, {
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          Authorization: `Bearer ${token.Token}`,
        },
      })
      .then((response) => {
        setMessage({
          status: "success",
          statusText: "Schedule is successfully updated.",
        });
        setOpenSB(true);
        handleCloseConfirmBox();
        fetchPresentations();
        setSelectedChair(0);
      })
      .catch((error) => {
        console.log(error);
        setMessage({
          status: "error",
          statusText: "Failed to update schedule.",
        });
        setOpenSB(true);
        handleCloseConfirmBox();
      });
  }

  const fetchChairSelection = async () => {
    await axios
      .get( API_URL + "/api/v1/csmind/getChairSelection/" + selectedCsmind.id, {
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${token.Token}`,
        },
      })
      .then((response) => {
        var data = response.data;
        setChairSelection(data);
      })
      .catch((error) => console.log(error));
  };
  
  const selected = (row, column, i) => {
    //unselect slot
    if(selectedSlots.some(s => i === s.day && row === s.row && column === s.column)) {
      let selectedIndex = selectedSlots.findIndex(s => i === s.day && row === s.row && column === s.column);
      let newArr = [...selectedSlots];
      newArr.splice(selectedIndex, 1);
      setSelectedSlots(newArr);
    }
    //selected slot
    else {
      var slot = dayOfSlots[i].find(s => s.column === column && s.row === row);
      slot = {
        ...slot,
        day: i
      }
      setSelectedSlots([...selectedSlots, slot]);
    }
  }

  const onSwap = () => {
    let newArr = [...slots];
    let firstSlotIndex = (selectedSlots[0].day * 16 * (numVenue+1)) + (selectedSlots[0].row * 16 + selectedSlots[0].column);
    let secondSlotIndex = (selectedSlots[1].day * 16 * (numVenue+1)) + (selectedSlots[1].row * 16 + selectedSlots[1].column);

    var tempHeader = newArr[secondSlotIndex].header;
    var tempFlag = newArr[secondSlotIndex].flag;

    //first to second
    newArr[secondSlotIndex].header = newArr[firstSlotIndex].header;
    newArr[secondSlotIndex].flag = newArr[firstSlotIndex].flag;
    
    //second to first
    newArr[firstSlotIndex].header = tempHeader;
    newArr[firstSlotIndex].flag = tempFlag;
    
    setSlots(newArr);
    setSelectedSlots([]);
  }

  useEffect(() => {
    if(presentations.length > 0 && chairSelection) {
      let newArr = [];
      presentations.forEach( p => {
        let temp = {
          presIdentity: p.presIdentity,
          color: chairSelection.findIndex( cs => cs.name === p.examinerTwo.name)
        }
        newArr.push(temp);
      });
      setPresColor(newArr);
    }
  }, [presentations, chairSelection]);

  const findColor = (presIdentity) => {
    var found = presColor.find(p => p.presIdentity === presIdentity);
    return COLORS[found.color];
  }

  useEffect(() => {
    if(selectedSlots.length === 2) {
      if (selectedSlots[0].column !== selectedSlots[1].column || selectedSlots[0].day !== selectedSlots[1].day || checkRoomUnavailable(selectedSlots[0].row, selectedSlots[0].column, selectedSlots[0].day) || checkRoomUnavailable(selectedSlots[1].row, selectedSlots[1].column, selectedSlots[1].day)) {
        setMessage({
          status: "error",
          statusText: "Unable to swap for different time, different day or room unavailable.",
        });
        setOpenSB(true);
        setSelectedSlots([]);
      }
    }
  }, [selectedSlots]);

  const fetchRooms = async () => {
    await axios
      .get( API_URL + "/api/v1/venue/" + selectedCsmind.id, {
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${token.Token}`,
        },
      })
      .then((response) => {
        var data = response.data;
        setRoomConstraints(data);
      })
      .catch((error) => {
        console.log(error)
      });
  };

  useEffect(() => {
    if(roomConstraints.length > 0) {
      let roomsFlag = [];

      roomConstraints.forEach(elt => {
        let unavailableTime = JSON.parse(elt.unavailableTime);
        let filteredFlag = unavailableTime.filter(ut => ut.flag === true && ut.header === "");
        for (let i = 0; i < filteredFlag.length; i++) {
          let temp = {
            venue: elt.name,
            day: filteredFlag[i].row - 1,
            column: filteredFlag[i].column
          }
          roomsFlag.push(temp);
        }
      });

      setRoomUnavailableSlot(roomsFlag);
    }
  }, [roomConstraints]);

  const checkRoomUnavailable = (row, column, day) => {
    let venue = slots[row*16].header;
    let found = roomUnavailableSlot.some(elt => elt.venue === venue && elt.day === day && elt.column === column)
    if(found)
      return true;
    else
      return false;
  }

  return (
    <>
      <div className="main-content-container p-4 container-fluid">
        <h3 style={{ marginBottom: "20px" }}>Master Schedule</h3>
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
              Edit Schedule
            </Typography>
          </Stack>
          <Box
            sx={{
              my: 3,
              mx: 4,
            }}
          >
            {
              presentations.length > 0 && presColor.length > 0 && dayOfSlots.length > 0 &&
              <>
                <Typography variant="subtitle1" sx={{ fontWeight: "bold", textAlign: "center" }}>
                  CSMInD Session
                </Typography>
                <Typography variant="subtitle1" sx={{ fontWeight: "bold", textAlign: "center" }}>
                  Academic Year {selectedCsmind.academicSession}
                </Typography>
                <Typography variant="subtitle1" sx={{ fontWeight: "bold", textAlign: "center" }}>
                  Semester {selectedCsmind.semester}
                </Typography>
                {
                  dayOfSlots.map( (dos, i) => (
                    <>
                      <Typography sx={{ fontWeight: "bold", mt: 3, fontSize: 18, textAlign: 'center' }}>{ dayDate[i] }</Typography>
                      <div className="table-responsive ps-2 pe-2" style={{ marginTop: '10px' }} id={`masterSchedule_${i}`}>
                        <table className="table table-bordered" style={{ border: '1px solid black' }}>
                          <thead>
                            <tr>
                            {
                              dos.filter(s => s.row === 0 ).map( (item, index) => {
                                if(item.header.includes('x')) {
                                  return <th key={index} style={{ textAlign: 'center' }}>x</th>
                                }
                                else {
                                  return <th key={index} style={{ textAlign: 'center' }}>{item.header}</th>
                                }
                              })
                            }
                            </tr>
                          </thead>
                          <tbody>
                            {
                              dos.filter(s => s.row !== 0 && s.column === 0 ).map( (item, row) => (
                                <tr key={row}>
                                  {
                                    dos.filter(s => s.row === row+1 ).map( (slot, column) => {
                                      if(column === 0) {
                                        return <th key={column} style={{ textAlign: 'center' }}>{slot.header}</th>
                                      }
                                      else {
                                        return <td key={column} style={{ verticalAlign: 'middle', textAlign: 'center', border: '1px solid black', backgroundColor: selectedSlots.some(s => i === s.day && slot.row === s.row && slot.column === s.column) ? '#39AC39' : checkRoomUnavailable(row+1, column, i) ? 'grey' : filtered.some(p => slot.header === p.presIdentity) ? findColor(slot.header) : 'white' }} onClick={()=>{selected(row+1, column, i)}}>
                                          <Typography>
                                            { slot.header }
                                          </Typography>
                                        </td>
                                      }
                                    })
                                  }
                                </tr>
                              ))
                            }
                          </tbody>
                        </table>
                      </div>
                    </>
                  ))
                }
                <Button
                  variant="contained"
                  sx={{ mt: 3, mb: 2, mx: 1 }}
                  onClick={handleOpenConfirmBox}
                >
                  Update
                </Button>
                {
                  selectedSlots.length === 2 &&
                  <Button
                    variant="outlined"
                    sx={{ mt: 3, mb: 2, ml: 1 }}
                    onClick={onSwap}
                  >
                    Swap
                  </Button>
                }
                <Divider sx={{ mt: 4, mb: 3 }}/>
                <InputLabel>Choose a chair</InputLabel>
                <FormControl style={{ width: "50%" }}>
                  <Select
                    id="chair"
                    value={selectedChair}
                    sx={{ marginBottom: "20px" }}
                    MenuProps={MenuProps}
                    onChange={(e) => {
                      setSelectedChair(e.target.value)
                    }}
                  >
                    <MenuItem key={0} value={0}>{"All"}</MenuItem>
                    {chairSelection && chairSelection.map((item) => (
                      <MenuItem key={item.id} value={item.id}>
                        { CapitalizeWord(item.name) }
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </>
            }
            {
              isLoading ? 
              (
                <div style={{ textAlign: "center" }}>
                  <CircularProgress />
                </div>
              ) : 
              (
                <DataGrid
                  pageSize={pageSize}
                  onPageSizeChange={(newPageSize) => setPageSize(newPageSize)}
                  getRowHeight={() => "auto"}
                  autoHeight={true}
                  getRowId={getRowId}
                  rows={filtered}
                  columns={columns}
                  rowsPerPageOptions={[10, 50, 100]}
                  disableColumnMenu={true}
                  disableSelectionOnClick
                  sx={{
                    ".MuiDataGrid-columnHeaderTitle": {
                      fontWeight: "bold !important",
                      overflow: "hidden !important",
                      fontSize: "16px",
                      textOverflow: "ellipsis",
                    },
                    [`& .${gridClasses.cell}`]: {
                      py: 2,
                    },
                    ".MuiTablePagination-displayedRows": {
                      marginTop: "1em",
                      marginBottom: "1em",
                    },
                    ".MuiTablePagination-displayedRows, .MuiTablePagination-selectLabel":
                      {
                        marginTop: "1em",
                        marginBottom: "1em",
                      },
                    border: "none",
                  }}
                />
              )
            }
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
            Are you sure to update this master schedule?
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

export default EditMasterSchedule;