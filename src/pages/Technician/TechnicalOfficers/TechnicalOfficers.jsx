/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect, useState, useMemo } from "react";
import "./TechnicalOfficers.css";
import { FaUsers, FaSearch, FaToggleOn, FaToggleOff } from "react-icons/fa";
import { TiExportOutline } from "react-icons/ti";
import { useSelector, useDispatch } from "react-redux";
import socket from "../../../utils/socket.js";
import { logoutRequest } from "../../../redux/auth/authSlice";
import {
  fetchTechniciansRequest,
  updateTechnicianRequest,
  updateTechnicianOnlineStatus,
} from "../../../redux/technicians/technicianSlice";

import { fetchSubCategoriesRequest } from "../../../redux/categories/categorySlice";
import ConfirmPopup from "../../../components/ConfirmPopup/ConfirmPopup";

function TechnicalOfficers() {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);

  // Use Redux state for technicians
  const technicians = useSelector(
    (state) => state.technicians.technicians ?? []
  );

  const subCategories = useSelector(
    (state) => state.categories?.subCategories ?? []
  );
  const mainCategories = useSelector(
    (state) => state.categories?.mainCategories ?? []
  );

  const [selectShowOption, setSelectShowOption] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [isTogglePopupOpen, setIsTogglePopupOpen] = useState(false);
  const [technicianToToggle, setTechnicianToToggle] = useState(null);

  // Check if user is teamLeader
  const isTeamLeader = user?.position === "teamLeader";

  useEffect(() => {
    if (!isTeamLeader) {
      dispatch(logoutRequest());
      return;
    }

    dispatch(fetchSubCategoriesRequest());
    dispatch(fetchTechniciansRequest());

    const handleStatusChange = ({ serviceNum, active }) => {
      dispatch(updateTechnicianOnlineStatus({ serviceNum, active }));
      dispatch(fetchTechniciansRequest(user.teamId));
    };

    socket.on("technician_status_changed", handleStatusChange);

    return () => {
      socket.off("technician_status_changed", handleStatusChange);
    };
  }, [dispatch, selectShowOption]);

  const getTeamName = (teamId) => {
    const main = mainCategories.find((m) => m.id === teamId);
    return main ? main.name : teamId || "Unknown";
  };

  const getSubCategoryName = (subCategoryId) => {
    if (!subCategoryId) return "";
    const subCategory = subCategories.find((sub) => sub.id === subCategoryId);
    return subCategory ? subCategory.name : subCategoryId;
  };

  const transformedData = useMemo(() => {
    // Only show technicians belonging to the teamLeader's team
    const filteredTechnicians = technicians.filter(
      (tech) =>
        tech.position === "technician" &&
        (isTeamLeader ? tech.teamId === user.teamId : true)
    );

    const transformed = filteredTechnicians.map((user) => ({
      serviceNum: user.serviceNum,
      name: user.name,
      tier: user.tier,
      cat1: getSubCategoryName(user.cat1),
      cat2: getSubCategoryName(user.cat2),
      cat3: getSubCategoryName(user.cat3),
      cat4: getSubCategoryName(user.cat4),
      active: Boolean(user.active),
      isOnline: user.active,
      email: user.email,
      contactNumber: user.contactNumber,
      id: user.id,
    }));

    return transformed;
  }, [technicians, getTeamName, getSubCategoryName, isTeamLeader, user.teamId]);

  const handleChange = (e) => setSelectShowOption(e.target.value);
  const handleSearch = (e) => setSearchQuery(e.target.value);

  const handleToggleActive = (technician) => {
    setTechnicianToToggle(technician);
    setIsTogglePopupOpen(true);
  };

  const confirmToggle = async () => {
    if (technicianToToggle) {
      const updatedTechnician = {
        ...technicianToToggle,
        active: !technicianToToggle.active,
      };

      // Emit socket event to notify technician status change
      if (technicianToToggle.active && !updatedTechnician.active) {
        socket.emit("technician-deactivated", {
          serviceNum: technicianToToggle.serviceNum,
          message: "Your account has been deactivated by team leader",
        });
      }

      try {
        dispatch(
          updateTechnicianRequest({
            ...updatedTechnician,
            serviceNum: technicianToToggle.serviceNum,
          })
        );

        dispatch(fetchTechniciansRequest());
      } catch (error) {
        console.error(error);
        alert("Failed to update technician status. Please try again.");
      }

      setIsTogglePopupOpen(false);
      setTechnicianToToggle(null);
    }
  };

  const cancelToggle = () => {
    setIsTogglePopupOpen(false);
    setTechnicianToToggle(null);
  };

  // Filter data based on search and selection
  const filteredData = transformedData.filter((user) => {
    const searchLower = searchQuery.toLowerCase();
    const matchesSearch =
      user.serviceNum.toLowerCase().includes(searchLower) ||
      user.name.toLowerCase().includes(searchLower) ||
      (searchLower === "active"
        ? user.active
        : searchLower === "inactive"
        ? !user.active
        : (user.active ? "active" : "inactive").includes(searchLower)) ||
      user.tier.toString().toLowerCase().includes(searchLower) ||
      user.email.toLowerCase().includes(searchLower) ||
      user.contactNumber.toLowerCase().includes(searchLower);

    if (selectShowOption === "Active") {
      return matchesSearch && user.active;
    } else if (selectShowOption === "Inactive") {
      return matchesSearch && !user.active;
    }
    return matchesSearch;
  });

  // If user is not a team leader, show access denied
  if (!isTeamLeader) {
    return (
      <div className="TechnicalOfficers-main-content">
        <div className="TechnicalOfficers-direction-bar">
          Technical Officers {">"} Access Denied
        </div>
        <div className="TechnicalOfficers-content2">
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              minHeight: "300px",
              padding: "20px",
              textAlign: "center",
            }}
          >
            <h3>Access Denied</h3>
            <p>This page is only accessible to team leaders.</p>
            <p>
              Your current position:{" "}
              <strong>{user?.position || "Unknown"}</strong>
            </p>
            <p>Contact your administrator if you believe this is an error.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="TechnicalOfficers-main-content">
      <div className="TechnicalOfficers-direction-bar">
        Technical Officers {">"} Technicians Management
      </div>

      <div className="TechnicalOfficers-content2">
        <div className="TechnicalOfficers-TitleBar">
          <div className="TechnicalOfficers-TitleBar-NameAndIcon">
            <FaUsers /> Technical Officers - Technicians List
          </div>
          <div className="TechnicalOfficers-TitleBar-buttons">
            <button className="TechnicalOfficers-TitleBar-buttons-ExportData">
              <TiExportOutline /> Export Data
            </button>
          </div>
        </div>

        <div className="TechnicalOfficers-content2-content3">
          <div className="TechnicalOfficers-content2-content3-left">
            <label>Show:</label>
            <select
              value={selectShowOption}
              onChange={handleChange}
              className="TechnicalOfficers-content2-content3-dropdown"
            >
              <option value="All">All</option>
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
            </select>
          </div>
          <div className="TechnicalOfficers-content2-content3-right">
            <FaSearch className="TechnicalOfficers-content2-content3-search-icon" />
            <input
              type="text"
              placeholder="Search by service number, name, status, tier, email, or contact..."
              value={searchQuery}
              onChange={handleSearch}
              className="TechnicalOfficers-content2-content3-search-input"
            />
          </div>
        </div>

        <div className="TechnicalOfficers-table">
          <div className="TechnicalOfficers-table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Service Number</th>
                  <th>Name</th>
                  <th>Status</th>
                  <th>Tier</th>
                  <th>Email</th>
                  <th>Contact</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {(() => {
                  if (filteredData.length > 0) {
                    return filteredData.map((user) => (
                      <tr key={user.id || user.serviceNum}>
                        <td>{user.serviceNum}</td>
                        <td>{user.name}</td>
                        <td>
                          <span
                            style={{
                              height: "10px",
                              width: "10px",
                              backgroundColor: user.isOnline
                                ? "#2de37d"
                                : "#ff4d4d",
                              borderRadius: "50%",
                              display: "inline-block",
                              marginRight: "5px",
                            }}
                          />
                          {user.active ? "Active" : "Inactive"}
                        </td>
                        <td>{user.tier}</td>
                        <td>{user.email}</td>
                        <td>{user.contactNumber}</td>
                        <td>
                          <button
                            className={`TechnicalOfficers-table-toggle-btn ${
                              user.active ? "active" : "inactive"
                            }`}
                            onClick={() => handleToggleActive(user)}
                            title={user.active ? "Deactivate" : "Activate"}
                          >
                            {user.active ? (
                              <FaToggleOn size="1.5em" color="#2de37d" />
                            ) : (
                              <FaToggleOff size="1.5em" color="#ff4d4d" />
                            )}
                          </button>
                        </td>
                      </tr>
                    ));
                  } else {
                    return (
                      <tr>
                        <td colSpan="7" style={{ textAlign: "center" }}>
                          No technicians found
                        </td>
                      </tr>
                    );
                  }
                })()}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {isTogglePopupOpen && (
        <ConfirmPopup
          message={`Are you sure you want to ${
            technicianToToggle?.active ? "deactivate" : "activate"
          } ${technicianToToggle?.name}?`}
          onConfirm={confirmToggle}
          onCancel={cancelToggle}
        />
      )}
    </div>
  );
}

export default TechnicalOfficers;
