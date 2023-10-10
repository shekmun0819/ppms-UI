import {
  Typography,
  Stack,
  IconButton,
  Button,
  Snackbar,
  Alert,
  CircularProgress,
} from "@mui/material";
import { DataGrid, gridClasses } from "@mui/x-data-grid";
import ArrowBackIosNewIcon from "@mui/icons-material/ArrowBackIosNew";
import { useHistory } from "react-router-dom";
import { DropzoneArea } from "mui-file-dropzone";
import axios from "axios";
import { useCookies } from "react-cookie";
import jwt_decode from "jwt-decode";
import { useState } from "react";
import DownloadIcon from "@mui/icons-material/Download";
import { useEffect } from "react";
import moment from "moment";
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";
import { API_URL } from "../../config";
import EditIcon from "@mui/icons-material/Edit";

const fileType = ["PDF"];

function ResumeRepository() {
  let history = useHistory();
  const [token, setToken] = useCookies();
  const [resume, setResume] = useState(null);
  const [openConfirmBox, setOpenConfirmBox] = useState(false);
  const [pageSize, setPageSize] = useState(10);
  const [isLoading, setLoading] = useState(true);
  const [resumes, setResumes] = useState([]);
  const [seed, setSeed] = useState(1);
  const decoded = jwt_decode(token["Token"]);
  let clearFiles = false;
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

  const handleCloseConfirmBox = () => {
    setOpenConfirmBox(false);
  };

  const handleSaveResume = async () => {
    if (resume === null || resume === 0) {
      setMessage({
        status: "error",
        statusText: "There is no file attached. Kindly reupload.",
      });
      setOpenSB(true);
    } else {
      let formData = new FormData();
      formData.append("student_id", jwt_decode(token["Token"]).userInfo.id);
      formData.append("resume", resume[0]);

      await axios
        .post( API_URL + "/api/v1/resume/upload", formData, {
          headers: {
            Accept: "application/json",
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${token.Token}`,
          },
        })
        .then((response) => {
          setMessage({
            status: "success",
            statusText: "Resume is successfully saved.",
          });
          setOpenSB(true);
          handleCloseConfirmBox();
          fetchResume();
          setSeed(Math.random());
        })
        .catch((error) => {
          setMessage({
            status: "error",
            statusText: "Failed to save resume.",
          });
          setOpenSB(true);
        });
    }
  };

  const fetchResume = async () => {
    const userId = decoded.userInfo.id;
    await axios
        .get( API_URL + "/api/v1/resume/getAllByStudentId/"+ userId, {
          headers: {
            Accept: "application/json",
            Authorization: `Bearer ${token.Token}`,
          },
        })
        .then((response) => {
          setColumnData(response.data);
          setLoading(false);

        })
        .catch((error) => {
          console.log(error);
        });
    }

  useEffect(() => {
    fetchResume();
  }, []);

  const handleDownloadResume = async (resume) => {
    await axios
      .get( API_URL + "/api/v1/resume/download/" + resume.id, {
        responseType: "blob",
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${token.Token}`,
        },
      })
      .then((response) => {
        console.log(response)
        const blob = new Blob([response.data], {type: "application/pdf"})
        //let url = window.URL.createObjectURL(new Blob([response.data]));
        let url = window.URL.createObjectURL(blob);
        let link = document.createElement("a");
        link.href = url;
        link.setAttribute("download", resume.resumeName);
        document.body.appendChild(link);
        link.click();

        link.parentNode.removeChild(link);
      })
      .catch((error) => {
        console.log(error);
        setMessage({
          status: "error",
          statusText:
            "Something wrong. Unable to download " + resume.resumeName,
        });
        setOpenSB(true);
      });
  };

  const columns = [
    { field: "resumeName", headerName: "File Name", flex: 3 },
    {
      field: "updatedAt",
      headerName: "Last Updated",
      flex: 2,
      headerAlign: "center",
      align: "center",
      renderCell: (cellValues) => {
        var updatedAt = moment(cellValues.value).format("DD-MMM-YYYY, hh:mm a");
        return <span>{updatedAt}</span>;
      },
    },
    {
      field: "action",
      headerName: "Action",
      flex: 2,
      headerAlign: "center",
      align: "center",
      renderCell: (cellValues) => {
        if (cellValues.row.aboutMe != null) {
          return (
            <Stack flexDirection="row">
              <IconButton
                onClick={() => {
                  console.log(cellValues.row.id)
                  onEditResume(cellValues.row.id);
                }}
              >
                <EditIcon sx={{ fontSize: "20px" }} />
              </IconButton>
              <IconButton
                onClick={() => {
                  handleDownloadResume(cellValues.row);
                }}
              >
                <DownloadIcon sx={{ fontSize: "20px" }} />
              </IconButton>
            </Stack>
          );
        } else{
          return (
            <IconButton
              onClick={() => {
                handleDownloadResume(cellValues.row);
              }}
            >
              <DownloadIcon sx={{ fontSize: "20px" }} />
            </IconButton>
          );
        }
        
      },
    },
  ];

  var resumeList = [];
  const setColumnData = (list) => {
    for (var i = 0; i < list.length; i++) {
      const data = {
        id: list[i].id,
        resumeName: list[i].filename,
        updatedAt: list[i].updatedAt,
        aboutMe: list[i].aboutMe,
      };
      resumeList = [...resumeList, data];
    }
    setResumes(resumeList);
  };

  const onBack = () => {
    history.goBack();
  };

  const onCreateResume = () => {
    history.push("/createresume");
  }

  const onEditResume = (props) => {
    history.push("/editresume/"+ props);
  };
  return (
    <>
      <div className="main-content-container p-4 container-fluid">
        <h3 style={{ marginBottom: "20px" }}>Resume Repository</h3>
        <div
          style={{
            backgroundColor: "white",
            padding: "20px",
            borderRadius: "5px",
          }}
        >
          <Stack direction="row" alignItems="center">
            <IconButton
              sx={{ color: "black", paddingLeft: "0" }}
              onClick={onBack}
            >
              <ArrowBackIosNewIcon sx={{ fontSize: "25px" }} />
            </IconButton>
            <Typography variant="h5" sx={{ fontWeight: "bold" }}>
              List of Resumes
            </Typography>
            <IconButton
              color="primary"
              sx={{ marginLeft: "10px" }}
              onClick={onCreateResume}
            >
              <AddCircleOutlineIcon sx={{ fontSize: "30px" }} />
            </IconButton>
          </Stack>
          <Stack
            display="flex"
            alignItems="center"
            marginLeft="20%"
            marginRight="20%"
          >
            <DropzoneArea
              key={seed}
              filesLimit={1}
              acceptedFiles={["application/pdf"]}
              fileObjects={resume}
              clearOnUnmount={clearFiles}
              //clearOnUnmount={resume?.length===0||resume?.length===null}
              showFileNames
              onChange={(e) => {
                setResume(e);
              }}
              //getPreviewIcon={handlePreviewIcon}
            ></DropzoneArea>
            <Button
              sx={{ marginTop: "20px" }}
              onClick={handleSaveResume}
              disabled={resume?.length === 0 || resume?.length === null}
            >
              Save
            </Button>
          </Stack>
          {isLoading ? (
            <div style={{ textAlign: "center" }}>
              <CircularProgress />
            </div>
          ) : (
            <DataGrid
              pageSize={pageSize}
              //onRowClick={handleRowClick}
              onPageSizeChange={(newPageSize) => setPageSize(newPageSize)}
              getRowHeight={() => "auto"}
              autoHeight={true}
              getRowId={(row) => row?.id}
              rows={resumes}
              columns={columns}
              rowsPerPageOptions={[10, 50, 100]}
              disableColumnMenu={true}
              disableSelectionOnClick
              //components={{ Toolbar: CustomToolbar }}
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

export default ResumeRepository;
