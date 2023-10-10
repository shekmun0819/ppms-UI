import { React, useState, useEffect } from "react";
import { IconButton, Typography, Stack, InputLabel, TextField, Box, Snackbar, Alert, DialogTitle, DialogContent, DialogContentText, DialogActions, Button, Dialog } from "@mui/material";
import ArrowBackIosNewIcon from "@mui/icons-material/ArrowBackIosNew";
import axios from "axios";
import { useHistory } from "react-router-dom";
import { useCookies } from "react-cookie";
import CapitalizeWord from '../../utils/CapitalizeWord';
import { API_URL } from "../../config";

function Create() {
  let history = useHistory();
  const [token, setToken] = useCookies();

  const [company, setCompany] = useState({
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

  const onCreate = async () => {
    let data = new FormData();
    data.append("companyName", company.name);
    data.append("address", company.address);
    data.append("contact", company.contact);

    await axios
      .post( API_URL + "/api/v1/company/create", data, {
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          Authorization: `Bearer ${token.Token}`,
        },
      })
      .then((response) => {
        setMessage({
          status: "success",
          statusText: "Company is successfully created.",
        });
        setOpenSB(true);
        handleCloseConfirmBox();
      })
      .catch((error) => {
        console.log(error);
        setMessage({
          status: "error",
          statusText: "Failed to create company.",
        });
        setOpenSB(true);
        handleCloseConfirmBox();
      });
  };

  const onReset = () => {
    window.location.reload();
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
              Create Company
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
              autoFocus
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
            Are you sure to create this company?
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