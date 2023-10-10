import { React, useState, useEffect } from "react";
import { IconButton, Typography, CircularProgress, Chip } from "@mui/material";
import Button from "@mui/material/Button";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CancelIcon from "@mui/icons-material/Cancel";
import EditIcon from "@mui/icons-material/Edit";
import Avatar from "@mui/material/Avatar";
import { blue } from "@mui/material/colors";
import Snackbar from "@mui/material/Snackbar";
import Alert from "@mui/material/Alert";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogTitle from "@mui/material/DialogTitle";
import axios from "axios";
import moment from "moment";
import Stack from "@mui/material/Stack";
import "../../../components/StatusLabel/StatusLabel.css";
import { useHistory } from "react-router-dom";
import { DataGrid, gridClasses } from "@mui/x-data-grid";
import { useCookies } from "react-cookie";
import { API_URL } from "../../../config";
import CapitalizeWord from "../../../utils/CapitalizeWord";

function ReportAccess() {
  let history = useHistory();

  const [id, setId] = useState("");
  const [reportRequests, setReportRequests] = useState([]);
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

  const handleDownload = async (row) => {
    await axios
      .get(API_URL + "/api/v1/report/download/" + row.id, {
        responseType: "blob",
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${token.Token}`,
        },
      })
      .then((response) => {
        let url = window.URL.createObjectURL(new Blob([response.data]));
        let link = document.createElement("a");
        link.href = url;
        link.setAttribute("download", row.fileName);
        document.body.appendChild(link);
        link.click();

        link.parentNode.removeChild(link);
      })
      .catch((error) => console.log(error));
  };

  const getRowId = (params) => params.id;

  const columns = [
    {
      field: "user",
      headerName: "Name",
      description: "Name",
      flex: 2,
      valueGetter: (reportRequests) =>
        CapitalizeWord(reportRequests.row.user.name),
    },
    {
      field: "fileName",
      headerName: "File",
      description: "File",
      flex: 2,
      renderCell: (cellValues) => {
        return (
          <a
            href="#"
            onClick={() => handleDownload(cellValues.row.report)}
            style={{ color: "blue", textDecoration: "underline" }}
          >
            {cellValues.row.report.fileName}
          </a>
        );
      },
    },
    {
      field: "roles",
      headerName: "Role",
      description: "Role",
      flex: 1,
      valueGetter: (reportRequests) => reportRequests.row.user.roles,
    },
    {
      field: "createdAt",
      headerName: "Requested Date",
      description: "Requested Date",
      flex: 1.5,
      renderCell: (cellValues) => {
        var reqDate = moment(cellValues.value).format("DD-MMM-YYYY, hh:mm a");
        return <span>{reqDate}</span>;
      },
    },
    {
      field: "startDate",
      headerName: "Start Date",
      description: "Start Date",
      flex: 1,
      renderCell: (cellValues) => {
        if (
          cellValues.row.requestStatus === "ACCEPTED" ||
          cellValues.row.requestStatus === "EXPIRED"
        ) {
          var startDate = moment(cellValues.value).format("DD-MMM-YYYY");
          return <span>{startDate}</span>;
        } else {
          return <span>Not available</span>;
        }
      },
    },
    {
      field: "endDate",
      headerName: "End Date",
      description: "End Date",
      flex: 1,
      renderCell: (cellValues) => {
        if (
          cellValues.row.requestStatus === "ACCEPTED" ||
          cellValues.row.requestStatus === "EXPIRED"
        ) {
          var endDate = moment(cellValues.value).format("DD-MMM-YYYY");
          return <span>{endDate}</span>;
        } else {
          return <span>Not available</span>;
        }
      },
    },
    {
      field: "requestStatus",
      headerName: "Status",
      description: "Status",
      flex: 1,
      renderCell: (cellValues) => {
        if (cellValues.value === "PENDING") {
          return (
            <div className="pending-status">
              <span>Pending</span>
            </div>
          );
        } else if (cellValues.value === "ACCEPTED") {
          return (
            <div className="active-status">
              <span>Accepted</span>
            </div>
          );
        } else if (cellValues.value === "REJECTED") {
          return (
            <div className="rejected-status">
              <span>Rejected</span>
            </div>
          );
        } else {
          return (
            <div className="inactive-status">
              <span>Expired</span>
            </div>
          );
        }
      },
    },
    {
      field: "action",
      headerName: "Actions",
      description: "Actions",
      flex: 1.5,
      headerAlign: "center",
      align: "center",
      sortable: false,
      renderCell: (cellValues) => {
        return (
          <Stack direction="row" spacing={-1}>
            <IconButton
              disabled={
                cellValues.row.requestStatus === "PENDING" ? false : true
              }
              onClick={() => {
                onAccept(cellValues.row.id);
              }}
            >
              <CheckCircleIcon
                sx={{
                  fontSize: "30px",
                  color:
                    cellValues.row.requestStatus === "PENDING"
                      ? "green"
                      : "grey",
                }}
              />
            </IconButton>
            <IconButton
              disabled={
                cellValues.row.requestStatus === "PENDING" ? false : true
              }
              onClick={() => {
                setId(cellValues.row.id);
                handleOpenConfirmBox();
              }}
            >
              <CancelIcon
                sx={{
                  fontSize: "30px",
                  color:
                    cellValues.row.requestStatus === "PENDING" ? "red" : "grey",
                }}
              />
            </IconButton>
            <IconButton
              disabled={
                cellValues.row.requestStatus === "ACCEPTED" ||
                cellValues.row.requestStatus === "EXPIRED"
                  ? false
                  : true
              }
              onClick={() => {
                onEdit(cellValues.row.id);
              }}
            >
              <Avatar
                sx={{
                  bgcolor:
                    cellValues.row.requestStatus === "ACCEPTED" ||
                    cellValues.row.requestStatus === "EXPIRED"
                      ? blue[500]
                      : "grey",
                  width: 25,
                  height: 25,
                }}
              >
                <EditIcon sx={{ fontSize: "18px" }} />
              </Avatar>
            </IconButton>
          </Stack>
        );
      },
    },
  ];

  const onAccept = (id) => {
    history.push(`/acceptrequest/${id}`);
  };

  const onEdit = (id) => {
    history.push(`/editreportaccess/${id}`);
  };

  const onReject = async (id) => {
    await axios
      .put(API_URL + "/api/v1/report-access/setReject/" + id, "", {
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          Authorization: `Bearer ${token.Token}`,
        },
      })
      .then((response) => {
        setMessage({
          status: "success",
          statusText: "Request rejected.",
        });
        handleCloseConfirmBox();
        setOpenSB(true);
        fetchReportRequests();
      })
      .catch((error) => {
        console.log(error);
        setMessage({
          status: "error",
          statusText: "Failed to update request.",
        });
        setOpenSB(true);
      });
  };

  const fetchReportRequests = async () => {
    await axios
      .get(API_URL + "/api/v1/report-access/getAll", {
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${token.Token}`,
        },
      })
      .then((response) => {
        var data = response.data;
        setReportRequests(data);
        setLoading(false);
      })
      .catch((error) => console.log(error));
  };

  useEffect(() => {
    fetchReportRequests();
  }, []);

  return (
    <>
      <div className="main-content-container p-4 container-fluid">
        <h3 style={{ marginBottom: "20px" }}>Report Access</h3>
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
              List of Requests
            </Typography>
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
              rows={reportRequests}
              columns={columns}
              rowsPerPageOptions={[10, 50, 100]}
              disableColumnMenu={true}
              disableSelectionOnClick
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
            Are you sure you want to reject this request?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseConfirmBox}>No</Button>
          <Button
            onClick={() => {
              onReject(id);
            }}
            autoFocus
          >
            Yes
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}

export default ReportAccess;
