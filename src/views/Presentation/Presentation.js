import { React, useState, useEffect } from "react";
import { IconButton, Typography, CircularProgress, Stack, Snackbar, Alert, Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions, Button } from "@mui/material";
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";
import ModeEditOutlinedIcon from "@mui/icons-material/ModeEditOutlined";
import DeleteOutlinedIcon from '@mui/icons-material/DeleteOutlined';
import { useHistory } from "react-router-dom";
import { useCookies } from "react-cookie";
import axios from "axios";
import moment from "moment";
import { DataGrid, gridClasses } from "@mui/x-data-grid";
import CapitalizeWord from "../../utils/CapitalizeWord";
import { API_URL } from "../../config";

function Presentation() {
  let history = useHistory();
  const [token, setToken] = useCookies();
  const [isLoading, setLoading] = useState(false);

  const [pageSize, setPageSize] = useState(10);
  const [presentations, setPresentations] = useState([]);
  const [students, setStudents] = useState([]);
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

  const getRowId = (params) => params.id;

  const columns = [
    //{ field: "presIdentity", headerName: "#", description: "#", flex: 1, headerAlign: "center", align: "center" },
    {
      field: "csmind",
      headerName: "CSMInD Date",
      description: "CSMInD Start Date",
      headerAlign: "center", 
      align: "center",
      flex: 2,
      renderCell: (cellValues) => {
        return (
          <span style={{ overflow: "hidden" }}>
            {moment(cellValues.value.startDate).format("DD-MMM-YYYY")}
          </span>
        );
      },
    },
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
    { field: "title", headerName: "Title", description: "Title", flex: 4,
      renderCell: (cellValues) => {
        return (
          <span style={{ overflow: "hidden" }}>
            { CapitalizeWord(cellValues.value) }
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

  const fetchPresentations = async () => {
    setLoading(true);
    await axios
      .get( API_URL + "/api/v1/presentation/getAll", {
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
      .catch((error) => {
        console.log(error)
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchPresentations();
  }, []);

  const onCreate = () => {
    history.push("/createpresentation");
  };

  const onEdit = (presentation) => {
    history.push(`/editpresentation/${presentation.id}`);
  };

  const onDelete = async () => {
    await axios
      .delete( API_URL + "/api/v1/presentation/" + selectedDelete, {
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          Authorization: `Bearer ${token.Token}`,
        },
      })
      .then((response) => {
        setMessage({
          status: "success",
          statusText: "Presentation is successfully deleted.",
        });
        setOpenSB(true);
        handleCloseConfirmBox();
        fetchPresentations();
      })
      .catch((error) => {
        console.log(error);
        setMessage({
          status: "error",
          statusText: "Failed to delete presentation.",
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
          <Stack direction="row" alignItems="center" gap={1}>
            <Typography
              variant="h5"
              sx={{ fontWeight: "bold", paddingLeft: "5px" }}
            >
              List of Presentation
            </Typography>
            <IconButton
              color="primary"
              sx={{ marginLeft: "10px" }}
              onClick={onCreate}
            >
              <AddCircleOutlineIcon sx={{ fontSize: "30px" }} />
            </IconButton>
          </Stack>
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
            Are you sure to delete this presentation?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseConfirmBox}>No</Button>
          <Button autoFocus 
            onClick={onDelete}
          >
            Yes
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}

export default Presentation;