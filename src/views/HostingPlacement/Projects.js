import axios from "axios";
import { useState, useEffect } from "react";
import { useCookies } from "react-cookie";
import {
  Container,
  Grid,
  Box,
  Card,
  Typography,
  CardMedia,
  Stack,
  IconButton,
  TextField,
  InputAdornment,
  FormControl,
  Select,
  InputLabel,
  MenuItem,
  CircularProgress,
  Snackbar,
  Alert,
  Dialog,
  DialogContent,
  DialogTitle,
  Button,
  DialogContentText,
  DialogActions,
} from "@mui/material";
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";
import { useHistory } from "react-router-dom";
import SearchIcon from "@mui/icons-material/Search";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import dummyImage from "../../assets/images/The-Role-of-Marketing-1.jpg";
import DoDisturbIcon from "@mui/icons-material/DoDisturb";
import jwt_decode from "jwt-decode";
import { API_URL } from "../../config";
import CapitalizeWord from '../../utils/CapitalizeWord';

function Projects() {
  let history = useHistory();
  const [practicumProjects, setPracticumProjects] = useState([]);
  let [filtered, setFiltered] = useState([]);
  const [isLoading, setLoading] = useState(true);
  const [token, setToken] = useCookies();
  const [sort, setSorting] = useState("");
  const [selectedFilter, setSelectedFilter] = useState("");
  const [role, setRole] = useState("");
  const [userId, setUserId] = useState();
  const [openSB, setOpenSB] = useState(false);
  const decoded = jwt_decode(token["Token"]);
  const [openConfirmBox, setOpenConfirmBox] = useState(false);
  const [searchingList, setSearchingList] = useState([]);
  const [filterList, setFilterList] = useState([]);
  const [deleteProject, setDeleteProject] = useState([]);
  const [reportCategory, setReportCategory] = useState([]);
  const [academicSession, setAcademicSession] = useState([]);
  const [selectedAcademicSession, setSelectedAcademicSession] = useState("");
  const [academicSessionFilterList, setAcademicSessionFilterList] = useState([]);
  const [searchInput, setSearchInput] = useState("");
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

  const handleOpenConfirmBox = (e) => {
    e.stopPropagation();
    setOpenConfirmBox(true);
  };
  const handleCloseConfirmBox = () => {
    setOpenConfirmBox(false);
  };

  const globalSearch = () => {
    //setSearching(e.target.value);
    //initialize filter and sort
    setSelectedFilter("");
    setSorting("");
    console.log("click");

    if (searchInput === "") {
      setFiltered(academicSessionFilterList);
      setSearchingList(academicSessionFilterList);
    } else {
      let newArray = academicSessionFilterList?.filter((value) => {
        return (
          value?.name.toLowerCase().includes(searchInput) ||
          value?.name.toUpperCase().includes(searchInput) ||
          value?.name.includes(searchInput) ||
          value?.description.toLowerCase().includes(searchInput) ||
          value?.description.toUpperCase().includes(searchInput) ||
          value?.description.includes(searchInput)
        );
      });
      setSearchingList(newArray); //in case later got filter action
      setFiltered(newArray); //to display
    }
  };

  const handleFilterChange = (e) => {
    setSelectedFilter(e.target.value);
    //setFilterList(filterList); //filterList = from search list
    //filteringList = filterList
    if (e.target.value === "all") {
      if (searchInput === "") {
        setFiltered(academicSessionFilterList);
        console.log("when search input is empty and e.target.value is all");
        console.log(filtered);
      } else {
        setFiltered(searchingList);
      }
    } else {
      if (searchInput === "") {
        let newArray = academicSessionFilterList.filter((project) => {
          return project.categories.includes(e.target.value);
        });
        setFiltered(newArray);
      } else {
        let newArray = searchingList.filter((project) => {
          return project.categories.includes(e.target.value);
        });
        setFiltered(newArray);
      }
    }
  };

  const onEdit = (e, practicumProject) => {
    e.stopPropagation();
    history.push(`/editpracticumproject/${practicumProject.id}`);
  };

  const onDelete = async (deleteProject) => {
    //will update status from open to closed
    await axios
      .put(
         API_URL + "/api/v1/practicumProjects/delete/" +
          deleteProject.id,
        "",
        {
          headers: {
            Accept: "application/json",
            Authorization: `Bearer ${token.Token}`,
          },
        }
      )
      .then((response) => {
        setMessage({
          status: "success",
          statusText: "Project " + deleteProject.name + " is deactivated",
        });
        setOpenSB(true);
        handleCloseConfirmBox();
        window.location.reload();
      })
      .catch((error) => console.log(error));
  };

  const fetchPracticumProjects = async () => {
    if (
      decoded.userInfo.roles.includes("Host") //||
      //decoded.userInfo.roles.includes("Lecturer")
    ) {
      await axios
        .get(
           API_URL + "/api/v1/practicumProjects/getByUserId/" +
            decoded.userInfo.id,
          {
            headers: {
              responseType: "blob",
              Accept: "application/json",
              Authorization: `Bearer ${token.Token}`,
            },
          }
        )
        .then((response) => {
          //const imageUrl = URL.createObjectURL(response.data.imageData);
          setPracticumProjects(response.data);
          setFiltered(response.data);
          setAcademicSessionFilterList(response.data);
          setLoading(false);
        })
        .catch((error) => console.log(error));
    } else if (decoded.userInfo.roles.includes("Student")) {
      await axios
        .get(
           API_URL + "/api/v1/practicumProjects/getOpenAndActiveProject",
          {
            headers: {
              Accept: "application/json",
              Authorization: `Bearer ${token.Token}`,
            },
          }
        )
        .then((response) => {
          setPracticumProjects(response.data);
          setFiltered(response.data);
          setAcademicSessionFilterList(response.data);
          setLoading(false);
        })
        .catch((error) => console.log(error));
    } else if (
      decoded.userInfo.roles.includes("Admin") ||
      decoded.userInfo.roles.includes("Lecturer") ||
      !decoded.userInfo.includes("Host")
    ) {
      await axios
        .get( API_URL + "/api/v1/practicumProjects/getAll", {
          headers: {
            Accept: "application/json",
            Authorization: `Bearer ${token.Token}`,
          },
        })
        .then((response) => {
          console.log(response.data);
          setPracticumProjects(response.data);
          setFiltered(response.data);
          setAcademicSessionFilterList(response.data);
          setLoading(false);
        })
        .catch((error) => console.log(error));
    }
  };

  function sortDateFunction(a, b) {
    var dateA = new Date(a.updatedAt);
    var dateB = new Date(b.updatedAt);
    return dateB > dateA ? 1 : -1;
  }

  useEffect(() => {}, [filtered, searchingList, filterList]);

  const handleSortChange = (e) => {
    setSorting(e.target.value);
    if (e.target.value === "valueAsc" || e.target.value === "default") {
      filtered = filtered.sort((a, b) => {
        const nameA = a.name.toUpperCase();
        const nameB = b.name.toUpperCase();
        if (nameA < nameB) {
          return -1;
        }
        if (nameA > nameB) {
          return 1;
        }

        return 0;
      });
      setFiltered(filtered);
    } else if (e.target.value === "valueDsc") {
      filtered = filtered.sort((a, b) => {
        const nameA = a.name.toUpperCase();
        const nameB = b.name.toUpperCase();
        if (nameA < nameB) {
          return 1;
        }
        if (nameA > nameB) {
          return -1;
        }

        return 0;
      });
      setFiltered(filtered);
    } else if (e.target.value === "latestDate") {
      filtered = filtered.sort(sortDateFunction);
      setFiltered(filtered);
    }
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
        setReportCategory(response.data);
      })
      .catch((error) => console.log(error));
  };

  const handleAcademicSession = (e) => {
    console.log(e.target.value)
    setSelectedAcademicSession(e.target.value);

    if (e.target.value === "all") {
      console.log("all");
      setAcademicSessionFilterList(practicumProjects);
      setFiltered(practicumProjects);
    } else {
      var semester = e.target.value.split(",")[1].trim();
      var academicSession = e.target.value.split(",")[0].trim();
      console.log("semester: " + semester);
      var newArray = practicumProjects.filter((project) => {
        return project.academicSession.academicSession.includes(academicSession) && project.academicSession.semester.toString().includes(semester);
      });
      setAcademicSessionFilterList(newArray)
      setFiltered(newArray);
    }
    setSelectedFilter("");
    setSorting("");
    setSearchInput("")
  };

  useEffect(() => {
    //getRole();
    fetchPracticumProjects();
    fetchProjectCategory();
    fetchAcademicSession();
  }, []);

  const onCreate = () => {
    history.push("/createpracticumproject");
  };

  const onDetail = (practicumProject) => {
    history.push(`/practicumprojectdetail/${practicumProject.id}`);
  };

  const fetchAcademicSession = async () => {
    await axios
      .get( API_URL + "/api/v1/academic-session/getAll", {
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${token.Token}`,
        },
      })
      .then((response) => {
        console.log(response.data);
        setAcademicSession(response.data);
      })
      .catch((error) => console.log(error));
  };

  return (
    <div className="main-content-container p-4 container-fluid">
      <Stack direction="row" style={{ marginBottom: "20px" }}>
        <h3>Projects</h3>
        {(decoded.userInfo.roles.includes("Admin") ||
          decoded.userInfo.roles.includes("Lecturer")) && (
            <Stack direction="row" marginLeft={"75%"}>
          <FormControl
            sx={{ minWidth: "180px" , paddingTop: 1 }}
            size="small"
          >
            <InputLabel id="demo-simple-select-label" sx={{ paddingTop: 1 }}>
              Academic Session
            </InputLabel>
            <Select
              labelId="test-select-label"
              id="demo-simple-select"
              label="Academic Session"
              //name="xxx"
              value={selectedAcademicSession}
              onChange={handleAcademicSession}
            >
              <MenuItem value="all">All</MenuItem>
              {academicSession?.map((academicSession) => (
                <MenuItem
                  value={
                    academicSession.academicSession +
                    "," +
                    academicSession.semester
                  }
                >
                  {academicSession.academicSession}, Semester {academicSession.semester}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          </Stack>
        )}
      </Stack>
      <div
        style={{
          backgroundColor: "white",
          padding: "20px",
          borderRadius: "5px",
        }}
      >
        <Container>
          <Stack direction="row" alignItems="center" gap={1}>
            <Typography
              variant="h5"
              sx={{ fontWeight: "bold", paddingLeft: "5px" }}
            >
              List of Practicum Projects
            </Typography>
            {(decoded.userInfo.roles.includes("Host") ||
              decoded.userInfo.roles.includes("Admin")) && (
              <IconButton
                color="primary"
                sx={{ marginLeft: "10px" }}
                onClick={onCreate}
              >
                <AddCircleOutlineIcon sx={{ fontSize: "30px" }} />
              </IconButton>
            )}
          </Stack>
          <Stack direction="row" sx={{ marginBottom: "20px" }}>
            <TextField
              sx={{
                backgroundColor: "#FFFFFF",
                width: "400px",
                borderRadius: "50",
                "& .MuiOutlinedInput-notchedOutline legend": {
                  display: "none",
                },
                paddingTop: "10px",
                paddingBottom: "10px",
              }}
              size="small"
              id="outlined-basic"
              variant="outlined"
              placeholder="Search"
              value={searchInput}
              onChange={(e) => {
                setSearchInput(e.target.value);
              }}
              //onChange={globalSearch}
              InputLabelProps={{
                shrink: true,
              }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
              }}
            />
            <Button
              sx={{
                minWidth: 50,
                height: "40px",
                marginLeft: 2,
                marginTop: 1,
                paddingTop: 1,
              }}
              variant="outlined"
              onClick={globalSearch}
            >
              Search
            </Button>
            <FormControl
              sx={{ minWidth: "20%", marginLeft: "20%", paddingTop: 1 }}
              size="small"
            >
              <InputLabel id="demo-simple-select-label" sx={{ paddingTop: 1 }}>
                Sort By
              </InputLabel>
              <Select
                labelId="demo-simple-select-label"
                id="demo-simple-select"
                label="Sort By"
                //name="xxx"
                value={sort}
                onChange={handleSortChange}
              >
                <MenuItem value="default">Default</MenuItem>
                <MenuItem value="valueAsc">Project Name(A-Z)</MenuItem>
                <MenuItem value="valueDsc">Project Name(Z-A)</MenuItem>
                <MenuItem value="latestDate">By latest date</MenuItem>
              </Select>
            </FormControl>
            <FormControl
              sx={{ minWidth: "20%", marginLeft: 2, paddingTop: 1 }}
              size="small"
            >
              <InputLabel
                id="demo-simple-select-label"
                v
                sx={{ paddingTop: 1 }}
              >
                Filter By
              </InputLabel>
              <Select
                labelId="demo-simple-select-label"
                id="demo-simple-select"
                label="Filter By"
                //name="xxx"
                value={selectedFilter}
                onChange={handleFilterChange}
              >
                <MenuItem value="all">All</MenuItem>
                {reportCategory?.map((category) => (
                  <MenuItem value={category.categoryName}>
                    {category.categoryName}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Stack>
          <Grid container spacing={3}>
            {isLoading ? (
              <div
                style={{
                  textAlign: "center",
                  paddingLeft: "50%",
                  paddingTop: "20px",
                }}
              >
                <CircularProgress />
              </div>
            ) : (
              filtered?.map((item, i) => (
                <Grid
                  item
                  xs={3}
                  sm={4}
                  key={i}
                  sx={{ marginBottom: "-150px" }}
                >
                  <Box
                    onClick={() => {
                      onDetail(filtered[i]);
                    }}
                    component={Card}
                    padding={3}
                    width={1}
                    height={0.6}
                    sx={{
                      boxShadow: 15,
                      borderRadius: 5,
                      bgcolor:
                        filtered[i].status === "Closed" ? "#afafaf" : "#f8f8fa",
                      "&:hover": {
                        bgcolor: "#C5CAE9",
                        color: "#212121",
                      },
                    }}
                  >
                    <Box display="flex" flexDirection="column">
                      <Typography
                        variant="h6"
                        noWrap
                        sx={{
                          fontWeight: 600,
                        }}
                      >
                        {CapitalizeWord(filtered[i].name)}
                      </Typography>
                      <Typography noWrap color="inherit">
                        {filtered[i].description}
                      </Typography>
                    </Box>
                    <Box display="block" width={1} height={0.8}>
                      <Card
                        sx={{
                          width: 1,
                          height: 1,
                          display: "flex",
                          flexDirection: "column",
                          boxShadow: "none",
                          bgcolor: "transparent",
                          backgroundImage: "none",
                        }}
                      >
                        <CardMedia
                          title="image"
                          component="img"
                          image={`data:image/webp;base64,${filtered[i].imageData}`}
                          //image = {URL.createObjectURL(filtered[i].imageData)}
                          //image={filtered[i].imageData}
                          //image = {require(("../../assets/images/practicum-project/" + filtered[i]?.imageName)?("../../assets/images/practicum-project/" + filtered[i]?.imageName):dummyImage)}
                          sx={{
                            position: "relative",
                            height: 320,
                            overflow: "hidden",
                            borderRadius: 2,
                            filter: "brightness(1)",
                            mt: 4,
                          }}
                        ></CardMedia>
                        {(decoded.userInfo.roles.includes("Host") ||
                          decoded.userInfo.roles.includes("Admin")) && (filtered[i].status==="Open") && (
                          <Stack
                            direction="row"
                            justifyContent="end"
                            sx={{ paddingTop: "10px" }}
                          >
                            <IconButton
                              color="primary"
                              sx={{ marginLeft: "10px" }}
                              onClick={(e) => {
                                onEdit(e, filtered[i]);
                              }}
                            >
                              <EditIcon
                                sx={{ fontSize: "30px", color: "#0d6efd" }}
                              />
                            </IconButton>
                            <IconButton
                              color="primary"
                              sx={{ marginLeft: "10px" }}
                              onClick={(e) => {
                                handleOpenConfirmBox(e);
                                setDeleteProject(filtered[i]);
                              }}
                            >
                              <DoDisturbIcon
                                sx={{ fontSize: "30px", color: "#0d6efd" }}
                              />
                            </IconButton>
                          </Stack>
                        )}
                      </Card>
                    </Box>
                  </Box>
                </Grid>
              ))
            )}
          </Grid>
        </Container>
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
              Are you sure to deactivate this practicum project? This action will
              only hide the project from user, it will still display under your
              list of projects. 
              Please note that once the project is deactivated, it could not be reactived or edited.
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseConfirmBox}>No</Button>
            {
              <Button
                onClick={(e) => {
                  onDelete(deleteProject);
                }}
                autoFocus
              >
                Yes
              </Button>
            }
          </DialogActions>
        </Dialog>
      </div>
    </div>
  );
}

export default Projects;
