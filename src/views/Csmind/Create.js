import { React, useEffect, useRef, useState } from "react";
import IconButton from "@mui/material/IconButton";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import Box from "@mui/material/Box";
import TextField from "@mui/material/TextField";
import { useHistory } from "react-router-dom";
import ArrowBackIosNewIcon from "@mui/icons-material/ArrowBackIosNew";
import SyncAltRoundedIcon from '@mui/icons-material/SyncAltRounded';
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
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import Divider from '@mui/material/Divider';
import { useCookies } from "react-cookie";
import FormControlLabel from '@mui/material/FormControlLabel';
import Checkbox from '@mui/material/Checkbox';
import FormGroup from '@mui/material/FormGroup';
import MenuItem from "@mui/material/MenuItem";
import Select from "@mui/material/Select";
import * as XLSX from 'xlsx';
import { DataGrid, gridClasses, GridToolbarContainer, GridToolbarFilterButton } from "@mui/x-data-grid";
import { FormControl, List, ListItem, ListItemIcon, ListItemText, Tooltip } from "@mui/material";
import DeleteOutlinedIcon from '@mui/icons-material/DeleteOutlined';
import { API_URL } from "../../config";
import CapitalizeWord from '../../utils/CapitalizeWord';

const EXTENSIONS = ['xlsx', 'xls', 'csv']

const ITEM_HEIGHT = 48;
const MenuProps = {
  PaperProps: {
    style: {
      maxHeight: ITEM_HEIGHT * 4.5,
      width: 250,
    },
  },
};

function CustomToolbar() {
  return (
    <GridToolbarContainer sx={{ margin: "0 5px 5px 0" }}>
      <GridToolbarFilterButton sx={{ fontSize: "16px", color: "black" }} />
    </GridToolbarContainer>
  );
}

