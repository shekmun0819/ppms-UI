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
  FormLabel,
  RadioGroup,
  FormControlLabel,
  Radio,
} from "@mui/material";
import ArrowBackIosNewIcon from "@mui/icons-material/ArrowBackIosNew";
import { useHistory } from "react-router-dom";
import { FileUploader } from "react-drag-drop-files";
import { useEffect, useState } from "react";
import axios from "axios";
import { useCookies } from "react-cookie";
import jwt_decode from "jwt-decode";
import { API_URL } from "../../config";
import CapitalizeWord from "../../utils/CapitalizeWord"
const imageType = ["JPG", "PNG", "JPEG"];
const fileType = ["PDF"];

function CreatePracticumProject() {
  let history = useHistory();
  const [projectName, setProjectName] = useState("");
  const [projectDescription, setProjectDescription] = useState("");
  const [categories, setCategories] = useState([]); //multiselect
  const [adminDescription, setadminDescription] = useState("");
  const [image, setImage] = useState(null);
  const [imageName, setImageName] = useState(null);
  const [token, setToken] = useCookies();
  const [openSB, setOpenSB] = useState(false);
  const [openConfirmBox, setOpenConfirmBox] = useState(false);
  const [reportCategory, setReportCategory] = useState([]);
  const [courseName, setCourseName] = useState("");
  const [openNDA, setOpenNDA] = useState(false);
  const [isNda, setIsNda] = useState(null);
  const [ndaAgreement, setNdaAgreement] = useState(null);
  const [hostList, setHostList] = useState([]);
  const [host, setHost] = useState("");
  const decoded = jwt_decode(token["Token"]);


  const handleOpenNDA = () => {
    setOpenNDA(true);
    setIsNda(true);
  };

  const handleCloseNDA = () => {
    setOpenNDA(false);
    setIsNda(false);
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

  const handleUploadImage = (file) => {
    setImage(file);
    setImageName(file.name);
    console.log(file);
  };

  const handleUploadFile = (file) => {
    setNdaAgreement(file);
    console.log(file);
  };

  const courseNameOnChange = (e) => {
    setCourseName(e.target.value.toUpperCase());
  };

  var list = [];
  const setData = (hostData) => {
    for (var i = 0; i < hostData.length; i++) {
      const data = {
        host: hostData[i]?.user
      };
      list = [...list, data];

    }
    console.log(list)
    setHostList(list);

  }

  const onCreatePracticumProjects = async () => {
    const data = new FormData();
    data.append("name", projectName.toUpperCase());
    data.append("description", projectDescription);
    data.append("categories", categories.toString());
    data.append("adminDescription", adminDescription);
    if(decoded.userInfo.roles.includes("Admin")){
      data.append("host_id", host)
    }else{
      data.append("host_id", jwt_decode(token["Token"]).userInfo.id);
    }
    data.append("imageName", imageName);
    data.append("image", image);
    data.append("course_name", courseName);
    data.append("isNda", isNda);
    if (openNDA) {
      data.append("nda", ndaAgreement);
    }
    await axios
      .post(API_URL + "/api/v1/practicumProjects/addpracticumproject", data, {
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
          statusText: "A new practicum project is successfully created.",
        });
        setOpenSB(true);
        handleCloseConfirmBox();
        //window.location.reload();
      })
      .catch((error) => {
        console.log(error);
        setMessage({
          status: "error",
          statusText: "Failed to create new practicum project.",
        });
        setOpenSB(true);
      });
  };

  const categoriesOnChange = (event) => {
    setCategories(event.target.value);
  };

  const fetchHosts = async () =>{
    axios.get( API_URL + "/api/v1/host/getAll", {
      headers:{
        Accept: "application/json",
        Authorization: `Bearer ${token.Token}`,
      },
    })
    .then((response)=>{
      console.log(response.data);
      setData(response.data);
      //setHostList(response.data);
    })
    .catch((error) => console.log(error));
  }

  const hostOnChange = (e) =>{
    setHost(e.target.value)
    console.log("Hostonchange:" + e.target.value);
  }

  const fetchProjectCategory = async () => {
    await axios
      .get(API_URL + "/api/v1/report-category/getAll", {
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${token.Token}`,
        },
      })
      .then((response) => {
        setReportCategory(response.data);
        console.log(response.data);
      })
      .catch((error) => console.log(error));
  };

  useEffect(() => {
    fetchProjectCategory();
    if(decoded.userInfo.roles.includes("Admin")){
      fetchHosts();
    }
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
              Create Practicum Project
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
              multiline
              rows={2}
              required
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
              fullWidth
              required
              value={categories}
              onChange={categoriesOnChange}
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
              sx={{ marginBottom: "20px" }}
            >
              {reportCategory?.map((category) => (
                <MenuItem value={category.categoryName}>
                  {category.categoryName}
                </MenuItem>
              ))}
            </Select>
            <InputLabel>Project Type</InputLabel>
            <Select
              fullWidth
              required
              value={courseName}
              onChange={courseNameOnChange}
              sx={{ marginBottom: "20px" }}
            >
              <MenuItem value="DIGITAL TRANSFORMATION">
                Digital Transformation
              </MenuItem>
              <MenuItem value="DATA SCIENCE AND ANALYTICS">
                Data Science and Analytics
              </MenuItem>
            </Select>
            {(decoded.userInfo.roles.includes("Admin"))&& <><InputLabel>Host</InputLabel><Select
              multiple={false}
              fullWidth
              required
              value={host}
              onChange={hostOnChange}
              sx={{ marginBottom: "20px" }}
            >
              {hostList?.map((host,i) => (
                <MenuItem value={host.host.id}>
                  {CapitalizeWord(host.host.name)}
                </MenuItem>
              ))}
            </Select></>}
            <InputLabel>Additional Description </InputLabel>
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
                setadminDescription(e.target.value);
              }}
            />

            <InputLabel>Image:</InputLabel>
            <FileUploader
              handleChange={handleUploadImage}
              name="file"
              types={imageType}
              label="Browse to choose a file or Drag and drop"
              sx={{ marginBottom: "30px" }}
            />

            <FormControl sx={{ marginTop: "20px", marginBottom: "10px" }}>
              <FormLabel>
                Do you wish to add NDA agreement to this practicum project?
              </FormLabel>

              <RadioGroup sx={{ display: "block" }}>
                <FormControlLabel
                  value="yesNDA"
                  control={<Radio />}
                  label="Yes"
                  onClick={handleOpenNDA}
                />
                <FormControlLabel
                  value="noNDA"
                  control={<Radio />}
                  label="No"
                  onClick={handleCloseNDA}
                />
              </RadioGroup>
            </FormControl>
            <Stack>
              {openNDA && <InputLabel>NDA Agreement:</InputLabel>}
              {openNDA && (
                <FileUploader
                  handleChange={handleUploadFile}
                  name="file"
                  types={fileType}
                  label="Browse to choose a file or Drag and drop"
                  sx={{ marginBottom: "20px" }}
                />
              )}
            </Stack>
            <Button
              variant="contained"
              sx={{ mt: 3, mb: 2 }}
              onClick={() => {
                if (
                  projectName === null ||
                  projectName === "" ||
                  projectDescription === null ||
                  projectDescription === "" ||
                  categories === null ||
                  categories === "" ||
                  adminDescription === null ||
                  adminDescription === ""
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
            Are you sure to create this practicum project?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseConfirmBox}>No</Button>
          <Button onClick={onCreatePracticumProjects} autoFocus>
            Yes
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}

export default CreatePracticumProject;
