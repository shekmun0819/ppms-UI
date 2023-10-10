import { React, useState } from "react";
import { useHistory, useParams } from "react-router-dom";
import axios from "axios";
import { DataGrid, gridClasses } from "@mui/x-data-grid";
import { useEffect } from "react";
import { useCookies } from "react-cookie";
import moment from "moment";
import ArrowBackIosNewIcon from "@mui/icons-material/ArrowBackIosNew";
import Typography from "@mui/material/Typography";
import Stack from "@mui/material/Stack";
import IconButton from "@mui/material/IconButton";
import { Box, CircularProgress, FormControl } from "@mui/material";
import { API_URL } from "../../config";

function StudentReport(props) {
  const getRowId = (params) => params.id;

  const { id } = useParams();
  let history = useHistory();

  const [studentTitle, setStudentTitle] = useState("");
  const [reports, setReports] = useState([]);
  const [pageSize, setPageSize] = useState(10);
  const [isLoading, setLoading] = useState(true);
  const [token, setToken] = useCookies();

  const onBack = () => {
    history.goBack();
  };

  const handleDownload = async (row) => {
    await axios
      .get(API_URL + "/api/v1/report/download/" + row.id, {
        responseType: "blob",
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${token.Token}`,
        },
      })
      .then((response) => {
        let url = window.URL.createObjectURL(new Blob([response.data]));
        let link = document.createElement("a");
        link.href = url;
        link.setAttribute("download", row.fileName);
        document.body.appendChild(link);
        link.click();

        link.parentNode.removeChild(link);
      })
      .catch((error) => console.log(error));
  };

  const columns = [
    {
      field: "type",
      headerName: "Report Type",
      description: "Report Type",
      flex: 2,
      valueGetter: (reports) => reports.row.type.type,
    },
    {
      field: "fileName",
      headerName: "File Name",
      description: "File Name",
      flex: 3,
      renderCell: (cellValues) => {
        return (
          <a
            href="#"
            onClick={() => handleDownload(cellValues.row)}
            style={{ color: "blue", textDecoration: "underline" }}
          >
            {cellValues.value}
          </a>
        );
      },
    },
    {
      field: "similarityScore",
      headerName: "Similarity Score",
      description: "Similarity Score",
      flex: 2,
      renderCell: (cellValues) => {
        return <span> {cellValues.value}% </span>;
      },
    },
    {
      field: "updatedAt",
      headerName: "Submitted At",
      description: "Submitted At",
      flex: 2,
      renderCell: (cellValues) => {
        var updatedAt = moment(cellValues.value).format("DD-MMM-YYYY, hh:mm a");
        return <span>{updatedAt}</span>;
      },
    },
  ];

  useEffect(() => {
    fetchStudentDetails();
    fetchReports();
  }, []);

  const fetchReports = async () => {
    await axios
      .get(API_URL + `/api/v1/report/getAll/finalReports/studentId=${id}`, {
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${token.Token}`,
        },
      })
      .then((response) => {
        var data = response.data;
        setReports(data);
        setLoading(false);
      })
      .catch((error) => console.log(error));
  };

  const fetchStudentDetails = async () => {
    await axios
      .get(
        API_URL + `/api/v1/student/getDetails/userId=${props.match.params.id}`,
        {
          headers: {
            Accept: "application/json",
            Authorization: `Bearer ${token.Token}`,
          },
        }
      )
      .then((response) => {
        var data = response.data;
        setStudentTitle(data.user.name + ", " + data.matricNum);
      })
      .catch((error) => {
        console.log(error);
      });
  };

  return (
    <div className="main-content-container p-4 container-fluid">
      <h3 style={{ marginBottom: "20px" }}>Student: {studentTitle}</h3>
      {/* <Typography>
        Student: <strong> {studentName}</strong>
        <strong> ({matricNum})</strong>
      </Typography> */}
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
            View Reports
          </Typography>
        </Stack>
        <Box
          sx={{
            my: 3,
            mx: 4,
          }}
        ></Box>
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
            rows={reports}
            columns={columns}
            rowsPerPageOptions={[10, 50, 100]}
            disableColumnMenu={true}
            disableSelectionOnClick
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

export default StudentReport;
