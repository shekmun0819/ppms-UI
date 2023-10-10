import {
  Stack,
  Typography,
  CircularProgress,
  Button,
  Snackbar,
  Alert,
  IconButton,
  Chip,
} from "@mui/material";
import { DataGrid, gridClasses } from "@mui/x-data-grid";
import axios from "axios";
import { useCookies } from "react-cookie";
import { useEffect, useState } from "react";
import jwt_decode from "jwt-decode";
import DescriptionIcon from "@mui/icons-material/Description";
import moment from "moment";
import { API_URL } from "../../config";
import { blue } from "@mui/material/colors";
import CapitalizeWord from '../../utils/CapitalizeWord';

function ApplicationStatus() {
  const [token, setToken] = useCookies();
  const [isLoading, setLoading] = useState(true);
  const [pageSize, setPageSize] = useState(10);
  const [practicumProject, setPracticumProject] = useState([]);
  const decoded = jwt_decode(token["Token"]);
  const [openSB, setOpenSB] = useState(false);
  const [currentAcad, setCurrentAcad] = useState("");
  const [message, setMessage] = useState({
    status: "info",
    statusText: "",
  });

  var list = [];
  const setData = (practicumProject) => {
    //response.data

    if (decoded.userInfo.roles.includes("Admin")) {
      for (var i = 0; i < practicumProject.length; i++) {
        const data = {
          studentName: CapitalizeWord(practicumProject[i].student.user.name),
          email: practicumProject[i].student.user.email,
          matricNum: practicumProject[i].student.matricNum,
          courseCode: practicumProject[i].student.courseCode,
          projectName: practicumProject[i].practicumProject?.name
            ? CapitalizeWord(practicumProject[i].practicumProject?.name)
            : "No project",
          status:
            practicumProject[i].practicumProject?.status === "Closed"
              ? "Success"
              : "Pending",
          id: practicumProject[i].student.user.id,
        };
        list = [...list, data];
      }
    } else if (decoded.userInfo.roles.includes("Student")) {
      for (i = 0; i < practicumProject.length; i++) {
        const data = {
          status: practicumProject[i].status,
          projectName: CapitalizeWord(practicumProject[i].practicumProject?.name),
          resume: practicumProject[i].resume,
          updatedAt: practicumProject[i].updatedAt,
          id: practicumProject[i].id, //application_id
        };

        list = [...list, data];
      }
    } else if (decoded.userInfo.roles.includes("Host")) {
      for (i = 0; i < practicumProject.length; i++) {
        const data = {
          studentName: CapitalizeWord(practicumProject[i].projectApplication.student?.name),
          courseCode: practicumProject[i].student.courseCode,
          matricNum: practicumProject[i].student.matricNum,
          email: practicumProject[i].projectApplication.student?.email,
          status: practicumProject[i].projectApplication.status,
          resume: practicumProject[i].projectApplication.resume,
          created: practicumProject[i].projectApplication.createdAt,
          projectName: practicumProject[i].projectApplication.practicumProject
            ?.name
            ? CapitalizeWord(practicumProject[i].projectApplication.practicumProject?.name)
            : "No project",
          id: practicumProject[i].projectApplication.id, //application_id
        };
        list = [...list, data];
      }
    }
    setPracticumProject(list);
  };

  const getColumns = () => {
    if (decoded.userInfo.roles.includes("Admin")) {
      const columns = [
        { field: "studentName", headerName: "Full Name", flex: 3 },
        { field: "email", headerName: "Email", flex: 2 },
        { field: "matricNum", headerName: "Matric No", flex: 2 },
        { field: "courseCode", headerName: "Course Code", flex: 2 },
        { field: "projectName", headerName: "Project Name", flex: 3 },
        { field: "status", headerName: "Status", flex: 2 },
      ];

      return columns;
    } else if (decoded.userInfo.roles.includes("Student")) {
      const columns = [
        { field: "projectName", headerName: "Project Name", flex: 3 },
        {
          field: "resume",
          headerName: "Resume",
          headerAlign: "center",
          align: "center",
          flex: 1,
          renderCell: (cellValues) => {
            return (
              <IconButton
                onClick={() => {
                  onViewResume(cellValues.row);
                }}
              >
                <DescriptionIcon sx={{ fontSize: "20px", color: blue[500] }} />
              </IconButton>
            );
          },
        },
        { field: "status", 
        headerName: "Status", 
        flex: 1,
        //align: "center",
        renderCell: (cellValues) => {
          if (cellValues.row.status === "Host Accepted") {
            return (
              <Stack>
                <Button
                  onClick={() => {
                    onAcceptOffer(cellValues.row);
                  }}
                >
                  Accept
                </Button>
                <Button
                  onClick={() => {
                    onRejectOffer(cellValues.row);
                  }}
                >
                  Reject
                </Button>
              </Stack>
            );

          }
          else {
            //accepted/rejected
            return (
              <Chip
                key="Accepted"
                label={
                  cellValues.row.status === "Accepted"
                    ? "Accepted"
                    : cellValues.row.status === "On hold"
                    ? "On Hold"
                    : cellValues.row.status === "Pending to review"
                    ? "Pending to review"
                    : "Rejected"
                }
                sx={{
                  marginRight: "5px",
                  marginBottom: "5px",
                  bgcolor:
                    cellValues.row.status === "Accepted"
                      ? "#388e3c"
                      : (cellValues.row.status === "On hold" || cellValues.row.status === "Pending to review")
                      ? "#FF8001"
                      : "#DB2525",
                  color: "white",
                }}
              />
            );
          }
        }
       },
        {
          field: "updatedAt",
          headerName: "Last Update",
          flex: 1,
          renderCell: (cellValues) => {
            var updatedAt = moment(cellValues.value).format(
              "DD-MMM-YYYY, hh:mm a"
            );
            return <span>{updatedAt}</span>;
          },
        },
      ];
      return columns;
    } else {
      //role = host or lecturer
      const columns = [
        {
          field: "projectName",
          headerName: "Project Name",
          flex: 3,
          headerAlign: "center",
        },
        { field: "studentName", headerName: "Full Name", flex: 3 },
        { field: "email", headerName: "Email", flex: 2, headerAlign: "center" },
        {
          field: "matricNum",
          headerName: "Matric No",
          flex: 2,
          headerAlign: "center",
        },
        {
          field: "courseCode",
          headerName: "Course Code",
          flex: 2,
          headerAlign: "center",
        },
        {
          field: "resume",
          headerName: "Resume",
          headerAlign: "center",
          align: "center",
          flex: 2,
          renderCell: (cellValues) => {
            return (
              <IconButton
                onClick={() => {
                  onViewResume(cellValues.row);
                }}
              >
                <DescriptionIcon sx={{ fontSize: "20px", color: blue[500] }} />
              </IconButton>
            );
          },
        },
        {
          field: "action",
          headerName: "Actions",
          flex: 2,
          headerAlign: "center",
          align: "center",
          renderCell: (cellValues) => {
            if (cellValues.row.status === "Pending to review") {
              return (
                <Stack>
                  <Button
                    onClick={() => {
                      onAcceptApplication(cellValues.row);
                    }}
                  >
                    Accept
                  </Button>
                  <Button
                    onClick={() => {
                      onRejectApplication(cellValues.row);
                    }}
                  >
                    Reject
                  </Button>
                </Stack>
              );
            } else {
              //accepted/rejected
              return (
                <Chip
                  key="Accepted"
                  label={
                    cellValues.row.status === "Accepted"
                      ? "Accepted"
                      : cellValues.row.status === "On hold"
                      ? "On Hold"
                      : cellValues.row.status === "Host Accepted"
                      ? "Host Accepted"
                      : "Rejected"
                  }
                  sx={{
                    marginRight: "5px",
                    marginBottom: "5px",
                    bgcolor:
                      cellValues.row.status === "Accepted"
                        ? "green"
                        : (cellValues.row.status === "On hold" || cellValues.row.status === "Host Accepted")
                        ? "#FF8001"
                        : "#DB2525",
                    color: "white",
                  }}
                />
              );
            }
          },
        },{
          field: "created",
          headerName: "Applied On",
          flex: 2,
          headerAlign: "center",
          renderCell: (cellValues) => {
            var createdAt = moment(cellValues.value).format("DD-MMM-YYYY, hh:mm a");
            return <span>{createdAt}</span>;
        }
      }
      ];
      return columns;
    }
  };

  const onViewResume = async (value) => {
    await axios
      .get( API_URL + "/api/v1/resume/download/" + value.resume.id, {
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
        link.setAttribute("download", value.resume.filename);
        document.body.appendChild(link);
        link.click();

        link.parentNode.removeChild(link);
      })
      .catch((error) => {
        console.log(error);
        setMessage({
          status: "error",
          statusText:
            "Something wrong. Unable to download " + value.resume.fileName,
        });
        setOpenSB(true);
      });
  };

  const handleCloseSB = (event, reason) => {
    if (reason === "clickaway") {
      return;
    }
    setOpenSB(false);
  };

  

  const onAcceptApplication = async (application) => {
    await axios
      .get(
         API_URL + "/api/v1/projectapplication/acceptApplication/" +
          application.id,
        {
          headers: {
            Accept: "application/json",
            Authorization: `Bearer ${token.Token}`,
          },
        }
      )
      .then((response) => {
        fetchPracticumProject();
        setMessage({
          status: "success",
          statusText:
            "The application is accepted.",
        });
        setOpenSB(true);
      })
      .catch((error) => {
        setMessage({
          status: "error",
          statusText: "Failed to accept this application.",
        });
        setOpenSB(true);
      });
  };

  const onRejectApplication = async (application) => {
    await axios
      .get(
         API_URL + "/api/v1/projectapplication/rejectApplication/" +
          application.id,
        {
          headers: {
            Accept: "application/json",
            Authorization: `Bearer ${token.Token}`,
          },
        }
      )
      .then((response) => {
        fetchPracticumProject();
        setMessage({
          status: "success",
          statusText: "The application is rejected.",
        });
        setOpenSB(true);
      })
      .catch((error) => {
        setMessage({
          status: "error",
          statusText: "Failed to reject this application.",
        });
        setOpenSB(true);
      });
  };

  const onRejectOffer = async (offer) => {
    await axios
      .get(
         API_URL + "/api/v1/projectapplication/rejectOffer/" +
          offer.id,
        {
          headers: {
            Accept: "application/json",
            Authorization: `Bearer ${token.Token}`,
          },
        }
      )
      .then((response) => {
        fetchPracticumProject();
        setMessage({
          status: "success",
          statusText: "You have rejected this offer.",
        });
        setOpenSB(true);
      })
      .catch((error) => {
        setMessage({
          status: "error",
          statusText: "Failed to reject this application. Please try again.",
        });
        setOpenSB(true);
      });
  }

  const onAcceptOffer = async (offer) =>{
    await axios
      .get(
         API_URL + "/api/v1/projectapplication/acceptOffer/" +
        offer.id,
        {
          headers: {
            Accept: "application/json",
            Authorization: `Bearer ${token.Token}`,
          },
        }
      )
      .then((response) => {
        fetchPracticumProject();
        setMessage({
          status: "success",
          statusText:
            "You have accepted the offer. Congratulations",
        });
        setOpenSB(true);
      })
      .catch((error) => {
        setMessage({
          status: "error",
          statusText: "Failed to accept this offer. Please try again",
        });
        setOpenSB(true);
      });
  }

  const fetchPracticumProject = async () => {
    if (decoded.userInfo.roles.includes("Admin")) {
      await axios
        .get(
           API_URL + "/api/v1/student/getAllStudentAndPracticumProject",
          {
            headers: {
              Accept: "application/json",
              Authorization: `Bearer ${token.Token}`,
            },
          }
        )
        .then((response) => {
          setData(response.data);
          setLoading(false);
          
        })
        .catch((error) => console.log(error));
    } else if (decoded.userInfo.roles.includes("Student")) {
      await axios
        .get(
           API_URL + "/api/v1/projectapplication/getByStudentId/" +
            decoded.userInfo.id,
          {
            headers: {
              Accept: "application/json",
              Authorization: `Bearer ${token.Token}`,
            },
          }
        )
        .then((response) => {
          setData(response.data);
          setLoading(false);
        })
        .catch((error) => console.log(error));
    } else {
      await axios
        .get(
           API_URL + "/api/v1/projectapplication/getByHostId/" +
            decoded.userInfo.id,
          {
            headers: {
              Accept: "application/json",
              Authorization: `Bearer ${token.Token}`,
            },
          }
        )
        .then((response) => {
          setData(response.data);
          setLoading(false);
        })
        .catch((error) => console.log(error));
    }
  };

  useEffect(() => {
    fetchPracticumProject();
    fetchAcademicSessions()
  }, []);

  const fetchAcademicSessions = async () => {
    await axios
      .get( API_URL + "/api/v1/academic-session/getAll", {
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${token.Token}`,
        },
      })
      .then((response) => {
        var data = response.data;
        var activeAcad = data.filter((x) => x.active === true);
        var str =
          activeAcad[0].academicSession +
          ", " +
          "Semester " +
          activeAcad[0].semester.toString();
        setCurrentAcad(str);
        setLoading(false);
      })
      .catch((error) => console.log(error));
  };

  return (
    <div className="main-content-container p-4 container-fluid">
      <h3>Application Status</h3>
      {decoded.userInfo.roles.includes("Admin") && <h5>Current Academic Session: {currentAcad}</h5>}
      <div style={{paddingTop:"20px"}}></div>
      <div
        style={{
          backgroundColor: "white",
          padding: "20px",
          borderRadius: "5px",
        }}
      >
        <Stack direction="row" alignItems="center" gap={1}>
          {(decoded.userInfo.roles.includes("Host") ||
            decoded.userInfo.roles === "Admin" ||
            decoded.userInfo.roles === "Lecturer") && (
            <Typography
              variant="h5"
              sx={{ fontWeight: "bold", paddingLeft: "5px" }}
            >
              List of Students
            </Typography>
          )}
          {decoded.userInfo.roles.includes("Student") && (
            <Typography
              variant="h5"
              sx={{ fontWeight: "bold", paddingLeft: "5px" }}
            >
              List of Application Status
            </Typography>
          )}
        </Stack>
        {isLoading && list != null ? (
          <div style={{ textAlign: "center" }}>
            <CircularProgress />
          </div>
        ) : (
          <DataGrid
            pageSize={pageSize}
            key={practicumProject?.id}
            onPageSizeChange={(newPageSize) => setPageSize(newPageSize)}
            getRowHeight={() => "auto"}
            autoHeight={true}
            getRowId={(row) => row?.id}
            rows={practicumProject}
            columns={getColumns()}
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
                overflow: "visible !important",
                fontSize: "16px",
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
        <Snackbar open={openSB} autoHideDuration={6000} onClose={handleCloseSB}>
          <Alert
            onClose={handleCloseSB}
            severity={message.status}
            sx={{ width: "100%" }}
          >
            {message.statusText}
          </Alert>
        </Snackbar>
      </div>
    </div>
  );
}

export default ApplicationStatus;
