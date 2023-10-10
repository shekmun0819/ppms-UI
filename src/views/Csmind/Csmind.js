import { React, useState, useEffect } from "react";
import { IconButton, Typography, CircularProgress } from "@mui/material";
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";
import ModeEditOutlinedIcon from "@mui/icons-material/ModeEditOutlined";
import axios from "axios";
import moment from "moment";
import Stack from "@mui/material/Stack";
import { useHistory } from "react-router-dom";
import {
  DataGrid,
  gridClasses,
  GridToolbarContainer,
  GridToolbarFilterButton,
} from "@mui/x-data-grid";
import { useCookies } from "react-cookie";
import { API_URL } from "../../config";

function CustomToolbar() {
  return (
    <GridToolbarContainer sx={{ margin: "0 5px 5px 0" }}>
      <GridToolbarFilterButton sx={{ fontSize: "16px", color: "black" }} />
    </GridToolbarContainer>
  );
}

function Csmind() {
  let history = useHistory();
  const [csminds, setCsminds] = useState([]);
  const [pageSize, setPageSize] = useState(10);
  const [isLoading, setLoading] = useState(true);
  const [token, setToken] = useCookies();

  const getRowId = (params) => params.id;

  const columns = [
    {
      field: "academicSession",
      headerName: "Academic Session",
      description: "Academic Session",
      flex: 2,
      renderCell: (cellValues) => {
        return (
          <span>
            {cellValues.row.academicSession.academicSession}, Semester{" "}
            {cellValues.row.academicSession.semester}
          </span>
        );
      },
    },
    { field: "startDate", headerName: "Start Date", description: "Start Date", headerAlign: "center", align: "center", flex: 2,
      renderCell: (cellValues) => {
        return <span style={{overflow: 'hidden'}}>{moment(cellValues.value).format("DD-MMM-YYYY")}</span>;
      },  
    },
    { field: "endDate", headerName: "End Date", description: "End Date", headerAlign: "center", align: "center", flex: 2,
      renderCell: (cellValues) => {
        return <span style={{overflow: 'hidden'}}>{moment(cellValues.value).format("DD-MMM-YYYY")}</span>;
      },  
    },
    { field: "numOfPresentations", headerName: "Presentations", description: "Total Presentations", headerAlign: "center", align: "center", flex: 2 },
    { field: "periodSlot", headerName: "Period Slot", description: "Schedule", headerAlign: "center", align: "center", flex: 2 },
    {
      field: "updatedAt",
      headerName: "Updated At",
      description: "Updated At",
      flex: 2,
      headerAlign: "center",
      align: "center",
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

  const fetchCsminds = async () => {
    setLoading(true);
    await axios
      .get( API_URL + "/api/v1/csmind/getAll", {
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${token.Token}`,
        },
      })
      .then((response) => {
        var data = response.data;
        setCsminds(data);
        setLoading(false);
      })
      .catch((error) => {
        console.log(error)
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchCsminds();
  }, []);

  const onCreate = () => {
    history.push("/createcsmind");
  };

  const onEdit = (csmind) => {
    history.push(`/editcsmind/${csmind.id}`);
  };

  return (
    <div className="main-content-container p-4 container-fluid">
      <h3 style={{ marginBottom: "20px" }}>CSMInD</h3>
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
            List of CSMInD
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
            rows={csminds}
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

export default Csmind;
