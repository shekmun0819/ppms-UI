import { Alert, Box, Button, CircularProgress, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, IconButton, Snackbar, Stack, Tab, Typography } from "@mui/material";
import { React, useState, useEffect } from "react";
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";
import { useHistory } from "react-router-dom";
import { DataGrid, gridClasses } from "@mui/x-data-grid";
import axios from "axios";
import moment from "moment";
import ModeEditOutlinedIcon from '@mui/icons-material/ModeEditOutlined';
import DeleteOutlinedIcon from '@mui/icons-material/DeleteOutlined';
import { useCookies } from "react-cookie";
import jwt_decode from "jwt-decode";
import CapitalizeWord from '../../utils/CapitalizeWord';
import { API_URL } from "../../config";

function UserConstraint() {

  let history = useHistory();
  const [token, setToken] = useCookies();

  const [userId, setUserId] = useState(0);
  const [constraints, setConstraints] = useState([]);
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

  const getRowId = (params) => params.id;

  const columns = [
    { field: "user", headerName: "Name", description: "Name", flex: 3,
      renderCell: (cellValues) => {
        return <span style={{overflow: 'hidden'}}>{ CapitalizeWord(cellValues.row.user.name) }</span>;
      },
    },
    { field: "csmind", headerName: "CSMInD Date", description: "CSMInD Date", flex: 2, headerAlign: "center", align: "center",
      renderCell: (cellValues) => {
        return <span style={{overflow: 'hidden'}}>{moment(cellValues.row.csmind.startDate).format("DD-MMM-YYYY")}</span>;
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
              disabled={cellValues.row.csmind.schedule !== null ? true : false }
            >
              <DeleteOutlinedIcon sx={{ fontSize: "20px", color: cellValues.row.csmind.schedule !== null ? 'grey' : 'red' }}/>
            </IconButton>
          </>
        );
      },
    },
  ];

  const fetchUserConstraints = async () => {
    setLoading(true);
    await axios
      .get( API_URL + "/api/v1/constraint/getUserConstraints/" + userId, {
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${token.Token}`,
        },
      })
      .then((response) => {
        var data = response.data;
        setConstraints(data);
        setLoading(false);
      })
      .catch((error) => {
        console.log(error)
        setLoading(false);
      });
  };

  useEffect(() => {
    if (userId !== 0)
      fetchUserConstraints();
  }, [userId]);

  useEffect(() => {
    if(token['Token']) {
      const decoded = jwt_decode(token['Token']);
      setUserId(decoded.userInfo.id);
    }
  }, [token]);

  const onCreate = () => {
    history.push("/createmyconstraint");
  };

  const onEdit = (constraint) => {
    history.push(`/editmyconstraint/${constraint.id}`);
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
        fetchUserConstraints();
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

  return (
    <>
      <div className="main-content-container p-4 container-fluid">
        <h3 style={{ marginBottom: "20px" }}>My Constraint</h3>
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
          {
            isLoading ? 
            (
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
              rows={constraints}
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
            Are you sure to delete this constraint?
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

export default UserConstraint;
