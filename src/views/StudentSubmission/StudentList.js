import { React, useState, useEffect } from "react";
import { IconButton, Typography, CircularProgress, Stack } from "@mui/material";
import axios from "axios";
import jwt_decode from "jwt-decode";
import { useCookies } from "react-cookie";
import PageviewRoundedIcon from "@mui/icons-material/PageviewRounded";
import { useHistory } from "react-router-dom";
import { FormControl, Select, MenuItem } from "@mui/material";
import Divider from "@mui/material/Divider";
import {
  DataGrid,
  gridClasses,
  GridToolbarContainer,
  GridToolbarFilterButton,
} from "@mui/x-data-grid";
import CapitalizeWord from "../../utils/CapitalizeWord";
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

function CustomToolbar() {
  return (
    <GridToolbarContainer sx={{ margin: "0 5px 5px 0" }}>
      <GridToolbarFilterButton sx={{ fontSize: "16px", color: "black" }} />
    </GridToolbarContainer>
  );
}

function StudentList(props) {
  const getRowId = (params) => params.id;

  const { role } = props;

  let history = useHistory();
  const [academicSessions, setAcademicSessions] = useState([]);
  const [selectedAcadSession, setSelectedAcadSession] = useState("");
  const [projects, setProjects] = useState([]);
  const [studentDetails, setStudentDetails] = useState([]);
  const [pageSize, setPageSize] = useState(10);
  const [isLoading, setLoading] = useState(false);
  const [token, setToken] = useCookies();
  const [userInfo, setUserInfo] = useState({
    email: "",
    name: "",
    roles: "",
    userId: "",
  });

  const findMatricNum = (stuId) => {
    var foundStudent = studentDetails.find((stu) => stu.user.id === stuId);
    var foundMatric = foundStudent.matricNum;
    return foundMatric;
  };

  const findCourse = (stuId) => {
    var foundStudent = studentDetails.find((stu) => stu.user.id === stuId);
    var foundCourse = foundStudent.courseCode;
    return foundCourse;
  };

  const onView = (studentReport) => {
    history.push(`/viewstudentreport/studentId/${studentReport.student.id}`);
  };

  const columns = [
    {
      field: "academicSession",
      headerName: "Academic Session",
      description: "Academic Session",
      flex: 1,
      renderCell: (cellValues) => {
        return (
          <span>
            {cellValues.row.academicSession.academicSession}, Semester{" "}
            {cellValues.row.academicSession.semester}
          </span>
        );
      },
    },
    {
      field: "course",
      headerName: "Course",
      description: "Course",
      flex: 1,
      renderCell: (cellValues) => {
        if (studentDetails.length > 0) {
          var course = findCourse(cellValues.row.student.id);
          return course ? <span> {course}</span> : <span>NA</span>;
        }
      },
    },
    {
      field: "student",
      headerName: "Student Name",
      description: "Student Name",
      flex: 2,
      renderCell: (cellValues) => {
        return <span> {CapitalizeWord(cellValues.row.student.name)}</span>;
      },
    },
    {
      field: "matricNum",
      headerName: "Matric No.",
      description: "Matric No.",
      flex: 1,
      renderCell: (cellValues) => {
        if (studentDetails.length > 0) {
          var matricNum = findMatricNum(cellValues.row.student.id);
          return matricNum ? <span> {matricNum}</span> : <span>NA</span>;
        }
      },
    },
    {
      field: "name",
      headerName: "Title",
      description: "Title",
      flex: 4,
      valueGetter: (params) => CapitalizeWord(params.value),
    },
    {
      field: "action",
      headerName: "Actions",
      description: "Actions",
      flex: 1,
      headerAlign: "center",
      align: "center",
      sortable: false,
      renderCell: (cellValues) => {
        return (
          <IconButton
            onClick={() => {
              onView(cellValues.row);
            }}
          >
            <PageviewRoundedIcon
              sx={{
                fontSize: "25px",
                //color: blue[500],
              }}
            />
          </IconButton>
        );
      },
    },
  ];

  const fetchAcademicSessions = async () => {
    await axios
      .get(API_URL + "/api/v1/academic-session/getAll", {
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${token.Token}`,
        },
      })
      .then((response) => {
        var data = response.data;
        setAcademicSessions(data);
        setSelectedAcadSession(data[0].id);
      })
      .catch((error) => console.log(error));
  };

  const fetchProjects = async () => {
    await axios
      .get(
        API_URL +
          `/api/v1/practicumProjects/getProject/${role.toLowerCase()}/${
            userInfo.userId
          }`,
        {
          headers: {
            Accept: "application/json",
            Authorization: `Bearer ${token.Token}`,
          },
        }
      )
      .then((response) => {
        var data = response.data;
        var projects = data.projects;
        var filtered = [];

        filtered = projects.filter(
          (project) => project.academicSession.id === selectedAcadSession
        );

        setProjects(filtered);
        setStudentDetails(data.studentDetails);
        setLoading(false);
      })
      .catch((error) => {
        console.log(error);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchAcademicSessions();
  }, []);

  useEffect(() => {
    const decoded = jwt_decode(token["Token"]);
    setUserInfo({
      email: decoded.userInfo.email,
      name: decoded.userInfo.name,
      roles: decoded.userInfo.roles,
      userId: decoded.userInfo.id,
    });
  }, [token]);

  useEffect(() => {
    if (userInfo.userId !== "" && selectedAcadSession !== "") {
      fetchProjects();
    }
  }, [userInfo, selectedAcadSession]);

  return (
    <div className="main-content-container p-4 container-fluid">
      <h3 style={{ marginBottom: "20px" }}>Role: {role}</h3>
      <div
        style={{
          backgroundColor: "white",
          padding: "20px",
          borderRadius: "5px",
        }}
      >
        <Typography
          variant="h5"
          sx={{ fontWeight: "bold", paddingLeft: "5px" }}
        >
          List of Students
        </Typography>
        <Stack direction="row" alignItems="center" spacing={2}>
          <Typography>Academic Session:</Typography>
          <FormControl sx={{ minWidth: "30%" }}>
            <Select
              id="acadSession"
              sx={{
                marginY: "20px",
                height: "40px",
              }}
              value={selectedAcadSession === "" ? "" : selectedAcadSession}
              MenuProps={MenuProps}
              onChange={(e) => {
                setSelectedAcadSession(e.target.value);
              }}
            >
              {academicSessions &&
                academicSessions.map((item) => (
                  <MenuItem key={item.id} value={item.id}>
                    {item.academicSession}, Semester {item.semester.toString()}
                  </MenuItem>
                ))}
            </Select>
          </FormControl>
        </Stack>
        <Divider sx={{ mt: 1, mb: 1 }} />
        {isLoading ? (
          <div style={{ textAlign: "center" }}>
            <CircularProgress />
          </div>
        ) : (
          <DataGrid
            pageSize={pageSize}
            onPageSizeChange={(newPageSize) => setPageSize(newPageSize)}
            getRowHeight={() => "auto"}
            autoHeight={true}
            getRowId={getRowId}
            rows={projects}
            columns={columns}
            rowsPerPageOptions={[10, 50, 100]}
            disableColumnMenu={true}
            disableSelectionOnClick
            components={{ Toolbar: CustomToolbar }}
            componentsProps={{
              panel: {
                placement: "top",
              },
            }}
            sx={{
              ".MuiDataGrid-columnHeaderTitle": {
                fontWeight: "bold !important",
                overflow: "hidden !important",
                fontSize: "16px",
                textOverflow: "ellipsis",
              },
              [`& .${gridClasses.cell}`]: {
                py: 2,
              },
              ".MuiTablePagination-displayedRows": {
                marginTop: "1em",
                marginBottom: "1em",
              },
              ".MuiTablePagination-displayedRows, .MuiTablePagination-selectLabel":
                {
                  marginTop: "1em",
                  marginBottom: "1em",
                },
              border: "none",
            }}
          />
        )}
      </div>
    </div>
  );
}

export default StudentList;
