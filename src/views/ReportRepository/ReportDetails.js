import { React, useState, useEffect } from "react";
import IconButton from "@mui/material/IconButton";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import Box from "@mui/material/Box";
import Snackbar from "@mui/material/Snackbar";
import Alert from "@mui/material/Alert";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogTitle from "@mui/material/DialogTitle";
import { useHistory, useParams } from "react-router-dom";
import ArrowBackIosNewIcon from "@mui/icons-material/ArrowBackIosNew";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import Divider from "@mui/material/Divider";
import ListItemText from "@mui/material/ListItemText";
import Stack from "@mui/material/Stack";
import Grid from "@mui/material/Grid";
import Chip from "@mui/material/Chip";
import axios from "axios";
import jwt_decode from "jwt-decode";
import { useCookies } from "react-cookie";
import { API_URL } from "../../config";

function ReportDetails(props) {
  let history = useHistory();

  const [reportId, setReportId] = useState("");
  const [fileName, setFileName] = useState("");
  const [courseCode, setCourseCode] = useState("");
  const [title, setTitle] = useState("");
  const [author, setAuthor] = useState("");
  const [academicSession, setAcademicSession] = useState("");
  const [categories, setCategories] = useState([]);
  const [token, setToken] = useCookies();
  const [sentRequest, setSentRequest] = useState(false);
  const [userInfo, setUserInfo] = useState({
    email: "",
    name: "",
    roles: "",
    userId: "",
  });

  const onBack = () => {
    history.goBack();
  };

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

  const capitalizeWords = (str) => {
    return str
      .toLowerCase()
      .split(" ")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  const listItems = [
    {
      header: "Course Code:",
      value: courseCode,
    },
    {
      header: "Title:",
      value: capitalizeWords(title),
    },
    {
      header: "Author:",
      value: capitalizeWords(author),
    },
    {
      header: "Academic Session:",
      value: academicSession,
    },
    {
      header: "Category:",
      value: categories,
    },
  ];

  const fetchReport = async () => {
    await axios
      .get(API_URL + "/api/v1/report/student/" + props.match.params.id, {
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${token.Token}`,
        },
      })
      .then((response) => {
        var projectCat = [];
        var acadSession =
          response.data.report.project.academicSession.academicSession.concat(
            ", Semester ",
            response.data.report.project.academicSession.semester
          );
        setReportId(response.data.report.id);
        setFileName(response.data.report.fileName);
        setCourseCode(response.data.student.courseCode);
        setTitle(response.data.report.project.name);
        setAuthor(response.data.report.user.name);
        setAcademicSession(acadSession);
        projectCat = response.data.report.project.categories.split(",");
        setCategories(projectCat);
      })
      .catch((error) => console.log(error));
  };

  const handleDownload = async () => {
    await axios
      .get(API_URL + "/api/v1/report/download/" + reportId, {
        responseType: "blob",
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${token.Token}`,
        },
      })
      .then((response) => {
        const url = window.URL.createObjectURL(response.data);
        const link = document.createElement("a");
        link.href = url;
        link.setAttribute("title", fileName);
        link.target = "_blank";
        link.rel = "noopener noreferrer";
        link.click();

        link.parentNode.removeChild(link);
      })
      .catch((error) => console.log(error));
  };

  const handleRequest = async () => {
    let data = new FormData();

    data.append("reportId", reportId);
    data.append("userId", userInfo.userId);

    await axios
      .post(API_URL + "/api/v1/report-access/create", data, {
        headers: {
          Accept: "application/json",
          "Content-Type": "form-data",
          Authorization: `Bearer ${token.Token}`,
        },
      })
      .then((response) => {
        setMessage({
          status: "success",
          statusText: "Request has been sent.",
        });
        setSentRequest(true);
        setOpenSB(true);
        handleCloseConfirmBox();
      })
      .catch((error) => {
        console.log(error);
        setMessage({
          status: "error",
          statusText: "Failed to send request.",
        });
        setOpenSB(true);
        handleCloseConfirmBox();
      });
  };

  useEffect(() => {
    fetchReport();
  }, []);

  useEffect(() => {
    const decoded = jwt_decode(token["Token"]);
    setUserInfo({
      email: decoded.userInfo.email,
      name: decoded.userInfo.name,
      roles: decoded.userInfo.roles,
      userId: decoded.userInfo.id,
    });
  }, [token]);

  return (
    <>
      <div className="main-content-container p-4 container-fluid">
        <h3 style={{ marginBottom: "20px" }}>Report Repository</h3>
        <div
          style={{
            backgroundColor: "white",
            padding: "20px",
            borderRadius: "5px",
          }}
        >
          <Stack direction="row" alignItems="center">
            <IconButton
              sx={{ paddingLeft: "0", color: "black" }}
              onClick={onBack}
            >
              <ArrowBackIosNewIcon sx={{ fontSize: "25px" }} />
            </IconButton>
            <Typography variant="h5" sx={{ fontWeight: "bold" }}>
              Report Details
            </Typography>
          </Stack>
          <Box
            sx={{
              my: 3,
              mx: 4,
            }}
          ></Box>
          <Grid container>
            <List sx={{ width: "100%" }}>
              {listItems.map((item, index) => {
                if (item.header !== "Category:") {
                  return (
                    <ListItem alignItems="flex-start" divider>
                      <Grid xs={3}>
                        <ListItemText primary={item.header} />
                      </Grid>
                      <Grid xs={9}>
                        <ListItemText primary={item.value} />
                      </Grid>
                      <Divider />
                    </ListItem>
                  );
                } else {
                  return (
                    <ListItem alignItems="flex-start" divider>
                      <Grid xs={3}>
                        <ListItemText primary={item.header} />
                      </Grid>
                      <Grid xs={9}>
                        {categories.map((item, index) => (
                          <Chip
                            key={item}
                            label={item}
                            sx={{ marginRight: "5px" }}
                          />
                        ))}
                      </Grid>
                      <Divider />
                    </ListItem>
                  );
                }
              })}
            </List>
          </Grid>
          {userInfo.roles.includes("Admin") ? (
            <Button
              variant="contained"
              sx={{ mt: 3, mb: 2, display: "flex", alignItem: "center" }}
              onClick={handleDownload}
            >
              View Full Report
            </Button>
          ) : (
            <Button
              variant="contained"
              sx={{ mt: 3, mb: 2, display: "flex", alignItem: "center" }}
              onClick={handleOpenConfirmBox}
              disabled={sentRequest}
            >
              Request full report
            </Button>
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
            Are you sure you want to request this report?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseConfirmBox}>No</Button>
          <Button onClick={handleRequest} autoFocus>
            Yes
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}

export default ReportDetails;
