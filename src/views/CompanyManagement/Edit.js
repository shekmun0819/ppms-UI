import { React, useState, useEffect } from "react";
import { IconButton, Typography, CircularProgress, Stack, InputLabel, TextField, FormControl, Select, MenuItem, Box, Snackbar, Alert, DialogTitle, DialogContent, DialogContentText, DialogActions, Button, Dialog } from "@mui/material";
import ArrowBackIosNewIcon from "@mui/icons-material/ArrowBackIosNew";
import axios from "axios";
import { useHistory } from "react-router-dom";
import { useCookies } from "react-cookie";
import CapitalizeWord from '../../utils/CapitalizeWord';
import { API_URL } from "../../config";

function Edit(props) {
  let history = useHistory();
  const [token, setToken] = useCookies();

  const [company, setCompany] = useState({
    id: 0,
    name: "",
    address: "",
    contact: ""
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

  const fetchCompany = async () => {
    await axios
      .get( API_URL + "/api/v1/company/" + props.match.params.id, {
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${token.Token}`,
        },
      })
      .then((response) => {
        var data = response.data;
        setCompany({
          id: data.id,
          name: data.companyName,
          address: data.address,
          contact: data.contact
        });
      })
      .catch((error) => console.log(error));
  };

  useEffect(() => {
    fetchCompany();
  }, []);

  const onEdit = async () => {
    let data = new FormData();
    data.append("id", company.id);
    data.append("companyName", company.name);
    data.append("address", company.address);
    data.append("contact", company.contact);

    await axios
      .put( API_URL + "/api/v1/company/update", data, {
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          Authorization: `Bearer ${token.Token}`,
        },
      })
      .then((response) => {
        setMessage({
          status: "success",
          statusText: "Company is successfully updated.",
        });
        setOpenSB(true);
        handleCloseConfirmBox();
      })
      .catch((error) => {
        console.log(error);
        setMessage({
          status: "error",
          statusText: "Failed to update company.",
        });
        setOpenSB(true);
        handleCloseConfirmBox();
      });
  };

  return (
    <>
      <div className="main-content-container p-4 container-fluid">
        <h3 style={{ marginBottom: "20px" }}>Company Management</h3>
        <div
          style={{
            backgroundColor: "white",
            padding: "20px",
            borderRadius: "5px",
          }}
        >
          <Stack direction="row" alignItems="center">
            <IconButton
              sx={{ paddingLeft: '0', color: "black" }}
              onClick={onBack}
            >
              <ArrowBackIosNewIcon sx={{ fontSize: "25px" }} />
            </IconButton>
            <Typography variant="h5" sx={{ fontWeight: "bold" }}>
              Edit Company
            </Typography>
          </Stack>
          <Box
            sx={{
              my: 3,
              mx: 4,
            }}
          >
            <InputLabel>Company Name</InputLabel>
            <TextField
              required
              multiline
              fullWidth
              id="companyName"
              type="text"
              value={ CapitalizeWord(company.name) }
              sx={{ marginBottom: "20px" }}
              onChange={(e) => {
                setCompany({
                  ...company,
                  name: e.target.value.toUpperCase(),
                });
              }}
            />
            <InputLabel>Company Address</InputLabel>
            <TextField
              required
              multiline
              fullWidth
              id="companyAddress"
              type="text"
              value={ CapitalizeWord(company.address) }
              sx={{ marginBottom: "20px" }}
              onChange={(e) => {
                setCompany({
                  ...company,
                  address: e.target.value.toUpperCase(),
                });
              }}
            />
            <InputLabel>Company Contact Number</InputLabel>
            <TextField
              required
              multiline
              fullWidth
              id="companyContact"
              type="text"
              value={company.contact}
              sx={{ marginBottom: "20px" }}
              onChange={(e) => {
                setCompany({
                  ...company,
                  contact: e.target.value,
                });
              }}
            />
            <Button
              variant="contained"
              sx={{ mt: 3, mb: 2 }}
              onClick={() => {
                if (
                  company.name === "" ||
                  company.address === "" ||
                  company.contact === "" 
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
            >
              Update
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
            Are you sure to update this company?
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