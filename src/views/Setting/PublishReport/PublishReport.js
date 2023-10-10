import { React, useState, useEffect } from "react";
import {
  IconButton,
  Typography,
  CircularProgress,
  FormControl,
  Select,
  Grid,
  MenuItem,
} from "@mui/material";
import Button from "@mui/material/Button";
import ModeEditOutlinedIcon from "@mui/icons-material/ModeEditOutlined";
import Snackbar from "@mui/material/Snackbar";
import Alert from "@mui/material/Alert";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogTitle from "@mui/material/DialogTitle";
import FormLabel from "@mui/material/FormLabel";
import axios from "axios";
import moment from "moment";
import Stack from "@mui/material/Stack";
import Divider from "@mui/material/Divider";
import "../../../components/StatusLabel/StatusLabel.css";
import CapitalizeWord from "../../../utils/CapitalizeWord";
import { useHistory } from "react-router-dom";
import {
  DataGrid,
  gridClasses,
  GridToolbarContainer,
  GridToolbarFilterButton,
} from "@mui/x-data-grid";
import { useCookies } from "react-cookie";
import { API_URL } from "../../../config";

function CustomToolbar() {
  return (
    <GridToolbarContainer sx={{ margin: "0 5px 5px 0" }}>
      <GridToolbarFilterButton sx={{ fontSize: "16px", color: "black" }} />
    </GridToolbarContainer>
  );
}

const ITEM_HEIGHT = 48;
const MenuProps = {
  PaperProps: {
    style: {
      maxHeight: ITEM_HEIGHT * 4.5,
      width: 250,
    },
  },
};

