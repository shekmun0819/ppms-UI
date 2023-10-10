import { React, useState, useEffect } from "react";
import { IconButton, Typography, CircularProgress } from "@mui/material";
import DeleteOutlineRoundedIcon from "@mui/icons-material/DeleteOutlineRounded";
import axios from "axios";
import moment from "moment";
import Stack from "@mui/material/Stack";
import Snackbar from "@mui/material/Snackbar";
import Alert from "@mui/material/Alert";
import dayjs from "dayjs";
import { DataGrid, gridClasses } from "@mui/x-data-grid";
import { useCookies } from "react-cookie";
import jwt_decode from "jwt-decode";
import { API_URL } from "../../config";

function ReportAccess() {
  const getRowId = (params) => params.id;

  const [finalFiles, setFinalFiles] = useState([]);
  const [pageSize, setPageSize] = useState(10);
  const [isLoading, setLoading] = useState(true);
  const [token, setToken] = useCookies();
  const [openSB, setOpenSB] = useState(false);
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
        let url = window.URL.createObjectURL(response.data);
        let link = document.createElement("a");
        link.href = url;
        link.setAttribute("title", row.fileName);
        link.target = "_blank";
        link.rel = "noopener noreferrer";
        link.click();

        link.parentNode.removeChild(link);
      })
      .catch((error) => console.log(error));
  };

  useEffect(() => {
    const decoded = jwt_decode(token["Token"]);
    setUserInfo({
      email: decoded.userInfo.email,
      name: decoded.userInfo.name,
      roles: decoded.userInfo.roles,
      userId: decoded.userInfo.id,
    });
  }, [token]);

  const fetchFinalReports = async () => {
    await axios
      .get(
        API_URL +
          `/api/v1/report/getAll/finalReports/studentId=${userInfo.userId}`,
        {
          headers: {
            Accept: "application/json",
            Authorization: `Bearer ${token.Token}`,
          },
        }
      )
      .then((response) => {
        setFinalFiles(response.data);
        setLoading(false);
      })
      .catch((error) => console.log(error));
  };

  const onRemoveSubmission = async (id) => {
    await axios
      .put(API_URL + "/api/v1/report/removeSubmission/" + id, "", {
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          Authorization: `Bearer ${token.Token}`,
        },
      })
      .then((response) => {
        setMessage({
          status: "success",
          statusText: "Submission removed successfully.",
        });
        setOpenSB(true);
        fetchFinalReports();
      })
      .catch((error) => {
        console.log(error);
        setMessage({
          status: "error",
          statusText: "Failed to remove submission.",
        });
        setOpenSB(true);
      });
  };

  useEffect(() => {
    if (userInfo.userId !== "") {
      fetchFinalReports();
    }
  }, [userInfo]);

  const columns = [
    {
      field: "type",
      headerName: "Report Type",
      description: "Report Type",
      flex: 1.5,
      valueGetter: (finalFiles) => finalFiles.row.type.type,
    },
    {
      field: "dueDate",
      headerName: "Due Date",
      description: "Due Date",
      flex: 2,
      valueGetter: (finalFiles) => finalFiles.row.type.dueDate,
      renderCell: (cellValues) => {
        return dayjs(cellValues.value).format("ddd DD-MMM-YYYY, hh:mm a");
      },
    },
    {
      field: "fileName",
      headerName: "File Name",
      description: "File Name",
      flex: 2,
      renderCell: (cellValues) => {
        return (
          <a
            href="#"
            onClick={() => handleDownload(cellValues.row)}
            style={{ color: "blue", textDecoration: "underline" }}
          >
            {cellValues.row.fileName}
          </a>
        );
      },
    },
    {
      field: "final",
      headerName: "Status",
      description: "Status",
      flex: 1.5,
      renderCell: (cellValues) => {
        return cellValues.value === true ? (
          <div className="active-status">
            <span>Submitted</span>
          </div>
        ) : (
          <div className="inactive-status">
            <span>Not Submitted</span>
          </div>
        );
      },
    },
    {
      field: "updatedAt",
      headerName: "Submitted At",
      description: "Submitted At",
      flex: 2,
      renderCell: (cellValues) => {
        var updatedAt = moment(cellValues.value).format("DD-MMM-YYYY, hh:mm a");
        return <span>{updatedAt}</span>;
      },
    },
    {
      field: "action",
      headerName: "Action",
      description: "Action",
      flex: 1,
      headerAlign: "center",
      align: "center",
      sortable: false,
      renderCell: (cellValues) => {
        const dueDate = moment(
          cellValues.row.type.dueDate,
          "YYYY-MM-DDTHH:mm:ss.SSSZ"
        );
        const now = moment();
        return (
          <IconButton
            disabled={now.isAfter(dueDate) ? true : false}
            onClick={() => {
              onRemoveSubmission(cellValues.row.id);
            }}
          >
            <DeleteOutlineRoundedIcon sx={{ fontSize: "20px" }} />
          </IconButton>
        );
      },
    },
  ];

  return (
    <>
      <div className="main-content-container p-4 container-fluid">
        <h3 style={{ marginBottom: "20px" }}>Submission Status</h3>
        <div
          style={{
            backgroundColor: "white",
            padding: "20px",
            borderRadius: "5px",
          }}
        >
          <Stack
            direction="row"
            alignItems="center"
            justifyContent="space-between"
          >
            <Typography
              variant="h5"
              sx={{ fontWeight: "bold", paddingLeft: "5px" }}
            >
              Reports
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
              rows={finalFiles}
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

export default ReportAccess;
