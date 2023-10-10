import { React, useState } from "react";
import IconButton from "@mui/material/IconButton";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import Box from "@mui/material/Box";
import TextField from "@mui/material/TextField";
import { useHistory } from "react-router-dom";
import ArrowBackIosNewIcon from "@mui/icons-material/ArrowBackIosNew";
import InputLabel from "@mui/material/InputLabel";
import MenuItem from "@mui/material/MenuItem";
import Select from "@mui/material/Select";
import axios from "axios";
import Snackbar from "@mui/material/Snackbar";
import Alert from "@mui/material/Alert";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogTitle from "@mui/material/DialogTitle";
import Stack from "@mui/material/Stack";
import { useEffect } from "react";
import { useCookies } from "react-cookie";
import { FormControl } from "@mui/material";
import { API_URL } from "../../config";
import CapitalizeWord from "../../utils/CapitalizeWord";

const ITEM_HEIGHT = 48;
const MenuProps = {
  PaperProps: {
    style: {
      maxHeight: ITEM_HEIGHT * 4.5,
      width: 250,
    },
  },
};

function Edit(props) {
  let history = useHistory();
  const [token, setToken] = useCookies();

  const [projectId, setProjectId] = useState("");
  const [academicSession, setAcademicSession] = useState("");
  const [title, setTitle] = useState("");
  const [student, setStudent] = useState("");
  const [matricNo, setMatricNo] = useState("");
  const [host, setHost] = useState("");
  const [supervisorId, setSupervisorId] = useState("");
  const [examinerId, setExaminerId] = useState("");
  const [panelId, setPanelId] = useState("");
  const [chairId, setChairId] = useState("");
  const [lecturers, setLecturers] = useState([]);
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

  const onBack = () => {
    history.goBack();
  };

  const handleSupervisorChange = (event) => {
    setSupervisorId(event.target.value);
  };

  const handleExaminerChange = (event) => {
    setExaminerId(event.target.value);
  };

  const handlePanelChange = (event) => {
    setPanelId(event.target.value);
  };

  const handleChairChange = (event) => {
    setChairId(event.target.value);
  };

  // const findStudentDetails = () => {
  //   var foundStudent = "";
  //   foundStudent = students.find((stu) => stu.user.id === stuId);

  //   setMatricNo(foundStudent.matricNum);
  // };

  const fetchAssessor = async () => {
    await axios
      .get(
        API_URL +
          `/api/v1/practicumProjects/projectId=${props.match.params.id}`,
        {
          headers: {
            Accept: "application/json",
            Authorization: `Bearer ${token.Token}`,
          },
        }
      )
      .then((response) => {
        var acadSession =
          response.data.practicumProject.academicSession.academicSession.concat(
            ", Semester ",
            response.data.practicumProject.academicSession.semester
          );
        setProjectId(response.data.practicumProject.id);
        setAcademicSession(acadSession);
        setTitle(response.data.practicumProject.name);
        setStudent(response.data.practicumProject.student.name);
        setMatricNo(response.data.student.matricNum);
        setHost(response.data.practicumProject.host.name);
        response.data.practicumProject.supervisor
          ? setSupervisorId(response.data.practicumProject.supervisor.id)
          : setSupervisorId(0);
        response.data.practicumProject.examiner
          ? setExaminerId(response.data.practicumProject.examiner.id)
          : setExaminerId(0);
        response.data.practicumProject.panel
          ? setPanelId(response.data.practicumProject.panel.id)
          : setPanelId(0);
        response.data.practicumProject.chair
          ? setChairId(response.data.practicumProject.chair.id)
          : setChairId(0);
      })
      .catch((error) => console.log(error));
  };

  const fetchLecturers = async () => {
    await axios
      .get(API_URL + "/api/v1/user/getAll", {
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${token.Token}`,
        },
      })
      .then((response) => {
        var data = response.data;
        setLecturers(data);
      })
      .catch((error) => {
        console.log(error);
      });
  };

  // const fetchStudents = async () => {
  //   await axios
  //     .get(`http://localhost:8090/api/v1/student/getDetails/userId=${stuId}`, {
  //       headers: {
  //         Accept: "application/json",
  //         Authorization: `Bearer ${token.Token}`,
  //       },
  //     })
  //     .then((response) => {
  //       var data = response.data;
  //       setMatricNo(data.matricNum);
  //     })
  //     .catch((error) => {
  //       setMatricNo("");
  //       console.log(error);
  //     });
  // };

  const onEdit = async () => {
    await axios
      .put(
        API_URL +
          `/api/v1/practicumProjects/updateAssessor/${projectId}/supervisorId=${supervisorId}&examinerId=${examinerId}&panelId=${panelId}&chairId=${chairId}`,
        "",
        {
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
            Authorization: `Bearer ${token.Token}`,
          },
        }
      )
      .then((response) => {
        setMessage({
          status: "success",
          statusText: "Assessor(s) is successfully updated.",
        });
        setOpenSB(true);
        fetchAssessor();
        handleCloseConfirmBox();
      })
      .catch((error) => {
        console.log(error);
        setMessage({
          status: "error",
          statusText: "Failed to update assessor.",
        });
        setOpenSB(true);
        handleCloseConfirmBox();
      });
  };

  const handleCloseSB = (event, reason) => {
    if (reason === "clickaway") {
      return;
    }
    setOpenSB(false);
  };

  useEffect(() => {
    fetchAssessor();
    fetchLecturers();
  }, []);

  return (
    <>
      <div className="main-content-container p-4 container-fluid">
        <h3 style={{ marginBottom: "20px" }}>Assessor Management</h3>
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
              Edit Assessor
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
              id="acadSession"
              type="text"
              value={academicSession == null ? "" : academicSession}
              disabled
              sx={{ marginBottom: "20px" }}
              InputProps={{
                readOnly: true,
              }}
            />
            <InputLabel>Project Title</InputLabel>
            <TextField
              fullWidth
              id="project"
              type="text"
              value={title == null ? "" : CapitalizeWord(title)}
              disabled
              sx={{ marginBottom: "20px" }}
              multiline
              InputProps={{
                readOnly: true,
              }}
            />
            <InputLabel>Student Name</InputLabel>
            <TextField
              fullWidth
              id="student"
              type="text"
              value={student == null ? "" : CapitalizeWord(student)}
              disabled
              sx={{ marginBottom: "20px" }}
              InputProps={{
                readOnly: true,
              }}
            />
            <InputLabel>Matric No.</InputLabel>
            <TextField
              fullWidth
              id="matricNo"
              type="text"
              value={matricNo == null ? "" : matricNo}
              disabled
              sx={{ marginBottom: "20px" }}
              InputProps={{
                readOnly: true,
              }}
            />
            <InputLabel>Host</InputLabel>
            <TextField
              fullWidth
              id="host"
              type="text"
              value={host == null ? "" : CapitalizeWord(host)}
              disabled
              sx={{ marginBottom: "20px" }}
              InputProps={{
                readOnly: true,
              }}
            />
            <InputLabel>Supervisor</InputLabel>
            <FormControl fullWidth>
              <Select
                labelId="demo-simple-select-label"
                id="demo-simple-select"
                value={supervisorId === null ? 0 : supervisorId}
                MenuProps={MenuProps}
                onChange={handleSupervisorChange}
                sx={{ marginBottom: "20px" }}
              >
                {lecturers
                  .filter((lecturer) => lecturer.roles.includes("Lecturer"))
                  .map((lecturer, index) => {
                    return (
                      <MenuItem key={lecturer.id} value={lecturer.id}>
                        {CapitalizeWord(lecturer.name)}
                      </MenuItem>
                    );
                  })}
                <MenuItem key="0" value="0">
                  Not Determined
                </MenuItem>
              </Select>
            </FormControl>
            <InputLabel>Examiner</InputLabel>
            <FormControl fullWidth>
              <Select
                labelId="demo-simple-select-label"
                id="demo-simple-select"
                value={examinerId === null ? 0 : examinerId}
                MenuProps={MenuProps}
                onChange={handleExaminerChange}
                placehoder="NO"
                sx={{ marginBottom: "20px" }}
              >
                {lecturers
                  .filter((lecturer) => lecturer.roles.includes("Lecturer"))
                  .map((lecturer, index) => {
                    return (
                      <MenuItem key={lecturer.id} value={lecturer.id}>
                        {CapitalizeWord(lecturer.name)}
                      </MenuItem>
                    );
                  })}
                <MenuItem key="0" value="0">
                  Not Determined
                </MenuItem>
              </Select>
            </FormControl>
            <InputLabel>Panel</InputLabel>
            <FormControl fullWidth>
              <Select
                labelId="demo-simple-select-label"
                id="demo-simple-select"
                value={panelId === null ? 0 : panelId}
                MenuProps={MenuProps}
                onChange={handlePanelChange}
                sx={{ marginBottom: "20px" }}
              >
                {lecturers
                  .filter((lecturer) => lecturer.roles.includes("Lecturer"))
                  .map((lecturer, index) => {
                    return (
                      <MenuItem key={lecturer.id} value={lecturer.id}>
                        {CapitalizeWord(lecturer.name)}
                      </MenuItem>
                    );
                  })}
                <MenuItem key="0" value="0">
                  Not Determined
                </MenuItem>
              </Select>
            </FormControl>
            <InputLabel>Chair</InputLabel>
            <FormControl fullWidth>
              <Select
                labelId="demo-simple-select-label"
                id="demo-simple-select"
                value={chairId === null ? 0 : chairId}
                MenuProps={MenuProps}
                onChange={handleChairChange}
                sx={{ marginBottom: "20px" }}
              >
                {lecturers
                  .filter((lecturer) => lecturer.roles.includes("Lecturer"))
                  .map((lecturer, index) => {
                    return (
                      <MenuItem key={lecturer.id} value={lecturer.id}>
                        {CapitalizeWord(lecturer.name)}
                      </MenuItem>
                    );
                  })}
                <MenuItem key="0" value="0">
                  Not Determined
                </MenuItem>
              </Select>
            </FormControl>
            <Button
              variant="contained"
              sx={{ mt: 3, mb: 2 }}
              disabled={message.status === "success" ? true : false}
              onClick={() => {
                if (supervisorId === "") {
                  setMessage({
                    status: "error",
                    statusText: "You are required to select a supervisor. ",
                  });
                  setOpenSB(true);
                } else if (examinerId === "") {
                  setMessage({
                    status: "error",
                    statusText: "You are required to select an examiner. ",
                  });
                  setOpenSB(true);
                } else if (panelId === "") {
                  setMessage({
                    status: "error",
                    statusText: "You are required to select a panel. ",
                  });
                  setOpenSB(true);
                } else {
                  handleOpenConfirmBox();
                }
              }}
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
            Are you sure to update this project's assessor?
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
