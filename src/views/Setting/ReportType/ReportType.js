import { React, useState, useEffect } from "react";
import { IconButton, Typography, CircularProgress, Chip } from "@mui/material";
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";
import ModeEditOutlinedIcon from "@mui/icons-material/ModeEditOutlined";
import axios from "axios";
import moment from "moment";
import Stack from "@mui/material/Stack";
import "../../../components/StatusLabel/StatusLabel.css";
import { useHistory } from "react-router-dom";
import { DataGrid, gridClasses } from "@mui/x-data-grid";
import { useCookies } from "react-cookie";
import { API_URL } from "../../../config";

function ReportType() {
  let history = useHistory();
  const [reportTypes, setReportTypes] = useState([]);
  const [pageSize, setPageSize] = useState(10);
  const [isLoading, setLoading] = useState(true);
  const [token, setToken] = useCookies();

  const getRowId = (params) => params.id;

  const columns = [
    {
      field: "academicSession",
      headerName: "Academic Session",
      description: "Academic Session",
      flex: 2.5,
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
      field: "milestone",
      headerName: "Milestone",
      description: "Milestone",
      flex: 1,
    },
    {
      field: "type",
      headerName: "Report Type Name",
      description: "Report Type Name",
      flex: 2,
    },
    {
      field: "dueDate",
      headerName: "Due Date",
      description: "Due Date",
      flex: 2.5,
      renderCell: (cellValues) => {
        var dueDate = moment(cellValues.value).format("DD-MMM-YYYY, hh:mm a");
        return <span>{dueDate}</span>;
      },
    },
    {
      field: "active",
      headerName: "Status",
      description: "Status",
      flex: 1,
      renderCell: (cellValues) => {
        return cellValues.value === true ? (
          <div className="active-status">
            <span>Active</span>
          </div>
        ) : (
          <div className="inactive-status">
            <span>Inactive</span>
          </div>
        );
      },
    },
    {
      field: "updatedAt",
      headerName: "Updated At",
      description: "Updated At",
      flex: 2,
      renderCell: (cellValues) => {
        var updatedAt = moment(cellValues.value).format("DD-MMM-YYYY, hh:mm a");
        return <span>{updatedAt}</span>;
      },
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
              onEdit(cellValues.row);
            }}
          >
            <ModeEditOutlinedIcon sx={{ fontSize: "20px" }} />
          </IconButton>
        );
      },
    },
  ];

  const fetchReportTypes = async () => {
    await axios
      .get( API_URL + "/api/v1/report-type/getAll", {
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${token.Token}`,
        },
      })
      .then((response) => {
        var data = response.data;
        setReportTypes(data);
        setLoading(false);
      })
      .catch((error) => console.log(error));
  };

  useEffect(() => {
    fetchReportTypes();
  }, []);

  const onCreate = () => {
    history.push("/createreporttype");
  };

  const onEdit = (reportType) => {
    history.push(`/editreporttype/${reportType.id}`);
  };

  return (
    <div className="main-content-container p-4 container-fluid">
      <h3 style={{ marginBottom: "20px" }}>Report Type</h3>
      <div
        style={{
          backgroundColor: "white",
          padding: "20px",
          borderRadius: "5px",
        }}
      >
        <Stack direction="row" alignItems="center" gap={1}>
          <Typography
            variant="h5"
            sx={{ fontWeight: "bold", paddingLeft: "5px" }}
          >
            List of Report Type
          </Typography>
          <IconButton
            color="primary"
            sx={{ marginLeft: "10px" }}
            onClick={onCreate}
          >
            <AddCircleOutlineIcon sx={{ fontSize: "30px" }} />
          </IconButton>
        </Stack>
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
            rows={reportTypes}
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

export default ReportType;
