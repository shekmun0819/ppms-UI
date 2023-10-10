/* eslint-disable jsx-a11y/anchor-is-valid */
import "./StyleSheets/Navbar.css";
import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import jwt_decode from "jwt-decode";
import { useCookies } from "react-cookie";
import CapitalizeWord from '../../utils/CapitalizeWord';

function Navbar(props) {
  const [token, setToken, removeCookie] = useCookies(["Token"]);
  const [expireTime, setExpireTime] = useState("");
  const [userInfo, setUserInfo] = useState({
    email: "",
    name: "",
    roles: "",
  });

  useEffect(() => {
    const decoded = jwt_decode(token["Token"]);
    setUserInfo({
      email: decoded.userInfo.email,
      name: decoded.userInfo.name,
      roles: decoded.userInfo.roles,
    });
    setExpireTime(decoded.exp);
  }, [token]);

  useEffect(() => {
    const interval = setInterval(() => {
      if (expireTime < Math.round(Date.now() / 1000)) {
        logout();
        window.location.href = "/login";
      }
    }, 3600000); //run for every 1 hour (3,600,000 milliseconds)
    return () => clearInterval(interval);
  }, [expireTime]);

  const logout = () => {
    removeCookie("Token", { path: "/" });
  };

  return (
    <div className="header-section" id="sticky">
      <nav className="navbar navbar-expand-lg bg-light">
        <div
          className="container-fluid"
          style={{ justifyContent: "flex-start" }}
        >
          <div onClick={() => props.onToggleClick()}>
            <i
              className="fa fa-bars"
              style={{ margin: "10px" }}
              aria-hidden="true"
            ></i>
          </div>
          <Link
            to="/hostingplacement/projects"
            style={{ textDecoration: "none" }}
          >
            {" "}
            <div className="nav-title" style={{ fontSize: "1.5em" }}>
              PPMS
            </div>
          </Link>
          {/* <button
            className="btn btn-light d-inline-block d-lg-none ms-auto"
            type="button"
            data-bs-toggle="collapse"
            data-bs-target="#navbarSupportedContent"
            aria-controls="navbarSupportedContent"
            aria-expanded="false"
            aria-label="Toggle navigation"
          >
            <i className="fa fa-align-justify"></i>
          </button> */}
          <div className="ms-auto" id="navbarSupportedContent">
            <ul className="navbar-nav ms-auto mb-lg-0">
              <li className="nav-item dropdown">
                <a
                  className="nav-link dropdown-toggle"
                  href="#"
                  role="button"
                  data-bs-toggle="dropdown"
                  aria-expanded="false"
                >
                  {/* <img
                    src="https://mdbcdn.b-cdn.net/img/new/avatars/2.webp"
                    className="rounded-circle shadow-4 d-inline-block"
                    alt=""
                    style={{ float: "left", width: "30px", height: "30px" }}
                  /> */}
                  { CapitalizeWord(userInfo.name) }
                </a>
                <ul className="dropdown-menu position-absolute">
                  <li>
                    <a className="dropdown-item" href="/profile">
                      Profile
                    </a>
                  </li>
                  <li>
                    <a className="dropdown-item" href="/login" onClick={logout}>
                      Logout
                    </a>
                  </li>
                </ul>
              </li>
            </ul>
          </div>
        </div>
      </nav>
    </div>
  );
}

export default Navbar;
