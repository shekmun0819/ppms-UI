import "./StyleSheets/BaseLayout.css";
import Sidebar from "../components/Sidebar/Sidebar";
import Navbar from "../components/Navbar/Navbar";
import Footer from "../components/Footer/Footer";
import { useState } from "react";

function BaseLayout(props) {
  const [toggle, setToggle] = useState("");

  const onToggle = () => {
    if (toggle === "active") {
      setToggle("");
    } else {
      setToggle("active");
    }
  };

  return (
    <div>
      <Navbar onToggleClick={() => onToggle()} />
      <div className="wrapper">
        <div className="sidebar-container">
          <Sidebar toggleClass={toggle} />
        </div>
        <div id="content" className={toggle}>
          <div className="layout-Container">{props.children}</div>
        </div>
      </div>
    </div>
  );
}

export default BaseLayout;
