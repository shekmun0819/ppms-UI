import { React, useState, useEffect } from "react";
import { useCookies } from 'react-cookie';
import axios from "axios";
import moment from "moment";
import jwt_decode from "jwt-decode";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import "jspdf-autotable";
import { Button, CircularProgress, Divider, FormControl, InputLabel, MenuItem, Select, Stack, Typography } from "@mui/material";
import { DataGrid, gridClasses, GridToolbarContainer, GridToolbarFilterButton } from "@mui/x-data-grid";
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

function MenteeSchedule() {

  const [token, setToken] = useCookies();
  const [isLoading, setLoading] = useState(false);
  
  const [academicSelection, setAcademicSelection] = useState([]);
  const [selectedAcademic, setSelectedAcademic] = useState(null);
  const [userId, setUserId] = useState(0);
  
  const [pageSize, setPageSize] = useState(10);
  const [presentations, setPresentations] = useState([]);
  const [students, setStudents] = useState([]);

  const getRowId = (params) => params.id;

  const columns = [
    {
      field: "matricNum",
      headerName: "Matric No.",
      description: "Matric No.",
      flex: 1,
      headerAlign: "center", 
      align: "center",
      renderCell: (cellValues) => {
        return (
          <span style={{ overflow: "hidden" }}>
            { students.find( (s) => s.user.id === cellValues.row.student.id).matricNum }
          </span>
        );
      },
    },
    {
      field: "student",
      headerName: "Student",
      description: "Student",
      flex: 2,
      renderCell: (cellValues) => {
        return (
          <span style={{ overflow: "hidden" }}>
            { CapitalizeWord(cellValues.row.student.name) }
          </span>
        );
      },
    },
    { field: "title", headerName: "Title", description: "Title", flex: 4,
      renderCell: (cellValues) => {
        return (
          <span style={{ overflow: "hidden" }}>
            { CapitalizeWord(cellValues.value) }
          </span>
        );
      },
    },
    {
      field: "venue",
      headerName: "Venue",
      description: "Venue",
      flex: 2,
      renderCell: (cellValues) => {
        return (
          <span style={{ overflow: "hidden" }}>
            {cellValues.row.venue}
          </span>
        );
      },
    },
    {
      field: "timeSlot",
      headerName: "Date & Time",
      description: "Date & Time",
      flex: 2,
      renderCell: (cellValues) => {
        return (
          <span style={{ overflow: "hidden" }}>
            {cellValues.row.day}
            <br></br>
            {cellValues.row.date}
            <br></br>
            {cellValues.row.timeSlot}
          </span>
        );
      },
    }
  ];

  const fetchPresentations = async () => {
    setLoading(true);
    let formData = new FormData();
    formData.append("userId", userId);

    await axios
      .put( API_URL + "/api/v1/presentation/host-academic/" + selectedAcademic.id, formData, {
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          Authorization: `Bearer ${token.Token}`,
        },
      })
      .then((response) => {
        var data = response.data;
        setPresentations(data.presentations);
        setStudents(data.students);
        setLoading(false);
      })
      .catch((error) => console.log(error));
  };

  const fetchHostAcademics = async () => {
    await axios
      .get( API_URL + "/api/v1/academic-session/getHostAcademics/" + userId, {
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${token.Token}`,
        },
      })
      .then((response) => {
        var data = response.data;
        setAcademicSelection(data);
        setSelectedAcademic(data[0]);
      })
      .catch((error) => console.log(error));
  };

  useEffect(() => {
    if(userId !== 0) {
      fetchHostAcademics();
    }
  }, [userId]);

  useEffect(() => {
    if(token['Token']) {
      const decoded = jwt_decode(token['Token']);
      setUserId(decoded.userInfo.id);
    }
  }, [token]);

  useEffect(() => {
    if(selectedAcademic && userId !== 0) {
      fetchPresentations();
    }
  }, [selectedAcademic]);

  return (
    <div className="main-content-container p-4 container-fluid">
      <h3 style={{ marginBottom: "20px" }}>Mentee Schedule</h3>
      <div
        style={{
          backgroundColor: "white",
          padding: "20px",
          borderRadius: "5px",
        }}
      >
        <Stack direction="row" alignItems="center" gap={3} sx={{ mb: 2 }}>
          <Typography
            variant="h5"
            sx={{ fontWeight: "bold", paddingLeft: "5px" }}
          >
            List of Presentations
          </Typography>
        </Stack>
        <div style={{ paddingLeft: "5px" }}>
          <InputLabel>Choose an Academic Session</InputLabel>
          <FormControl style={{width: '50%'}}>
            <Select
              id="academicSession"
              sx={{
                marginBottom: "10px",
              }}
              value={selectedAcademic == null ? "" : selectedAcademic.id}
              MenuProps={MenuProps}
              onChange={(e) => {
                let selected = academicSelection.find((element) => {
                  return element.id === e.target.value;
                })
                setSelectedAcademic(selected)
              }}
            >
              {
                academicSelection.length > 0 && academicSelection.map((item) => (
                  <MenuItem key={item.id} value={item.id}>{item.academicSession}, Semester {item.semester.toString()}</MenuItem>
                ))
              }
            </Select>
          </FormControl>
        </div>
        <Divider sx={{ mt: 3, mb: 3 }}/>
        {
          isLoading ? 
          (
            <div style={{ textAlign: "center" }}>
              <CircularProgress />
            </div>
          ) : 
          (
            <DataGrid
              pageSize={pageSize}
              onPageSizeChange={(newPageSize) => setPageSize(newPageSize)}
              getRowHeight={() => "auto"}
              autoHeight={true}
              getRowId={getRowId}
              rows={presentations}
              columns={columns}
              rowsPerPageOptions={[10, 50, 100]}
              disableColumnMenu={true}
              disableSelectionOnClick
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
          )
        }
      </div>
    </div>
  );
}

export default MenteeSchedule;


