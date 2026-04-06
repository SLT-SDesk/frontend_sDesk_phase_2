import { useState } from "react";
import { FaListAlt } from "react-icons/fa";
import { IoExit } from "react-icons/io5";
import { useNavigate } from "react-router-dom";
import { logoutRequest } from "../../redux/auth/authSlice";
import { useAppDispatch } from "../../redux/hooks";
import ConfirmPopup from "../ConfirmPopup/ConfirmPopup";
import NotificationDropdown from "../notificationDropdown/NotificationDropdown";
import "./TopNotificationBar.css";

const roleDisplayNames = {
  user: "User",
  admin: "Admin",
  technician: "Technical Officer",
  teamLeader: "Team Leader",
  superAdmin: "Super Admin",
};

export default function TopNotificationBar({
  user,
  notificationCount = 0,
  toggleSidebar,
}) {
  const navigate = useNavigate();
  let role;
  const dispatch = useAppDispatch();
  if (user.role === "technician") {
    if (user.position) {
      role = user.position;
    }
  } else {
    role = user?.role;
  }
  const displayName = user?.userName;
  const [showConfirm, setShowConfirm] = useState(false);

  const handleLogoutClick = () => {
    setShowConfirm(true);
  };

  const handleConfirm = () => {
    setShowConfirm(false);
    dispatch(logoutRequest());
    navigate("/LogIn");
  };

  const handleCancel = () => {
    setShowConfirm(false);
  };

  return (
    <div
      className={`TopNotificationBar-top-notification-bar TopNotificationBar--${
        role || "default"
      }`}
    >
      <div className="TopNotificationBar-notificationIcon-listIcon">
        <FaListAlt
          size="0.8em"
          className="TopNotificationBar-list-icon"
          onClick={toggleSidebar}
        />
        <NotificationDropdown
          user={user}
          initialNotifications={[
            {
              id: 1,
              message: "Incident #245 assigned to technical officer Alex.",
              date: "2025-10-29T09:00:00Z",
              starred: false,
            },
            {
              id: 2,
              message: "Incident #233 resolved successfully.",
              date: "2025-10-28T18:30:00Z",
              starred: true,
            },
            {
              id: 3,
              message: "Your created incident #244 has been assigned to Sam.",
              date: "2025-10-27T14:00:00Z",
              starred: false,
            },
          ]}
        />
      </div>
      <div className="TopNotificationBar-profile-section">
        <span className="TopNotificationBar-userName">
          {displayName ||
            user?.username ||
            user?.name ||
            user?.email ||
            "User Name"}
        </span>
        {role && (
          <span className="TopNotificationBar-role">
            {roleDisplayNames[role] || role}
          </span>
        )}
        <button
          className="TopNotificationBar-logout-btn"
          onClick={handleLogoutClick}
          title="Logout"
        >
          <IoExit size="1.2em" className="TopNotificationBar-logout-icon" />
          <span className="TopNotificationBar-logout-text">Logout</span>
        </button>
      </div>
      {showConfirm && (
        <ConfirmPopup
          message="Are you sure you want to log out?"
          onConfirm={handleConfirm}
          onCancel={handleCancel}
        />
      )}
    </div>
  );
}
