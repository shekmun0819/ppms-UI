import { Alert, Box, Button, CircularProgress, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, IconButton, Snackbar, Stack, Tab, Typography } from "@mui/material";
import { React, useState, useEffect } from "react";
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";
import { useHistory } from "react-router-dom";
import { TabContext, TabList, TabPanel } from "@mui/lab";
import { DataGrid, gridClasses } from "@mui/x-data-grid";
import axios from "axios";
import moment from "moment";
import ModeEditOutlinedIcon from '@mui/icons-material/ModeEditOutlined';
import DeleteOutlinedIcon from '@mui/icons-material/DeleteOutlined';
import { useCookies } from "react-cookie";
import CapitalizeWord from '../../utils/CapitalizeWord';
import { API_URL } from "../../config";

function ConstraintsManagement() {

  let history = useHistory();
  const [token, setToken] = useCookies();

  const [lectConstraints, setLectConstraints] = useState([]);
  const [stuConstraints, setStuConstraints] = useState([]);
  const [roomConstraints, setRoomConstraints] = useState([]);
  const [pageSize, setPageSize] = useState(10);
  const [isLoading, setLoading] = useState(false);
  const [selectedDelete, setSelectedDelete] = useState(0);

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

  const [value, setValue] = useState('1');
  const handleChange = (event, newValue) => {
    setValue(newValue);
  };

  const getRowId = (params) => params.id;

  const columns = [
    { field: "csmind", headerName: "CSMInD Date", description: "CSMInD Date", flex: 2,
      renderCell: (cellValues) => {
        return <span style={{overflow: 'hidden'}}>{moment(cellValues.row.csmind.startDate).format("DD-MMM-YYYY")}</span>;
      },
    },
    { field: "user", headerName: "Name", description: "Name", flex: 3,
      renderCell: (cellValues) => {
        return <span style={{overflow: 'hidden'}}>{ CapitalizeWord(cellValues.row.user.name) }</span>;
      },
    },
    {
      field: "createdAt",
      headerName: "Created At",
      description: "Created At",
      flex: 2,
      headerAlign: "center",
      align: "center",
      renderCell: (cellValues) => {
        var updatedAt = moment(cellValues.value).format("DD-MMM-YYYY, hh:mm a");
        return <span>{updatedAt}</span>;
      },
    },
    {
      field: "updatedAt",
      headerName: "Updated At",
      description: "Updated At",
      flex: 2,
      headerAlign: "center",
      align: "center",
      renderCell: (cellValues) => {
        var createdAt = moment(cellValues.value).format("DD-MMM-YYYY, hh:mm a");
        return <span>{createdAt}</span>;
      },
    },
    {
      field: "action",
      headerName: "Actions",
      description: "Actions",
      flex: 1,
      headerAlign: "center",
      align: "center",
      sortable: false,
      renderCell: (cellValues) => {
        return (
          <>
            <IconButton
              onClick={() => {
                onEdit(cellValues.row);
              }}
            >
              <ModeEditOutlinedIcon sx={{ fontSize: "20px" }} />
            </IconButton>
            <IconButton
              onClick={() => {
                setSelectedDelete(cellValues.row.id);
                handleOpenConfirmBox();
              }}
            >
              <DeleteOutlinedIcon sx={{ fontSize: "20px", color: 'red' }}/>
            </IconButton>
          </>
        );
      },
    },
  ];

  const fetchConstraints = async () => {
    setLoading(true);
    await axios
      .get( API_URL + "/api/v1/constraint/getAll", {
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${token.Token}`,
        },
      })
      .then((response) => {
        var data = response.data;
        setLectConstraints(data.lecturer);
        setStuConstraints(data.student);
        setLoading(false);
      })
      .catch((error) => {
        console.log(error)
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchConstraints();
    fetchRooms();
  }, []);

  const onCreate = () => {
    history.push("/createconstraint");
  };

  const onEdit = (constraint) => {
    history.push(`/editconstraint/${constraint.id}`);
  };

  const onDelete = async () => {
    await axios
      .delete( API_URL + "/api/v1/constraint/" + selectedDelete, {
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          Authorization: `Bearer ${token.Token}`,
        },
      })
      .then((response) => {
        setMessage({
          status: "success",
          statusText: "Constraint is successfully deleted.",
        });
        setOpenSB(true);
        handleCloseConfirmBox();
        fetchConstraints();
      })
      .catch((error) => {
        console.log(error);
        setMessage({
          status: "error",
          statusText: "Failed to delete constraint.",
        });
        setOpenSB(true);
        handleCloseConfirmBox();
      });
  };

  const roomColumns = [
    { field: "csmind", headerName: "CSMInD Date", description: "CSMInD Date", flex: 2,
      renderCell: (cellValues) => {
        return <span style={{overflow: 'hidden'}}>{moment(cellValues.row.csmind.startDate).format("DD-MMM-YYYY")}</span>;
      },
    },
    { field: "name", headerName: "Room", description: "Room", flex: 2,
      renderCell: (cellValues) => {
        return <span style={{color: `${cellValues.row.unavailableTime !== null ? "" : "darkgrey"}`}}>{cellValues.value}</span>
      },
    },
    {
      field: "createdAt",
      headerName: "Created At",
      description: "Created At",
      flex: 2,
      headerAlign: "center",
      align: "center",
      renderCell: (cellValues) => {
        var updatedAt = moment(cellValues.value).format("DD-MMM-YYYY, hh:mm a");
        return <span>{updatedAt}</span>;
      },
    },
    {
      field: "updatedAt",
      headerName: "Updated At",
      description: "Updated At",
      flex: 2,
      headerAlign: "center",
      align: "center",
      renderCell: (cellValues) => {
        var createdAt = moment(cellValues.value).format("DD-MMM-YYYY, hh:mm a");
        return <span>{createdAt}</span>;
      },
    },
    {
      field: "action",
      headerName: "Actions",
      description: "Actions",
      flex: 1,
      headerAlign: "center",
      align: "center",
      sortable: false,
      renderCell: (cellValues) => {
        return (
          <>
            <IconButton
              onClick={() => {
                onEditVenue(cellValues.row);
              }}
            >
              <ModeEditOutlinedIcon sx={{ fontSize: "20px" }} />
            </IconButton>
            <IconButton
              onClick={() => {
                setSelectedDelete(cellValues.row.id);
                handleOpenConfirmBox();
              }}
            >
              <DeleteOutlinedIcon sx={{ fontSize: "20px", color: 'red' }}/>
            </IconButton>
          </>
        );
      },
    },
  ];

  const fetchRooms = async () => {
    setLoading(true);
    await axios
      .get( API_URL + "/api/v1/venue/getAll", {
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${token.Token}`,
        },
      })
      .then((response) => {
        var data = response.data;
        setRoomConstraints(data);
        setLoading(false);
      })
      .catch((error) => {
        console.log(error)
        setLoading(false);
      });
  };

  const onEditVenue = (venue) => {
    history.push(`/editvenue/${venue.id}`);
  };

  const onDeleteVenue = async () => {
    await axios
      .delete( API_URL + "/api/v1/venue/" + selectedDelete, {
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
        <h3 style={{ marginBottom: "20px" }}>Constraints Management</h3>
        <div
          style={{
            backgroundColor: "white",
            padding: "20px",
            borderRadius: "5px",
          }}
        >
          <Stack direction="row" alignItems="center" gap={1}>
            <Typography
              variant="h5"
              sx={{ fontWeight: "bold", paddingLeft: "5px" }}
            >
              List of Constraints
            </Typography>
            <IconButton
              color="primary"
              sx={{ marginLeft: "10px" }}
              onClick={onCreate}
            >
              <AddCircleOutlineIcon sx={{ fontSize: "30px" }} />
            </IconButton>
          </Stack>
          <TabContext value={value}>
            <Box sx={{ borderColor: 'divider' }}>
              <TabList onChange={handleChange}>
                <Tab label="Room" value="1" />
                <Tab label="Lecturer" value="2" />
                <Tab label="Student" value="3" />
              </TabList>
            </Box>
            <TabPanel value="1">
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
                  rows={roomConstraints}
                  columns={roomColumns}
                  rowsPerPageOptions={[10, 50, 100]}
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
            </TabPanel>
            <TabPanel value="2">
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
                  rows={lectConstraints}
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
              )}
            </TabPanel>
            <TabPanel value="3">
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
                  rows={stuConstraints}
                  columns={columns}
                  rowsPerPageOptions={[10, 50, 100]}
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
            </TabPanel>
          </TabContext>
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
            Are you sure to delete this {value === "1" ? "room" : "constraint"}?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseConfirmBox}>No</Button>
          <Button autoFocus 
            onClick={() => {
              if(value === "1")
                onDeleteVenue();
              else
                onDelete();
            }}
          >
            Yes
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}

export default ConstraintsManagement;
