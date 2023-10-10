import { React, useState, useEffect } from "react";
import { IconButton, Typography, CircularProgress, Stack, Divider, Button, Snackbar, Alert, Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions } from "@mui/material";
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";
import ModeEditOutlinedIcon from "@mui/icons-material/ModeEditOutlined";
import { useHistory } from "react-router-dom";
import { useCookies } from "react-cookie";
import axios from "axios";
import { DataGrid, gridClasses } from "@mui/x-data-grid";
import * as XLSX from 'xlsx';
import CapitalizeWord from '../../utils/CapitalizeWord';
import { API_URL } from "../../config";

const EXTENSIONS = ['xlsx', 'xls', 'csv']

function CompanyManagement() {
  let history = useHistory();
  const [token, setToken] = useCookies();
  const [isLoading, setLoading] = useState(false);

  const [pageSize, setPageSize] = useState(10);
  const [companies, setCompanies] = useState([]);

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
    { field: "companyName", headerName: "Name", description: "Company Name", flex: 2,
      renderCell: (cellValues) => {
        return (
          <span style={{ overflow: "hidden" }}>
            { CapitalizeWord(cellValues.value) }
          </span>
        );
      },
    },
    { field: "address", headerName: "Address", description: "Company Address", flex: 2,
      renderCell: (cellValues) => {
        return (
          <span style={{ overflow: "hidden" }}>
            { CapitalizeWord(cellValues.value) }
          </span>
        );
      },
    },
    { field: "contact", headerName: "Contact", description: "Company Contact", flex: 1 },
    {
      field: "action",
      headerName: "Actions",
      description: "Actions",
      headerAlign: "center", 
      align: "center",
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
          </>
        );
      },
    },
  ];

  const fetchCompanies = async () => {
    setLoading(true);
    await axios
      .get( API_URL + "/api/v1/company/getAll", {
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${token.Token}`,
        },
      })
      .then((response) => {
        var data = response.data;
        setCompanies(data);
        setLoading(false);
      })
      .catch((error) => {
        console.log(error)
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchCompanies();
  }, []);

  const onCreate = () => {
    history.push("/createcompany");
  };

  const onEdit = (company) => {
    history.push(`/editcompany/${company.id}`);
  };

  //for company import
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

  const [message, setMessage] = useState({
    status: "info",
    statusText: "",
  });

  const onImport = async () => {
    handleCloseConfirmBox();
    
    await axios
      .post( API_URL + "/api/v1/company/import", data, {
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          Authorization: `Bearer ${token.Token}`,
        },
      })
      .then((response) => {
        setMessage({
          status: "success",
          statusText: "List of companies is successfully imported.",
        });
        setOpenSB(true);
        fetchCompanies();
      })
      .catch((error) => {
        console.log(error);
        setMessage({
          status: "error",
          statusText: "Failed to create company.",
        });
        setOpenSB(true);
      });
  };

  return (
    <>
      <div className="main-content-container p-4 container-fluid">
        <h3 style={{ marginBottom: "20px" }}>Company Management</h3>
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
              List of Companies
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
            <input type="file" id="companyListFile" name="filename" style={{ width: '100%', marginTop: '10px', marginBottom: '10px', paddingLeft: '5px' }}
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
                    flex: index < 2 ? 2 : 1
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
              rows={companies}
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
            Are you sure to import this file?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseConfirmBox}
          >
            No
          </Button>
          <Button onClick={onImport}
          >
            Yes
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}

export default CompanyManagement;