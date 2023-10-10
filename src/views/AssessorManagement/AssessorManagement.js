import { React, useState, useEffect } from "react";
import { IconButton, Typography, CircularProgress, Stack } from "@mui/material";
import ModeEditOutlinedIcon from "@mui/icons-material/ModeEditOutlined";
import axios from "axios";
import moment from "moment";
import { useHistory } from "react-router-dom";
import {
  DataGrid,
  gridClasses,
  GridToolbarContainer,
  GridToolbarFilterButton,
} from "@mui/x-data-grid";
import { useCookies } from "react-cookie";
import * as XLSX from "xlsx";
import Button from "@mui/material/Button";
import Snackbar from "@mui/material/Snackbar";
import Alert from "@mui/material/Alert";
import { FormControl, Select, MenuItem } from "@mui/material";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogTitle from "@mui/material/DialogTitle";
import Divider from "@mui/material/Divider";
import CapitalizeWord from "../../utils/CapitalizeWord";
import { API_URL } from "../../config";

const EXTENSIONS = ["xlsx", "xls", "csv"];

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

function AssessorManagement() {
  let history = useHistory();
  const [academicSessions, setAcademicSessions] = useState([]);
  const [selectedAcadSession, setSelectedAcadSession] = useState("");
  const [projects, setProjects] = useState([]);
  const [pageSize, setPageSize] = useState(10);
  const [isLoading, setLoading] = useState(false);
  const [token, setToken] = useCookies();

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

  //for assessor import
  const [colDefs, setColDefs] = useState();
  const [data, setData] = useState([]);
  const convertToJson = (headers, data) => {
    const rows = [];
    data.forEach((row) => {
      let rowData = {};
      row.forEach((element, index) => {
        rowData[headers[index]] = element;
      });
      rows.push(rowData);
    });

    return rows;
  };

  const getExtension = (file) => {
    const parts = file.name.split(".");
    const extension = parts[parts.length - 1];
    return EXTENSIONS.includes(extension);
  };

  const getRowId = (params) => params.id;

  const columns = [
    {
      field: "name",
      headerName: "Project",
      description: "Project",
      flex: 2.5,
      valueGetter: (params) => CapitalizeWord(params.value),
    },
    {
      field: "student",
      headerName: "Student",
      description: "Student",
      flex: 1.5,
      renderCell: (cellValues) => {
        return cellValues.value ? (
          <span>{CapitalizeWord(cellValues.row.student.name)}</span>
        ) : (
          <span>Not determined</span>
        );
      },
    },
    {
      field: "host",
      headerName: "Host",
      description: "Host",
      flex: 1.5,
      renderCell: (cellValues) => {
        return cellValues.value ? (
          <span>{CapitalizeWord(cellValues.row.host.name)}</span>
        ) : (
          <span>Not determined</span>
        );
      },
    },
    {
      field: "supervisor",
      headerName: "Supervisor",
      description: "Supervisor",
      flex: 1.5,
      renderCell: (cellValues) => {
        return cellValues.value ? (
          <span style={{ overflow: "hidden" }}>
            {CapitalizeWord(cellValues.row.supervisor.name)}
          </span>
        ) : (
          <span>Not determined</span>
        );
      },
    },
    {
      field: "examiner",
      headerName: "Examiner",
      description: "Examiner",
      flex: 1.5,
      renderCell: (cellValues) => {
        return cellValues.value ? (
          <span style={{ overflow: "hidden" }}>
            {CapitalizeWord(cellValues.row.examiner.name)}
          </span>
        ) : (
          <span>Not determined</span>
        );
      },
    },
    {
      field: "panel",
      headerName: "Panel",
      description: "Panel",
      flex: 1.5,
      renderCell: (cellValues) => {
        return cellValues.value ? (
          <span style={{ overflow: "hidden" }}>
            {CapitalizeWord(cellValues.row.panel.name)}
          </span>
        ) : (
          <span>Not determined</span>
        );
      },
    },
    {
      field: "chair",
      headerName: "Chair",
      description: "Chair",
      flex: 1.5,
      renderCell: (cellValues) => {
        return cellValues.value ? (
          <span style={{ overflow: "hidden" }}>
            {CapitalizeWord(cellValues.row.chair.name)}
          </span>
        ) : (
          <span>Not determined</span>
        );
      },
    },
    {
      field: "updatedAt",
      headerName: "Updated At",
      description: "Updated At",
      flex: 1,
      headerAlign: "center",
      align: "center",
      renderCell: (cellValues) => {
        var updatedAt = moment(cellValues.value).format("DD-MMM-YYYY, hh:mm a");
        return <span>{updatedAt}</span>;
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
          <IconButton
            disabled={cellValues.row.student !== null ? false : true}
            onClick={() => {
              onEdit(cellValues.row.id);
            }}
          >
            <ModeEditOutlinedIcon sx={{ fontSize: "20px" }} />
          </IconButton>
        );
      },
    },
  ];

  const fetchAcademicSessions = async () => {
    await axios
      .get(API_URL + "/api/v1/academic-session/getAll", {
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${token.Token}`,
        },
      })
      .then((response) => {
        var data = response.data;
        setAcademicSessions(data);
        setSelectedAcadSession(data[0].id);
      })
      .catch((error) => console.log(error));
  };

  const fetchProjects = async () => {
    setLoading(true);
    await axios
      .get(
        API_URL +
          `/api/v1/practicumProjects/getAll/academicSessionId=${selectedAcadSession}`,
        {
          headers: {
            Accept: "application/json",
            Authorization: `Bearer ${token.Token}`,
          },
        }
      )
      .then((response) => {
        var data = response.data;
        setProjects(data);
        setLoading(false);
      })
      .catch((error) => {
        console.log(error);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchAcademicSessions();
  }, []);

  useEffect(() => {
    if (selectedAcadSession !== "") {
      fetchProjects();
    }
  }, [selectedAcadSession]);

  const onEdit = (projectId) => {
    history.push(`/editassessor/${projectId}`);
  };

  const onImport = async () => {
    await axios
      .post(
        API_URL +
          `/api/v1/practicumProjects/academicSessionId=${selectedAcadSession}/import`,
        data,
        {
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
            Authorization: `Bearer ${token.Token}`,
          },
        }
      )
      .then((response) => {
        if (data.length > 0) {
          setMessage({
            status: "success",
            statusText: "Assessors have successfully updated.",
          });
          setOpenSB(true);
          handleCloseConfirmBox();
          fetchProjects();
        } else {
          setMessage({
            status: "error",
            statusText: "Please select a file to import.",
          });
          setOpenSB(true);
          handleCloseConfirmBox();
        }
      })
      .catch((error) => {
        console.log(error);
        setMessage({
          status: "error",
          statusText: "Failed to import assessor.",
        });
        setOpenSB(true);
        handleCloseConfirmBox();
      });
  };

  return (
    <>
      <div className="main-content-container p-4 container-fluid">
        <h3 style={{ marginBottom: "20px" }}>Assessor Management</h3>
        <div
          style={{
            backgroundColor: "white",
            padding: "20px",
            borderRadius: "5px",
          }}
        >
          <Typography
            variant="h5"
            sx={{ fontWeight: "bold", paddingLeft: "5px" }}
          >
            List of Projects with Assessors
          </Typography>

          <Stack direction="row" alignItems="center" spacing={2}>
            <Typography>Academic Session:</Typography>
            <FormControl sx={{ minWidth: "30%" }}>
              <Select
                id="acadSession"
                sx={{
                  marginY: "20px",
                  height: "40px",
                }}
                value={selectedAcadSession === "" ? "" : selectedAcadSession}
                MenuProps={MenuProps}
                onChange={(e) => {
                  setSelectedAcadSession(e.target.value);
                }}
              >
                {academicSessions &&
                  academicSessions.map((item) => (
                    <MenuItem key={item.id} value={item.id}>
                      {item.academicSession}, Semester{" "}
                      {item.semester.toString()}
                    </MenuItem>
                  ))}
              </Select>
            </FormControl>
          </Stack>
          <Divider sx={{ mt: 1, mb: 1 }} />
          <div className="d-flex align-items-center">
            <input
              type="file"
              id="presentationFile"
              name="filename"
              style={{
                width: "100%",
                marginTop: "10px",
                marginBottom: "10px",
                paddingLeft: "5px",
              }}
              onChange={(e) => {
                const file = e.target.files[0];
                const reader = new FileReader();
                reader.onload = (event) => {
                  //parse data
                  const bstr = event.target.result;
                  const workBook = XLSX.read(bstr, { type: "binary" });

                  //get first sheet
                  const workSheetName = workBook.SheetNames[0];
                  const workSheet = workBook.Sheets[workSheetName];

                  //convert to array
                  const fileData = XLSX.utils.sheet_to_json(workSheet, {
                    header: 1,
                  });

                  const headers = fileData[0];
                  const heads = headers.map((head, index) => ({
                    headerName: head,
                    field: head,
                    flex: index < 2 ? 1 : 2,
                  }));
                  setColDefs(heads);
                  fileData.splice(0, 1);
                  setData(convertToJson(headers, fileData));
                };
                if (file) {
                  if (getExtension(file)) {
                    reader.readAsBinaryString(file);
                  } else {
                    alert("Invalid file input, Select Excel or CSV file");
                  }
                }
              }}
            />
            <Button variant="outlined" onClick={handleOpenConfirmBox}>
              Import
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
              rows={projects}
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
          <Button onClick={handleCloseConfirmBox}>No</Button>
          <Button onClick={onImport} autoFocus>
            Yes
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}

export default AssessorManagement;
