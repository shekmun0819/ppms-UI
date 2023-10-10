import { React, useState, useEffect } from "react";
import { IconButton, Typography, CircularProgress } from "@mui/material";
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";
import ModeEditOutlinedIcon from "@mui/icons-material/ModeEditOutlined";
import LockResetIcon from '@mui/icons-material/LockReset';
import axios from "axios";
import moment from "moment";
import Stack from "@mui/material/Stack";
import { useHistory } from "react-router-dom";
import {
  DataGrid,
  gridClasses,
  GridToolbarContainer,
  GridToolbarFilterButton,
} from "@mui/x-data-grid";
import Chip from "@mui/material/Chip";
import { useCookies } from "react-cookie";
import * as XLSX from 'xlsx';
import Button from "@mui/material/Button";
import Snackbar from "@mui/material/Snackbar";
import Alert from "@mui/material/Alert";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogTitle from "@mui/material/DialogTitle";
import Divider from '@mui/material/Divider';
import CapitalizeWord from '../../utils/CapitalizeWord';
import { API_URL } from "../../config";

const EXTENSIONS = ['xlsx', 'xls', 'csv']

function CustomToolbar() {
  return (
    <GridToolbarContainer sx={{ margin: "0 5px 5px 0" }}>
      <GridToolbarFilterButton sx={{ fontSize: "16px", color: "black" }} />
    </GridToolbarContainer>
  );
}

