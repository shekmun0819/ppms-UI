import { React, useState, useEffect } from "react";
import DashboardHeaderCard from "./DashboardHeaderCard";
import axios from "axios";
import { useCookies } from "react-cookie";
import { API_URL } from "../../../config";

function DashboardHeaderSection() {
  const [courseCodes, setCourseCodes] = useState([]);
  const [token, setToken] = useCookies();

  const fetchCourseCodes = async () => {
    await axios
      .get( API_URL + "/api/v1/student/getAllStudentsByCourse", {
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${token.Token}`,
        },
      })
      .then((response) => {
        var data = response.data;
        setCourseCodes(data);
      })
      .catch((error) => console.log(error));
  };

  useEffect(() => {
    fetchCourseCodes();
  }, []);

  return (
    <div className="row">
      <DashboardHeaderCard
        count={courseCodes.CDS590}
        title={"CDS590"}
        icon={"person"}
        color={"flat-color-1"}
      />

      <DashboardHeaderCard
        count={courseCodes.CDT594}
        title={"CDT594"}
        icon={"person"}
        color={"flat-color-2"}
      />

      <DashboardHeaderCard
        count={courseCodes.CDS590 + courseCodes.CDT594}
        title={"Total Students"}
        icon={"people"}
        color={"flat-color-3"}
      />
    </div>
  );
}

export default DashboardHeaderSection;
