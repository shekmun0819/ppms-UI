import { React, useState, useEffect } from "react";
import IconButton from "@mui/material/IconButton";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import Box from "@mui/material/Box";
import TextField from "@mui/material/TextField";
import { useHistory, useParams } from "react-router-dom";
import ArrowBackIosNewIcon from "@mui/icons-material/ArrowBackIosNew";
import InputLabel from "@mui/material/InputLabel";
import FormGroup from "@mui/material/FormGroup";
import FormControlLabel from "@mui/material/FormControlLabel";
import Checkbox from "@mui/material/Checkbox";
import axios from "axios";
import Snackbar from "@mui/material/Snackbar";
import Alert from "@mui/material/Alert";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogTitle from "@mui/material/DialogTitle";
import Stack from "@mui/material/Stack";
import CapitalizeWord from "../../../utils/CapitalizeWord";
import { useCookies } from "react-cookie";
import { API_URL } from "../../../config";

function Edit() {
  let history = useHistory();
  const { id } = useParams();

  const [token, setToken] = useCookies();
  const [academicSession, setAcademicSession] = useState("");
  const [course, setCourse] = useState("");
  const [title, setTitle] = useState("");
  const [projectDesc, setProjectDesc] = useState("");
  const [student, setStudent] = useState("");
  const [matricNo, setMatricNo] = useState("");
  const [nda, setNda] = useState("");
  const [publish, setPublish] = useState("");

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

  const onBack = () => {
    history.goBack();
  };

  const handleCheckbox = (event) => {
    setPublish(event.target.checked);
  };

  const fetchReport = async () => {
    await axios
      .get(API_URL + `/api/v1/report/student/${id}`, {
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${token.Token}`,
        },
      })
      .then((response) => {
        var acadSession =
          response.data.report.project.academicSession.academicSession.concat(
            ", Semester ",
            response.data.report.project.academicSession.semester
          );

        setAcademicSession(acadSession);
        setCourse(response.data.student.courseCode);
        setTitle(response.data.report.project.name);
        setProjectDesc(response.data.report.project.description);
        setStudent(response.data.report.user.name);
        setMatricNo(response.data.student.matricNum);
        setNda(response.data.report.project.nda);
        setPublish(response.data.report.published);
      })
      .catch((error) => console.log(error));
  };

  const onEdit = async () => {
    let formData = new FormData();
    formData.append("id", id);
    formData.append("published", publish);

    await axios
      .put(API_URL + "/api/v1/report/updatePublishStatus", formData, {
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          Authorization: `Bearer ${token.Token}`,
        },
      })
      .then((response) => {
        setMessage({
          status: "success",
          statusText: "Report details updated successfully.",
        });
        setOpenSB(true);
        handleCloseConfirmBox();
      })
      .catch((error) => {
        console.log(error);
        setMessage({
          status: "error",
          statusText: "Failed to update report details.",
        });
        setOpenSB(true);
        handleCloseConfirmBox();
      });
  };

  useEffect(() => {
    fetchReport();
  }, []);

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
          <Stack direction="row" alignItems="center">
            <IconButton
              sx={{ paddingLeft: "0", color: "black" }}
              onClick={onBack}
            >
              <ArrowBackIosNewIcon sx={{ fontSize: "25px" }} />
            </IconButton>
            <Typography variant="h5" sx={{ fontWeight: "bold" }}>
              Edit Report
            </Typography>
          </Stack>
          <Box
            sx={{
              my: 3,
              mx: 4,
            }}
          >
            <InputLabel>Academic Session</InputLabel>
            <TextField
              fullWidth
              id="academicSession"
              type="text"
              value={academicSession == null ? "" : academicSession}
              sx={{ marginBottom: "20px" }}
              multiline
              disabled
            />
            <InputLabel>Course Code</InputLabel>
            <TextField
              fullWidth
              id="course"
              type="text"
              value={course == null ? "" : course}
              sx={{ marginBottom: "20px" }}
              multiline
              disabled
            />
            <InputLabel>Project Title</InputLabel>
            <TextField
              fullWidth
              id="project"
              type="text"
              value={title == null ? "" : CapitalizeWord(title)}
              sx={{ marginBottom: "20px" }}
              multiline
              disabled
            />
            <InputLabel>Project Description</InputLabel>
            <TextField
              fullWidth
              id="projectDesc"
              type="text"
              value={projectDesc == null ? "" : projectDesc}
              sx={{ marginBottom: "20px" }}
              multiline
              disabled
            />
            <InputLabel>Student Name</InputLabel>
            <TextField
              fullWidth
              id="student"
              type="text"
              value={student == null ? "" : CapitalizeWord(student)}
              sx={{ marginBottom: "20px" }}
              disabled
            />
            <InputLabel>Matric No.</InputLabel>
            <TextField
              fullWidth
              id="student"
              type="text"
              value={matricNo == null ? "" : matricNo}
              sx={{ marginBottom: "20px" }}
              disabled
            />
            <InputLabel>Confidentiality</InputLabel>
            <TextField
              fullWidth
              id="nda"
              type="text"
              value={nda === true ? "NDA" : "Non-NDA"}
              sx={{ marginBottom: "20px" }}
              disabled
            />
            <FormGroup>
              <FormControlLabel
                control={<Checkbox />}
                label="Publish"
                checked={publish}
                onChange={handleCheckbox}
                disabled={nda}
              />
            </FormGroup>
            <Button
              variant="contained"
              sx={{ mt: 3, mb: 2 }}
              onClick={() => {
                handleOpenConfirmBox();
              }}
              disabled={
                message.status === "success" || nda === true ? true : false
              }
            >
              Update
            </Button>
            <Button
              variant="outlined"
              sx={{ mt: 3, mb: 2, mx: 2 }}
              onClick={onBack}
            >
              Close
            </Button>
          </Box>
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
            Are you sure to {publish ? "publish" : "unpublish"} this report?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseConfirmBox}>No</Button>
          <Button onClick={onEdit} autoFocus>
            Yes
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}

export default Edit;
