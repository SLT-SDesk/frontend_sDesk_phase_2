import React, { useState } from "react";
import "./sideBar.css";
import { HiComputerDesktop } from "react-icons/hi2";
import { FaHome } from "react-icons/fa";
import { FaUsers } from "react-icons/fa";
import { CiBookmark } from "react-icons/ci";
import { FaLocationArrow } from "react-icons/fa";
import { FaAnchor } from "react-icons/fa";
import { VscGraph } from "react-icons/vsc";
import { FaList } from "react-icons/fa6";
import { FaChevronDown, FaChevronUp, FaTimes } from "react-icons/fa";
import { FiPlusCircle } from "react-icons/fi";
import { Link, useLocation } from "react-router-dom";
import { FaLocationDot } from "react-icons/fa6";
import { BiCategory } from "react-icons/bi";

const SideBar = ({ role, isOpen, closeSidebar }) => {
  const [isDashBoardOpen, setIsDashBoardOpen] = useState(false);
  const [isIncidentsOpen, setIsIncidentsOpen] = useState(false);

  const toggleDashBoard = (e) => {
    // This checks if the click is on the SVG or its path to prevent the Link from firing
    if (e.target.closest("svg")) {
      setIsDashBoardOpen(!isDashBoardOpen);
    }
  };

  const toggleIncidents = (e) => {
    // This checks if the click is on the SVG or its path to prevent the Link from firing
    if (e.target.closest("svg")) {
      setIsIncidentsOpen(!isIncidentsOpen);
    }
  };

  const location = useLocation();

  React.useEffect(() => {
    if (isOpen) {
      document.body.classList.add("sidebar-open");
    } else {
      document.body.classList.remove("sidebar-open");
    }
    return () => {
      document.body.classList.remove("sidebar-open");
    };
  }, [isOpen]);

  return (
    <aside className={`SideBar-sidebar-container ${isOpen ? "open" : ""}`}>
      <div className="SideBar-sdeskTitle">
        {/* Mobile close icon */}
        <button
          className="SideBar-close-btn"
          onClick={closeSidebar}
          aria-label="Close sidebar"
        >
          <FaTimes size="1.5em" />
        </button>
        <div className="SideBar-icon_text_container">
          <FaHome size="1.8em" />
          <h2>sDESK</h2>
        </div>
      </div>
      <nav className="SideBar-sidebar">
        <ul>
          {(role === "admin" || role === "superAdmin") && (
            <>
              <li className="SideBar-dropdown-header">
                <Link
                  to={`/${role}/AdminDashBoard`}
                  className={
                    location.pathname === `/${role}/AdminDashBoard`
                      ? "active"
                      : ""
                  }
                  onClick={closeSidebar}
                >
                  <HiComputerDesktop /> Dashboard
                </Link>
                <span onClick={toggleDashBoard}>
                  {isDashBoardOpen ? <FaChevronUp /> : <FaChevronDown />}
                </span>
              </li>
              {isDashBoardOpen && (
                <>
                  <li className="SideBar-sub-list">
                    <Link
                      to={`/${role}/kpi-helpdesk`}
                      className={
                        location.pathname === `/${role}/kpi-helpdesk`
                          ? "active"
                          : ""
                      }
                      onClick={closeSidebar}
                    >
                      <VscGraph /> KPI-IT Helpdesk
                    </Link>
                  </li>
                  <li className="SideBar-sub-list">
                    <Link
                      to={`/${role}/LoggingTimeLine`}
                      className={
                        location.pathname === `/${role}/LoggingTimeLine`
                          ? "active"
                          : ""
                      }
                      onClick={closeSidebar}
                    >
                      <VscGraph /> Logging TimeLine
                    </Link>
                  </li>
                  <li className="SideBar-sub-list">
                    <Link
                      to={`/${role}/roster`}
                      className={
                        location.pathname === `/${role}/roster` ? "active" : ""
                      }
                      onClick={closeSidebar}
                    >
                      <FaList /> Roster
                    </Link>
                  </li>
                  <li className="SideBar-sub-list">
                    <Link
                      to={`/${role}/sla-settings`}
                      className={
                        location.pathname === `/${role}/sla-settings`
                          ? "active"
                          : ""
                      }
                      onClick={closeSidebar}
                    >
                      <FaList /> SLA Settings
                    </Link>
                  </li>
                </>
              )}
              <li className="SideBar-dropdown-header">
                <Link
                  to={
                    role === "superAdmin"
                      ? "/superAdmin/manageteamadmin"
                      : `/${role}/AdminUserList`
                  }
                  className={
                    (
                      role === "superAdmin"
                        ? location.pathname === "/superAdmin/manageteamadmin"
                        : location.pathname === `/${role}/AdminUserList`
                    )
                      ? "active"
                      : ""
                  }
                  onClick={closeSidebar}
                >
                  <FaUsers /> Technical Officers
                </Link>
              </li>
              {role === "superAdmin" && (
                <>
                  <li className="SideBar-dropdown-header">
                    <Link
                      to="/superAdmin/SuperAdminCategory"
                      className={
                        location.pathname === "/superAdmin/SuperAdminCategory"
                          ? "active"
                          : ""
                      }
                      onClick={closeSidebar}
                    >
                      <BiCategory /> Category
                    </Link>
                  </li>
                  <li className="SideBar-dropdown-header">
                    <Link
                      to="/superAdmin/SuperAdminLocation"
                      className={
                        location.pathname === "/superAdmin/SuperAdminLocation"
                          ? "active"
                          : ""
                      }
                      onClick={closeSidebar}
                    >
                      <FaLocationDot /> Location
                    </Link>
                  </li>
                </>
              )}
            </>
          )}
          {(role === "technician" || role === "teamLeader") && (
            <li className="SideBar-dropdown-header">
              <Link
                to="/technician/TechnicianDashboard"
                className={
                  location.pathname === "/technician/TechnicianDashboard"
                    ? "active"
                    : ""
                }
                onClick={closeSidebar}
              >
                <HiComputerDesktop /> Dashboard
              </Link>
            </li>
          )}
          {role === "teamLeader" && (
            <>
              <li className="SideBar-dropdown-header">
                <Link
                  to="/technician/TechnicalOfficers"
                  className={
                    location.pathname === "/technician/TechnicalOfficers"
                      ? "active"
                      : ""
                  }
                  onClick={closeSidebar}
                >
                  <FaUsers /> Technical Officers
                </Link>
              </li>
            </>
          )}
          {(role === "admin" ||
            role === "technician" ||
            role === "teamLeader" ||
            role === "superAdmin") && (
            <>
              <li className="SideBar-dropdown-header">
                {(() => {
                  let incidentPaths = [];
                  if (role === "admin") {
                    incidentPaths = [
                      "/admin/AdminAllIncidents",
                      "/admin/AdminAddIncident",
                      "/admin/AdminMyTeamIncidentViewAll",
                      "/admin/AdminMyReportedIncidents",
                    ];
                  } else if (role === "technician" || role === "teamLeader") {
                    incidentPaths = [
                      "/technician/TechnicianAllTeam",
                      "/technician/TechnicianAddIncident",
                      "/technician/TechnicianMyAssignedInsidents",
                      "/technician/TechnicianReportedMyIncidents",
                    ];
                  } else if (role === "superAdmin") {
                    incidentPaths = [
                      "/superAdmin/AdminAllIncidents",
                      "/superAdmin/SuperAdminAllIncidents",
                      "/superAdmin/SuperAdminAddIncident",
                      "/superAdmin/SuperAdminMyReportedIncidents",
                    ];
                  }
                  return (
                    <>
                      <Link
                        className={
                          incidentPaths.includes(location.pathname)
                            ? "active"
                            : ""
                        }
                        onClick={closeSidebar}
                      >
                        <FaAnchor /> Incidents
                      </Link>
                      <span onClick={toggleIncidents}>
                        {isIncidentsOpen ? <FaChevronUp /> : <FaChevronDown />}
                      </span>
                    </>
                  );
                })()}
              </li>
              {isIncidentsOpen && (
                <>
                  {role === "superAdmin" && (
                    <li className="SideBar-sub-list">
                      <Link
                        to="/superAdmin/SuperAdminAllIncidents"
                        className={
                          location.pathname === "/superAdmin/AdminAllIncidents"
                            ? "active"
                            : ""
                        }
                        onClick={closeSidebar}
                      >
                        <FaList /> All Incidents
                      </Link>
                    </li>
                  )}
                  <li className="SideBar-sub-list">
                    <Link
                      to={
                        role === "admin"
                          ? "/admin/AdminAddIncident"
                          : role === "technician" || role === "teamLeader"
                          ? "/technician/TechnicianAddIncident"
                          : "/superAdmin/SuperAdminAddIncident"
                      }
                      className={
                        location.pathname ===
                        (role === "admin"
                          ? "/admin/AdminAddIncident"
                          : role === "technician" || role === "teamLeader"
                          ? "/technician/TechnicianAddIncident"
                          : "/superAdmin/SuperAdminAddIncident")
                          ? "active"
                          : ""
                      }
                      onClick={closeSidebar}
                    >
                      <FiPlusCircle /> Add Incidents
                    </Link>
                  </li>
                  {role !== "superAdmin" && (
                    <>
                      <li className="SideBar-sub-list">
                        <Link
                          to={
                            role === "admin"
                              ? "/admin/AdminMyTeamIncidentViewAll"
                              : "/technician/TechnicianAllTeam"
                          }
                          className={
                            location.pathname ===
                            (role === "admin"
                              ? "/admin/AdminMyTeamIncidentViewAll"
                              : "/technician/TechnicianAllTeam")
                              ? "active"
                              : ""
                          }
                          onClick={closeSidebar}
                        >
                          <FaList /> My Team - All Incidents
                        </Link>
                      </li>
                      {(role === "technician" ||
                        role === "teamLeader" ||
                        role === "admin") && (
                        <li className="SideBar-sub-list">
                          <Link
                            to={
                              role === "admin"
                                ? "/admin/AdminMyAssignedIncidents"
                                : "/technician/TechnicianMyAssignedInsidents"
                            }
                            className={
                              location.pathname ===
                              (role === "admin"
                                ? "/admin/AdminMyAssignedIncidents"
                                : "/technician/TechnicianMyAssignedInsidents")
                                ? "active"
                                : ""
                            }
                            onClick={closeSidebar}
                          >
                            <FaList /> My Assigned Incidents
                          </Link>
                        </li>
                      )}
                    </>
                  )}
                  <li className="SideBar-sub-list">
                    <Link
                      to={
                        role === "admin"
                          ? "/admin/AdminMyReportedIncidents"
                          : role === "technician" || role === "teamLeader"
                          ? "/technician/TechnicianReportedMyIncidents"
                          : "/superAdmin/SuperAdminMyReportedIncidents"
                      }
                      className={
                        location.pathname ===
                        (role === "admin"
                          ? "/admin/AdminMyReportedIncidents"
                          : role === "technician" || role === "teamLeader"
                          ? "/technician/TechnicianReportedMyIncidents"
                          : "/superAdmin/SuperAdminMyReportedIncidents")
                          ? "active"
                          : ""
                      }
                      onClick={closeSidebar}
                    >
                      <FaList /> My Reported Incidents
                    </Link>
                  </li>
                </>
              )}
            </>
          )}
          {role === "user" && (
            <>
              <li className="SideBar-dropdown-header">
                <Link
                  to="/user/UserViewIncident"
                  className={
                    location.pathname === "/user/UserViewIncident"
                      ? "active"
                      : ""
                  }
                  onClick={closeSidebar}
                >
                  <FaAnchor /> Incidents
                </Link>
              </li>
              <li className="SideBar-dropdown-header">
                <Link
                  to="/user/UserAddIncident"
                  className={
                    location.pathname === "/user/UserAddIncident"
                      ? "active"
                      : ""
                  }
                  onClick={closeSidebar}
                >
                  <FiPlusCircle /> Add Incident
                </Link>
              </li>
            </>
          )}
        </ul>
      </nav>
    </aside>
  );
};

export default SideBar;
