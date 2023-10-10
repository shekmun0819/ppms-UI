import {
  Typography,
  Stack,
  IconButton,
  InputLabel,
  TextField,
  Box,
  Button,
  Snackbar,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
} from "@mui/material";
import ArrowBackIosNewIcon from "@mui/icons-material/ArrowBackIosNew";
import { useHistory } from "react-router-dom";
import { useEffect, useState } from "react";
import jwt_decode from "jwt-decode";
import { useCookies } from "react-cookie";
import { PDFDownloadLink, Document, Page } from "@react-pdf/renderer";
import { Right as SectionRight } from "./PDF/Section/Right_";
import { Left as SectionLeft } from "./PDF/Section/Left_";
import { createContext } from "react";
import { FileUploader } from "react-drag-drop-files";
import { pdf} from "@react-pdf/renderer";
import axios from "axios";
import { API_URL } from "../../config";
import CapitalizeWord from "../../utils/CapitalizeWord"

export const BuilderContext = createContext({});
const imageType = ["JPG", "PNG", "JPEG"];

function CreateResume() {
  let history = useHistory();
  const [name, setName] = useState("");
  const [token, setToken] = useCookies(["Token"]);
  const [email, setEmail] = useState("");
  const [contactNo, setContactNo] = useState("");
  const [linkedInLink, setLinkedInLink] = useState("");
  const [aboutMe, setAboutMe] = useState("");
  const [education, setEducation] = useState("");
  const [experience, setExperience] = useState("");
  const [skill, setSkill] = useState("");
  const [reference, setReference] = useState("");
  const [photo, setPhoto] = useState(null);
  const [openSB, setOpenSB] = useState(false);
  const [loading1, setLoading1] = useState(false);
  const [openConfirmBox, setOpenConfirmBox] = useState(false);

  const [message, setMessage] = useState({
    status: "info",
    statusText: "",
  });

  const handleUploadImage = (file) => {
    setPhoto(file);
    console.log(file);
  };

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

  const onReset = () => {
    window.location.reload();
  };

  const onCreateResume = async (e) => {
    console.log(e.target.href)
    let blobPdf = await pdf(<ResumeTemplate></ResumeTemplate>).toBlob();
    console.log(blobPdf);
    var file = new File([blobPdf], CapitalizeWord(decoded.userInfo.name) + " "+ new Date().toLocaleString().replace(/\D/g, ''), {type: 'application/pdf'});
    console.log("file " , file);
    let url = window.URL.createObjectURL(blobPdf);
    let link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", CapitalizeWord(decoded.userInfo.name) + " "+ new Date().toLocaleString().replace(/\D/g, ''));
    document.body.appendChild(link);
    
    link.click();
    const data = new FormData();
    data.append("name", name.toUpperCase());
    data.append("email", email);
    data.append("contactNo", contactNo);
    data.append("linkedInLink", linkedInLink);
    data.append("aboutMe", aboutMe);
    data.append("education", education);
    data.append("experience", experience);
    data.append("skill", skill);
    data.append("reference", reference);
    data.append("student_id", jwt_decode(token["Token"]).userInfo.id);
    data.append("resume", file);
    data.append("photo", photo);
    await axios
      .post( API_URL + "/api/v1/resume/saveResume", data, {
        headers: {
          Accept: "application/json",
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${token.Token}`,
        },
      })
      .then((response) => {
        console.log(response);
        setMessage({
          status: "success",
          statusText: "A new resume is successfully created and save.",
        });
        setOpenSB(true);
        handleCloseConfirmBox();
      })
      .catch((error) => {
        console.log(error);
        setMessage({
          status: "error",
          statusText: "Failed to create new resume.",
        });
        setOpenSB(true);
      });
  };

  const ResumeTemplate = () => (
    <Document /*style={styles.document*/>
      <Page
        size="A4"
        style={{
          display: "flex",
          flexDirection: "row",
        }}
      >
        <BuilderContext.Provider value={name}>
          <SectionLeft
            name={name}
            email={email}
            contactNo={contactNo}
            linkedInLink={linkedInLink}
            display={photo}
          />
          <SectionRight
            about={aboutMe}
            experience={experience}
            skill={skill}
            education={education}
            reference={reference}
            linkedInLink={linkedInLink}
          />
        </BuilderContext.Provider>
      </Page>
    </Document>
  );
  const decoded = jwt_decode(token["Token"]);
  useEffect(() => {
    
    setName(decoded.userInfo.name);
  }, []);

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
              Create Resume
            </Typography>
          </Stack>
          <Box
            sx={{
              my: 3,
              mx: 4,
            }}
          >
            <InputLabel>Name</InputLabel>
            <TextField
              required
              InputProps={{
                readOnly: true,
              }}
              fullWidth
              size="small"
              id="projectName"
              type="text"
              value={name == null ? "" : CapitalizeWord(name)}
              sx={{ marginBottom: "20px" }}
            />
            <InputLabel>Email</InputLabel>
            <TextField
              required
              fullWidth
              size="small"
              id="email"
              type="text"
              value={email}
              autoFocus
              sx={{ marginBottom: "20px" }}
              onChange={(e) => {
                setEmail(e.target.value.toLowerCase());
              }}
            />
            <InputLabel>Contact No</InputLabel>
            <TextField
              required
              fullWidth
              size="small"
              id="contactNo"
              type="text"
              value={contactNo}
              sx={{ marginBottom: "20px" }}
              onChange={(e) => {
                setContactNo(e.target.value);
              }}
            />
            <InputLabel>LinkedIn Link</InputLabel>
            <TextField
              required
              fullWidth
              size="small"
              id="linkedInLink"
              type="text"
              value={linkedInLink}
              sx={{ marginBottom: "20px" }}
              onChange={(e) => {
                setLinkedInLink(e.target.value.toLowerCase());
              }}
            />
            <InputLabel>About Me</InputLabel>
            <TextField
              multiline
              rows={3}
              required
              fullWidth
              size="small"
              id="aboutMe"
              type="text"
              value={aboutMe}
              sx={{ marginBottom: "20px" }}
              onChange={(e) => {
                setAboutMe(e.target.value);
              }}
            />
            <InputLabel>Education</InputLabel>
            <TextField
              multiline
              rows={3}
              required
              fullWidth
              size="small"
              id="education"
              type="text"
              value={education}
              sx={{ marginBottom: "20px" }}
              onChange={(e) => {
                setEducation(e.target.value);
              }}
            />
            <InputLabel>Experience</InputLabel>
            <TextField
              multiline
              rows={3}
              required
              fullWidth
              size="small"
              id="experience"
              type="text"
              value={experience}
              sx={{ marginBottom: "20px" }}
              onChange={(e) => {
                setExperience(e.target.value);
              }}
            />
            <InputLabel>Skills</InputLabel>
            <TextField
              multiline
              rows={3}
              required
              fullWidth
              size="small"
              id="skills"
              type="text"
              value={skill}
              sx={{ marginBottom: "20px" }}
              onChange={(e) => {
                setSkill(e.target.value);
              }}
            />
            <InputLabel>Reference</InputLabel>
            <TextField
              multiline
              rows={3}
              required
              fullWidth
              size="small"
              id="reference"
              type="text"
              value={reference}
              sx={{ marginBottom: "20px" }}
              onChange={(e) => {
                setReference(e.target.value);
              }}
            />
            <InputLabel>Photo:</InputLabel>
            <FileUploader
              handleChange={handleUploadImage}
              name="file"
              types={imageType}
              label="Browse to choose a file or Drag and drop"
              sx={{ marginBottom: "30px" }}
            />
            <Button variant="contained" sx={{ mt: 3, mb: 2 }}
            onClick={() => {
                if (
                  email === null ||
                  email === "" ||
                  contactNo === null ||
                  contactNo === "" ||
                  linkedInLink === null ||
                  linkedInLink === "" ||
                  aboutMe === null ||
                  aboutMe === "" ||
                  education === null ||
                  education === "" ||
                  experience === null ||
                  experience === "" ||
                  skill === null ||
                  skill === "" ||
                  reference === null ||
                  reference === "" ||
                  photo === null
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
            Are you sure to create this resume?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseConfirmBox}>No</Button>
          <Button onClick={onCreateResume}>Yes</Button>
        </DialogActions>
      </Dialog>
    </>
  );
}

export default CreateResume;