function PublishReport() {
  let history = useHistory();

  const [id, setId] = useState("");
  const [academicSessions, setAcademicSessions] = useState([]);
  const [selectedAcadSession, setSelectedAcadSession] = useState("");
  const [finalReports, setFinalReports] = useState([]);
  const [reportTypes, setReportTypes] = useState([]);
  const [selectionModel, setSelectionModel] = useState([]);
  const [publishBtn, setPublishBtn] = useState(true);
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

  const getRowId = (params) => params.id;

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

  const fetchFinalReports = async () => {
    setLoading(true);
    await axios
      .get(
        API_URL +
          `/api/v1/report/getAll/finalReports/academicSessionId=${selectedAcadSession}`,
        {
          headers: {
            Accept: "application/json",
            Authorization: `Bearer ${token.Token}`,
          },
        }
      )
      .then((response) => {
        var data = response.data;
        setFinalReports(data);
        setLoading(false);
      })
      .catch((error) => {
        console.log(error);
        setLoading(false);
      });
  };

  const fetchReportTypes = async () => {
    await axios
      .get(API_URL + "/api/v1/report-type/getAll", {
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${token.Token}`,
        },
      })
      .then((response) => {
        var data = response.data;
        setReportTypes(data);
        setLoading(false);
      })
      .catch((error) => console.log(error));
  };

  const onPublish = async () => {
    await axios
      .put(API_URL + "/api/v1/report/setPublished/" + selectionModel, "", {
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          Authorization: `Bearer ${token.Token}`,
        },
      })
      .then((response) => {
        setMessage({
          status: "success",
          statusText: "File(s) has been published successfully.",
        });
        setOpenSB(true);
        handleCloseConfirmBox();
        setSelectionModel([]);
        fetchFinalReports();
      })
      .catch((error) => {
        console.log(error);
        setMessage({
          status: "error",
          statusText: "Failed to publish file.",
        });
        setOpenSB(true);
      });
  };

  const onEdit = (row) => {
    history.push(`/editpublishreport/${row.id}`);
  };

  useEffect(() => {
    fetchAcademicSessions();
  }, []);

  useEffect(() => {
    if (selectedAcadSession !== "") {
      fetchFinalReports();
    }
  }, [selectedAcadSession]);

  const columns = [
    {
      field: "academicSession",
      headerName: "Academic Session",
      description: "Academic Session",
      flex: 1,
      renderCell: (cellValues) => {
        return (
          <span>
            {cellValues.row.project.academicSession.academicSession}, Semester{" "}
            {cellValues.row.project.academicSession.semester}
          </span>
        );
      },
    },
    {
      field: "user",
      headerName: "Name",
      description: "Name",
      flex: 2,
      valueGetter: (finalReports) => CapitalizeWord(finalReports.row.user.name),
    },
    {
      field: "title",
      headerName: "Title",
      description: "Title",
      flex: 2,
      valueGetter: (finalReports) =>
        CapitalizeWord(finalReports.row.project.name),
    },
    {
      field: "type",
      headerName: "Type",
      description: "Type",
      flex: 1,
      valueGetter: (finalReports) => finalReports.row.type.type,
    },
    {
      field: "updatedAt",
      headerName: "Updated At",
      description: "Updated At",
      flex: 1,
      renderCell: (cellValues) => {
        var reqDate = moment(cellValues.value).format("DD-MMM-YYYY, hh:mm a");
        return <span>{reqDate}</span>;
      },
    },
    {
      field: "nda",
      headerName: "Confidentiality",
      description: "Confidentiality",
      flex: 1,
      renderCell: (cellValues) => {
        return cellValues.row.project.nda === false ? (
          <div className="inactive-status">
            <span>Non-NDA</span>
          </div>
        ) : (
          <div className="rejected-status">
            <span>NDA</span>
          </div>
        );
      },
    },
    {
      field: "published",
      headerName: "Status",
      description: "Status",
      flex: 1,
      renderCell: (cellValues) => {
        return cellValues.value === true ? (
          <div className="active-status">
            <span>Published</span>
          </div>
        ) : (
          <div className="inactive-status">
            <span>Not Published</span>
          </div>
        );
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
            //disabled={!cellValues.row.active}
            onClick={() => {
              onEdit(cellValues.row);
            }}
          >
            <ModeEditOutlinedIcon sx={{ fontSize: "20px" }} />
          </IconButton>
        );
      },
    },
  ];

  //   const VISIBLE_FIELDS = ['academicSession', 'user', 'title'. 'nda', 'isPu'];

  // export default function QuickFilteringGrid() {
  //   const { data } = useDemoData({
  //     dataSet: 'Employee',
  //     visibleFields: VISIBLE_FIELDS,
  //     rowLength: 100,
  //   });

  //   // Otherwise filter will be applied on fields such as the hidden column id
  //   const columns = React.useMemo(
  //     () => data.columns.filter((column) => VISIBLE_FIELDS.includes(column.field)),
  //     [data.columns],
  //   );

  return (
    <>
      <div className="main-content-container p-4 container-fluid">
        <h3 style={{ marginBottom: "20px" }}>Publish Report</h3>
        <div
          style={{
            backgroundColor: "white",
            padding: "20px",
            borderRadius: "5px",
          }}
        >
          {/* <Grid container spacing={1}>
                <Grid item xs={3}>
                  <FormControl sx={{ mb: 2, minWidth: 180 }}>
                    <InputLabel id="demo-simple-select-label">
                      Report Type
                    </InputLabel>
                    <Select
                      labelId="demo-simple-select-label"
                      id="demo-simple-select"
                      label="Report Type"
                      value={reportType}
                      onChange={handleReportTypeChange}
                      displayEmpty
                      //style={{ height: 40 }}
                    >
                      {reportTypes.map((option) => {
                        return (
                          <MenuItem value={option.type}>{option.type}</MenuItem>
                        );
                      })}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={3}>
                  <FormControl sx={{ mb: 2, minWidth: 180 }}>
                    <InputLabel id="demo-simple-select-label">
                      Confidentiality
                    </InputLabel>
                    <Select
                      labelId="demo-simple-select-label"
                      id="demo-simple-select"
                      label="Confidentiality"
                      value={nda}
                      onChange={handleNdaChange}
                      displayEmpty
                      sx={{ bgColor: "#393939" }}
                      //style={{ height: 40 }}
                    >
                      <MenuItem value={true}>NDA</MenuItem>
                      <MenuItem value={false}>Non-NDA</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={3}>
                  <FormControl sx={{ mb: 2, minWidth: 180 }}>
                    <InputLabel id="demo-simple-select-label">
                      Status
                    </InputLabel>
                    <Select
                      labelId="demo-simple-select-label"
                      id="demo-simple-select"
                      label="Report Type"
                      value={status}
                      onChange={handleStatusChange}
                      displayEmpty
                      //style={{ height: 40 }}
                    >
                      <MenuItem value={true}>Published</MenuItem>
                      <MenuItem value={false}>Not Published</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
              </Grid> */}

          <Typography
            variant="h5"
            sx={{
              fontWeight: "bold",
              paddingLeft: "5px",
            }}
          >
            List of Reports
          </Typography>
          <Stack
            direction="row"
            justifyContent="space-between"
            alignItems="center"
            spacing={2}
          >
            <Grid container direction="row" alignItems="center" spacing={2}>
              <Grid item>
                <Typography>Academic Session:</Typography>
              </Grid>
              <Grid item>
                <FormControl sx={{ minWidth: 220 }}>
                  <Select
                    id="acadSession"
                    sx={{
                      marginY: "20px",
                      height: "40px",
                    }}
                    value={
                      selectedAcadSession === "" ? "" : selectedAcadSession
                    }
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
                    <MenuItem key="0" value="0">
                      All
                    </MenuItem>
                  </Select>
                </FormControl>
              </Grid>
            </Grid>

            <Button
              variant="contained"
              hidden={publishBtn}
              onClick={handleOpenConfirmBox}
            >
              Publish
            </Button>
          </Stack>
          <Divider sx={{ mt: 1, mb: 1 }} />
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
              rows={finalReports}
              columns={columns}
              rowsPerPageOptions={[10, 50, 100]}
              disableColumnMenu={true}
              disableSelectionOnClick
              components={{ Toolbar: CustomToolbar }}
              checkboxSelection
              componentsProps={{
                panel: {
                  placement: "top",
                },
              }}
              onSelectionModelChange={(reportIds) => {
                reportIds.length === 0
                  ? setPublishBtn(true)
                  : setPublishBtn(false);
                setSelectionModel(reportIds);
              }}
              selectionModel={selectionModel}
              isRowSelectable={(params) =>
                params.row.project.nda === false &&
                params.row.type.milestone === 3
              }
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
            Are you sure you want to publish {selectionModel.length} report(s)?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseConfirmBox}>No</Button>
          <Button onClick={onPublish} autoFocus>
            Yes
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}

export default PublishReport;
