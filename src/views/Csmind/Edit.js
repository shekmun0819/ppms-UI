import { React, useState, useEffect } from "react";
import IconButton from "@mui/material/IconButton";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import Box from "@mui/material/Box";
import TextField from "@mui/material/TextField";
import { useHistory } from "react-router-dom";
import ArrowBackIosNewIcon from "@mui/icons-material/ArrowBackIosNew";
import InputLabel from "@mui/material/InputLabel";
import axios from "axios";
import Snackbar from "@mui/material/Snackbar";
import Alert from "@mui/material/Alert";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogTitle from "@mui/material/DialogTitle";
import Stack from "@mui/material/Stack";
import { useCookies } from "react-cookie";
import { DatePicker, LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import Divider from "@mui/material/Divider";
import dayjs from "dayjs";
import {
  DataGrid,
  gridClasses,
  GridToolbarContainer,
  GridToolbarFilterButton,
} from "@mui/x-data-grid";
import ModeEditOutlinedIcon from "@mui/icons-material/ModeEditOutlined";
import FormControlLabel from "@mui/material/FormControlLabel";
import Checkbox from "@mui/material/Checkbox";
import FormGroup from "@mui/material/FormGroup";
import MenuItem from "@mui/material/MenuItem";
import Select from "@mui/material/Select";
import FormControl from "@mui/material/FormControl";
import CircularProgress from "@mui/material/CircularProgress";
import { List, ListItem, ListItemIcon, ListItemText } from "@mui/material";
import DeleteOutlinedIcon from "@mui/icons-material/DeleteOutlined";
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

function CustomToolbar() {
  return (
    <GridToolbarContainer sx={{ margin: "0 5px 5px 0" }}>
      <GridToolbarFilterButton sx={{ fontSize: "16px", color: "black" }} />
    </GridToolbarContainer>
  );
}

function Edit(props) {
  let history = useHistory();
  const [token, setToken] = useCookies();
  const [isLoading, setLoading] = useState(true);

  //edit presentation
  const [userSelection, setUserSelection] = useState();

  //edit room
  const [rooms, setRooms] = useState([]);
  const [room, setRoom] = useState("");

  const [pageSize, setPageSize] = useState(10);
  const [presentations, setPresentations] = useState([]);
  const [students, setStudents] = useState([]);

  const [id, setId] = useState();
  const [acadSession, setAcadSession] = useState(null);
  const [courseCode, setCourseCode] = useState("");
  const [checked, setChecked] = useState(false);
  const [startDate, setStartDate] = useState(dayjs(Date.now()));
  const [endDate, setEndDate] = useState(dayjs(Date.now()));
  const [selected, setSelected] = useState("");
  const [totalPres, setTotalPres] = useState(43);
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
  const [openRowDetails, setOpenRowDetails] = useState(false);

  const handleOpenConfirmBox = () => {
    setOpenConfirmBox(true);
  };
  const handleCloseConfirmBox = () => {
    setOpenConfirmBox(false);
  };

  const onBack = () => {
    history.goBack();
  };

  const onManageRoom = () => {
    history.push('/presentationscheduling/constraintsmanagement');
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
        setId(response.data.id);
        setAcadSession(response.data.academicSession);
        setCourseCode(response.data.courseCode);
        setStartDate(dayjs(new Date(response.data.startDate)));
        if (response.data.endDate !== response.data.startDate) {
          setEndDate(dayjs(new Date(response.data.endDate)));
          setChecked(true);
        }
        setSelected(response.data.periodSlot);
        setTotalPres(response.data.numOfPresentations);
      })
      .catch((error) => console.log(error));
  };

  const onEdit = async () => {
    let data = new FormData();
    data.append("id", id);
    data.append("courseCode", courseCode);
    data.append("academicSession", acadSession.id);
    data.append("startDate", startDate.toJSON());

    if (checked === false) {
      data.append("endDate", startDate.toJSON());
    } else {
      data.append("endDate", endDate.toJSON());
    }

    data.append("periodSlot", selected);
    data.append("numOfPresentations", presentations.length);
    data.append("rooms", JSON.stringify(rooms));

    await axios
      .put( API_URL + "/api/v1/csmind/update", data, {
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          Authorization: `Bearer ${token.Token}`,
        },
      })
      .then((response) => {
        setMessage({
          status: "success",
          statusText: "CSMInD is successfully updated.",
        });
        setOpenSB(true);
        handleCloseConfirmBox();
      })
      .catch((error) => {
        console.log(error);
        setMessage({
          status: "error",
          statusText: "Failed to update CSMInD.",
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
    fetchCsmind();
    fetchUserSelection();
  }, []);

  const getRowId = (params) => params.id;

  const columns = [
    { field: "presIdentity", headerName: "#", description: "#", flex: 1, headerAlign: "center", align: "center" },
    {
      field: "date",
      headerName: "Matric No.",
      description: "Matric No.",
      flex: 2,
      headerAlign: "center", 
      align: "center",
      renderCell: (cellValues) => {
        return (
          <span style={{ overflow: "hidden" }}>
            { students.find( (s) => s.user.id === cellValues.row.student.id).matricNum }
          </span>
        );
      },
    },
    {
      field: "student",
      headerName: "Student",
      description: "Student Name",
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
      description: "Supervisor Name",
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
      description: "Examiner Name",
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
      description: "Chair Name",
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
      field: "action",
      headerName: "Actions",
      description: "Actions",
      flex: 1,
      sortable: false,
      renderCell: (cellValues) => {
        return (
          <IconButton
            onClick={() => {
              onRowClick(cellValues.row);
            }}
          >
            <ModeEditOutlinedIcon sx={{ fontSize: "20px" }} />
          </IconButton>
        );
      },
    },
  ];

  const fetchPresentations = async () => {
    setLoading(true);
    await axios
      .get( API_URL + "/api/v1/presentation/" + id, {
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${token.Token}`,
        },
      })
      .then((response) => {
        var data = response.data;
        setPresentations(data.presentations);
        setStudents(data.students);
        setLoading(false);
      })
      .catch((error) => console.log(error));
  };

  const fetchRooms = async () => {
    await axios
      .get( API_URL + "/api/v1/venue/" + id, {
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${token.Token}`,
        },
      })
      .then((response) => {
        var data = response.data;
        setRooms(data);
      })
      .catch((error) => console.log(error));
  };

  useEffect(() => {
    fetchPresentations();
    fetchRooms();
  }, [id]);

  const onRowUpdate = async () => {
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
        setOpenRowDetails(false);
        fetchPresentations();
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

  const onRowClick = (presentation) => {
    setOpenRowDetails(true);
    setSelectedPres({
      id: presentation.id,
      title: presentation.title,
      student: presentation.student.id,
      supervisor: presentation.supervisor.id,
      examiner: presentation.examinerOne.id,
      chair: presentation.examinerTwo.id,
    });
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

  const onAdd = async () => {
    let data = new FormData();
    data.append("csmindId", id);
    data.append("room", room);

    await axios
      .post( API_URL + "/api/v1/venue/add", data, {
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          Authorization: `Bearer ${token.Token}`,
        },
      })
      .then((response) => {
        setMessage({
          status: "success",
          statusText: "Venue is successfully added.",
        });
        setOpenSB(true);
        handleCloseConfirmBox();
        setRoom("");
        fetchRooms();
      })
      .catch((error) => {
        console.log(error);
        setMessage({
          status: "error",
          statusText: "Failed to add venue.",
        });
        setOpenSB(true);
        handleCloseConfirmBox();
      });
  };

  const onDelete = async (id) => {
    await axios
      .delete( API_URL + "/api/v1/venue/" + id, {
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          Authorization: `Bearer ${token.Token}`,
        },
      })
      .then((response) => {
        setMessage({
          status: "success",
          statusText: "Venue is successfully deleted.",
        });
        setOpenSB(true);
        handleCloseConfirmBox();
        fetchRooms();
      })
      .catch((error) => {
        console.log(error);
        setMessage({
          status: "error",
          statusText: "Failed to delete venue.",
        });
        setOpenSB(true);
        handleCloseConfirmBox();
      });
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
              sx={{ color: "black", paddingLeft: "0" }}
              onClick={onBack}
            >
              <ArrowBackIosNewIcon sx={{ fontSize: "25px" }} />
            </IconButton>
            <Typography variant="h5" sx={{ fontWeight: "bold" }}>
              Edit CSMInD
            </Typography>
          </Stack>
          <Box
            sx={{
              my: 3,
              mx: 4,
            }}
          >
            <InputLabel>Academic Session</InputLabel>
            <TextField
              disabled
              required
              fullWidth
              id="acadSession"
              type="text"
              placeholder="2022/2023"
              value={acadSession == null ? "" : `${acadSession.academicSession}, Semester ${acadSession.semester.toString()}`}
              autoFocus
              sx={{ marginBottom: "20px" }}
            />
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
            <Divider sx={{ mt: 2, mb: 3 }} />
            <InputLabel
              sx={{
                fontSize: "20px",
                fontWeight: "bold",
                color: "black",
              }}
            >
              Settings
            </InputLabel>
            {/* <FormGroup>
              <FormControlLabel control={<Checkbox checked={checked} onChange={(e) => {
                setChecked(e.target.checked);
              }} />} label="Multiple days" />
            </FormGroup> */}
            {checked ? (
              <div className="row">
                <div className="col-md-3">
                  <InputLabel sx={{ mt: 1 }}>CSMInD Start Date</InputLabel>
                  <LocalizationProvider dateAdapter={AdapterDayjs}>
                    <DatePicker
                      disabled
                      value={startDate}
                      format="DD-MMM-YYYY"
                      onChange={(e) => {
                        setStartDate(dayjs(new Date(e.$d)));
                      }}
                    />
                  </LocalizationProvider>
                </div>
                <div className="col-md-3">
                  <InputLabel sx={{ mt: 1 }}>CSMInD End Date</InputLabel>
                  <LocalizationProvider dateAdapter={AdapterDayjs}>
                    <DatePicker
                      disabled
                      value={endDate}
                      format="DD-MMM-YYYY"
                      onChange={(e) => {
                        setEndDate(dayjs(new Date(e.$d)));
                      }}
                    />
                  </LocalizationProvider>
                </div>
              </div>
            ) : (
              <>
                <InputLabel sx={{ mt: 1 }}>CSMInD Date</InputLabel>
                <div>
                  <LocalizationProvider dateAdapter={AdapterDayjs}>
                    <DatePicker
                      disabled
                      value={startDate}
                      format="DD-MMM-YYYY"
                      onChange={(e) => {
                        setStartDate(dayjs(new Date(e.$d)));
                      }}
                    />
                  </LocalizationProvider>
                </div>
              </>
            )}
            <InputLabel sx={{ mt: 2 }}>Period Slot for Timetable</InputLabel>
            <Select
              disabled
              fullWidth
              value={selected}
              onChange={(e) => {
                setSelected(e.target.value);
              }}
            >
              <MenuItem value={"30-Minute per slot"}>
                30-Minute per slot
              </MenuItem>
              <MenuItem value={"40-Minute per slot"}>
                40-Minute per slot
              </MenuItem>
              <MenuItem value={"60-Minute per slot"}>
                60-Minute per slot
              </MenuItem>
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
                endAdornment: (
                  <Button
                    variant="contained"
                    onClick={() => {
                      if (room !== "") {
                        onAdd();
                      }
                    }}
                  >
                    Add
                  </Button>
                ),
              }}
            />
            {rooms.length > 0 ? (
              <>
                <InputLabel sx={{ mt: 2, fontWeight: "bold" }}>
                  Venue List
                </InputLabel>
                <List sx={{ pt: 0, pb: 0 }}>
                  {rooms.map((item, index) => (
                    <ListItem disablePadding key={index}>
                      <ListItemIcon>
                        <IconButton
                          onClick={() => {
                            onDelete(item.id);
                          }}
                        >
                          <DeleteOutlinedIcon
                            sx={{ fontSize: "20px", color: "red" }}
                          />
                        </IconButton>
                      </ListItemIcon>
                      <ListItemText primary={item.name} />
                    </ListItem>
                  ))}
                </List>
              </>
            ) : (
              <></>
            )}
            <Divider sx={{ mt: 4, mb: 3 }} />
            <InputLabel
              sx={{
                fontSize: "20px",
                fontWeight: "bold",
                color: "black",
              }}
            >
              Presentation Details
            </InputLabel>
            {isLoading ? (
              <div style={{ textAlign: "center" }}>
                <CircularProgress />
              </div>
            ) : (
              <DataGrid
                pageSize={pageSize}
                onPageSizeChange={(newPageSize) => setPageSize(newPageSize)}
                getRowHeight={() => "auto"}
                autoHeight={true}
                getRowId={getRowId}
                rows={presentations}
                columns={columns}
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
              />
            )}
            <Button
              variant="contained"
              sx={{ mt: 3, mb: 2 }}
              onClick={() => {
                if (
                  acadSession === null ||
                  courseCode === "" ||
                  startDate === "" ||
                  (checked && endDate === "") ||
                  selected === "" ||
                  rooms.length === 0
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
            <Button
              variant="contained"
              sx={{ mt: 3, mb: 2, mx: 2 }}
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
            Are you sure to update this CSMInD?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseConfirmBox}>No</Button>
          <Button onClick={onEdit} autoFocus>
            Yes
          </Button>
        </DialogActions>
      </Dialog>
      {userSelection && selectedPres ? (
        <Dialog
          fullWidth
          sx={{ mt: 5 }}
          open={openRowDetails}
          onClose={() => {
            setOpenRowDetails(false);
          }}
        >
          <DialogContent>
            <Typography variant="h5" sx={{ fontWeight: "bold", mb: 2 }}>
              Edit Presentation
            </Typography>
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
                {userSelection && userSelection.lecturer.map((item) => (
                  <MenuItem key={item.userId} value={item.userId}>
                    { CapitalizeWord(item.fullname) }
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </DialogContent>
          <DialogActions>
            <Button
              onClick={() => {
                setOpenRowDetails(false);
              }}
            >
              Close
            </Button>
            <Button onClick={onRowUpdate} autoFocus>
              Update
            </Button>
          </DialogActions>
        </Dialog>
      ) : (
        <></>
      )}
    </>
  );
}

export default Edit;
