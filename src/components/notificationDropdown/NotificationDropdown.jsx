import { useEffect, useState } from "react";
import { FaRegStar, FaStar, FaTrashAlt } from "react-icons/fa";
import { IoIosNotifications } from "react-icons/io";
import apiClient from "../../api/axiosInstance";
import socket from "../../utils/socket";
import ConfirmPopup from "../ConfirmPopup/ConfirmPopup";
import "./NotificationDropdown.css";

export default function NotificationDropdown({
  user,
  initialNotifications = [],
}) {
  const [showDropdown, setShowDropdown] = useState(false);
  const [notifications, setNotifications] = useState(initialNotifications);
  const [showConfirm, setShowConfirm] = useState(false);
  const [confirmMessage, setConfirmMessage] = useState("");
  const [confirmMode, setConfirmMode] = useState("delete");
  const [pendingDeleteId, setPendingDeleteId] = useState(null);

  const toggleDropdown = () => setShowDropdown(!showDropdown);

  const handleDelete = async (id) => {
    // Open confirm popup flow
    setPendingDeleteId(id);
    setConfirmMessage("Delete this notification?");
    setConfirmMode("delete");
    setShowConfirm(true);
  };

  const handleToggleStar = (id) => {
    // Toggle starred flag; set starredAt when starred; reorder starred by starredAt desc and others by date desc
    setNotifications((prev) => {
      const toggled = prev.map((n) => {
        if (n.id !== id) return n;
        const now = Date.now();
        if (!n.starred) {
          // marking as starred
          return { ...n, starred: true, starredAt: now };
        }
        // unmarking
        return { ...n, starred: false, starredAt: null };
      });

      const starred = toggled
        .filter((i) => i.starred)
        .sort((a, b) => (b.starredAt || 0) - (a.starredAt || 0));

      const others = toggled
        .filter((i) => !i.starred)
        .sort(
          (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
        );

      return [...starred, ...others];
    });
  };

  const handleMarkRead = (id) => {
    apiClient
      .patch(`/notifications/${id}/read`)
      .catch(() => {})
      .finally(() => {
        setNotifications((prev) =>
          prev.map((n) => (n.id === id ? { ...n, read: true } : n))
        );
      });
  };

  const handleMarkUnread = (id) => {
    apiClient
      .patch(`/notifications/${id}/unread`)
      .catch(() => {})
      .finally(() => {
        setNotifications((prev) =>
          prev.map((n) => (n.id === id ? { ...n, read: false } : n))
        );
      });
  };

  // Fetch persisted notifications on mount
  useEffect(() => {
    let mounted = true;
    const fetchNotifications = async () => {
      try {
        const res = await apiClient.get("/notifications");
        if (!mounted) return;
        const mapped = (res.data || []).map((nt) => {
          // try to extract actor name from message like "... has been assigned to John Doe"
          const message = nt.message || "";
          let actorName = null;
          let actorServiceNum = null;
          const assignedMatch = message.match(/assigned to\s+(.+)$/i);
          if (assignedMatch) {
            actorName = assignedMatch[1].trim();
          }
          // store parsed fields for nicer rendering on frontend
          return {
            id: nt.id,
            message,
            date: nt.createdOn || nt.created_on || new Date().toISOString(),
            read: !!nt.read,
            starred: false,
            starredAt: null,
            incidentNumber: nt.incidentNumber || nt.incident_number,
            actorName,
            actorServiceNum,
          };
        });
        setNotifications(mapped);
      } catch (e) {
        // ignore fetch errors
      }
    };
    fetchNotifications();
    return () => {
      mounted = false;
    };
  }, [user]);

  // Confirm popup handlers
  const handleConfirm = async () => {
    // If we're in delete mode, perform delete
    if (confirmMode === "delete" && pendingDeleteId) {
      try {
        await apiClient.delete(`/notifications/${pendingDeleteId}`);
        setNotifications((prev) =>
          prev.filter((n) => n.id !== pendingDeleteId)
        );
        setShowConfirm(false);
        setPendingDeleteId(null);
      } catch (e) {
        console.error("Failed to delete notification", e);
        // Show an informational confirm popup
        setConfirmMessage("Failed to delete notification. Please try again.");
        setConfirmMode("info");
        setPendingDeleteId(null);
        setShowConfirm(true);
      }
    } else {
      // info mode or other - just close
      setShowConfirm(false);
      setPendingDeleteId(null);
    }
  };

  const handleCancel = () => {
    setShowConfirm(false);
    setPendingDeleteId(null);
  };

  useEffect(() => {
    // Listener for technician assignment (targeted to technician sockets)
    const techListener = (data) => {
      try {
        const incidentNumber =
          data?.incident?.incident_number || data?.incidentNumber || null;
        const message = data?.message || `You have been assigned an incident`;
        // If server sent a persisted notification object, prefer that (has DB id and actor fields)
        const serverNotif = data?.notification || null;
        if (serverNotif) {
          const newNotif = {
            id: serverNotif.id,
            message: serverNotif.message,
            date:
              serverNotif.createdOn ||
              serverNotif.created_on ||
              new Date().toISOString(),
            read: !!serverNotif.read,
            starred: !!serverNotif.starred,
            starredAt: serverNotif.starredAt || null,
            incidentNumber:
              serverNotif.incidentNumber ||
              serverNotif.incident_number ||
              incidentNumber,
            actorName: serverNotif.actorName || serverNotif.actor_name || null,
            actorServiceNum:
              serverNotif.actorServiceNum ||
              serverNotif.actor_service_number ||
              null,
          };
          setNotifications((prev) => {
            const exists = prev.some(
              (n) =>
                n.id === newNotif.id ||
                (newNotif.incidentNumber &&
                  n.incidentNumber === newNotif.incidentNumber &&
                  n.message === newNotif.message)
            );
            if (exists) return prev;
            return [newNotif, ...prev];
          });
          return;
        }

        // attempt to extract actor name and serviceNum from payload when serverNotif not present
        const actorServiceNum = data?.incident?.handler || null;
        let actorName = null;
        const assignedMatch = message.match(/assigned to\s+(.+)$/i);
        if (assignedMatch) actorName = assignedMatch[1].trim();

        // Deduplication: if we already have a persisted notification with same incidentNumber+message OR identical message, skip
        setNotifications((prev) => {
          const exists = prev.some((n) => {
            if (incidentNumber && n.incidentNumber) {
              return (
                n.incidentNumber === incidentNumber && n.message === message
              );
            }
            return n.message === message;
          });
          if (exists) return prev;

          const newNotif = {
            id: `${Date.now()}-${Math.random()}`,
            message,
            date: new Date().toISOString(),
            starred: false,
            starredAt: null,
            incidentNumber,
            actorName,
            actorServiceNum,
          };
          return [newNotif, ...prev];
        });
      } catch (e) {
        // ignore
      }
    };

    // Listener for informant assignment/closure (targeted to the user who created the incident)
    const informantListener = (data) => {
      try {
        const incidentNumber =
          data?.incident?.incident_number || data?.incidentNumber || null;
        const message = data?.message || `Your incident has an update`;
        const serverNotif = data?.notification || null;
        if (serverNotif) {
          const newNotif = {
            id: serverNotif.id,
            message: serverNotif.message,
            date:
              serverNotif.createdOn ||
              serverNotif.created_on ||
              new Date().toISOString(),
            read: !!serverNotif.read,
            starred: !!serverNotif.starred,
            starredAt: serverNotif.starredAt || null,
            incidentNumber:
              serverNotif.incidentNumber ||
              serverNotif.incident_number ||
              incidentNumber,
            actorName: serverNotif.actorName || serverNotif.actor_name || null,
            actorServiceNum:
              serverNotif.actorServiceNum ||
              serverNotif.actor_service_number ||
              null,
          };
          setNotifications((prev) => {
            const exists = prev.some(
              (n) =>
                n.id === newNotif.id ||
                (newNotif.incidentNumber &&
                  n.incidentNumber === newNotif.incidentNumber &&
                  n.message === newNotif.message)
            );
            if (exists) return prev;
            return [newNotif, ...prev];
          });
          return;
        }

        const actorServiceNum = data?.incident?.handler || null;
        let actorName = null;
        const assignedMatch = message.match(/assigned to\s+(.+)$/i);
        if (assignedMatch) actorName = assignedMatch[1].trim();

        setNotifications((prev) => {
          const exists = prev.some((n) => {
            if (incidentNumber && n.incidentNumber) {
              return (
                n.incidentNumber === incidentNumber && n.message === message
              );
            }
            return n.message === message;
          });
          if (exists) return prev;

          const newNotif = {
            id: `${Date.now()}-${Math.random()}`,
            message,
            date: new Date().toISOString(),
            starred: false,
            starredAt: null,
            incidentNumber,
            actorName,
            actorServiceNum,
          };
          return [newNotif, ...prev];
        });
      } catch (e) {
        // ignore
      }
    };

    // Register socket listeners
    socket.on("incident_assigned_technician", techListener);
    socket.on("incident_assigned_informant", informantListener);

    // Optionally, listen for incident closed (if wanted)
    socket.on("incident_closed_notification", informantListener);

    return () => {
      socket.off("incident_assigned_technician", techListener);
      socket.off("incident_assigned_informant", informantListener);
      socket.off("incident_closed_notification", informantListener);
    };
  }, [user]);

  return (
    <div className="notification-wrapper">
      {/* Bell button */}
      <button className="notification-button" onClick={toggleDropdown}>
        <div className="notification-bell-container">
          <IoIosNotifications className="notification-bell" />
        </div>
        {notifications.length > 0 && (
          <span className="notification-badge">
            {notifications.filter((n) => !n.read).length > 99
              ? "99+"
              : notifications.filter((n) => !n.read).length}
          </span>
        )}
      </button>

      {/* Dropdown */}
      {showDropdown && (
        <div className="notification-dropdown">
          {notifications.length === 0 ? (
            <div className="notification-empty">No notifications</div>
          ) : (
            // Wrap list so it becomes scrollable when there are many notifications
            <div
              className={`notification-list ${
                notifications.length > 5 ? "notification-list--scroll" : ""
              }`}
            >
              {notifications.map((n) => (
                <div
                  key={n.id}
                  className={`notification-item ${
                    n.starred ? "notification-important" : ""
                  }`}
                >
                  <div className="notification-text">
                    <p>
                      {/**
                       * If we parsed an actorName, highlight it and optionally show service number
                       * Otherwise show whole message as-is.
                       */}
                      {n.actorName
                        ? (() => {
                            const msg = n.message || "";
                            const idx = msg.indexOf(n.actorName);
                            if (idx >= 0) {
                              const before = msg.slice(0, idx);
                              const after = msg.slice(idx + n.actorName.length);
                              return (
                                <>
                                  {before}
                                  <strong>
                                    {n.actorName}
                                    {n.actorServiceNum
                                      ? ` (${n.actorServiceNum})`
                                      : ""}
                                  </strong>
                                  {after}
                                </>
                              );
                            }
                            // fallback
                            return (
                              <>
                                {msg}{" "}
                                {n.actorServiceNum
                                  ? `(${n.actorServiceNum})`
                                  : ""}
                              </>
                            );
                          })()
                        : n.message}
                    </p>
                    <span className="notification-time">
                      {new Date(n.date).toLocaleString()}
                    </span>
                  </div>

                  <div className="notification-actions">
                    <button
                      title={n.read ? "Mark unread" : "Mark read"}
                      className="notification-icon-btn"
                      onClick={() =>
                        n.read ? handleMarkUnread(n.id) : handleMarkRead(n.id)
                      }
                    >
                      {n.read ? "✓" : "•"}
                    </button>

                    <button
                      title={n.starred ? "Unmark important" : "Mark important"}
                      className="notification-icon-btn"
                      onClick={() => handleToggleStar(n.id)}
                    >
                      {n.starred ? (
                        <FaStar className="icon-gold" />
                      ) : (
                        <FaRegStar className="icon-gray" />
                      )}
                    </button>

                    <button
                      title="Delete"
                      className="notification-icon-btn"
                      onClick={() => handleDelete(n.id)}
                    >
                      <FaTrashAlt className="icon-red" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
      {showConfirm && (
        <ConfirmPopup
          message={confirmMessage}
          onConfirm={handleConfirm}
          onCancel={handleCancel}
        />
      )}
    </div>
  );
}
