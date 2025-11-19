import React, { useEffect, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import "./AffectedUserDetails.css";
import {
  lookupUserRequest,
  clearLookupUser,
} from "../../redux/userLookup/userLookupSlice";

// Debounce function to prevent too many API calls
const useDebounce = (callback, delay) => {
  const [debounceTimer, setDebounceTimer] = React.useState(null);

  const debouncedCallback = useCallback(
    (...args) => {
      if (debounceTimer) {
        clearTimeout(debounceTimer);
      }

      const newTimer = setTimeout(() => {
        callback(...args);
      }, delay);

      setDebounceTimer(newTimer);
    },
    [callback, delay, debounceTimer]
  );

  return debouncedCallback;
};

const AffectedUserDetails = ({ formData, setFormData, handleInputChange }) => {
  const dispatch = useDispatch();
  const { loading, user, error } = useSelector((state) => state.userLookup);

  // Debounced lookup function
  const debouncedLookup = useDebounce((serviceNum) => {
    dispatch(lookupUserRequest(serviceNum));
  }, 500);

  // Handle service number change with lookup
  const handleServiceNoChange = (e) => {
    const serviceNum = e.target.value;
    // Update form data immediately for UI responsiveness
    handleInputChange(e);
    // Perform lookup if service number exists and has minimum length
    if (
      serviceNum &&
      serviceNum.trim() !== "" &&
      serviceNum.trim().length >= 3
    ) {
      debouncedLookup(serviceNum.trim());
    } else {
      // Clear previous lookup results if service number is too short
      dispatch(clearLookupUser());
      // Clear user-related fields
      setFormData((prevData) => ({
        ...prevData,
        name: "",
        email: "",
        designation: "",
        tpNumber: "",
      }));
    }
  };

  // Auto-fill form when user data is found, butonly fill empty fields (do not overwrite manual edits)
  useEffect(() => {
    if (user) {
      setFormData((prevData) => ({
        ...prevData,
        name: prevData.name || user.display_name || "",
        email: prevData.email || user.email || "",
        designation: prevData.designation || user.role || "",
        tpNumber: prevData.tpNumber || user.contactNumber || "",
      }));
    }
  }, [user, setFormData]);

  // Clear lookup user data on component unmount
  useEffect(() => {
    return () => {
      dispatch(clearLookupUser());
    };
  }, [dispatch]);

  return (
    <div className="AddInicident-content2-UserDetails">
      <div className="AddInicident-content2-UserDetails-TitleBar">
        Affected User Details
      </div>

      <div className="AddInicident-content2-UserDetails-UserInfo">
        <div className="AddInicident-content2-UserDetails-UserInfo-Cube1">
          <div className="AddInicident-content2-UserDetails-UserInfo-Cube1-title">
            Service No
          </div>
          <div className="AddInicident-content2-UserDetails-UserInfo-Cube1-input">
            <input
              type="text"
              placeholder="Enter Service No"
              name="serviceNo"
              value={formData.serviceNo}
              onChange={handleServiceNoChange}
              required
            />
            {user ? (
              <div className="lookup-status success">✅ User Found</div>
            ) : !loading &&
              !user &&
              error &&
              error.includes("User not found") &&
              formData.serviceNo &&
              formData.serviceNo.trim().length >= 3 ? (
              <div className="lookup-status error">❌ User Not Found</div>
            ) : null}
          </div>
        </div>
        <div className="AddInicident-content2-UserDetails-UserInfo-Cube2">
          <div className="AddInicident-content2-UserDetails-UserInfo-Cube1-title">
            TP Number
          </div>
          <div className="AddInicident-content2-UserDetails-UserInfo-Cube1-input">
            <input
              type="text"
              name="tpNumber"
              value={formData.tpNumber}
              onChange={handleInputChange}
              placeholder="TP Number"
            />
          </div>
        </div>
        <div className="AddInicident-content2-UserDetails-UserInfo-Cube3">
          <div className="AddInicident-content2-UserDetails-UserInfo-Cube1-title">
            Name
          </div>
          <div className="AddInicident-content2-UserDetails-UserInfo-Cube1-input">
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              placeholder="Full Name"
            />
          </div>
        </div>
        <div className="AddInicident-content2-UserDetails-UserInfo-Cube2">
          <div className="AddInicident-content2-UserDetails-UserInfo-Cube1-title">
            Designation
          </div>
          <div className="AddInicident-content2-UserDetails-UserInfo-Cube1-input">
            <input
              type="text"
              name="designation"
              value={formData.designation}
              onChange={handleInputChange}
              placeholder="Designation"
            />
          </div>
        </div>
        <div className="AddInicident-content2-UserDetails-UserInfo-Cube2">
          <div className="AddInicident-content2-UserDetails-UserInfo-Cube1-title">
            Email
          </div>
          <div className="AddInicident-content2-UserDetails-UserInfo-Cube1-input">
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              placeholder="Email"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default AffectedUserDetails;
