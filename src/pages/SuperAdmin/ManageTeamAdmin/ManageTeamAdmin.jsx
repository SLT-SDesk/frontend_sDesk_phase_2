import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchTeamAdminsRequest,
  createTeamAdminRequest,
  updateTeamAdminRequest,
  deleteTeamAdminRequest,
} from "../../../redux/teamAdmin/teamAdminSlice";
import { fetchUserByServiceNum } from "../../../redux/sltusers/sltusersService";
import { useDispatch as useSagaDispatch } from "react-redux";
import { fetchMainCategoriesRequest, fetchSubCategoriesByMainCategoryIdRequest } from "../../../redux/categories/categorySlice";
import { useSelector as useAppSelector } from "react-redux";
// Removed unused sDesk_t2_users_dataset import
import "./ManageTeamAdmin.css";
import { MdEdit, MdDeleteForever } from 'react-icons/md';

const initialForm = {
  serviceNumber: "",
  userName: "",
  contactNumber: "",
  designation: "",
  email: "",
  cat1: "",
  cat2: "",
  cat3: "",
  cat4: "",
  teamId: "",
  teamName: "",
  userRole: "",
};

const MAX_CATEGORIES = 4;

const ManageTeamAdmin = () => {
  const dispatch = useDispatch();
  // Add fallback for undefined state.teamAdmin
  const { teamAdmins, loading, error } = useSelector(
    (state) =>
      state.teamAdmin || { teamAdmins: [], loading: false, error: null }
  );
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState(initialForm);
  const [submitError, setSubmitError] = useState("");
  // Get sltusers error from Redux (for backend error display)
  const sltusersError = useSelector(state => state.sltusers?.error);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [availableCategories, setAvailableCategories] = useState([]);
  // --- Category/Team Redux State ---
  const mainCategories = useAppSelector(state => state.categories?.mainCategories || []);
  const subCategories = useAppSelector(state => state.categories?.subCategories || []);
  const categoriesLoading = useAppSelector(state => state.categories?.loading);
  const categoriesError = useAppSelector(state => state.categories?.error);
  const subCategoriesLoading = useAppSelector(state => state.categories?.subCategoriesLoading);
  const subCategoriesError = useAppSelector(state => state.categories?.subCategoriesError);
  // Fetch main categories (teams) on mount
  useEffect(() => {
    dispatch(fetchMainCategoriesRequest());
  }, [dispatch]);
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [editMode, setEditMode] = useState(false);
  const [editId, setEditId] = useState(null);
  // --- Confirmation & Info Message State ---
  const [infoMessage, setInfoMessage] = useState("");
  const [showConfirm, setShowConfirm] = useState(false);
  const [confirmAction, setConfirmAction] = useState(null);
  const [confirmMessage, setConfirmMessage] = useState("");
  // Find teams that already have an admin
  const teamsWithAdmin = Array.isArray(teamAdmins)
    ? teamAdmins.map(admin => admin.teamName)
    : [];

  useEffect(() => {
    dispatch(fetchTeamAdminsRequest());
  }, [dispatch]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };
  // Service Number change: fetch user, always auto-fill designation as 'admin'
  const handleServiceNumberChange = async (e) => {
    const value = e.target.value;
    setForm((prev) => ({ ...prev, serviceNumber: value }));
    if (!value.trim()) {
      setForm((prev) => ({
        ...prev,
        userName: "",
        designation: "admin",
        email: "",
        contactNumber: "",
      }));
      setSubmitError("");
      return;
    }

    // Check if the user is already a team admin
    if (!editMode && Array.isArray(teamAdmins)) {
      const existingAdmin = teamAdmins.find(admin => admin.serviceNumber === value);
      if (existingAdmin) {
        setSubmitError("This User Already Team admin");
        setForm((prev) => ({
          ...prev,
          userName: "",
          designation: "admin",
          email: "",
          contactNumber: "",
        }));
        return;
      }
    }

    setSubmitError("");
    setForm((prev) => ({
      ...prev,
      userName: "Loading...",
      designation: "admin",
      email: "Loading...",
    }));

    try {
      const response = await fetchUserByServiceNum(value);
      const user = response.data;
      if (user) {
        // Check if user role is valid for promotion to admin
        const userRole = user.role?.toLowerCase();
        if (userRole === "technician" || userRole === "team leader") {
          setForm((prev) => ({
            ...prev,
            userName: "",
            designation: "admin",
            email: "",
            contactNumber: "",
          }));
          setSubmitError(`Cannot add user with role "${user.role}" as admin. Only users with role "user" can be promoted to admin.`);
          return;
        }
        
        setForm((prev) => ({
          ...prev,
          userName: user.display_name || "",
          designation: "admin",
          email: user.email || "",
          contactNumber: user.contactNumber ? user.contactNumber.replace(/\D/g, '').slice(0, 10) : "",
          userRole: user.role || "", // Store user role for validation
        }));
        setSubmitError("");
      } else {
        setForm((prev) => ({
          ...prev,
          userName: "",
          designation: "admin",
          email: "",
          contactNumber: "",
        }));
        setSubmitError("User not found in database.");
      }
    } catch (error) {
      setForm((prev) => ({
        ...prev,
        userName: "",
        designation: "admin",
        email: "",
        contactNumber: "",
      }));
      setSubmitError("User not found in database.");
    }
  };

  // --- Edit with Confirmation on Pencil Icon Click ---
  const handleEditClick = (admin) => {
    if (!admin || !admin.teamId || !admin.id) {
      setSubmitError("Invalid admin data for editing");
      return;
    }
    setConfirmMessage("Are you sure you want to update this admin?");
    setShowConfirm(true);
    setConfirmAction(() => () => {
      setForm({
        serviceNumber: admin.serviceNumber,
        userName: admin.userName,
        contactNumber: admin.contactNumber,
        designation: admin.designation,
        email: admin.email,
        cat1: admin.cat1,
        cat2: admin.cat2,
        cat3: admin.cat3,
        cat4: admin.cat4,
        teamId: admin.teamId,
        teamName: admin.teamName,
      });
      const cats = [admin.cat1, admin.cat2, admin.cat3, admin.cat4].filter(
        Boolean
      );
      setSelectedCategories(cats);
      setEditMode(true);
      setEditId(admin.teamId);
      setShowModal(true);
      setSubmitError("");
      setSubmitSuccess(false);
      setShowConfirm(false);
      setConfirmAction(null);
    });
  };

  const handleEditSubmit = () => {
    const payload = {
      serviceNumber: form.serviceNumber,
      userName: form.userName,
      contactNumber: form.contactNumber,
      designation: form.designation,
      email: form.email,
      cat1: selectedCategories[0] || "",
      cat2: selectedCategories[1] || "",
      cat3: selectedCategories[2] || "",
      cat4: selectedCategories[3] || "",
      teamId: form.teamId,
      teamName: form.teamName,
    };
    dispatch(updateTeamAdminRequest({ id: editId, data: payload }));
    setInfoMessage("Admin updated successfully!");
    setShowModal(false);
    setTimeout(() => setInfoMessage(""), 2000);
  };

  const handleAddClick = () => {
    setForm(initialForm);
    setShowModal(true);
    setSubmitError("");
    setSubmitSuccess(false);
    setEditMode(false);
    setEditId(null);
  };

  const handleClose = () => {
    setShowModal(false);
    setSubmitError("");
  };

  // When teamName changes, update teamId and fetch subcategories from backend
  useEffect(() => {
    if (form.teamName) {
      const selectedTeam = mainCategories.find(cat => cat.name === form.teamName);
      if (selectedTeam) {
        setForm(prev => ({ ...prev, teamId: selectedTeam.category_code }));
        dispatch(fetchSubCategoriesByMainCategoryIdRequest(selectedTeam.id));
      } else {
        setForm(prev => ({ ...prev, teamId: "" }));
        setAvailableCategories([]);
        setSelectedCategories([]);
      }
    } else {
      setForm(prev => ({ ...prev, teamId: "" }));
      setAvailableCategories([]);
      setSelectedCategories([]);
    }
  }, [form.teamName, mainCategories, dispatch]);

  // When subCategories in Redux change, update availableCategories
  useEffect(() => {
    if (Array.isArray(subCategories)) {
      setAvailableCategories(subCategories);
      // Remove any selected categories that are no longer available
      setSelectedCategories(prev => prev.filter(cat => subCategories.some(sub => sub.name === cat)));
    } else {
      setAvailableCategories([]);
    }
  }, [subCategories]);

  // When selectedCategories changes, update cat1-cat4 in form
  useEffect(() => {
    setForm((prev) => ({
      ...prev,
      cat1: selectedCategories[0] || "",
      cat2: selectedCategories[1] || "",
      cat3: selectedCategories[2] || "",
      cat4: selectedCategories[3] || "",
    }));
  }, [selectedCategories]);

  // Validation helpers
  const validateForm = (form, selectedCategories) => {
    const errors = {};
    if (!form.serviceNumber)
      errors.serviceNumber = "Service Number is required";
    if (!form.userName) errors.userName = "Full Name is required";
    if (!form.contactNumber) {
      errors.contactNumber = "Contact Number is required";
    } else if (!/^\d{10}$/.test(form.contactNumber)) {
      errors.contactNumber = "Contact Number must be exactly 10 digits";
    }
    if (!form.designation) errors.designation = "Designation is required";
    if (!form.email) errors.email = "Email is required";
    if (!form.teamId) errors.teamId = "Team ID is required";
    if (!form.teamName) errors.teamName = "Team Name is required";
    return errors;
  };

  // Add/Edit form submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitError("");
    setSubmitSuccess(false);
    
    // Check if this is edit mode
    const isEdit = editMode && editId;
    
    // Additional validation for new admin creation - check user role
    if (!isEdit) {
      const userRole = form.userRole?.toLowerCase();
      if (userRole === "technician" || userRole === "team leader") {
        setSubmitError(`Cannot promote user with role "${form.userRole}" to admin. Only users with role "user" can be promoted to admin.`);
        return;
      }
      if (userRole && userRole !== "user") {
        setSubmitError(`Invalid user role "${form.userRole}". Only users with role "user" can be promoted to admin.`);
        return;
      }
    }
    const payload = {
      serviceNumber: form.serviceNumber,
      userName: form.userName,
      contactNumber: form.contactNumber,
      designation: isEdit ? form.designation : "admin",
      email: form.email,
      cat1: selectedCategories[0] || "",
      cat2: selectedCategories[1] || "",
      cat3: selectedCategories[2] || "",
      cat4: selectedCategories[3] || "",
      teamId: form.teamId,
      teamName: form.teamName,
    };
    // Prevent adding admin to a team that already has one (unless editing that admin)
    if (!isEdit && teamsWithAdmin.includes(form.teamName)) {
      setSubmitError("An admin already exists for this team. Please select another team.");
      return;
    }
    const errors = validateForm(payload, selectedCategories);
    if (Object.keys(errors).length > 0) {
      setSubmitError(Object.values(errors).join(" | "));
      return;
    }
    if (isEdit) {
      dispatch(updateTeamAdminRequest({ id: editId, data: payload }));
      setInfoMessage("Admin updated successfully!");
      setShowModal(false);
      setTimeout(() => setInfoMessage(""), 2000);
    } else {
      try {
        // Call both APIs in parallel: createTeamAdminRequest and updateUserRoleRequest
        const results = await Promise.allSettled([
          dispatch(createTeamAdminRequest({ ...payload, teamId: form.teamId })),
          dispatch({
            type: 'sltusers/updateUserRoleRequest',
            payload: { serviceNum: form.serviceNumber, role: "admin" }
          })
        ]);
        // Check for errors in both results
        const errors = results
          .filter(r => r.status === 'rejected')
          .map(r => r.reason?.message || r.reason || 'Unknown error');
        if (errors.length > 0) {
          setSubmitError("Failed to add admin and/or update user role: " + errors.join(' | '));
        } else {
          setInfoMessage("Admin added successfully!");
          setSubmitSuccess(true);
          setTimeout(() => {
            setShowModal(false);
            setSubmitSuccess(false);
            setEditMode(false);
            setEditId(null);
            setInfoMessage("");
          }, 1000);
        }
      } catch (err) {
        setSubmitError("Failed to add admin and/or update user role: " + (err?.message || err));
      }
    }
  };

  const handleDeleteClick = (admin) => {
    if (!admin || !admin.teamId || !admin.id) {
      alert("Cannot delete: Missing admin data!");
      return;
    }
    setConfirmMessage("Are you sure you want to delete this admin?");
    setShowConfirm(true);
    setConfirmAction(() => () => {
      dispatch(deleteTeamAdminRequest({ teamId: admin.teamId, id: admin.id }));
      // Change role in slt_users table from admin to user
      dispatch({
        type: 'sltusers/updateUserRoleRequest',
        payload: { serviceNum: admin.serviceNumber, role: "user" }
      });
      setInfoMessage("Admin deleted successfully!");
      setShowConfirm(false);
      setTimeout(() => setInfoMessage(""), 2000);
    });
  };

  return (
    <div className="superadmin-container">
      <div className="superadmin-header-row">
        <h2>Team Admin Management</h2>
        <button className="add-user-btn" onClick={handleAddClick}>
          + Add Admin
        </button>
      </div>

      {loading && <p className="loading-message">Loading team admins...</p>}
      {error && <p className="error-message">{error}</p>}
      {(submitError || sltusersError) && (
        <div className="error-message">
          {submitError}
          {sltusersError && <div>{sltusersError}</div>}
        </div>
      )}
      
      {!loading && !error && teamAdmins.length === 0 && (
        <div className="info-message">No admins found.</div>
      )}

      <div className="table-responsive">
        <table className="teamadmin-table">
          <thead>
            <tr>
              <th>Service No.</th>
              <th>Full Name</th>
              <th>Contact</th>
              <th>Designation</th>
              <th>Email</th>
              <th>Team Name</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {(Array.isArray(teamAdmins) ? teamAdmins : []).map((admin) => (
              <tr key={admin.id}>
                <td>{admin.serviceNumber}</td>
                <td>{admin.userName}</td>
                <td>{admin.contactNumber}</td>
                <td>{admin.designation}</td>
                <td>{admin.email}</td>
                <td>{admin.teamName}</td>
                <td>
                  <button
                    title="Edit this admin"
                    onClick={() => handleEditClick(admin)}
                    style={{ background: 'none', border: 'none', padding: 0, marginRight: '10px', cursor: 'pointer' }}
                  >
                    <MdEdit style={{ color: '#1976d2', fontSize: '1.8em' }} />
                  </button>
                  <button
                    title="Delete this admin"
                    onClick={() => handleDeleteClick(admin)}
                    style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer' }}
                  >
                    <MdDeleteForever style={{ color: '#d32f2f', fontSize: '1.8em' }} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content teamadmin-form-container">
            <div className="modal-header">
              <h3>{editMode ? "Edit Team Admin" : "Add New Team Admin"}</h3>
              <button className="close-btn" onClick={handleClose}>
                &times;
              </button>
            </div>
            <form className="add-user-form" onSubmit={handleSubmit}>
              <div className="form-row">
                <div className="form-group">
                  <label>Service Number</label>
                  <input
                    name="serviceNumber"
                    value={form.serviceNumber}
                    onChange={handleServiceNumberChange}
                    required
                    disabled={editMode}
                  />
                </div>
                <div className="form-group">
                  <label>Full Name</label>
                  <input name="userName" value={form.userName} readOnly />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Contact Number</label>
                  <input
                    name="contactNumber"
                    value={form.contactNumber}
                    type="tel"
                    pattern="[0-9]{10}"
                    maxLength="10"
                    title="Please enter exactly 10 digits"
                    required
                    readOnly
                  />
                </div>
                <div className="form-group">
                  <label>Designation</label>
                  <input name="designation" value={form.designation} readOnly />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Email</label>
                  <input name="email" value={form.email} type="email" readOnly />
                </div>
                <div className="form-group">
                  <label>Team Name</label>
                  <select
                    name="teamName"
                    value={form.teamName}
                    onChange={handleChange}
                    required
                  >
                    <option value="">Select a Team</option>
                    {mainCategories.map((cat) => {
                      const isTaken = teamsWithAdmin.includes(cat.name);
                      const isCurrentEdit = editMode && form.teamName === cat.name;
                      return (
                        <option
                          key={cat.id}
                          value={cat.name}
                          disabled={isTaken && !isCurrentEdit}
                          className={isTaken && !isCurrentEdit ? "option-disabled" : ""}
                        >
                          {cat.name}
                          {isTaken && !isCurrentEdit ? " (Assigned)" : ""}
                        </option>
                      );
                    })}
                  </select>
                  {categoriesLoading && <div className="loading-text">Loading teams...</div>}
                  {categoriesError && <div className="error-text">{categoriesError}</div>}
                </div>
              </div>
              {submitError && <div className="error-message form-error">{submitError}</div>}
              {submitSuccess && <div className="success-message form-success">Admin added!</div>}
              <div className="form-actions">
                <button type="button" className="btn-cancel" onClick={handleClose}>
                  Cancel
                </button>
                <button type="submit" className="btn-submit">
                  {editMode ? "Update Admin" : "Add Admin"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showConfirm && (
        <div className="sa-modal-overlay">
          <div className="sa-modal-confirm">
            <h4 className="sa-modal-title">Confirm Action</h4>
            <p className="sa-modal-message">{confirmMessage}</p>
            <div className="sa-modal-actions">
              <button
                className="sa-btn sa-btn-cancel"
                onClick={() => setShowConfirm(false)}
              >
                Cancel
              </button>
              <button
                className="sa-btn sa-btn-confirm"
                onClick={() => {
                  if (confirmAction) confirmAction();
                  setShowConfirm(false);
                }}
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}

      {infoMessage && (
        <div className="sa-modal-overlay-info">
          <div className="sa-modal-info">
            <span className="sa-modal-info-icon">✔️</span>
            <p>{infoMessage}</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageTeamAdmin;
