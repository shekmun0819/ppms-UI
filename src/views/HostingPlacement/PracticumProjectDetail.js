import {
  CardMedia,
  Typography,
  Button,
  Grid,
  Box,
  Stack,
  IconButton,
  Snackbar,
  Alert,
  CircularProgress,
  Dialog,
  DialogContent,
  DialogContentText,
  DialogActions,
  Card,
} from "@mui/material";
import axios from "axios";
import { useCookies } from "react-cookie";
import { useEffect, useState } from "react";
import dummyImage from "../../assets/images/The-Role-of-Marketing-1.jpg";
import { useHistory } from "react-router-dom";
import ArrowBackIosNewIcon from "@mui/icons-material/ArrowBackIosNew";
import jwt_decode from "jwt-decode";
import DownloadIcon from "@mui/icons-material/Download";
import { DataGrid, gridClasses } from "@mui/x-data-grid";
import moment from "moment";
import { API_URL } from "../../config";
import CapitalizeWord from '../../utils/CapitalizeWord';

const style = {
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: { xs: 300, sm: 400, md: 700 },
  backgroundColor: "background.paper",
  border: "1px solid #000",
  boxShadow: 24,
  p: 4,
};

function PracticumProjectDetail(props) {
  let history = useHistory();
  const [token, setToken] = useCookies();
  const [projectName, setProjectName] = useState("");
  const [projectDescription, setProjectDescription] = useState("");
  const [categories, setCategories] = useState("");
  const [adminDescription, setAdminDescription] = useState("");
  const [ndaFileName, setNdaFileName] = useState("");
  const [ndaAgreeemnt, setNdaAgreement] = useState(null);
  const [companyName, setCompanyName] = useState("");
  const [imageData, setImageData] = useState();
  const [courseName, setCourseName] = useState("");
  const [openSB, setOpenSB] = useState(false);
  const [hostId, setHostId] = useState();
  const [disabledButton, setDisabledButton] = useState(false);
  const decoded = jwt_decode(token["Token"]);
  const [isLoading, setLoading] = useState(true);
  const [openApplyDialog, setOpenApplyDialog] = useState(false);
  const [resumes, setResumes] = useState([]);
  const [selectedResumeId, setSelectedResumeId] = useState(null);
  const [recommend, setRecommend] = useState([]);

  const [message, setMessage] = useState({
    status: "info",
    statusText: "",
  });

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
  ];

  const handleNdaDownload = async () => {
    await axios
      .get(API_URL + "/api/v1/practicumProjects/download/" + props.match.params.id, {
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
        link.setAttribute("download", ndaFileName);
        document.body.appendChild(link);
        link.click();

        link.parentNode.removeChild(link);
      })
      .catch((error) => console.log(error));
  };

  const checkApplication = async () => {
    // const data = new FormData();
    // data.append("student_id", jwt_decode(token["Token"]).userInfo.id);
    // data.append("project_id", props.match.params.id);
    const data = {
      student_id: jwt_decode(token["Token"]).userInfo.id,
      project_id: props.match.params.id,
    };
    await axios
      //.get( API_URL + "/api/v1/projectapplication/check", data, {
      .get(
         API_URL + "/api/v1/projectapplication/check/" +
          jwt_decode(token["Token"]).userInfo.id +
          "/" +
          props.match.params.id,
        {
          headers: {
            Accept: "application/json",
            Authorization: `Bearer ${token.Token}`,
          },
        }
      )
      .then((response) => {
        if (response.data.toString() === "true") {
          //apply before
          setDisabledButton(true);
        } else setDisabledButton(false);
      })
      .catch((error) => console.log(error));
  };

  const fetchResume = async () => {
    const userId = decoded.userInfo.id;
    await axios
      .get( API_URL + "/api/v1/resume/getAllByStudentId/" + userId, {
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
  };

  var resumeList = [];
  const setColumnData = (list) => {
    for (var i = 0; i < list.length; i++) {
      const data = {
        id: list[i].id,
        resumeName: list[i].filename,
        updatedAt: list[i].updatedAt,
      };
      resumeList = [...resumeList, data];
    }
    setResumes(resumeList);
  };

  const fetchPracticumProject = async () => {
    await axios
      .get(
         API_URL + "/api/v1/practicumProjects/" +
          props.match.params.id,
        {
          headers: {
    
            Accept: "application/json",
            Authorization: `Bearer ${token.Token}`,
          },
        }
      )
      .then((response) => {
        console.log(response)
        setHostId(response.data.practicumProject.host.id);
        setProjectName(CapitalizeWord(response.data.practicumProject.name));
        setProjectDescription(response.data.practicumProject.description);
        setCategories(response.data.practicumProject.categories);
        setCompanyName(CapitalizeWord(response.data.host?.company.companyName));
        setCourseName(CapitalizeWord(response.data.practicumProject.courseName));
        setNdaAgreement(response.data.practicumProject.ndaData);
        setNdaFileName(response.data.practicumProject.ndaName);
        setAdminDescription(response.data.practicumProject.adminDescription);
        setImageData(response.data.practicumProject.imageData);
        setLoading(false);
      })
      .catch((error) => console.log(error));
  };

  const fetchProjectApplication = async () => {
    let data = {
      practicumProject: { id: props.match.params.id },
      student: { id: jwt_decode(token["Token"]).userInfo.id },
      status: "Pending to review",
      resume: { id: selectedResumeId },
    };
    await axios
      .post(
         API_URL + "/api/v1/projectapplication/addprojectapplication",
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
        console.log(response);
        checkApplication();
        setMessage({
          status: "success",
          statusText: "Apply successfully. ",
        });
        setOpenSB(true);
        handleCloseApplyDialog();
      })
      .catch((error) => {
        console.log(error);
        if (selectedResumeId === null || selectedResumeId === "") {
          setMessage({
            status: "error",
            statusText: "Kindly select a resume to apply.",
          });
        } else {
          setMessage({
            status: "error",
            statusText: "Failed to apply. Please try again",
          });
        }

        setOpenSB(true);
      });
  };

  const fetchRecommendation = async () => {
    console.log(jwt_decode(token["Token"]).userInfo.id);
    await axios
      .get(
        API_URL + "/api/v1/practicumProjects/getRecommendation/" +
          props.match.params.id,
        {
          headers: {
            Accept: "application/json",
            Authorization: `Bearer ${token.Token}`,
          },
        }
      )
      .then((response) => {
        console.log("recommendation");
        console.log(response.data);
        setRecommend(response.data);
      })
      .catch((error) => console.log(error));
  };

  const onDetail = (practicumProject) => {
    history.push(`/practicumprojectdetail/${practicumProject.id}`);
    window.location.reload();
  };

  const checkStudent = async () => {
    console.log(jwt_decode(token["Token"]).userInfo.id);
    await axios
      .get(
         API_URL + "/api/v1/practicumProjects/checkStudent/" +
          jwt_decode(token["Token"]).userInfo.id,
        {
          headers: {
            Accept: "application/json",
            Authorization: `Bearer ${token.Token}`,
          },
        }
      )
      .then((response) => {
        if (response.data.toString() === "true") {
          //apply before
          setDisabledButton(true);
        } else setDisabledButton(false);
      })
      .catch((error) => console.log(error));
  };

  const handleOpenApplyDialog = () => {
    fetchResume();
    setOpenApplyDialog(true);
  };

  const handleCloseApplyDialog = () => {
    console.log("here")
    setSelectedResumeId(null);
    setOpenApplyDialog(false);
  };

  const onBack = () => {
    history.goBack();
  };

  const handleCloseSB = (event, reason) => {
    if (reason === "clickaway") {
      return;
    }
    setOpenSB(false);
  };

  useEffect(() => {
    if(decoded.userInfo.roles.includes("Student")){
      console.log("here")
      fetchRecommendation();
    }
    fetchPracticumProject();
    
    checkApplication();
    checkStudent();
  }, []);

  return (
    <div className="main-content-container p-4 container-fluid">
      <h3 style={{ marginBottom: "20px" }}>Projects</h3>
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
            Practicum Project Detail
          </Typography>
        </Stack>
        <div style={{ marginLeft: "10%", marginRight: "10%" }}>
          {isLoading ? (
            <div style={{ textAlign: "center" }}>
              <CircularProgress />
            </div>
          ) : (
            <CardMedia
              image={`data:image/webp;base64,${imageData}`}
              sx={{
                //marginLeft: 27,
                //marginRight: 20,
                //position: "relative",
                height: 350,
                //overflow: "hidden",
                borderRadius: 2,
                filter: "brightness(1)",
                mt: 4,
                //maxWidth: 1000,
              }}
            ></CardMedia>
          )}

          <Stack
            direction="column"
            //sx={{ marginLeft: "20%", marginRight: "18%" }}
          >
            <Typography
              variant="h4"
              gutterBottom
              sx={{
                paddingTop: 2,
                fontWeight: 600,
              }}
            >
              {projectName}
            </Typography>
            <Typography
              variant="h6"
              gutterBottom
              sx={{
                paddingTop: 1,
                fontWeight: 600,
              }}
            >
              Company:
            </Typography>
            <Typography
              variant="h6"
              gutterBottom
              sx={{
                fontWeight: 400,
              }}
            >
              {companyName}
            </Typography>
            <Typography
              variant="h6"
              gutterBottom
              sx={{
                alignContent: "center",
                paddingTop: 2,
                //paddingRight:50,
                fontWeight: 600,
              }}
            >
              Categories:
            </Typography>
            <Typography
              variant="h6"
              gutterBottom
              sx={{
                alignContent: "center",
                fontWeight: 400,
              }}
            >
              {categories}
            </Typography>
            <Typography
              variant="h6"
              gutterBottom
              sx={{
                alignContent: "center",
                paddingTop: 2,
                //paddingRight:50,
                fontWeight: 600,
              }}
            >
              Type:
            </Typography>
            <Typography
              variant="h6"
              gutterBottom
              sx={{
                alignContent: "center",
                fontWeight: 400,
              }}
            >
              {courseName}
            </Typography>
            <Typography
              variant="h6"
              gutterBottom
              textAlign="justify"
              sx={{
                alignContent: "center",
                paddingTop: 2,
                fontWeight: 600,
              }}
            >
              Description:
            </Typography>
            <Typography
              variant="h6"
              gutterBottom
              textAlign="justify"
              sx={{
                alignContent: "center",
                fontWeight: 400,
              }}
            >
              {projectDescription}
            </Typography>

            {(decoded.userInfo.roles.includes("Host") ||
              decoded.userInfo.roles.includes("Admin")) && (
              <Stack>
                <Typography
                  align="justify"
                  variant="h6"
                  gutterBottom
                  sx={{
                    paddingTop: 2,
                    fontWeight: 600,
                  }}
                >
                  Addtional Description:
                </Typography>
                <Typography
                  align="justify"
                  variant="h6"
                  gutterBottom
                  sx={{
                    fontWeight: 400,
                    //marginBottom: 5,
                  }}
                >
                  {adminDescription}
                </Typography>

                {ndaAgreeemnt !== null && (
                  <Typography
                    align="justify"
                    variant="h6"
                    gutterBottom
                    sx={{
                      paddingTop: 2,
                      fontWeight: 600,
                    }}
                  >
                    NDA agreement:
                  </Typography>
                )}
                {ndaAgreeemnt !== null && (
                  <Stack direction="row">
                    <Typography
                      align="justify"
                      variant="h6"
                      gutterBottom
                      sx={{
                        fontWeight: 400,
                        //marginBottom: 5,
                      }}
                    >
                      {ndaFileName}
                    </Typography>
                    <IconButton
                      onClick={() => {
                        handleNdaDownload();
                      }}
                    >
                      <DownloadIcon
                        sx={{ fontSize: "30px", marginTop: "-5px" }}
                      />
                    </IconButton>
                  </Stack>
                )}
              </Stack>
            )}
            <Stack paddingTop="30px">
              {decoded.userInfo.roles.includes("Student") && (
                <Button
                  sx={{
                    //alignContent: "center",
                    //alignItems: "center",
                    borderRadius: 2,
                    marginRight: "auto",
                    width: 0.2,
                  }}
                  disabled={disabledButton}
                  textAlign="center"
                  variant="contained"
                  size="medium"
                  onClick={handleOpenApplyDialog}
                >
                  Apply
                </Button>
              )}
            </Stack>
          </Stack>
          {(decoded.userInfo.roles.includes("Student") && recommend.length > 0) && <><Typography
            variant="h5"
            sx={{
              marginTop: "60px",
              marginBottom: "30px",
              fontWeight: 600,
            }}
          >
            Similar Project That You May Like It:
          </Typography><Grid container spacing={3}>
              {recommend?.map((item, i) => (
                <Grid item xs={3} sm={4} key={i} sx={{ marginBottom: "-150px" }}>
                  <Box
                    onClick={() => {
                      onDetail(recommend[i]);
                    } }
                    component={Card}
                    padding={3}
                    width={1}
                    height={0.6}
                    sx={{
                      boxShadow: 15,
                      borderRadius: 5,
                      bgcolor: recommend[i].status === "Closed" ? "#afafaf" : "#f8f8fa",
                      "&:hover": {
                        bgcolor: "#C5CAE9",
                        color: "#212121",
                      },
                    }}
                  >
                    <Box display="flex" flexDirection="column">
                      <Typography
                        variant="h6"
                        noWrap
                        sx={{
                          fontWeight: 600,
                        }}
                      >
                        {recommend[i].name}
                      </Typography>
                      <Typography noWrap color="inherit">
                        {recommend[i].description}
                      </Typography>
                    </Box>
                    <Box display="block" width={1} height={0.8}>
                      <Card
                        sx={{
                          width: 1,
                          height: 1,
                          display: "flex",
                          flexDirection: "column",
                          boxShadow: "none",
                          bgcolor: "transparent",
                          backgroundImage: "none",
                        }}
                      >
                        <CardMedia
                          title="image"
                          component="img"
                          image={`data:image/webp;base64,${recommend[i].imageData}`}
                          sx={{
                            position: "relative",
                            height: 320,
                            overflow: "hidden",
                            borderRadius: 2,
                            filter: "brightness(1)",
                            mt: 4,
                          }}
                        ></CardMedia>
                      </Card>
                    </Box>
                  </Box>
                </Grid>
              ))}
            </Grid></>}
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
        PaperProps={{ sx: { width: "50%" } }}
        open={openApplyDialog}
        onClose={handleCloseApplyDialog}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        {/* <DialogTitle id="alert-dialog-title">{"Confirmation"}</DialogTitle> */}
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            Kindly select resume to attach.
            <DataGrid
              getRowHeight={() => "auto"}
              autoHeight={true}
              //rowHeight={25}
              onRowClick={(e) => setSelectedResumeId(e.id)}
              getRowId={(row) => row?.id}
              rows={resumes}
              columns={columns}
              disableColumnMenu={true}
              hideFooterPagination={true}
              //disableSelectionOnClick
              sx={{
                ".MuiDataGrid-columnHeaderTitle": {
                  fontWeight: "bold !important",
                  overflow: "hidden !important",
                  fontSize: "16px",
                  textOverflow: "ellipsis",
                },
                "&.MuiDataGrid-root--densityStandard .MuiDataGrid-cell": {
                  py: "15px",
                },
                // [`& .${gridClasses.cell}`]: {
                //   py: 2,
                // },
                // ".MuiTablePagination-displayedRows": {
                //   marginTop: "1em",
                //   marginBottom: "1em",
                // },
                // ".MuiTablePagination-displayedRows, .MuiTablePagination-selectLabel":
                //   {
                //     marginTop: "1em",
                //     marginBottom: "1em",
                //   },
                border: "none",
              }}
            />
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseApplyDialog}>Cancel</Button>
          <Button onClick={fetchProjectApplication} autoFocus>
            Confirm
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}

export default PracticumProjectDetail;
