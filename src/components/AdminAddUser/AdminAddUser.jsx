import React, { useState, useEffect, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchSubCategoriesByMainCategoryIdRequest, fetchMainCategoriesRequest } from '../../redux/categories/categorySlice';
import './AdminAddUser.css';
import { IoIosClose } from 'react-icons/io';
import socket from '../../utils/socket';
import {
  lookupUserRequest,
  clearLookupUser,
} from "../../redux/userLookup/userLookupSlice";


// Helper: returns true if the given team name is "IT Help Desk" (case-insensitive)
const isITHelpDeskTeam = (teamName) =>
  typeof teamName === 'string' && teamName.toLowerCase().trim() === 'it help desk';

// Helper: returns true if the given main category name represents Tier 3 (case-insensitive)
const isTier3CategoryName = (name) =>
  typeof name === 'string' && (name.toLowerCase().trim() === 'tier 3 support' || name.toLowerCase().trim() === 'tier 3');


const AdminAddUser = ({ onSubmit, onClose, isEdit = false, editUser = null, addTechnicianError, allTechnicians = [] }) => {
  // Show error if technician already exists (on submit)
  const showSubmitUserExists =
    addTechnicianError &&
    (
      addTechnicianError.toLowerCase().includes('technician already')

    );
  const dispatch = useDispatch();

  const loggedInUser = useSelector(state => state.auth?.user);
  const mainCategories = useSelector(state => state.categories?.mainCategories || []);
  const subCategories = useSelector(state => state.categories?.subCategories || []);
  const { user, loading: lookupLoading, error: lookupError } =
    useSelector(state => state.userLookup);


  const [formData, setFormData] = useState({
    id: '',
    name: '',
    email: '',
    contactNumber: '',
    teamName: loggedInUser?.teamName || '',
    position: 'technician',
    tier: 'tier1',
    active: true,
    teamId: loggedInUser?.teamId || '',
    categories: [],
  });

  const [errors, setErrors] = useState({});

  const [hasSubmitted, setHasSubmitted] = useState(false);

  // Track whether we've already initialized the form for the current editUser.
  // This prevents subCategories updates (triggered by tier changes) from
  // re-firing the edit pre-fill effect and resetting the tier back.
  const editInitializedRef = React.useRef(false);

  // Tier3 allowed sub-categories — sourced directly from the flat subCategories state
  // and filtered by matching the "Tier 3 Support" main category.
  const tier3AllowedSubCategories = React.useMemo(() => {
    const tier3MainCat = mainCategories.find(mainCat =>
      isTier3CategoryName(mainCat.name)
    );
    const tier3MainCatId = tier3MainCat?.id;

    return subCategories.filter(subCat => {
      const matchId = tier3MainCatId && (
        subCat.mainCategoryId === tier3MainCatId ||
        subCat.main_category_id === tier3MainCatId ||
        subCat.mainCategory?.id === tier3MainCatId
      );
      const matchName = isTier3CategoryName(subCat.mainCategory?.name);
      const hasItems = subCat.categoryItems && subCat.categoryItems.length > 0;

      return (matchId || matchName) && hasItems;
    });
  }, [mainCategories, subCategories]);

  // Memoize filtered subcategories to prevent recalculation on every render
  // For admins, show all subcategories based on teamName match instead of teamId
  const filteredSubCategories = React.useMemo(() => {
    if (!loggedInUser) return subCategories;

    // When Tier3 is selected, show only the Super Admin's Tier3 categories
    // (sub-categories belonging to the "Tier 3 Support" main category)
    if (formData.tier === 'tier3') {
      return tier3AllowedSubCategories;
    }

    // First try to find matching main category by teamId
    let userMainCategory = mainCategories.find(mainCat =>
      mainCat.id === loggedInUser?.teamId
    );

    // If not found by teamId, try by teamName
    if (!userMainCategory && loggedInUser?.teamName) {
      userMainCategory = mainCategories.find(mainCat =>
        mainCat.name === loggedInUser.teamName
      );
    }

    // If we found a matching main category, filter subcategories by it
    if (userMainCategory) {
      return subCategories.filter(subCat =>
        subCat.mainCategory?.id === userMainCategory.id ||
        subCat.mainCategory?.name === userMainCategory.name
      );
    }

    // If no match found, return all subcategories as fallback
    return subCategories;
  }, [subCategories, mainCategories, loggedInUser?.teamId, loggedInUser?.teamName, formData.tier, tier3AllowedSubCategories]);


  useEffect(() => {
    if (!isEdit) {
      // clear stale redux errors when opening modal
      dispatch({ type: 'CLEAR_ADD_TECHNICIAN_ERROR' });
    }
  }, [isEdit, dispatch]);

  // Fetch main categories when component mounts
  useEffect(() => {
    dispatch(fetchMainCategoriesRequest());
  }, [dispatch]);

  // Fetch all subcategories when component mounts
  useEffect(() => {
    dispatch({ type: 'categories/fetchSubCategoriesRequest' });
  }, [dispatch]);

  // Fetch subcategories when mainCategories are loaded, when loggedInUser changes, or when the selected tier changes
  useEffect(() => {
    if (mainCategories.length === 0) return;

    if (formData.tier === 'tier3') {
      // For Tier3, we fetch all sub categories using the general endpoint so that
      // the nested categoryItems relations are correctly populated.
      dispatch({ type: 'categories/fetchSubCategoriesRequest' });
    } else if (loggedInUser?.teamId || loggedInUser?.teamName) {
      // Find the main category that matches the logged-in user's team
      const userMainCategory = mainCategories.find(mainCat =>
        mainCat.name === loggedInUser?.teamName ||
        mainCat.category_code === loggedInUser?.teamId ||
        mainCat.id === loggedInUser?.teamId
      );

      if (userMainCategory) {
        dispatch(fetchSubCategoriesByMainCategoryIdRequest(userMainCategory.id));
      }
    }
  }, [dispatch, loggedInUser, mainCategories, formData.tier]);


  useEffect(() => {
    if (isEdit) return;

    const serviceNum = formData.id?.trim();

    if (!serviceNum || serviceNum.length < 3) {
      dispatch(clearLookupUser());
      return;
    }

    dispatch(lookupUserRequest(serviceNum));
  }, [formData.id, isEdit, dispatch]);


  useEffect(() => {
    if (user) {
      setFormData(prev => ({
        ...prev,
        name: user.display_name || "",
        email: user.email || "",
        contactNumber: user.contactNumber || "",
      }));
    }

    if (lookupError) {
      setFormData(prev => ({
        ...prev,
        name: "",
        email: "",
        contactNumber: "",
      }));
    }
  }, [user, lookupError]);

  // Pre-fill form when opening in edit mode.
  // We use a ref to ensure this only runs ONCE per editUser open — NOT every time
  // subCategories updates (which happens when the tier changes and triggers a fetch).
  useEffect(() => {
    if (!isEdit || !editUser) {
      editInitializedRef.current = false;
      return;
    }

    // Already initialized for this editUser — skip to avoid resetting tier on category refetch
    if (editInitializedRef.current) return;
    editInitializedRef.current = true;

    const editCategories = [
      editUser.cat1,
      editUser.cat2,
      editUser.cat3,
      editUser.cat4
    ]
      .filter(Boolean)
      .map(name => {
        const sub = subCategories.find(s => s.name === name);
        return sub ? sub.id : name;
      });

    setFormData({
      id: editUser.serviceNum || editUser.serviceNumber || editUser.id || '',
      name: editUser.name || '',
      email: editUser.email || '',
      contactNumber: editUser.contactNumber || '',
      teamName: loggedInUser?.teamName || '',
      tier: editUser.tier || 'tier1',
      position: editUser.position || 'technician' || 'teamLeader',
      active: editUser.active !== undefined ? editUser.active : true,
      teamId: loggedInUser?.teamId || '',
      categories: editCategories,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isEdit, editUser, loggedInUser?.teamName, loggedInUser?.teamId]);

  // Reset formData to initial state (with teamName) every time the modal is opened in add mode
  useEffect(() => {
    if (!isEdit) {
      setFormData({
        id: '',
        name: '',
        email: '',
        teamId: loggedInUser?.teamId || '',
        teamName: loggedInUser?.teamName || '',
        position: 'technician',
        tier: 'tier1',
        active: true,
        categories: [],
      });
      setErrors({});
    }
  }, [isEdit, loggedInUser, editUser]);



  // Always set teamName from admin/cookie when adding or editing
  useEffect(() => {
    if (loggedInUser && loggedInUser.teamName) {
      setFormData(prev => ({ ...prev, teamName: loggedInUser.teamName }));
    }
  }, [loggedInUser]);

  // Auto-reset tier to 'tier1' if 'tier3' is selected but the team is not IT Help Desk.
  // Skip this restriction in edit mode — admins should be able to freely change the tier.
  // Also clears selected categories when the tier changes to prevent invalid carry-over.
  useEffect(() => {
    if (!isEdit && formData.tier === 'tier3' && !isITHelpDeskTeam(formData.teamName)) {
      setFormData(prev => ({ ...prev, tier: 'tier1', categories: [] }));
    }
  }, [formData.teamName, formData.tier, isEdit]);

  // Derived: which tiers are available based on the current team.
  // In edit mode, always show all 3 tiers so the admin can change it freely.
  const availableTiers = isEdit
    ? ['tier1', 'tier2', 'tier3']
    : isITHelpDeskTeam(formData.teamName)
      ? ['tier1', 'tier2', 'tier3']
      : ['tier1', 'tier2'];

  const handleChange = e => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: undefined }));
    }
  };

  // Tier-specific change handler: guards tier3 selection for non-IT-Help-Desk teams
  // In edit mode, allow any tier to be selected freely.
  // Also clears selected categories when the tier changes to prevent invalid carry-over.
  const handleTierChange = e => {
    const newTier = e.target.value;
    if (!isEdit) {
      const effectiveTeam = isITHelpDeskTeam(formData.teamName) ? formData.teamName : (formData.teamName || '');
      if (newTier === 'tier3' && !isITHelpDeskTeam(effectiveTeam)) {
        // Prevent selecting tier3 for non-IT Help Desk teams — silently ignore
        return;
      }
    }
    // Clear categories when tier changes to avoid carrying over invalid selections
    setFormData(prev => ({ ...prev, tier: newTier, categories: [] }));
    if (errors.tier) {
      setErrors(prev => ({ ...prev, tier: undefined }));
    }
  };

  const handleCategoryChange = e => {
    const value = e.target.value;
    const selected = new Set(formData.categories);

    if (selected.has(value)) {
      selected.delete(value);
    } else {
      if (selected.size < 4) {
        selected.add(value);
      } else {
        setErrors(prev => ({ ...prev, categories: 'Can assign only up to 4 categories' }));
      }
    }

    setFormData(prev => ({ ...prev, categories: Array.from(selected) }));

    if (errors.categories && selected.size > 0 && selected.size <= 4) {
      setErrors(prev => ({ ...prev, categories: undefined }));
    }
  };


  const selectedCategories = formData.categories || [];

  const handleSubmit = (e) => {
    e.preventDefault();

    setHasSubmitted(true);

    const newErrors = {};
    // Always validate against the displayed (fetched) values
    const nameToUse = formData.name;
    const emailToUse = formData.email;
    if (!formData.id) newErrors.id = 'Service Number is required';
    if (!emailToUse) newErrors.email = 'Email is required';
    if (!nameToUse) newErrors.name = 'Name is required';
    if (!formData.teamName) newErrors.teamName = 'Team is required';
    if (formData.categories.length === 0) {
      newErrors.categories = 'Select at least one category';
    } else if (formData.categories.length > 4) {
      newErrors.categories = 'Can assign only up to 4 categories';
    }

    // Validate: Tier3 is only allowed for IT Help Desk team
    const effectiveTeamForValidation = formData.tier === 'tier3' ? 'IT Help Desk' : formData.teamName;
    if (formData.tier === 'tier3' && !isITHelpDeskTeam(effectiveTeamForValidation)) {
      newErrors.tier = 'Tier3 is only available for the IT Help Desk team';
    }

    // Validate: for Tier3, selected categories must all be from the Tier3 allowed list
    if (formData.tier === 'tier3' && tier3AllowedSubCategories.length > 0) {
      const allowedIds = new Set(tier3AllowedSubCategories.map(s => s.id));
      const hasInvalidCategory = formData.categories.some(catId => !allowedIds.has(catId));
      if (hasInvalidCategory) {
        newErrors.categories = 'Selected categories are not allowed for Tier3';
      }
    }

    // Team Leader validation
    if (formData.position === 'teamLeader') {
      const teamLeadersInTeam = allTechnicians.filter(
        (tech) =>
          tech.team === formData.teamName &&
          (tech.position === 'teamLeader')
      );

      const isEditingSelfAsLeader =
        isEdit &&
        editUser &&
        (editUser.position === 'teamLeader') &&
        (editUser.serviceNum === formData.id || editUser.serviceNumber === formData.id);

      if (teamLeadersInTeam.length >= 4 && !isEditingSelfAsLeader) {
        newErrors.position = 'A team can only have up to 4 team leaders.';
      }
    }

    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;

    // Convert category IDs back to names for the backend
    const categoryNames = formData.categories.map(catId => {
      const subCat = filteredSubCategories.find(sub => sub.id === catId);
      return subCat ? subCat.name : catId; // fallback to catId if not found
    });

    let finalTeamId = formData.teamId;
    let finalTeamName = formData.teamName;

    if (formData.tier === 'tier3') {
      const tier3Category = mainCategories.find(mainCat =>
        mainCat.name.toLowerCase().trim() === 'it help desk'
      );
      if (tier3Category) {
        finalTeamId = tier3Category.id;
        finalTeamName = tier3Category.name;
      }
    }

    const payload = {
      serviceNum: formData.id,
      email: emailToUse,
      name: nameToUse,
      teamId: finalTeamId,
      team: finalTeamName,
      tier: formData.tier,
      active: formData.active,
      cat1: categoryNames[0] || '',
      cat2: categoryNames[1] || '',
      cat3: categoryNames[2] || '',
      cat4: categoryNames[3] || '',
      position: formData.position,
      contactNumber: formData.contactNumber,
      isEdit,
    };

    // If editing and changing active status to false
    if (isEdit && editUser?.active && !formData.active) {
      socket.emit('admin-deactivate-technician', {
        serviceNum: formData.id,
        message: 'You have been deactivated by admin'
      });
    }

    onSubmit(payload);
  };


  return (
    <div className="AdminAddUser-modal">
      <div className="AdminAddUser-content">
        <div className="AdminAddUser-header">
          <h2>{isEdit ? 'Edit Technical Officer' : 'Add Technical Officer'}</h2>
          <button onClick={onClose}><IoIosClose size={30} /></button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="AdminAddUser-form-grid">
            <div className="form-left">
              <div>
                <label>Service Number:</label>
                {errors.id && <span className="error-message">{errors.id}</span>}
                <input
                  type="text"
                  name="id"
                  value={formData.id}
                  onChange={handleChange}
                  autoComplete="off"
                  required
                  readOnly={isEdit}
                />
                {/* Show 'User Found' or 'User Not Found' message */}
                {!isEdit && user && <span className="success-message">User Found</span>}

                {!isEdit && lookupError && hasSubmitted && (
                  <span className="error-message">User Not Found</span>
                )}



              </div>
              <div>
                <label>Name:</label>
                {errors.name && <span className="error-message">{errors.name}</span>}
                <input
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  readOnly={!!user || isEdit}

                />

              </div>
              <div>
                <label>Email:</label>
                {errors.email && <span className="error-message">{errors.email}</span>}
                <input
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  readOnly={!!user || isEdit}

                />

              </div>

              <div>
                <label>Team:</label>
                <input
                  type="text"
                  name="teamName"
                  value={formData.tier === 'tier3' ? 'IT Help Desk' : formData.teamName}
                  readOnly
                  className="readonly-input"
                />
              </div>
              <div>
                <label>Position:</label>
                <select name="position" value={formData.position} onChange={handleChange}>
                  <option value="technician">Technical Officer</option>
                  <option value="teamLeader">Team Leader</option>
                </select>
                {errors.position && <span className="error-message">{errors.position}</span>}
              </div>
              <div>
                <label>Tier:</label>
                <select name="tier" value={formData.tier} onChange={handleTierChange}>
                  {availableTiers.map(tier => (
                    <option key={tier} value={tier}>
                      {tier.charAt(0).toUpperCase() + tier.slice(1)}
                    </option>
                  ))}
                </select>
                {errors.tier && <span className="error-message">{errors.tier}</span>}
              </div>
              <div className="form-left-ActiveCheckBox">
                <label>Active:</label>
                <input
                  type="checkbox"
                  name="active"
                  checked={formData.active}
                  onChange={handleChange}
                />
              </div>
            </div>
            <div className="form-right">
              <label>Categories :</label>
              {errors.categories && <span className="error-message">{errors.categories}</span>}
              <div className="checkbox-list">
                {filteredSubCategories.map(item => (
                  <label key={item.id} className="checkbox-item">
                    <input
                      type="checkbox"
                      value={item.id}
                      checked={formData.categories.includes(item.id)}
                      onChange={handleCategoryChange}
                    />
                    {item.name}
                  </label>
                ))}
              </div>
              <div className="AdminAddUser-form-submit">
                <button type="submit">{isEdit ? 'Save' : 'Add'}</button>
                {showSubmitUserExists && (
                  <span className="error-message message-margin">Technical Officer already exists</span>
                )}
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AdminAddUser;