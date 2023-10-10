/* eslint-disable jsx-a11y/anchor-is-valid */
import React, { useState, useEffect } from "react";
import { withRouter } from "react-router-dom";
import "./StyleSheets/Sidebar.css";
import jwt_decode from "jwt-decode";
import { useCookies } from "react-cookie";

function Sidebar(props) {
  const [active, setActive] = useState("");
  const [dropdownToggle, setDropDownToggle] = useState(false);
  const [dropdownToggle2, setDropDownToggle2] = useState(false);
  const [dropdownToggle3, setDropDownToggle3] = useState(false);
  const [dropdownToggle4, setDropDownToggle4] = useState(false);
  const [dropdownToggle5, setDropDownToggle5] = useState(false);

  const [token, setToken] = useCookies();
  const [roles, setRoles] = useState("");

  useEffect(() => {
    if (token["Token"]) {
      const decoded = jwt_decode(token["Token"]);
      setRoles(decoded.userInfo.roles);
    }
  }, [token]);

  useEffect(() => {
    setActive(props.location.pathname);
  }, [props.location.pathname, active]);

  return (
    <div
      className="sidebar-container border-right main-sidebar"
      id="sticky-sidebar"
    >
      <nav id="sidebar" className={props.toggleClass}>
        <ul className="list-unstyled components">
          {(roles.includes("Admin") || roles.includes("Lecturer")) && (
            <li className={active === "/dashboard" ? "active" : null}>
              <a href="/dashboard">
                <div className="menu-icon">
                  <i className="fa fa-home nav_icon" aria-hidden="true"></i>
                </div>
                <span className="menu-title">Dashboard</span>
              </a>
            </li>
          )}
          {roles.includes("Admin") && (
            <>
              <li
                className={
                  active === "/companymanagement" ||
                  active === "/createcompany" ||
                  active.includes("/editcompany/")
                    ? "active"
                    : null
                }
              >
                <a href="/companymanagement">
                  <div className="menu-icon">
                    <i className="fa fa-briefcase" aria-hidden="true"></i>
                  </div>
                  <span className="menu-title">Company Management</span>
                </a>
              </li>

              <li
                className={
                  active === "/usermanagement" ||
                  active === "/createuser" ||
                  active.includes("/edituser/")
                    ? "active"
                    : null
                }
              >
                <a href="/usermanagement">
                  <div className="menu-icon">
                    <i className="fa fa-users" aria-hidden="true"></i>
                  </div>
                  <span className="menu-title">User Management</span>
                </a>
              </li>
            </>
          )}
          {
            <>
              <li
                className="menu-item-has-children dropdown"
                onClick={() => setDropDownToggle(!dropdownToggle)}
              >
                <a
                  href="#"
                  className="dropdown-toggle"
                  data-toggle="dropdown"
                  aria-haspopup="true"
                  aria-expanded="false"
                >
                  <div className="menu-icon">
                    <i className="fa fa-building"></i>
                  </div>
                  <span className="menu-title">Hosting & Placement</span>
                </a>
                <ul
                  className={
                    dropdownToggle
                      ? "sub-menu children dropdown-menu show"
                      : "sub-menu children dropdown-menu"
                  }
                >
                  <li
                    className={
                      active === "/hostingplacement/projects" ? "active" : null
                    }
                  >
                    <a href="/hostingplacement/projects">
                      <span className="menu-title">Projects</span>
                    </a>
                  </li>
                  {(!roles.includes("Lecturer") ||
                    roles.includes("Host") ||
                    roles.includes("Admin")) && (
                    <li
                      className={
                        active === "/hostingplacement/applicationstatus"
                          ? "active"
                          : null
                      }
                    >
                      <a href="/hostingplacement/applicationstatus">
                        <span className="menu-title">Application Status</span>
                      </a>
                    </li>
                  )}
                </ul>
              </li>
            </>
          }
          {!roles.includes("Admin") &&
            !roles.includes("Lecturer") &&
            !roles.includes("Host") &&
            roles.includes("Student") && (
              <>
                <li
                  className={active === "/resumerepository" ? "active" : null}
                >
                  <a href="/resumerepository">
                    <div className="menu-icon">
                      <i
                        class="bi bi-file-earmark-person"
                        aria-hidden="true"
                      ></i>
                    </div>
                    <span className="menu-title">Resume Repository</span>
                  </a>
                </li>
              </>
            )}
          {roles.includes("Admin") && (
            <>
              <li
                className={
                  active === "/assessormanagement" ||
                  active.includes("/editassessor/")
                    ? "active"
                    : null
                }
              >
                <a href="/assessormanagement">
                  <div className="menu-icon">
                    <i
                      className="bi bi-person-workspace"
                      aria-hidden="true"
                    ></i>
                  </div>
                  <span className="menu-title">Assessor Management</span>
                </a>
              </li>
            </>
          )}
          {(!roles.includes("Host") ||
            roles.includes("Admin") ||
            roles.includes("Lecturer") ||
            roles.includes("Student")) && (
            <li className={active === "/reportrepository" ? "active" : null}>
              <a href="/reportrepository">
                <div className="menu-icon">
                  <i className="bi bi-folder-fill" aria-hidden="true"></i>
                </div>
                <span className="menu-title">Report Repository</span>
              </a>
            </li>
          )}
          {!roles.includes("Admin") &&
            (roles.includes("Lecturer") || roles.includes("Student")) && (
              <>
                <li className={active === "/reportrequest" ? "active" : null}>
                  <a href="/reportrequest">
                    <div className="menu-icon">
                      <i class="bi bi-send-fill" aria-hidden="true"></i>
                    </div>
                    <span className="menu-title">Report Request Status</span>
                  </a>
                </li>
              </>
            )}
          {!roles.includes("Admin") &&
            !roles.includes("Lecturer") &&
            !roles.includes("Host") &&
            roles.includes("Student") && (
              <>
                <li
                  className={active === "/reportmanagement" ? "active" : null}
                >
                  <a href="/reportmanagement">
                    <div className="menu-icon">
                      <i
                        className="bi bi-file-earmark-arrow-up-fill"
                        aria-hidden="true"
                      ></i>
                    </div>
                    <span className="menu-title">Report Management</span>
                  </a>
                </li>
              </>
            )}
          {roles.includes("Lecturer") && (
            <>
              <li
                className="menu-item-has-children dropdown"
                onClick={() => setDropDownToggle4(!dropdownToggle4)}
              >
                <a
                  href="#"
                  className="dropdown-toggle"
                  data-toggle="dropdown"
                  aria-haspopup="true"
                  aria-expanded="false"
                >
                  <div className="menu-icon">
                    <i className="bi bi-file-earmark-person-fill"></i>
                  </div>
                  <span className="menu-title">Student Submission</span>
                </a>
                <ul
                  className={
                    dropdownToggle4
                      ? "sub-menu children dropdown-menu show"
                      : "sub-menu children dropdown-menu"
                  }
                >
                  <li
                    className={
                      active === "/studentsubmission/supervisor"
                        ? "active"
                        : null
                    }
                  >
                    <a href="/studentsubmission/supervisor">
                      <span className="menu-title">Supervisor</span>
                    </a>
                  </li>
                  <li
                    className={
                      active === "/studentsubmission/examiner" ? "active" : null
                    }
                  >
                    <a href="/studentsubmission/examiner">
                      <span className="menu-title">Examiner</span>
                    </a>
                  </li>
                  <li
                    className={
                      active === "/studentsubmission/panel" ? "active" : null
                    }
                  >
                    <a href="/studentsubmission/panel">
                      <span className="menu-title">Panel</span>
                    </a>
                  </li>
                  {roles.includes("Host") && (
                    <li
                      className={
                        active === "/studentsubmission/host" ? "active" : null
                      }
                    >
                      <a href="/studentsubmission/host">
                        <span className="menu-title">Host</span>
                      </a>
                    </li>
                  )}
                </ul>
              </li>
            </>
          )}
          {!roles.includes("Admin") &&
            !roles.includes("Lecturer") &&
            !roles.includes("Host") &&
            roles.includes("Student") && (
              <>
                <li
                  className={active === "/submissionstatus" ? "active" : null}
                >
                  <a href="/submissionstatus">
                    <div className="menu-icon">
                      <i class="bi bi-check2-square" aria-hidden="true"></i>
                    </div>
                    <span className="menu-title">Submission Status</span>
                  </a>
                </li>
              </>
            )}
          {(roles.includes("Lecturer") || roles.includes("Student")) && (
            <>
              <li
                className={
                  active === "/myconstraint" ||
                  active === "/createmyconstraint" ||
                  active.includes("/editmyconstraint/")
                    ? "active"
                    : null
                }
              >
                <a href="/myconstraint">
                  <div className="menu-icon">
                    <i class="fa fa-calendar-times-o" aria-hidden="true"></i>
                  </div>
                  <span className="menu-title">My Constraint</span>
                </a>
              </li>
            </>
          )}
          {!roles.includes("Admin") &&
            (roles.includes("Lecturer") || roles.includes("Student")) && (
              <>
                <li className={active === "/masterschedule" ? "active" : null}>
                  <a href="/masterschedule">
                    <div className="menu-icon">
                      <i className="fa fa-calendar" aria-hidden="true"></i>
                    </div>
                    <span className="menu-title">Master Schedule</span>
                  </a>
                </li>

                <li
                  className={
                    active === "/personalizedschedule" ? "active" : null
                  }
                >
                  <a href="/personalizedschedule">
                    <div className="menu-icon">
                      <i class="fa fa-table" aria-hidden="true"></i>
                    </div>
                    <span className="menu-title">Personalized Schedule</span>
                  </a>
                </li>
              </>
            )}
          {!roles.includes("Admin") &&
            !roles.includes("Lecturer") &&
            roles.includes("Host") && (
              <>
                <li
                  className="menu-item-has-children dropdown"
                  onClick={() => setDropDownToggle5(!dropdownToggle5)}
                >
                  <a
                    href="#"
                    className="dropdown-toggle"
                    data-toggle="dropdown"
                    aria-haspopup="true"
                    aria-expanded="false"
                  >
                    <div className="menu-icon">
                      <i className="bi bi-file-earmark-person-fill"></i>
                    </div>
                    <span className="menu-title">Student Submission</span>
                  </a>
                  <ul
                    className={
                      dropdownToggle5
                        ? "sub-menu children dropdown-menu show"
                        : "sub-menu children dropdown-menu"
                    }
                  >
                    <li
                      className={
                        active === "/studentsubmission/host" ? "active" : null
                      }
                    >
                      <a href="/studentsubmission/host">
                        <span className="menu-title">Host</span>
                      </a>
                    </li>
                  </ul>
                </li>

                <li
                  className={
                    active === "/menteeschedule" ? "active" : null
                  }
                >
                  <a href="/menteeschedule">
                    <div className="menu-icon">
                      <i class="fa fa-table" aria-hidden="true"></i>
                    </div>
                    <span className="menu-title">Mentee Schedule</span>
                  </a>
                </li>
              </>
              
            )}
          {roles.includes("Admin") && (
            <>
              <li
                className="menu-item-has-children dropdown"
                onClick={() => setDropDownToggle2(!dropdownToggle2)}
              >
                <a
                  href="#"
                  className="dropdown-toggle"
                  data-toggle="dropdown"
                  aria-haspopup="true"
                  aria-expanded="false"
                >
                  <div className="menu-icon">
                    <i className="fa fa-table" aria-hidden="true"></i>
                  </div>
                  <span className="menu-title">Presentation Scheduling</span>
                </a>
                <ul
                  className={
                    dropdownToggle2
                      ? "sub-menu children dropdown-menu show"
                      : "sub-menu children dropdown-menu"
                  }
                >
                  <li
                    className={
                      active === "/presentationscheduling/csmind" ||
                      active === "/createcsmind" ||
                      active.includes("/editcsmind/")
                        ? "active"
                        : null
                    }
                  >
                    <a href="/presentationscheduling/csmind">
                      <span className="menu-title">CSMInD</span>
                    </a>
                  </li>

                  <li
                    className={
                      active === "/presentationscheduling/presentation" ||
                      active === "/createpresentation" ||
                      active.includes("/editpresentation/")
                        ? "active"
                        : null
                    }
                  >
                    <a href="/presentationscheduling/presentation">
                      <span className="menu-title">Presentation</span>
                    </a>
                  </li>

                  <li
                    className={
                      active ===
                        "/presentationscheduling/constraintsmanagement" ||
                      active === "/createconstraint" ||
                      active.includes("/editconstraint/") ||
                      active.includes("/editvenue/")
                        ? "active"
                        : null
                    }
                  >
                    <a href="/presentationscheduling/constraintsmanagement">
                      <span className="menu-title">Constraints Management</span>
                    </a>
                  </li>

                  <li
                    className={
                      active === "/presentationscheduling/scheduler"
                        ? "active"
                        : null
                    }
                  >
                    <a href="/presentationscheduling/scheduler">
                      <span className="menu-title">Scheduler</span>
                    </a>
                  </li>

                  <li
                    className={
                      active === "/presentationscheduling/masterschedule" || active.includes("/editschedule/")
                        ? "active"
                        : null
                    }
                  >
                    <a href="/presentationscheduling/masterschedule">
                      <span className="menu-title">Master Schedule</span>
                    </a>
                  </li>

                  <li
                    className={
                      active === "/presentationscheduling/personalizedschedule"
                        ? "active"
                        : null
                    }
                  >
                    <a href="/presentationscheduling/personalizedschedule">
                      <span className="menu-title">Personalized Schedule</span>
                    </a>
                  </li>
                </ul>
              </li>

              <li
                className="menu-item-has-children dropdown"
                onClick={() => setDropDownToggle3(!dropdownToggle3)}
              >
                <a
                  href="#"
                  className="dropdown-toggle"
                  data-toggle="dropdown"
                  aria-haspopup="true"
                  aria-expanded="false"
                >
                  <div className="menu-icon">
                    <i className="bi bi-gear-fill"></i>
                  </div>
                  <span className="menu-title">Setting</span>
                </a>
                <ul
                  className={
                    dropdownToggle3
                      ? "sub-menu children dropdown-menu show"
                      : "sub-menu children dropdown-menu"
                  }
                >
                  <li
                    className={
                      active === "/setting/academicsession" ? "active" : null
                    }
                  >
                    <a href="/setting/academicsession">
                      <span className="menu-title">Academic Session</span>
                    </a>
                  </li>
                  <li
                    className={
                      active === "/setting/reporttype" ? "active" : null
                    }
                  >
                    <a href="/setting/reporttype">
                      <span className="menu-title">Report Type</span>
                    </a>
                  </li>
                  <li
                    className={
                      active === "/setting/publishreport" ? "active" : null
                    }
                  >
                    <a href="/setting/publishreport">
                      <span className="menu-title">Publish Report</span>
                    </a>
                  </li>
                  <li
                    className={
                      active === "/setting/reportaccess" ? "active" : null
                    }
                  >
                    <a href="/setting/reportaccess">
                      <span className="menu-title">Report Access</span>
                    </a>
                  </li>
                </ul>
              </li>
            </>
          )}
        </ul>
      </nav>
    </div>
  );
}

export default withRouter(Sidebar);
