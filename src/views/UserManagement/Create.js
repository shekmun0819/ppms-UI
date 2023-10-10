import { React, useState, useEffect } from "react";
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
import Chip from "@mui/material/Chip";
import Stack from "@mui/material/Stack";
import axios from "axios";
import Snackbar from "@mui/material/Snackbar";
import Alert from "@mui/material/Alert";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogTitle from "@mui/material/DialogTitle";
import { useCookies } from "react-cookie";
import Divider from '@mui/material/Divider';
import { FormControl } from "@mui/material";
import CapitalizeWord from '../../utils/CapitalizeWord';
import { API_URL } from "../../config";

const ITEM_HEIGHT = 48;
const MenuProps = {
  PaperProps: {
    style: {
      maxHeight: ITEM_HEIGHT * 4.5,
      width: 250,
    },
  },
};

function Create() {
  let history = useHistory();
  const [token, setToken] = useCookies();

  const [acadSessions, setAcadSessions] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [selectedCompany, setSelectedCompany] = useState();

  const [email, setEmail] = useState("");
  const [fullname, setFullname] = useState("");
  const [selected, setSelected] = useState([]);
  const [matricNo, setMatricNo] = useState("");
  const [course, setCourse] = useState("");
  const [acadSession, setAcadSession] = useState(null);
  const [staffId, setStaffId] = useState("");

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

  const selectionChangeHandler = (event) => {
    setSelected(event.target.value);
  };

  const onBack = () => {
    history.goBack();
  };

  const onCreate = async () => {
    let data = new FormData();
    data.append("email", email);
    data.append("name", fullname);
    data.append("roles", selected.toString());
    data.append("matricNum", matricNo);
    data.append("courseCode", course);
    data.append("academicSession", acadSession ? acadSession.academicSession : "");
    data.append("semester", acadSession ? acadSession.semester : 0);
    data.append("staffId", staffId);
    data.append("companyId", selectedCompany ? selectedCompany.id : 0);

    await axios
      .post( API_URL + "/api/v1/auth/register", data, {
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          Authorization: `Bearer ${token.Token}`,
        },
      })
      .then((response) => {
        setMessage({
          status: "success",
          statusText: "User is successfully created.",
        });
        setOpenSB(true);
        handleCloseConfirmBox();
      })
      .catch((error) => {
        console.log(error);
        setMessage({
          status: "error",
          statusText: "Failed to create user.",
        });
        setOpenSB(true);
        handleCloseConfirmBox();
      });
  };

  const onReset = () => {
    window.location.reload();
  };

  const handleCloseSB = (event, reason) => {
    if (reason === "clickaway") {
      return;
    }
    setOpenSB(false);
  };

  const fetchCompanies = async () => {
    await axios
      .get( API_URL + "/api/v1/company/getAll", {
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${token.Token}`,
        },
      })
      .then((response) => {
        var data = response.data;
        setCompanies(data);
      })
      .catch((error) => {
        console.log(error)
      });
  };

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
        setAcadSessions(data);
      })
      .catch((error) => console.log(error));
  };

  useEffect(() => {
    fetchCompanies();
    fetchAcademicSessions();
  }, []);

  return (
    <>
      <div className="main-content-container p-4 container-fluid">
        <h3 style={{ marginBottom: "20px" }}>User Management</h3>
        <div
          style={{
            backgroundColor: "white",
            padding: "20px",
            borderRadius: "5px",
          }}
        >
          <Stack direction="row" alignItems="center">
            <IconButton
              sx={{ color: "black", paddingLeft: '0' }}
              onClick={onBack}
            >
              <ArrowBackIosNewIcon sx={{ fontSize: "25px" }} />
            </IconButton>
            <Typography variant="h5" sx={{ fontWeight: "bold" }}>
              Create User
            </Typography>
          </Stack>
          <Box
            sx={{
              my: 3,
              mx: 4,
            }}
          >
            <InputLabel>Email Address</InputLabel>
            <TextField
              required
              fullWidth
              id="email"
              type="email"
              placeholder="johndoe@gmail.com"
              value={email == null ? "" : email}
              autoFocus
              sx={{ marginBottom: "20px" }}
              onChange={(e) => {
                setEmail(e.target.value.toLowerCase());
              }}
            />
            <InputLabel>Fullname</InputLabel>
            <TextField
              required
              fullWidth
              id="fullname"
              type="text"
              placeholder="John Doe"
              value={fullname == null ? "" : CapitalizeWord(fullname)}
              sx={{ marginBottom: "20px" }}
              onChange={(e) => {
                setFullname(e.target.value.toUpperCase());
              }}
            />
            <InputLabel>Role(s)</InputLabel>
            <Select
              multiple
              fullWidth
              required
              value={selected}
              onChange={selectionChangeHandler}
              renderValue={(selected) => (
                <div>
                  {selected.map((value) => (
                    <Chip
                      key={value}
                      label={value}
                      sx={{ marginRight: "5px" }}
                    />
                  ))}
                </div>
              )}
            >
              <MenuItem value={"Admin"}>Admin</MenuItem>
              <MenuItem value={"Lecturer"}>Lecturer</MenuItem>
              <MenuItem value={"Student"}>Student</MenuItem>
              <MenuItem value={"Host"}>Host</MenuItem>
            </Select>
            {
              (selected.includes("Student") || selected.includes("Lecturer") || selected.includes("Host")) &&
              <>
                <Divider sx={{ mt: 4, mb: 3 }} />
                <InputLabel
                  sx={{
                    fontSize: "20px",
                    fontWeight: "bold",
                    color: "black",
                    mb: 2,
                  }}
                >
                  Personal Information
                </InputLabel>
              </>
            }
            {
              selected.includes("Student") ?
              <>
                <InputLabel>Matric Number</InputLabel>
                <TextField
                  required
                  fullWidth
                  id="matricNo"
                  type="text"
                  placeholder="123456"
                  value={matricNo == null ? "" : matricNo}
                  sx={{ marginBottom: "20px" }}
                  onChange={(e) => {
                    setMatricNo(e.target.value);
                  }}
                />
                <InputLabel>Course Code</InputLabel>
                <TextField
                  required
                  fullWidth
                  id="courseCode"
                  type="text"
                  placeholder="CDS590"
                  value={course == null ? "" : course}
                  sx={{ marginBottom: "20px" }}
                  onChange={(e) => {
                    setCourse(e.target.value.toUpperCase());
                  }}
                />
                <InputLabel>Academic Session</InputLabel>
                <FormControl style={{width: '100%'}}>
                  <Select
                    id="acadSession"
                    sx={{
                      marginBottom: "20px",
                    }}
                    value={acadSession == null ? "" : acadSession.id}
                    MenuProps={MenuProps}
                    onChange={(e) => {
                      let selected = acadSessions.find((element) => {
                        return element.id === e.target.value;
                      })
                      setAcadSession(selected);
                    }}
                  >
                    {
                      acadSessions.length > 0 && acadSessions.map((item) => (
                        <MenuItem key={item.id} value={item.id}>{item.academicSession}, Semester {item.semester.toString()}</MenuItem>
                      ))
                    }
                  </Select>
                </FormControl>
              </> : <></>
            }
            {
              selected.includes("Host") ?
              <>
                <InputLabel>Company Name</InputLabel>
                <FormControl style={{width: '100%'}}>
                  <Select
                    id="companyName"
                    sx={{
                      marginBottom: "20px",
                    }}
                    value={selectedCompany == null ? "" : selectedCompany.id}
                    MenuProps={MenuProps}
                    onChange={(e) => {
                      setSelectedCompany(companies.find((element) => {
                        return element.id === e.target.value;
                      }))
                    }}
                  >
                    {
                      companies && companies.map((item) => (
                        <MenuItem key={item.id} value={item.id}>{ CapitalizeWord(item.companyName) }</MenuItem>
                      ))
                    }
                  </Select>
                </FormControl>
              </> : <></>
            }
            {
              selected.includes("Lecturer") ?
              <>
                <InputLabel>Staff ID</InputLabel>
                <TextField
                  required
                  fullWidth
                  id="staffId"
                  type="text"
                  placeholder=""
                  value={staffId == null ? "" : staffId}
                  sx={{ marginBottom: "20px" }}
                  onChange={(e) => {
                    setStaffId(e.target.value.toUpperCase());
                  }}
                />
              </> : <></>
            }
            <Button
              variant="contained"
              sx={{ mt: 3, mb: 2 }}
              onClick={() => {
                if (email === "" ||
                  fullname === "" ||
                  selected.length === 0 ||
                  (selected.includes("Student") && matricNo === "") ||
                  (selected.includes("Student") && course === "") ||
                  (selected.includes("Host") && !selectedCompany) ||
                  (selected.includes("Lecturer") && staffId === "")
                ) {
                  setMessage({
                    status: "error",
                    statusText: "You are required to fill in all the details.",
                  });
                  setOpenSB(true);
                } else {
                  handleOpenConfirmBox();
                }
              }}
              disabled={message.status === "success" ? true : false}
            >
              Create
            </Button>
            <Button
              variant="outlined"
              sx={{ mt: 3, mb: 2, mx: 2 }}
              onClick={onReset}
            >
              Reset
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
            Are you sure to create this user?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseConfirmBox}>No</Button>
          <Button onClick={onCreate} autoFocus>
            Yes
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}

export default Create;
