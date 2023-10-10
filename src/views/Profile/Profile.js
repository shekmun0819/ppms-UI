import { React, useState, useEffect } from "react";
import { useHistory } from "react-router-dom";
import { useCookies } from "react-cookie";
import { Alert, Box, Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, Divider, InputLabel, Snackbar, TextField, Typography } from '@mui/material';
import axios from "axios";
import jwt_decode from "jwt-decode";
import CapitalizeWord from '../../utils/CapitalizeWord';
import { API_URL } from "../../config";

function Profile(props) {
  let history = useHistory();
  const [token, setToken] = useCookies();
  const [userInfo, setUserInfo] = useState(null);
  const [roles, setRoles] = useState([]);

  const [oldPwd, setOldPwd] = useState("");
  const [newPwd, setNewPwd] = useState("");

  const [userProfile, setUserProfile] = useState({
    id: 0,
    email: "",
    fullname: "",
    matricNo: "",
    courseCode: "",
    company: "",
    staffId: ""
  });

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

  const onSave = async () => {
    let data = new FormData();
    data.append("email", userInfo.email);
    data.append("oldPwd", oldPwd);
    data.append("newPwd", newPwd);

    await axios
      .put( API_URL + "/api/v1/auth/changePwd", data, {
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          Authorization: `Bearer ${token.Token}`,
        },
      })
      .then((response) => {
        setMessage({
          status: "success",
          statusText: "Password is successfully changed.",
        });
        setOpenSB(true);
        handleCloseConfirmBox();
      })
      .catch((error) => {
        console.log(error);
        setMessage({
          status: "error",
          statusText: "Failed to change password.",
        });
        setOpenSB(true);
        handleCloseConfirmBox();
      });
  };

  useEffect(() => {
    if(token['Token']) {
      const decoded = jwt_decode(token['Token']);
      setUserInfo(decoded.userInfo);
    }
  }, [token]);

  useEffect(() => {
    if(userInfo) {
      fetchUser();
    }
  }, [userInfo]);

  const fetchUser = async () => {
    await axios
      .get( API_URL + "/api/v1/user/" + userInfo.id, {
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${token.Token}`,
        },
      })
      .then((response) => {
        var data = response.data;
        
        var tempRoles = data.user.roles.split(",");
        tempRoles = tempRoles.sort();
        setRoles(tempRoles);

        setUserProfile({
          id: data.user.id,
          email: data.user.email,
          fullname: CapitalizeWord(data.user.name),
          roles: tempRoles
        });

        if(tempRoles.includes("Host")) {
          setUserProfile({
            company: CapitalizeWord(data.host.company.companyName)
          });
        }
        if(tempRoles.includes("Student")) {
          setUserProfile({
            matricNo: data.student.matricNum,
            courseCode: data.student.courseCode
          });
        }
        if(tempRoles.includes("Lecturer")) {
          setUserProfile({
            staffId: data.lecturer.staffId
          });
        }
      })
      .catch((error) => console.log(error));
  };

  return (
    <>
      <div className="main-content-container p-4 container-fluid">
        <h3 style={{ marginBottom: "20px" }}>Profile</h3>
        <div
          style={{
            backgroundColor: "white",
            padding: "20px",
            borderRadius: "5px",
          }}
        >
          {
            roles.length > 0 &&
            <Box
              sx={{
                mx: 4,
              }}
            >
              <Typography variant="h6" sx={{ fontWeight: "bold", mb: 2 }}>
                Personal Information
              </Typography>
              <InputLabel>Email Address</InputLabel>
              <TextField
                disabled
                required
                fullWidth
                id="email"
                type="email"
                placeholder="johndoe@gmail.com"
                value={userProfile.email}
                sx={{ marginBottom: "20px" }}
              />
              <InputLabel>Fullname</InputLabel>
              <TextField
                disabled
                required
                fullWidth
                id="fullname"
                type="text"
                placeholder="John Doe"
                value={userProfile.fullname}
                sx={{ marginBottom: "20px" }}
              />
              {
                roles.includes("Student") ?
                <>
                  <InputLabel>Matric Number</InputLabel>
                  <TextField
                    disabled
                    required
                    fullWidth
                    id="matricNo"
                    type="text"
                    placeholder="123456"
                    value={userProfile.matricNo}
                    sx={{ marginBottom: "20px" }}
                  />
                  <InputLabel>Course Code</InputLabel>
                  <TextField
                    disabled
                    required
                    fullWidth
                    id="courseCode"
                    type="text"
                    placeholder="CDS590"
                    value={userProfile.courseCode}
                    sx={{ marginBottom: "20px" }}
                  />
                </> : <></>
              }
              {
                roles.includes("Host") ?
                <>
                  <InputLabel>Company Name</InputLabel>
                  <TextField
                    disabled
                    required
                    fullWidth
                    id="companyName"
                    type="text"
                    value={userProfile.company}
                    sx={{ marginBottom: "20px" }}
                  />
                </> : <></>
              }
              {
                roles.includes("Lecturer") ?
                <>
                  <InputLabel>Staff ID</InputLabel>
                  <TextField
                    disabled
                    required
                    fullWidth
                    id="staffId"
                    type="text"
                    placeholder=""
                    value={userProfile.staffId}
                    sx={{ marginBottom: "20px" }}
                  />
                </> : <></>
              }
              <Divider sx={{ mt: 2, mb: 3 }}/>
              <Typography variant="h6" sx={{ fontWeight: "bold", mb: 2 }}>
                Change Password
              </Typography>
              <InputLabel>Old Password</InputLabel>
              <TextField
                required
                fullWidth
                id="oldPwd"
                type="password"
                value={oldPwd}
                sx={{ marginBottom: "20px" }}
                onChange={(e) => {
                  setOldPwd(e.target.value);
                }}
              />
              <InputLabel>New Password</InputLabel>
              <TextField
                required
                fullWidth
                id="newPwd"
                type="password"
                value={newPwd}
                sx={{ marginBottom: "20px" }}
                onChange={(e) => {
                  setNewPwd(e.target.value);
                }}
              />
              <Button
                variant="contained"
                sx={{ mt: 1, mb: 2 }}
                onClick={ () => {
                  if (oldPwd === "" || newPwd === "") {
                  setMessage({
                    status: "error",
                    statusText: "You are required to fill in the old and new password.",
                  });
                  setOpenSB(true);
                  } 
                  else {
                    handleOpenConfirmBox();
                  }
                }}
              >
                Save
              </Button>
            </Box>
          }
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
            Are you sure to change your password?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseConfirmBox}>No</Button>
          <Button onClick={onSave} autoFocus>
            Yes
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}

export default Profile;