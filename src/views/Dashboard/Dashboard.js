import { React, useState, useEffect } from "react";
import "./StyleSheets/Dashboard.css";
import ChartSection from "./Components/ChartSection";
import DashboardHeaderSection from "./Components/DashboardHeaderSection";
import OrderSection from "./Components/OrderSection";
import TodoLiveChat from "./Components/TodoLiveChat";
import SubmissionSection from "./Components/SubmissionSection";
import BarChart from "./Components/BarChart";
import axios from "axios";
import { useCookies } from "react-cookie";
import { API_URL } from "../../config";

function Dashboard() {
  const [currentAcad, setCurrentAcad] = useState("");
  const [isLoading, setLoading] = useState(true);
  const [token, setToken] = useCookies();
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
        var activeAcad = data.filter((x) => x.active === true);
        var str =
          activeAcad[0].academicSession +
          ", " +
          "Semester " +
          activeAcad[0].semester.toString();
        setCurrentAcad(str);
        setLoading(false);
      })
      .catch((error) => console.log(error));
  };

  useEffect(() => {
    fetchAcademicSessions();
  }, []);

  return (
    <div className="main-content-container p-4 container-fluid">
      <h3>Dashboard</h3>
      <h5>Current Academic Session: {currentAcad}</h5>
      <div className="right-panel">
        <DashboardHeaderSection />
        <SubmissionSection />
        <BarChart />
        {/* <ChartSection />
        <OrderSection />
        <TodoLiveChat /> */}
      </div>
    </div>
  );
}

export default Dashboard;