function Create() {
  const inputRef = useRef(null);

  const [colDefs, setColDefs] = useState();
  const [data, setData] = useState([]);
  const [retrievedData, setRetrievedData] = useState([]);
  const [pageSize, setPageSize] = useState(10);
  const [academicSessions, setAcademicSessions] = useState([]);
  const [selectedAcadSession, setSelectedAcadSession] = useState(null);
  const [projects, setProjects] = useState([]);
  const [retrieve, setRetrieve] = useState(false);

  let history = useHistory();
  const [token, setToken] = useCookies();

  const [courseCode, setCourseCode] = useState("");
  const [checked, setChecked] = useState(false);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [selected, setSelected] = useState("");
  const [rooms, setRooms] = useState([]);
  const [room, setRoom] = useState("");

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

  const onCreate = async () => {
    let formData = new FormData();
    formData.append("courseCode", courseCode);
    formData.append("academicSession", selectedAcadSession.id);
    formData.append("startDate", startDate.toJSON());

    if(checked === false) {
      formData.append("endDate", startDate.toJSON());
    }
    else {
      formData.append("endDate", endDate.toJSON());
    }
    
    formData.append("periodSlot", selected);
    formData.append("numOfPresentations", retrieve ? retrievedData.length : data.length);

    formData.append("data", JSON.stringify( retrieve ? retrievedData : data));
    formData.append("rooms", JSON.stringify(rooms));

    await axios
      .post( API_URL + "/api/v1/csmind/create", formData, {
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          Authorization: `Bearer ${token.Token}`,
        },
      })
      .then((response) => {
        setMessage({
          status: "success",
          statusText: "CSMInD is successfully created.",
        });
        setOpenSB(true);
        handleCloseConfirmBox();
      })
      .catch((error) => {
        console.log(error);
        setMessage({
          status: "error",
          statusText: "Failed to create CSMInD.",
        });
        setOpenSB(true);
        handleCloseConfirmBox();
      });
  };

  const onReset = () => {
    window.location.reload();
  };

  const onManageRoom = () => {
    history.push('/presentationscheduling/constraintsmanagement');
  };

  const handleCloseSB = (event, reason) => {
    if (reason === "clickaway") {
      return;
    }
    setOpenSB(false);
  };

  const getRowId = (params) => params.id;

  const convertToJson = (headers, data) => {
    const rows = [];
    data.forEach( row => {
      let rowData = {};
      row.forEach( (element, index) => {
        rowData[headers[index]] = element;
      })
      rows.push(rowData);
    });
    
    return rows;
  }

  const getExtension = (file) => {
    const parts = file.name.split(".");
    const extension = parts[parts.length-1];
    return EXTENSIONS.includes(extension);
  }

  const deleteRooms = (i) => {
    let newArr = [...rooms];
    newArr = newArr.filter( (item, index) => index !== i)
    setRooms(newArr);
  }

  const fetchAcademicSessions = async () => {
    await axios
      .get( API_URL + "/api/v1/academic-session/getAll", {
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${token.Token}`,
        },
      })
      .then((response) => {
        var data = response.data;
        setAcademicSessions(data);
      })
      .catch((error) => console.log(error));
  };

  useEffect(() => {
    fetchAcademicSessions();
  }, []);

  useEffect(() => {
    if (academicSessions.length > 0) {
      let current = academicSessions.filter( elt => elt.active === true)[0];
      if (current !== null) {
        setSelectedAcadSession(current);
      }
    }
  }, [academicSessions]);

  const onRetrieve = () => {
    if (selectedAcadSession !== null) {
      fetchProjects();
    }
  }

  const fetchProjects = async () => {
    let formData = new FormData();
    formData.append("courseCode", courseCode);

    await axios
      .put(
        API_URL + `/api/v1/practicumProjects/getAll/academicSessionId=${selectedAcadSession.id}`, formData, 
        {
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
            Authorization: `Bearer ${token.Token}`,
          },
        }
      )
      .then((response) => {
        var data = response.data;
        setProjects(data);
      })
      .catch((error) => {
        console.log(error);
      });
  };

  useEffect(() => {
    if(projects.length > 0) {
      setRetrieve(true);
      const rows = [];
      projects.forEach( (project, index) => {
        let rowData = {
          id: index+1,
          name: project.student !== null ? project.student.name : "",
          title: project.name !== null ? project.name : "",
          supervisor: project.supervisor !== null ? project.supervisor.name : "",
          examiner: project.examiner !== null ? project.examiner.name : "",
          chair: project.chair !== null ? project.chair.name : ""
        };

        rows.push(rowData);
      })
      setRetrievedData(rows);
    }
  }, [projects]);

  const retrievedDataColumns = [
    { headerName: 'Id', field: 'id', flex: 1 },
    { headerName: 'Name', field: 'name', flex: 2, valueGetter: (params) => CapitalizeWord(params.value) },
    { headerName: 'Title', field: 'title', flex: 2, valueGetter: (params) => CapitalizeWord(params.value), },
    { headerName: 'Supervisor', field: 'supervisor', flex: 2, valueGetter: (params) => CapitalizeWord(params.value), },
    { headerName: 'Examiner', field: 'examiner', flex: 2, valueGetter: (params) => CapitalizeWord(params.value), },
    { headerName: 'Chair', field: 'chair', flex: 2, valueGetter: (params) => CapitalizeWord(params.value), },
  ]

  const resetFileInput = () => {
    inputRef.current.value = null;
  };

  const disableWeekends = (date) => {
    return new Date(date).getDay() === 0 || new Date(date).getDay() === 6;
  };

  const disableDatesOutsideRange = (date) => {
    if (startDate === "") {
      return false;
    }

    const start = new Date(startDate);
    const end = new Date(startDate);
    const numOfDayToAdd = start.getDay() === 1 ? 4 : start.getDay() === 2 ? 3 : start.getDay() === 3 ? 2 : start.getDay() === 4 ? 1 : 0
    end.setDate(start.getDate() + numOfDayToAdd);

    return new Date(date) < start || new Date(date) > end;
  };

  return (
    <>
      <div className="main-content-container p-4 container-fluid">
        <h3 style={{ marginBottom: "20px" }}>CSMInD</h3>
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
              Create CSMInD
            </Typography>
          </Stack>
          <Box
            sx={{
              my: 3,
              mx: 4,
            }}
          >
            <InputLabel>Academic Session</InputLabel>
            <FormControl style={{width: '50%'}}>
              <Select
                id="acadSession"
                sx={{
                  marginBottom: "20px",
                }}
                value={selectedAcadSession == null ? "" : selectedAcadSession.id}
                MenuProps={MenuProps}
                onChange={(e) => {
                  let selected = academicSessions.find((element) => {
                    return element.id === e.target.value;
                  })
                  setSelectedAcadSession(selected);
                  setProjects([]);
                  setRetrievedData([]);
                  setData([]);
                  resetFileInput();
                  setRetrieve(false);
                }}
              >
                {
                  academicSessions && academicSessions.map((item) => (
                    <MenuItem key={item.id} value={item.id}>{item.academicSession}, Semester {item.semester.toString()}</MenuItem>
                  ))
                }
              </Select>
            </FormControl>
            <InputLabel>Course Code</InputLabel>
            <TextField
              required
              fullWidth
              id="courseCode"
              type="text"
              placeholder="CDS590"
              value={courseCode == null ? "" : courseCode}
              sx={{ marginBottom: "20px" }}
              onChange={(e) => {
                setCourseCode(e.target.value.toUpperCase());
              }}
            />
            <Divider sx={{ mt: 2, mb: 3 }}/>
            <InputLabel
              sx={{
                fontSize: '20px',
                fontWeight: 'bold',
                color: 'black'
              }}
            >
              Settings
            </InputLabel>
            <FormGroup>
              <FormControlLabel control={<Checkbox checked={checked} onChange={(e) => {
                setChecked(e.target.checked);
                setStartDate("");
                setEndDate("");
              }} />} label="Multiple days" />
            </FormGroup>
            {
              checked ? 
              <div className="row">
                <div className="col-md-3">
                  <InputLabel sx={{ mt: 1 }}>CSMInD Start Date</InputLabel>
                  <LocalizationProvider 
                    dateAdapter={AdapterDayjs}
                  >
                    <DatePicker
                      format="DD-MMM-YYYY" 
                      onChange={(e) => {
                        setStartDate(e.$d);
                      }}
                      shouldDisableDate={disableWeekends}
                      disablePast
                    />
                  </LocalizationProvider>
                </div>
                <div className="col-md-3">
                  <InputLabel sx={{ mt: 1 }}>CSMInD End Date</InputLabel>
                  <LocalizationProvider 
                    dateAdapter={AdapterDayjs}
                  >
                    <DatePicker
                      format="DD-MMM-YYYY" 
                      onChange={(e) => {
                        setEndDate(e.$d);
                      }}
                      shouldDisableDate={startDate === "" ? disableWeekends : disableDatesOutsideRange}
                      disablePast
                    />
                  </LocalizationProvider>
                </div>
              </div> :
              <>
                <InputLabel sx={{ mt: 1 }}>CSMInD Date</InputLabel>
                <div>
                  <LocalizationProvider 
                    dateAdapter={AdapterDayjs}
                  >
                    <DatePicker
                      format="DD-MMM-YYYY" 
                      onChange={(e) => {
                        setStartDate(e.$d);
                      }}
                      shouldDisableDate={disableWeekends}
                      disablePast
                    />
                  </LocalizationProvider>
                </div>
              </>
            }
            <InputLabel sx={{ mt: 2 }}>Period Slot for Timetable</InputLabel>
            <Select
              required
              fullWidth
              value={selected}
              onChange={(e) => {
                setSelected(e.target.value);
              }}
            >
              <MenuItem value={"30-Minute per slot"}>30-Minute per slot</MenuItem>
              <MenuItem value={"40-Minute per slot"}>40-Minute per slot</MenuItem>
              <MenuItem value={"60-Minute per slot"}>60-Minute per slot</MenuItem>
            </Select>
            <InputLabel sx={{ mt: 2 }}>Venue Name</InputLabel>
            <TextField
              fullWidth
              id="room"
              type="text"
              value={room == null ? "" : room}
              onChange={(e) => {
                setRoom(e.target.value);
              }}
              InputProps={{
                endAdornment: 
                  <Button
                    variant="contained"
                    onClick={() => {
                      if(room !== "") {
                        setRooms(prevArray => [...prevArray, room]);
                        setRoom("");
                      }
                    }}
                  >
                    Add
                  </Button>
              }}
            />
            {
              rooms.length > 0 ? 
              <>
                <InputLabel sx={{ mt: 2, fontWeight: 'bold' }}>Venue List</InputLabel>
                <List sx={{ pt: 0, pb: 0}}>
                  {
                    rooms.map( (item, index) => (
                      <ListItem disablePadding>
                        <ListItemIcon>
                          <IconButton
                            onClick={() => {
                              deleteRooms(index);
                            }}
                          >
                            <DeleteOutlinedIcon sx={{ fontSize: "20px", color: 'red' }}/>
                          </IconButton>
                        </ListItemIcon>
                        <ListItemText primary={item} />
                      </ListItem>
                    ))
                  }
                </List>
              </>  : <></>
            }
            <Divider sx={{ mt: 4, mb: 3 }}/>
            <Stack direction="row" alignItems="center">
              <InputLabel
                sx={{
                  fontSize: '20px',
                  fontWeight: 'bold',
                  color: 'black'
                }}
              >
                Import Presentation Details
              </InputLabel>
              <Tooltip title="Retrieve from projects">
                <IconButton
                  color="primary"
                  sx={{ marginLeft: "10px" }}
                  onClick={onRetrieve}
                  disabled={data.length>0}
                >
                  <SyncAltRoundedIcon sx={{ fontSize: "30px" }} />
                </IconButton>
              </Tooltip>
            </Stack>
            <input ref={inputRef} type="file" id="presentationFile" name="filename" style={{ width: '100%', marginTop: '10px', marginBottom: '10px' }} disabled={retrieve}
              onChange={(e) => {
                const file = e.target.files[0];
                const reader = new FileReader();
                reader.onload = (event) => {
                  //parse data
                  const bstr = event.target.result;
                  const workBook =  XLSX.read(bstr, {type:"binary"});
                  
                  //get first sheet
                  const workSheetName = workBook.SheetNames[0];
                  const workSheet = workBook.Sheets[workSheetName];

                  //convert to array
                  const fileData = XLSX.utils.sheet_to_json(workSheet, {header:1});
                  const headers = fileData[0];
                  const heads = headers.map( (head, index) => ({
                    headerName: CapitalizeWord(head),
                    field: head,
                    flex: index < 2 ? 1 : 2
                  }))
                  setColDefs(heads);
                  fileData.splice(0,1);
                  setData(convertToJson(headers, fileData));
                }
                if(file) {
                  if(getExtension(file)) {
                    reader.readAsBinaryString(file)
                  }
                  else {
                    alert("Invalid file input, Select Excel or CSV file")
                  }
                }
              }}
            />
            {
              ( data.length > 0 || retrievedData.length > 0 ) ? 
              <DataGrid
                pageSize={pageSize}
                onPageSizeChange={(newPageSize) => setPageSize(newPageSize)}
                getRowHeight={() => "auto"}
                autoHeight={true}
                getRowId={getRowId}
                rows={ retrieve ? retrievedData : data }
                columns={ retrieve ? retrievedDataColumns : colDefs }
                rowsPerPageOptions={[10, 50, 100]}
                disableColumnMenu={true}
                disableSelectionOnClick
                components={{ Toolbar: CustomToolbar }}
                componentsProps={{
                  panel: {
                    placement: "top",
                  },
                }}
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
              /> : <></>
            }
            <Button
              variant="contained"
              sx={{ mt: 3, mb: 2 }}
              onClick={() => {
                // Check lecturer assignment
                let missingAssign = false;
                if (retrievedData.length > 0) {
                  retrievedData.forEach( (item) => {
                    if (item.name === "" || item.supervisor === "" || item.examiner === "" || item.chair === "") {
                      missingAssign = true;
                    }
                  })
                }
                else if (data.length > 0) {
                  data.forEach( (item) => {
                    if (item.name === "" || item.supervisor === "" || item.examiner === "" || item.chair === "") {
                      missingAssign = true;
                    }
                  })
                }
                else {
                  missingAssign = false;
                }

                if (
                  selectedAcadSession === null ||
                  courseCode === "" ||
                  startDate === "" ||
                  (checked && endDate === "") ||
                  selected === "" ||
                  rooms.length === 0 || 
                  (retrieve ? retrievedData.length === 0 : data.length === 0) ||
                  missingAssign ||
                  disableDatesOutsideRange(endDate)
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
            <Button
              disabled={message.status === "success" ? false : true}
              variant="contained"
              sx={{ mt: 3, mb: 2 }}
              color="success"
              onClick={onManageRoom}
            >
              Manage Room Unavailability
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
            Are you sure to create this CSMInD?
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