function UserManagement() {
  let history = useHistory();
  const [users, setUsers] = useState([]);
  const [pageSize, setPageSize] = useState(10);
  const [isLoading, setLoading] = useState(true);
  const [token, setToken] = useCookies();

  const [selectionModel, setSelectionModel] = useState([]);
  const [activationBtn, setActivationBtn] = useState(false);
  const [reset, setReset] = useState(false);
  const [activateClick, setActivateClick] = useState(false);
  const [deactivateClick, setDeactivateClick] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState(0);

  const [message, setMessage] = useState({
    status: "info",
    statusText: "",
  });

  const [openSB, setOpenSB] = useState(false);
  const [openConfirmBox, setOpenConfirmBox] = useState(false);
  const handleOpenConfirmBox = () => {
    setReset(false);
    setActivateClick(false);
    setDeactivateClick(false);
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

  //for user import
  const [colDefs, setColDefs] = useState();
  const [data, setData] = useState([]);
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

  const getRowId = (params) => params.id;

  const columns = [
    { field: "name", headerName: "Full Name", description: "Full Name", flex: 3,
      renderCell: (cellValues) => {
        return (
          <span style={{ overflow: "hidden" }}>
            { CapitalizeWord(cellValues.value) }
          </span>
        );
      },
    },
    { field: "email", headerName: "Email", description: "Email", flex: 3 },
    {
      field: "roles",
      headerName: "Role(s)",
      description: "Role(s)",
      flex: 2,
      headerAlign: "center",
      align: "center",
      renderCell: (cellValues) => {
        var roles = cellValues.value.split(",");
        roles = roles.sort();
        return (
          <div className="d-flex flex-column" style={{ marginTop: "5px" }}>
            {roles.map((role) => (
              <Chip
                key={role}
                label={role}
                sx={{ marginRight: "5px", marginBottom: "5px" }}
              />
            ))}
          </div>
        );
      },
    },
    {
      field: "active",
      headerName: "Status",
      description: "Status",
      headerAlign: "center",
      align: "center",
      flex: 2,
      renderCell: (cellValues) => {
        return cellValues.value === true ? (
          <div className="active-status">
            <span>Active</span>
          </div>
        ) : (
          <div className="inactive-status">
            <span>Inactive</span>
          </div>
        );
      },
    },
    {
      field: "action",
      headerName: "Actions",
      description: "Actions",
      flex: 2,
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
                handleOpenConfirmBox();
                setSelectedUserId(cellValues.row.id);
                setReset(true);
              }}
            >
              <LockResetIcon sx={{ fontSize: "28px" }}/>
            </IconButton>
          </>
        );
      },
    },
  ];

  const fetchUsers = async () => {
    setLoading(true);
    await axios
      .get( API_URL + "/api/v1/user/getAll", {
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${token.Token}`,
        },
      })
      .then((response) => {
        var data = response.data;
        setUsers(data);
        setLoading(false);
      })
      .catch((error) => {
        console.log(error)
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const onCreate = () => {
    history.push("/createuser");
  };

  const onEdit = (user) => {
    history.push(`/edituser/${user.id}`);
  };

  const onImport = async () => {
    handleCloseConfirmBox();
    
    await axios
      .post( API_URL + "/api/v1/user/import", data, {
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          Authorization: `Bearer ${token.Token}`,
        },
      })
      .then((response) => {
        setMessage({
          status: "success",
          statusText: "User(s) is successfully imported.",
        });
        setOpenSB(true);
        fetchUsers();
      })
      .catch((error) => {
        console.log(error);
        setMessage({
          status: "error",
          statusText: "Failed to create user.",
        });
        setOpenSB(true);
      });
  };

  const onResetPwd = async () => {
    handleCloseConfirmBox();
    await axios
      .put( API_URL + "/api/v1/auth/resetPwd/" + selectedUserId, {
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          Authorization: `Bearer ${token.Token}`,
        },
      })
      .then((response) => {
        setMessage({
          status: "success",
          statusText: "Password is successfully reset.",
        });
        setOpenSB(true);
        setReset(false);
      })
      .catch((error) => {
        console.log(error);
        setMessage({
          status: "error",
          statusText: "Failed to reset password.",
        });
        setOpenSB(true);
        setReset(false);
      });
  }

  const onActivate = async () => {
    handleCloseConfirmBox();
    await axios
      .put( API_URL + "/api/v1/user/activate/" + selectionModel, "", {
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          Authorization: `Bearer ${token.Token}`,
        },
      })
      .then((response) => {
        setMessage({
          status: "success",
          statusText: "User(s) is successfully activated.",
        });
        setOpenSB(true);
        setActivateClick(false);
        setActivationBtn(false);
        setSelectionModel([]);
        fetchUsers();
      })
      .catch((error) => {
        console.log(error);
        setMessage({
          status: "error",
          statusText: "Failed to activate user(s).",
        });
        setOpenSB(true);
        setActivateClick(false);
      });
  }

  const onDeactivate = async () => {
    handleCloseConfirmBox();
    await axios
      .put( API_URL + "/api/v1/user/deactivate/" + selectionModel, "", {
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          Authorization: `Bearer ${token.Token}`,
        },
      })
      .then((response) => {
        setMessage({
          status: "success",
          statusText: "User(s) is successfully deactivated.",
        });
        setOpenSB(true);
        setDeactivateClick(false);
        setActivationBtn(false);
        setSelectionModel([]);
        fetchUsers();
      })
      .catch((error) => {
        console.log(error);
        setMessage({
          status: "error",
          statusText: "Failed to deactivate user(s).",
        });
        setOpenSB(true);
        setDeactivateClick(false);
      });
  }

  return (
    <>
      <div className="main-content-container p-4 container-fluid">
        <h3 style={{ marginBottom: "20px" }}>User Management</h3>
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
              List of Users
            </Typography>
            <IconButton
              color="primary"
              sx={{ marginLeft: "10px" }}
              onClick={onCreate}
            >
              <AddCircleOutlineIcon sx={{ fontSize: "30px" }} />
            </IconButton>
          </Stack>
          <Divider sx={{ mt: 1, mb: 1 }}/>
          <div className="d-flex align-items-center">
            <input type="file" id="userListFile" name="filename" style={{ width: '100%', marginTop: '10px', marginBottom: '10px', paddingLeft: '5px' }}
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
                    headerName: head,
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
            <Button
              variant="outlined"
              onClick={handleOpenConfirmBox}
            >
              Import
            </Button>
          </div>
          <Divider sx={{ mt: 1, mb: 1 }}/>
          <div>
            <Button
              variant="contained"
              color="success"
              sx={{ mt: 1, mb: 1 }}
              hidden={!activationBtn}
              onClick={() => {
                handleOpenConfirmBox();
                setActivateClick(true);
              }}
            >
              Activate
            </Button>
            <Button
              variant="contained"
              color="error"
              hidden={!activationBtn}
              sx={{ mt: 1, mb: 1, mx: 2 }}
              onClick={() => {
                handleOpenConfirmBox();
                setDeactivateClick(true);
              }}
            >
              Deactivate
            </Button>
          </div>
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
              rows={users}
              columns={columns}
              rowsPerPageOptions={[10, 50, 100]}
              checkboxSelection 
              disableSelectionOnClick
              onSelectionModelChange={(userIds) => {
                userIds.length === 0
                  ? setActivationBtn(false)
                  : setActivationBtn(true);
                setSelectionModel(userIds);
              }}
              selectionModel={selectionModel}
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
            Are you sure to {activateClick ? "activate this user(s)" : deactivateClick ? "deactivate this user(s)" : reset ? 'reset the password of this user' : 'import this file'}?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => {
              handleCloseConfirmBox();
            }}
          >
            No
          </Button>
          <Button onClick={() => {
              activateClick ? onActivate() : deactivateClick ? onDeactivate() : reset ? onResetPwd() : onImport();
            }}
          >
            Yes
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}

export default UserManagement;
