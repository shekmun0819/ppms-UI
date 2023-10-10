import { React, useState, useEffect } from "react";
import { IconButton, Typography, CircularProgress } from "@mui/material";
import Button from "@mui/material/Button";
import FileUploadIcon from "@mui/icons-material/FileUpload";
import SendIcon from "@mui/icons-material/Send";
import DeleteOutlineRoundedIcon from "@mui/icons-material/DeleteOutlineRounded";
import axios from "axios";
import moment from "moment";
import Stack from "@mui/material/Stack";
import Snackbar from "@mui/material/Snackbar";
import Alert from "@mui/material/Alert";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogTitle from "@mui/material/DialogTitle";
import { DataGrid, gridClasses } from "@mui/x-data-grid";
import MenuItem from "@mui/material/MenuItem";
import FormControl from "@mui/material/FormControl";
import Select from "@mui/material/Select";
import jwt_decode from "jwt-decode";
import { useCookies } from "react-cookie";
import { API_URL } from "../../config";

function ReportManagement(props) {
  const getRowId = (params) => params.id;

  const [id, setId] = useState("");
  const [files, setFiles] = useState([]);
  const [selectedFile, setSelectedFile] = useState([]);
  const [type, setType] = useState("");
  const [typeId, setTypeId] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [reportTypes, setReportTypes] = useState([]);
  const [hasError, setHasError] = useState(false);
  const [pageSize, setPageSize] = useState(10);
  const [isLoading, setLoading] = useState(false);
  const [token, setToken] = useCookies();
  const [submitBtn, setSubmitBtn] = useState(true);
  const [userInfo, setUserInfo] = useState({
    email: "",
    name: "",
    roles: "",
    userId: "",
  });

  const [openConfirmBox, setOpenConfirmBox] = useState(false);
  const [openSB, setOpenSB] = useState(false);

  const [message, setMessage] = useState({
    status: "info",
    statusText: "",
  });

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

  const columns = [
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
      field: "similarityScore",
      headerName: "Similarity Score",
      description: "Similarity Score",
      flex: 1,
      renderCell: (cellValues) => {
        return <span> {cellValues.value}% </span>;
      },
    },
    {
      field: "final",
      headerName: "Status",
      description: "Status",
      flex: 1,
      renderCell: (cellValues) => {
        return cellValues.value === true ? (
          <div className="active-status">
            <span>Final</span>
          </div>
        ) : (
          <div className="inactive-status">
            <span>Not Final</span>
          </div>
        );
      },
    },
    {
      field: "createdAt",
      headerName: "Created At",
      description: "Created At",
      flex: 1.5,
      renderCell: (cellValues) => {
        var createdAt = moment(cellValues.value).format("DD-MMM-YYYY, hh:mm a");
        return <span>{createdAt}</span>;
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
        return (
          <IconButton
            disabled={cellValues.row.final === true ? true : false}
            onClick={() => {
              setId(cellValues.row.id);
              handleOpenConfirmBox();
            }}
          >
            <DeleteOutlineRoundedIcon sx={{ fontSize: "20px" }} />
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
    fetchReportTypes();
  }, []);

  useEffect(() => {
    if (typeId !== "") {
      fetchReports();
    }
  }, [typeId]);

  const fetchReportTypes = async () => {
    await axios
      .get(API_URL + "/api/v1/report-type/getAll/currentAcademicSession", {
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${token.Token}`,
        },
      })
      .then((response) => {
        var data = response.data;
        var activeType = data.filter((option) => option.active === true);
        var lastItem = activeType.length - 1;

        setReportTypes(activeType);
        setTypeId(activeType[lastItem].id);
        setType(activeType[lastItem].type);
        setDueDate(
          moment(activeType[lastItem].dueDate).format(
            "dddd, DD MMM YYYY, hh:mm a"
          )
        );
        setLoading(false);
      })
      .catch((error) => console.log(error));
  };

  const fetchReports = async () => {
    setLoading(true);
    await axios
      .get(API_URL + `/api/v1/report/getAll/${typeId}/${userInfo.userId}`, {
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${token.Token}`,
        },
      })
      .then((response) => {
        var data = response.data;
        setFiles(data);
        setLoading(false);
      })
      .catch((error) => {
        console.log(error);
        setLoading(false);
      });
  };

  const uploadHandler = async (e) => {
    const file = e.target.files[0];
    const data = new FormData();
    data.append("file", file);
    data.append("typeId", typeId);
    data.append("userId", userInfo.userId);

    await axios
      .post(API_URL + "/api/v1/report/upload", data, {
        headers: {
          Accept: "application/json",
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${token.Token}`,
        },
      })
      .then((response) => {
        setMessage({
          status: "success",
          statusText: "Report uploaded successfully.",
        });
        fetchReports();
        setOpenSB(true);
      })
      .catch((error) => {
        console.log(error);

        if (typeId === "") {
          setMessage({
            status: "error",
            statusText: "Please select a report type before you upload.",
          });
          setHasError(true);
        } else {
          setMessage({
            status: "error",
            statusText: "Failed to upload report.",
          });
        }

        setOpenSB(true);
      });
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

  const handleTypeChange = (e) => {
    setHasError(false);
    setTypeId(e.target.value);
    findType(e.target.value);
  };

  const findType = (typeId) => {
    const result = reportTypes.find((obj) => {
      return obj.id === typeId;
    });
    setType(result.type);
    setDueDate(moment(result.dueDate).format("dddd, DD MMM YYYY, hh:mm a"));
  };

  const onCheckSubmission = async () => {
    setSubmitBtn(true);
    if (selectedFile.length === 1) {
      await axios
        .get(
          API_URL +
            `/api/v1/report/checkMultipleSubmission/userId=${userInfo.userId}&typeId=${typeId}`,
          {
            headers: {
              Accept: "application/json",
              Authorization: `Bearer ${token.Token}`,
            },
          }
        )
        .then((response) => {
          var isMultiple = response.data;
          if (!isMultiple) {
            onSubmit();
          } else {
            setMessage({
              status: "error",
              statusText:
                "Only 1 final submission is allowed. Please remove your previous submission.",
            });
            setOpenSB(true);
            setSelectedFile([]);
          }
        })
        .catch((error) => {
          console.log(error);
          setMessage({
            status: "error",
            statusText: "Failed to submit file.",
          });
          setOpenSB(true);
          setSelectedFile([]);
        });
    } else {
      setMessage({
        status: "warning",
        statusText: "You can only submit one file.",
      });
      setOpenSB(true);
    }
  };

  const onSubmit = async () => {
    await axios
      .put(API_URL + `/api/v1/report/setFinal/${selectedFile[0]}`, "", {
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          Authorization: `Bearer ${token.Token}`,
        },
      })
      .then((response) => {
        setMessage({
          status: "success",
          statusText: "File submitted successfully.",
        });
        setOpenSB(true);
        setSelectedFile([]);
        fetchReports();
      })
      .catch((error) => {
        console.log(error);
        setMessage({
          status: "error",
          statusText: "Failed to submit file.",
        });
        setOpenSB(true);
        setSelectedFile([]);
      });
  };

  const onDelete = async (id) => {
    await axios
      .delete(API_URL + "/api/v1/report/" + id, {
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${token.Token}`,
        },
      })
      .then((response) => {
        setMessage({
          status: "success",
          statusText: "File deleted successfully.",
        });
        setOpenSB(true);
        handleCloseConfirmBox();
        fetchReports();
      })
      .catch((error) => {
        console.log(error);
        setMessage({
          status: "error",
          statusText: "Failed to delete file.",
        });
        setOpenSB(true);
        handleCloseConfirmBox();
      });
  };

  return (
    <>
      <div className="main-content-container p-4 container-fluid">
        <Stack direction="row" justifyContent="space-between">
          <h3 style={{ marginBottom: "20px" }}>Report Management</h3>
          <FormControl error={hasError} sx={{ m: 1, minWidth: 130 }}>
            <Select
              labelId="demo-simple-select-label"
              id="demo-simple-select"
              value={typeId === null ? "" : typeId}
              onChange={handleTypeChange}
              displayEmpty
              style={{ height: 30 }}
            >
              {reportTypes.map((option) => {
                return (
                  <MenuItem key={option.id} value={option.id}>
                    {option.type}
                  </MenuItem>
                );
              })}
            </Select>
          </FormControl>
        </Stack>

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
              {type}
            </Typography>
            <Stack justifyContent="flex-end" direction="row" spacing={2}>
              <Button
                variant="outlined"
                component="label"
                size="small"
                hidden={submitBtn}
                endIcon={<SendIcon />}
                onClick={onCheckSubmission}
              >
                Submit
              </Button>
              <Button
                variant="contained"
                component="label"
                size="small"
                endIcon={<FileUploadIcon />}
              >
                Upload
                <input
                  hidden
                  type="file"
                  onChange={uploadHandler}
                  onClick={(e) => {
                    e.target.value = null;
                  }}
                  accept="application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                />
              </Button>
            </Stack>
          </Stack>
          {dueDate !== "" && (
            <Typography variant="subtitle1" sx={{ paddingLeft: "5px" }}>
              Due date: {dueDate}
            </Typography>
          )}
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
              //onRowClick={handleRowClick}
              rows={files}
              columns={columns}
              rowsPerPageOptions={[10, 50, 100]}
              disableColumnMenu={true}
              checkboxSelection
              disableSelectionOnClick
              selectionModel={selectedFile}
              onSelectionModelChange={(data) => {
                data.length === 0 ? setSubmitBtn(true) : setSubmitBtn(false);
                setSelectedFile(data);
              }}
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
            Are you sure you want to delete this file permanently?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseConfirmBox}>No</Button>
          <Button onClick={() => onDelete(id)} autoFocus>
            Yes
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}

export default ReportManagement;
