import {
  Stack,
  IconButton,
  Typography,
  Box,
  InputLabel,
  TextField,
  Select,
  MenuItem,
  Button,
  Snackbar,
  Alert,
  Dialog,
  DialogContent,
  DialogTitle,
  DialogContentText,
  DialogActions,
  Chip,
  FormControl,
  RadioGroup,
  FormLabel,
  FormControlLabel,
  Radio,
  CardMedia
} from "@mui/material";
import ArrowBackIosNewIcon from "@mui/icons-material/ArrowBackIosNew";
import { useHistory } from "react-router-dom";
import { FileUploader } from "react-drag-drop-files";
import { useState } from "react";
import axios from "axios";
import { useCookies } from "react-cookie";
import { useEffect } from "react";
import jwt_decode from "jwt-decode";
import { API_URL } from "../../config";
import CapitalizeWord from "../../utils/CapitalizeWord";

const imageType = ["JPG", "PNG"];
const fileType = ["PDF"];

function EditPracticumProject(props) {
  let history = useHistory();
  const [projectName, setProjectName] = useState("");
  const [projectDescription, setProjectDescription] = useState("");
  const [categories, setCategories] = useState([]);
  const [adminDescription, setAdminDescription] = useState("");
  const [token, setToken] = useCookies();
  const [openSB, setOpenSB] = useState(false);
  const [openConfirmBox, setOpenConfirmBox] = useState(false);
  const [reportCategory, setReportCategory] = useState([]);
  const [openNDA, setOpenNDA] = useState(false);
  const [ndaAgreement, setNdaAgreement] = useState(null);
  const [image, setImage] = useState();
  const [imageName, setImageName] = useState();
  const [courseName, setCourseName] = useState();
  const [previewImage, setPreviewImage] = useState();
  const [isNda, setIsNda] = useState(null);
  const [status, setStatus] = useState("");
  const [studentId, setStudentId] = useState(null);
  const [academicSession, setAcademicSession] = useState("");
  const [ndaFileName, setNdaFileName] = useState("");

  const handleOpenNDA = (e) => {
    setOpenNDA(true);
    setIsNda(true);
  };

  const handleCloseNDA = () => {
    setOpenNDA(false);
    setIsNda(false);
  };

  const handleUploadImage = (file) => {
    setImage(file);
    setImageName(file.name);
  };

  const handleUploadFile = (file) => {
    console.log(file)
    setIsNda(true);
    setNdaAgreement(file);
  };

  const handleOpenConfirmBox = () => {
    setOpenConfirmBox(true);
  };
  const handleCloseConfirmBox = () => {
    setOpenConfirmBox(false);
  };

  const [message, setMessage] = useState({
    status: "info",
    statusText: "",
  });

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
        console.log(response.data)
        setProjectName(response.data.practicumProject.name);
        setProjectDescription(response.data.practicumProject.description);
        var categories = response.data.practicumProject.categories.split(",");
        setCategories(categories);
        setAdminDescription(response.data.practicumProject.adminDescription);
        setImage(response.data.practicumProject.imageData);
        setStatus(response.data.practicumProject.status);
        setStudentId(response.data.practicumProject.studentId);
        setCourseName(CapitalizeWord(response.data.practicumProject.courseName));
        setAcademicSession(response.data.practicumProject.academicSession);
        setPreviewImage(response.data.practicumProject.imageData);
        setImageName(response.data.practicumProject.imageName);
        var file = new File([response.data.practicumProject.ndaAgreement], response.data.practicumProject.ndaName, {type: "application/pdf"});
        //setNdaAgreement(response.data.practicumProject.ndaAgreeemnt);
        setNdaAgreement(file);
        setIsNda(response.data.practicumProject.nda);
        setNdaFileName(response.data.practicumProject.ndaName);
        
      })
      .catch((error) => console.log(error));
  };

  const onEdit = async () => {
    const data = new FormData();
    console.log(image);
    data.append("id", props.match.params.id);
    data.append("name", projectName);
    data.append("description", projectDescription);
    data.append("categories", categories.toString());
    data.append("adminDescription", adminDescription);
    data.append("imageName", imageName);
    data.append("course_name", courseName.toUpperCase());
    data.append("image", image);
    data.append('isNda', isNda);
    data.append("status", status);
    //data.append("host_id", jwt_decode(token["Token"]).userInfo.id);
    if(studentId===undefined){
      data.append("student_id", "null");
    }else{
      data.append("student_id", studentId);
    }
    
    data.append("academicSession", academicSession);
    if(isNda===true){
      data.append("nda", ndaAgreement);
    }

    await axios
      .put( API_URL + "/api/v1/practicumProjects/update", data, {
        headers: {
          Accept: "application/json",
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${token.Token}`,
        },
      })
      .then((response) => {
        setMessage({
          status: "success",
          statusText: "Practicum project is successfully updated.",
        });
        setOpenSB(true);
        handleCloseConfirmBox();
      })
      .catch((error) => {
        setMessage({
          status: "error",
          statusText: "Failed to update practicum project.",
        });
        setOpenSB(true);
      });
  };

  const handleCategories = (event) => {
    setCategories(event.target.value);
  };

  const fetchProjectCategory = async () => {
    await axios
      .get( API_URL + "/api/v1/report-category/getAll", {
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${token.Token}`,
        },
      })
      .then((response) => {
        console.log("here")
        console.log(response.data)
        setReportCategory(response.data);
      })
      .catch((error) => console.log(error));
  };

  useEffect(() => {
    fetchPracticumProject();
    fetchProjectCategory();
  }, []);

  return (
    <>
      <div className="main-content-container p-4 container-fluid">
        <h3>Project</h3>
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
              Update Practicum Project
            </Typography>
          </Stack>
          <Box
            sx={{
              my: 3,
              mx: 4,
            }}
          >
            <InputLabel>Project Name</InputLabel>
            <TextField
              required
              multiline
              rows={2}
              fullWidth
              size="small"
              id="projectName"
              type="text"
              value={projectName == null ? "" : projectName}
              autoFocus
              sx={{ marginBottom: "20px" }}
              onChange={(e) => {
                setProjectName(e.target.value.toUpperCase());
              }}
            />
            <InputLabel>Project Description</InputLabel>
            <TextField
              multiline
              rows={3}
              required
              fullWidth
              size="small"
              id="projectDescription"
              type="text"
              value={projectDescription == null ? "" : projectDescription}
              sx={{ marginBottom: "20px" }}
              onChange={(e) => {
                setProjectDescription(e.target.value);
              }}
            />
            <InputLabel>Project Category</InputLabel>
            <Select
              multiple
              required
              fullWidth
              size="small"
              id="categories"
              type="text"
              value={categories}
              sx={{ marginBottom: "20px" }}
              onChange={handleCategories}
              renderValue={(categories) => (
                <div>
                  {categories.map((value) => (
                    <Chip
                      key={value}
                      label={value}
                      sx={{ marginRight: "5px" }}
                    />
                  ))}
                </div>
              )}
            >
              {reportCategory?.map((category) => (
                <MenuItem value={category.categoryName}>
                  {category.categoryName}
                </MenuItem>
              ))}
            </Select>
            <InputLabel>Project Type</InputLabel>
            <TextField
              disabled
              fullWidth
              size="small"
              id="projectType"
              type="text"
              value={courseName}
              sx={{ marginBottom: "20px" }}
            />
            <InputLabel>Additional Description</InputLabel>
            <TextField
              multiline
              rows={3}
              required
              fullWidth
              size="small"
              id="adminDescription"
              type="text"
              value={adminDescription == null ? "" : adminDescription}
              sx={{ marginBottom: "20px" }}
              onChange={(e) => {
                setAdminDescription(e.target.value);
              }}
            />

            <InputLabel>Image:</InputLabel>
            <FileUploader
              handleChange={handleUploadImage}
              //onclick download image
              name="file"
              types={imageType}
              //label="Browse to choose a file or Drag and drop"
              label={imageName}
              sx={{ marginBottom: "20px"}}
            />
            {/* <InputLabel sx={{marginTop: "20px"}}>Image Preview:</InputLabel>
            <Stack  sx={{marginTop: "-30px"}}>
            <CardMedia
              title="image" 
              component="img" 
              image={`data:imasge/webp;base64,${previewImage}`}
              sx={{
                //position: "relative",
                //height: 0,
                width: 200,
                //paddingTop: '56.25%',
                overflow: "hidden",
                borderRadius: 2,
                filter: "brightness(1)",
                mt: 4,
              }}
              >
            </CardMedia>
            </Stack> */}
            <FormControl sx={{ marginTop: "20px", marginBottom: "10px" }}>
              <FormLabel>
                Do you wish to add NDA agreement to this practicum project?
              </FormLabel>

              <RadioGroup sx={{ display: "block" }}>
                <FormControlLabel
                  value="yesNDA"
                  control={<Radio />}
                  label="Yes"
                  checked={isNda}
                  //checked={true}
                  onClick={handleOpenNDA}
                />
                <FormControlLabel
                  value="noNDA"
                  control={<Radio />}
                  label="No"
                  checked={!isNda}
                  onClick={handleCloseNDA}
                />
              </RadioGroup>
            </FormControl>
            <Stack>
              {(openNDA || isNda) && <InputLabel>NDA Agreement:</InputLabel>}
              {(openNDA || isNda) && (
                <FileUploader
                  handleChange={handleUploadFile}
                  name="file"
                  types={fileType}
                  //label="Browse to choose a file or Drag and drop"
                  label={ndaFileName}
                  sx={{ marginBottom: "20px" }}
                />
              )}
            </Stack>
            <Button
              variant="contained"
              sx={{ mt: 3, mb: 2 }}
              onClick={() => {
                console.log(categories)
                if (
                  projectName === null ||
                  projectName === "" ||
                  projectDescription === null ||
                  projectDescription === "" ||
                  categories.length===0 ||
                  categories === null
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
            Are you sure to update this practicum project?
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

export default EditPracticumProject;
