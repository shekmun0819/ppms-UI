import { React, useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { IconButton, Typography, CircularProgress } from "@mui/material";
import { InputAdornment, TextField } from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import ModeEditOutlinedIcon from "@mui/icons-material/ModeEditOutlined";
import axios from "axios";
import { DataGrid, gridClasses } from "@mui/x-data-grid";
import { useCookies } from "react-cookie";
import FilterPanel from "../../components/FilterPanel/FilterPanel";
import { API_URL } from "../../config";

function ReportRepository() {
  const getRowId = (params) => params.id;

  const [reports, setReports] = useState([]);
  const [filteredReports, setFilteredReports] = useState([]);
  const [academicSessions, setAcademicSessions] = useState([]);
  const [categories, setCategories] = useState([]);
  const [pageSize, setPageSize] = useState(10);
  const [filterAcademicSessions, setFilterAcademicSessions] = useState([]);
  const [filterCategories, setFilterCategories] = useState([]);

  const [isLoading, setLoading] = useState(false);
  const [query, setQuery] = useState("");
  const [token, setToken] = useCookies();

  const capitalizeWords = (str) => {
    return str
      .toLowerCase()
      .split(" ")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  const handleQuery = (e) => {
    setQuery(e.target.value);
  };

  const filterHandler = (event) => {
    if (event.target.name === "category") {
      event.target.checked === true
        ? setFilterCategories([...filterCategories, event.target.value])
        : setFilterCategories(
            filterCategories.filter(
              (filterCategory) => filterCategory !== event.target.value
            )
          );
    } else if (event.target.name === "academic session") {
      event.target.checked === true
        ? setFilterAcademicSessions([
            ...filterAcademicSessions,
            event.target.value,
          ])
        : setFilterAcademicSessions(
            filterAcademicSessions.filter(
              (filterAcademicSession) =>
                filterAcademicSession !== event.target.value
            )
          );
    }
  };

  const applyFilters = () => {
    var filtered = [];

    if (query !== "") {
      filtered = reports.filter(
        (item) =>
          item.project.name.toLowerCase().includes(query) ||
          item.user.name.toLowerCase().includes(query)
      );
    } else if (
      filterAcademicSessions.length === 0 &&
      filterCategories.length > 0
    ) {
      filtered = reports.filter((item) => {
        var found = false;
        filterCategories.forEach((filterCategory) => {
          if (item.project.categories.includes(filterCategory)) {
            found = true;
          }
        });
        return found;
      });
    } else if (
      filterCategories.length === 0 &&
      filterAcademicSessions.length > 0
    ) {
      filtered = reports.filter((item) =>
        filterAcademicSessions.includes(
          item.project.academicSession.academicSession
        )
      );
    } else if (
      filterAcademicSessions.length > 0 &&
      filterCategories.length > 0
    ) {
      filtered = reports.filter((item) => {
        var foundCategory = false;
        var foundAcademic = false;
        if (
          filterAcademicSessions.includes(
            item.project.academicSession.academicSession
          )
        ) {
          foundAcademic = true;
        }
        filterCategories.forEach((filterCategory) => {
          if (item.project.categories.includes(filterCategory)) {
            foundCategory = true;
          }
        });
        if (foundAcademic && foundCategory) {
          return true;
        } else {
          return false;
        }
      });
    } else {
      filtered = reports;
    }
    setFilteredReports(filtered);
  };

  useEffect(() => {
    applyFilters();
  }, [filterAcademicSessions, filterCategories, query]);

  const columns = [
    {
      field: "academicSession",
      headerName: "Academic Session",
      description: "Academic Session",
      flex: 1,
      renderCell: (cellValues) => {
        return (
          <span>
            {cellValues.row.project.academicSession.academicSession}, Semester{" "}
            {cellValues.row.project.academicSession.semester}
          </span>
        );
      },
    },
    {
      field: "project",
      headerName: "Title",
      description: "Title",
      flex: 3,
      valueGetter: (reports) => capitalizeWords(reports.row.project.name),
      renderCell: (cellValues) => {
        return (
          <Link to={`/reportdetails/${cellValues.row.id}`}>
            {cellValues.value}
          </Link>
        );
      },
    },
    {
      field: "user",
      headerName: "Author",
      description: "Author",
      flex: 1,
      valueGetter: (reports) => capitalizeWords(reports.row.user.name),
    },
    // {
    //   field: "action",
    //   headerName: "Actions",
    //   description: "Actions",
    //   flex: 1,
    //   headerAlign: "center",
    //   align: "center",
    //   sortable: false,
    //   renderCell: (cellValues) => {
    //     return (
    //       <IconButton
    //         onClick={() => {
    //           //onEdit(cellValues.row);
    //         }}
    //       >
    //         <ModeEditOutlinedIcon sx={{ fontSize: "20px" }} />
    //       </IconButton>
    //     );
    //   },
    // },
  ];

  const fetchReports = async () => {
    await axios
      .get(API_URL + "/api/v1/report/getAll/publishReports", {
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${token.Token}`,
        },
      })
      .then((response) => {
        var data = response.data;
        setReports(data);
        setFilteredReports(data);
        setLoading(false);
      })
      .catch((error) => console.log(error));
  };

  const fetchAcademicSessions = async () => {
    await axios
      .get(API_URL + "/api/v1/academic-session/getAll", {
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${token.Token}`,
        },
      })
      .then((response) => {
        const uniqueAcadSessions = [];
        var data = response.data;
        data.map((item) => {
          var findItem = uniqueAcadSessions.find(
            (x) => x.academicSession === item.academicSession
          );
          if (!findItem) {
            uniqueAcadSessions.push(item);
          }
        });

        setAcademicSessions(uniqueAcadSessions);
      })
      .catch((error) => console.log(error));
  };

  const fetchCategories = async () => {
    await axios
      .get(API_URL + "/api/v1/report-category/getAll", {
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${token.Token}`,
        },
      })
      .then((response) => {
        var data = response.data;
        setCategories(data);
      })
      .catch((error) => console.log(error));
  };

  useEffect(() => {
    fetchReports();
    fetchAcademicSessions();
    fetchCategories();
  }, []);

  return (
    <div className="main-content-container p-4 container-fluid">
      <h3 style={{ marginBottom: "20px" }}>Report Repository</h3>

      <div
        className="row"
        style={{
          backgroundColor: "white",
          padding: "20px",
          borderRadius: "5px",
        }}
      >
        <div className="col-md-3">
          <FilterPanel
            academicSessions={academicSessions}
            categories={categories}
            handleChecked={filterHandler}
          />
        </div>
        <div className="col-md-9">
          <TextField
            id="search-bar"
            fullWidth
            type="text"
            placeholder="Search"
            size="small"
            onChange={handleQuery}
            sx={{ width: 600, borderRadius: "5px" }}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
          />

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
              rows={filteredReports}
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
    </div>
  );
}

export default ReportRepository;
