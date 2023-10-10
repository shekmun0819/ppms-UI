import { React, useState, useEffect } from "react";
import {
  Chart as ChartJs,
  BarElement,
  CategoryScale,
  LinearScale,
} from "chart.js";
import { Bar } from "react-chartjs-2";
import { FormControl, Select, MenuItem } from "@mui/material";
import axios from "axios";
import { useCookies } from "react-cookie";
import { API_URL } from "../../../config";

ChartJs.register(CategoryScale, LinearScale, BarElement);

function BarChart() {
  const [academicSessions, setAcademicSessions] = useState([]);
  const [selectedAcadSession, setSelectedAcadSession] = useState("");
  const [categories, setCategories] = useState([]);
  const [categoriesData, setCategoriesData] = useState([]);
  const [token, setToken] = useCookies();

  var data = {
    labels: categories,
    datasets: [
      {
        axis: "y",
        label: "# of Students",
        data: categoriesData,
        backgroundColor: [
          "rgba(255, 99, 132, 0.2)",
          "rgba(255, 159, 64, 0.2)",
          "rgba(255, 205, 86, 0.2)",
          "rgba(75, 192, 192, 0.2)",
          "rgba(54, 162, 235, 0.2)",
          "rgba(153, 102, 255, 0.2)",
          "rgba(201, 203, 207, 0.2)",
        ],
        borderColor: [
          "rgb(255, 99, 132)",
          "rgb(255, 159, 64)",
          "rgb(255, 205, 86)",
          "rgb(75, 192, 192)",
          "rgb(54, 162, 235)",
          "rgb(153, 102, 255)",
          "rgb(201, 203, 207)",
        ],
        borderWidth: 1,
      },
    ],
  };

  var options = {
    indexAxis: "y",
    maintainAspectRatio: false,
    responsive: true,
    scales: {
      y: {
        beginAtZero: true,
      },
    },
    legend: {
      labels: { fontSize: 26 },
    },
    responsive: true,
  };

  const fetchAcademicSessions = async () => {
    await axios
      .get( API_URL + "/api/v1/academic-session/getAll", {
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

  const fetchProjectCategoryData = async () => {
    await axios
      .get(
        API_URL + `/api/v1/practicumProjects/getProjectCategoryData/academicSessionId=${selectedAcadSession}`,
        {
          headers: {
            Accept: "application/json",
            Authorization: `Bearer ${token.Token}`,
          },
        }
      )
      .then((response) => {
        var data = response.data;
        setCategories(Object.keys(data));
        setCategoriesData(Object.values(data));
      })
      .catch((error) => console.log(error));
  };

  useEffect(() => {
    fetchAcademicSessions();
  }, []);

  useEffect(() => {
    if (selectedAcadSession !== "") {
      fetchProjectCategoryData();
    }
  }, [selectedAcadSession]);

  return (
    <div className="row">
      <div className="col-lg mb-4 col-sm-12 col-md-12">
        <div className="card">
          <div className="card-body">
            <div className="row">
              <div className="col-lg-8">
                <h4 className="box-title">
                  Total Number of Students By Project Category
                </h4>
              </div>
              <div className="col-lg-3 offset-lg-1">
                <FormControl sx={{ marginLeft: -3, minWidth: 180 }}>
                  <Select
                    id="acadSession"
                    value={
                      selectedAcadSession === "" ? "" : selectedAcadSession
                    }
                    onChange={(e) => {
                      setSelectedAcadSession(e.target.value);
                    }}
                    displayEmpty
                    style={{ height: 30 }}
                  >
                    {academicSessions &&
                      academicSessions.map((item) => (
                        <MenuItem key={item.id} value={item.id}>
                          {item.academicSession}, Semester{" "}
                          {item.semester.toString()}
                        </MenuItem>
                      ))}
                  </Select>
                </FormControl>
              </div>
            </div>
            <div>
              <Bar height={400} data={data} options={options} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default BarChart;
