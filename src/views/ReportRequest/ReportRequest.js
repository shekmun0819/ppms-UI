import { React, useState, useEffect } from "react";
import { IconButton, Typography, CircularProgress, Chip } from "@mui/material";
import DescriptionIcon from "@mui/icons-material/Description";
import { blue } from "@mui/material/colors";
import Snackbar from "@mui/material/Snackbar";
import Alert from "@mui/material/Alert";
import axios from "axios";
import moment from "moment";
import Stack from "@mui/material/Stack";
import "../../components/StatusLabel/StatusLabel.css";
import CapitalizeWord from "../../utils/CapitalizeWord";
import { DataGrid, gridClasses } from "@mui/x-data-grid";
import jwt_decode from "jwt-decode";
import { useCookies } from "react-cookie";
import { API_URL } from "../../config";

function ReportRequest() {
  const [reportRequests, setReportRequests] = useState([]);
  const [pageSize, setPageSize] = useState(10);
  const [isLoading, setLoading] = useState(false);
  const [token, setToken] = useCookies();
  const [userInfo, setUserInfo] = useState({
    email: "",
    name: "",
    roles: "",
    userId: "",
  });

  const [message, setMessage] = useState({
    status: "info",
    statusText: "",
  });

  const [openSB, setOpenSB] = useState(false);

  const handleCloseSB = (event, reason) => {
    if (reason === "clickaway") {
      return;
    }
    setOpenSB(false);
  };

  const getRowId = (params) => params.id;

  const columns = [
    {
      field: "title",
      headerName: "Project Title",
      description: "Project Title",
      flex: 3,
      valueGetter: (reportRequests) =>
        CapitalizeWord(reportRequests.row.report.project.name),
    },
    {
      field: "name",
      headerName: "Author",
      description: "Author",
      flex: 2,
      valueGetter: (reportRequests) =>
        CapitalizeWord(reportRequests.row.report.user.name),
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
    // {
    //   field: "remainingDay",
    //   headerName: "Remaining Day",
    //   description: "End Date",
    //   flex: 1,
    //   renderCell: (cellValues) => {
    //     var diff = moment(cellValues.row.endDate).diff(
    //       cellValues.row.startDate
    //     );
    //     const diffDuration = moment.duration(diff);
    //     var day = diffDuration.days();

    //     //var duration = moment.duration(day);
    //     return <span>{day}</span>;
    //   },
    // },
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
      flex: 1,
      headerAlign: "center",
      align: "center",
      sortable: false,
      renderCell: (cellValues) => {
        return (
          <IconButton
            disabled={
              cellValues.row.requestStatus === "ACCEPTED" ? false : true
            }
            onClick={() => {
              handleDownload(cellValues.row);
            }}
          >
            <DescriptionIcon
              sx={{
                fontSize: "30px",
                color:
                  cellValues.row.requestStatus === "ACCEPTED"
                    ? blue[500]
                    : "grey",
              }}
            />
          </IconButton>
        );
      },
    },
  ];

  useEffect(() => {
    const decoded = jwt_decode(token["Token"]);
    setUserInfo({
      email: decoded.userInfo.email,
      name: decoded.userInfo.name,
      roles: decoded.userInfo.roles,
      userId: decoded.userInfo.id,
    });
  }, [token]);

  useEffect(() => {
    if (userInfo.userId !== "") {
      fetchReportRequests();
    }
  }, [userInfo]);

  const fetchReportRequests = async () => {
    await axios
      .get(API_URL + `/api/v1/report-access/getAll/userId=${userInfo.userId}`, {
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

  const handleDownload = async (row) => {
    await axios
      .get(API_URL + "/api/v1/report/download/" + row.report.id, {
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
        link.setAttribute("download", row.report.fileName);
        document.body.appendChild(link);
        link.click();

        link.parentNode.removeChild(link);
      })
      .catch((error) => console.log(error));
  };

  return (
    <>
      <div className="main-content-container p-4 container-fluid">
        <h3 style={{ marginBottom: "20px" }}>Report Request Status</h3>
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
    </>
  );
}

export default ReportRequest;
