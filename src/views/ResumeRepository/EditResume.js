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
import { pdf } from "@react-pdf/renderer";
import axios from "axios";
import { API_URL } from "../../config";
import CapitalizeWord from "../../utils/CapitalizeWord";

export const BuilderContext = createContext({});
const imageType = ["JPG", "PNG", "JPEG"];

function EditResume(props) {
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
  const [imageName, setImageName] = useState("");
  const [openSB, setOpenSB] = useState(false);
  const [fileName, setFileName] = useState("");
  const [openConfirmBox, setOpenConfirmBox] = useState(false);
  const decoded = jwt_decode(token["Token"]);

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

  const capitalizeWords = (str) => {
    return str
      .toLowerCase()
      .split(" ")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  const onReset = () => {
    //window.location.reload();
    console.log(photo);
  };

  const onEditResume = async (e) => {
    let blobPdf = await pdf(<ResumeTemplate></ResumeTemplate>).toBlob();
    console.log(blobPdf);
    
    let url = window.URL.createObjectURL(blobPdf);
    let link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", fileName);
    document.body.appendChild(link);
    link.click();

    var file = new File([blobPdf], fileName, { type: "application/pdf" });
    console.log(blobPdf)
    console.log("file ", file);

    link.parentNode.removeChild(link);
    const data = new FormData();
    data.append("id", props.match.params.id);
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
      .put(API_URL + "/api/v1/resume/updateResume", data, {
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
          statusText: "The resume is successfully updated.",
        });
        setOpenSB(true);
        handleCloseConfirmBox();
      })
      .catch((error) => {
        console.log(error);
        setMessage({
          status: "error",
          statusText: "Failed to update this resume.",
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

  const getResumeInfo = async () => {
    await axios
      .get(API_URL + "/api/v1/resume/getById/" + props.match.params.id, {
        headers: {
          Accept: "application/json",
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${token.Token}`,
        },
      })
      .then((response) => {
        console.log(response.data);
        setAboutMe(response.data.aboutMe);
        setContactNo(response.data.contact);
        setEducation(response.data.education);
        setEmail(response.data.email);
        setExperience(response.data.experience);
        setLinkedInLink(response.data.linkedinLink);
        //var type = response.data.imageName.split(/[#?]/)[0].split('.').pop().trim();
        //var image = new File([response.data.imageData], response.data.imageName, {type: "image/"+type});
        //setPhoto(image)
        setSkill(response.data.skill);
        setReference(response.data.reference);
        setImageName(response.data.imageName);
        setFileName(response.data.filename);
      })
      .catch((error) => {
        console.log(error);
        setMessage({
          status: "error",
          statusText: "Failed to update this resume.",
        });
        setOpenSB(true);
      });
  };

  const fetchImageData = async () => {
    await axios
      .get(API_URL + "/api/v1/resume/getResumeImage/" + props.match.params.id, {
        responseType: "blob",
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${token.Token}`,
        },
      })
      .then((response) => {
        console.log(response);
        console.log(imageName);
        var type = imageName.split(/[#?]/)[0].split(".").pop().trim();
        var image = new File([response.data], imageName, {
          type: "image/" + type,
        });
        setPhoto(image);
      })
      .catch((error) => {
        console.log(error);
        setMessage({
          status: "error",
          statusText: "Failed to update this resume.",
        });
        setOpenSB(true);
      });
  };

  useEffect(() => {
    const decoded = jwt_decode(token["Token"]);
    console.log(props.match.params.id);
    setName(capitalizeWords(decoded.userInfo.name));
    getResumeInfo();
    //fetchImageData();
  }, []);

  // const createAndDownloadPDF = () =>{
  //   <PDFDownloadLink
  //               document={<ResumeTemplate />}
  //               fileName="resume.pdf"
  //               style={{ color: "white", textDecoration: "none" }}
  //               onClick={(e) => {
  //                 onEditResume(e);
  //               }}
  //             >
  //               {({ loading }) =>
  //                 loading ? "Loading document..." : "Download"
  //               }
  //             </PDFDownloadLink>
  // };

  useEffect(() => {
    fetchImageData();
  }, [imageName]);

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
              Edit Resume
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
              value={email == null ? "" : email.toLowerCase()}
              autoFocus
              sx={{ marginBottom: "20px" }}
              onChange={(e) => {
                setEmail(e.target.value);
              }}
            />
            <InputLabel>Contact No</InputLabel>
            <TextField
              required
              fullWidth
              size="small"
              id="contactNo"
              type="text"
              value={contactNo == null ? "" : contactNo}
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
              value={linkedInLink == null ? "" : linkedInLink}
              sx={{ marginBottom: "20px" }}
              onChange={(e) => {
                setLinkedInLink(e.target.value);
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
              value={aboutMe == null ? "" : aboutMe}
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
              value={education == null ? "" : education}
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
              value={experience == null ? "" : experience}
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
              value={skill == null ? "" : skill}
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
              value={reference == null ? "" : reference}
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
              label={imageName}
              sx={{ marginBottom: "30px" }}
            />
            <Button
              variant="contained"
              sx={{ mt: 3, mb: 2 }}
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
              Update
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
            Are you sure to update this resume?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseConfirmBox}>No</Button>
          <Button onClick={onEditResume}>Yes</Button>
        </DialogActions>
      </Dialog>
    </>
  );
}

export default EditResume;
