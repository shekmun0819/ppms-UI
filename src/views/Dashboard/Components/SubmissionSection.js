import { React, useState, useEffect } from "react";
import axios from "axios";
import { useCookies } from "react-cookie";
import CircularProgressBar from "./CircularProgressBar";
import MenuItem from "@mui/material/MenuItem";
import FormControl from "@mui/material/FormControl";
import Select from "@mui/material/Select";
import { API_URL } from "../../../config";

function SubmissionSection() {
  const [cdsSubmission, setCdsSubmission] = useState("");
  const [cdtSubmission, setCdtSubmission] = useState("");
  const [overallSubmission, setOverallSubmission] = useState("");
  const [typeId, setTypeId] = useState("");
  const [reportTypes, setReportTypes] = useState([]);
  const [token, setToken] = useCookies();
  const [isLoading, setLoading] = useState(true);

  const handleTypeChange = (e) => {
    setTypeId(e.target.value);
  };

  const fetchSubmissionData = async () => {
    await axios
      .get(API_URL + `/api/v1/report/totalSubmission/${typeId}`, {
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${token.Token}`,
        },
      })
      .then((response) => {
        var data = response.data;
        setCdsSubmission(data.CDS590);
        setCdtSubmission(data.CDT594);
        setOverallSubmission(Math.round(data.Overall));
        setLoading(false);
      })
      .catch((error) => console.log(error));
  };

  const fetchReportTypes = async () => {
    await axios
      .get(API_URL + "/api/v1/report-type/getAll/currentAcademicSession", {
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${token.Token}`,
        },
      })
      .then((response) => {
        var data = response.data;
        var lastItem = data.length - 1;

        setReportTypes(data);
        setTypeId(data[lastItem].id);
        setLoading(false);
      })
      .catch((error) => console.log(error));
  };

  useEffect(() => {
    fetchReportTypes();
  }, []);

  useEffect(() => {
    if (typeId !== "") {
      fetchSubmissionData();
    }
  }, [typeId]);

  return (
    <div className="row">
      <div className="col-lg mb-4 col-sm-12 col-md-12">
        <div className="card">
          <div className="card-body">
            {/* <h4 className="box-title">Total Students' Report Submissions </h4>
              <button>test</button> */}
            <div className="row">
              <div className="col-lg-8">
                <h4 className="box-title">
                  Total Students' Report Submissions
                </h4>
              </div>
              <div className="col-lg-3 offset-lg-1">
                <FormControl sx={{ marginLeft: 1, minWidth: 180 }}>
                  <Select
                    labelId="demo-simple-select-label"
                    id="demo-simple-select"
                    value={typeId === null ? "" : typeId}
                    onChange={handleTypeChange}
                    displayEmpty
                    style={{ height: 30 }}
                  >
                    {reportTypes.map((option) => {
                      return (
                        <MenuItem key={option.id} value={option.id}>
                          {option.type}
                        </MenuItem>
                      );
                    })}
                  </Select>
                </FormControl>
              </div>
            </div>
          </div>
          <div className="row">
            <div className="col-lg-4 col-sm-12">
              <CircularProgressBar
                title="CDS590"
                percentage={cdsSubmission}
                circleWidth="200"
              />
            </div>
            <div className="col-lg-4 col-sm-12">
              <CircularProgressBar
                title="CDT594"
                percentage={cdtSubmission}
                circleWidth="200"
              />
            </div>
            <div className="col-lg-4 col-sm-12">
              <CircularProgressBar
                title="Total"
                percentage={overallSubmission}
                circleWidth="200"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SubmissionSection;
