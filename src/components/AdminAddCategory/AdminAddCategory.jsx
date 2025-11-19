import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { createCategoryRequest, fetchMainCategoriesRequest, fetchSubCategoriesRequest, fetchSubCategoriesByMainCategoryIdRequest, createCategoryItemRequest, updateCategoryItemRequest } from '../../redux/categories/categorySlice';
import './AdminAddCategory.css';

const AdminAddCategory = ({ onSubmit, onClose, isEdit = false, editCategory = null }) => {
    const dispatch = useDispatch();
    const mainCategories = useSelector(state => state.categories.mainCategories);
    const subCategories = useSelector(state => state.categories.subCategories);
    const categoryError = useSelector(state => state.categories.error);
    const subCategoryError = useSelector(state => state.categories.createSubCategoryError);
    const subCategorySuccess = useSelector(state => state.categories.createSubCategorySuccess);
    const mainCategoryError = useSelector(state => state.categories.createMainCategoryError);
    const mainCategorySuccess = useSelector(state => state.categories.createMainCategorySuccess);
    const categoryItemError = useSelector(state => state.categories.createCategoryItemError);
    const categoryItemSuccess = useSelector(state => state.categories.createCategoryItemSuccess);
    const [categoryType, setCategoryType] = useState(isEdit ? editCategory?.type || 'grandchild' : 'grandchild');
    const [formData, setFormData] = useState(
        isEdit && editCategory
            ? {
                  name: editCategory.name || '',
                  parent: editCategory.parent || '',
                  sub: editCategory.sub || '',
              }
            : { name: '', parent: '', sub: '' }
    );
    const [errors, setErrors] = useState({});
    const [localSuccess, setLocalSuccess] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        dispatch(fetchMainCategoriesRequest());
        dispatch(fetchSubCategoriesRequest());
    }, [dispatch]);

    useEffect(() => {
        if (categoryType === 'grandchild' && formData.parent) {
            dispatch(fetchSubCategoriesByMainCategoryIdRequest(formData.parent));
        }
    }, [categoryType, formData.parent, dispatch]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value,
        }));
        if (value && errors[name]) {
            setErrors(prev => ({ ...prev, [name]: undefined }));
        }
    };

    // UUID v4 regex (simple, not strict for all variants)
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

    const handleSubmit = (e) => {
        e.preventDefault();
        if (isSubmitting) return;
        setIsSubmitting(true);
        const newErrors = {};

        if (!formData.name) newErrors.name = 'Name is required';
        if (categoryType !== 'parent' && !formData.parent) newErrors.parent = 'Parent Category is required';
        if (categoryType === 'grandchild' && !formData.sub) newErrors.sub = 'Sub Category is required';

        // UUID validation for parent and sub fields
        if (categoryType === 'sub' || categoryType === 'grandchild') {
            if (!formData.parent || !uuidRegex.test(formData.parent)) {
                newErrors.parent = 'Parent Category is invalid (not a valid ID)';
            }
        }
        if (categoryType === 'grandchild') {
            if (!formData.sub || !uuidRegex.test(formData.sub)) {
                newErrors.sub = 'Sub Category is invalid (not a valid ID)';
            }

        }

        setErrors(newErrors);

        // Log payload for debugging
        if (!isEdit) {
            if (categoryType === 'parent') {
                if (!formData.name || typeof formData.name !== 'string' || formData.name.trim() === '') {
                    setErrors({ name: 'Name is required' });
                    setIsSubmitting(false);
                    return;
                }
                const payload = { name: formData.name.trim() };
                dispatch(createCategoryRequest(payload));
                setTimeout(() => setIsSubmitting(false), 1000);
                return;
            } else if (categoryType === 'sub') {
                const parentObj = mainCategories.find(cat => cat.id === formData.parent);
                if (!parentObj) {
                    setErrors({ parent: 'Invalid parent category selected❌' });
                    setIsSubmitting(false);
                    return;
                }
                if (!formData.name || typeof formData.name !== 'string' || formData.name.trim() === '') {
                    setErrors({ name: 'Name is required' });
                    setIsSubmitting(false);
                    return;
                }
                if (!uuidRegex.test(parentObj.id)) {
                    setErrors({ parent: 'Parent Category is not a valid UUID' });
                    setIsSubmitting(false);
                    return;
                }
                const payload = { name: formData.name.trim(), mainCategoryId: parentObj.id };
                dispatch({ type: 'categories/createSubCategoryRequest', payload });
                setTimeout(() => setIsSubmitting(false), 1000);
                return;
            } else if (categoryType === 'grandchild') {
                if (!formData.sub || typeof formData.sub !== 'string' || formData.sub.trim() === '') {
                    setErrors({ sub: 'Sub Category is required' });
                    setIsSubmitting(false);
                    return;
                }
                if (!formData.name || typeof formData.name !== 'string' || formData.name.trim() === '') {
                    setErrors({ name: 'Name is required' });
                    setIsSubmitting(false);
                    return;
                }
                if (!uuidRegex.test(formData.sub)) {
                    setErrors({ sub: 'Sub Category is not a valid UUID' });
                    setIsSubmitting(false);
                    return;
                }
                // Only send trimmed name and subCategoryId as string
                const payload = { name: formData.name.trim(), subCategoryId: String(formData.sub) };
                dispatch(createCategoryItemRequest(payload));
                setTimeout(() => setIsSubmitting(false), 1000);
                return;
            }
        } else {
            // Only allow editing for grandchild/category-item
            if (categoryType === 'grandchild' && editCategory?.id) {
                const payload = {
                    id: editCategory.id,
                    name: formData.name,
                    subCategoryId: formData.sub
                };
                dispatch(updateCategoryItemRequest(payload));
                setLocalSuccess('Category item updated successfully!✅');
                setTimeout(() => {
                    setLocalSuccess('');
                    onClose();
                }, 1000);
                setTimeout(() => setIsSubmitting(false), 1000);
                return;
            }
            // Optionally handle other types if needed
        }
        if (Object.keys(newErrors).length > 0) {
            setIsSubmitting(false);
            return;
        }
    };
    const filteredSubCategories = categoryType === 'grandchild' && formData.parent
        ? subCategories.filter(sub => sub.mainCategory && sub.mainCategory.id === formData.parent)
        : [];

    useEffect(() => {
        if (categoryType === 'parent' && !isEdit) {
            if (mainCategorySuccess && !mainCategoryError && !errors.name && formData.name) {
                setLocalSuccess('Parent category added successfully!✅');
                setTimeout(() => {
                    setLocalSuccess('');
                    onSubmit && onSubmit({ name: formData.name });
                    onClose();
                }, 1000);
            }
        }
        if (categoryType === 'sub' && !isEdit) {
            if (subCategorySuccess && !subCategoryError && !errors.name && formData.name && formData.parent) {
                setLocalSuccess('Subcategory added successfully!✅');
                setTimeout(() => {
                    setLocalSuccess('');
                    onClose();
                }, 2000);
            }
        }
        if (categoryType === 'grandchild' && !isEdit) {
            if (categoryItemSuccess && !categoryItemError && !errors.name && formData.name && formData.sub) {
                setLocalSuccess('Category item added successfully!✅');
                setTimeout(() => {
                    setLocalSuccess('');
                    onClose();
                }, 2000);
            }
        }
    }, [mainCategoryError, mainCategorySuccess, categoryError, subCategorySuccess, subCategoryError, categoryItemSuccess, categoryItemError]);


    return (
        <div className="AdminAddCategory-modal" role="dialog" aria-labelledby="category-form-title" aria-modal="true">
            <div className="AdminAddCategory-content1">
                <div className="AdminAddCategory-content1-topcontainer">
                    <div>
                        <div className="AdminAddCategory-content1-topcontainer-selectContainer">
                            <label className="AdminAddCategory-content1-topcontainer-label" htmlFor="category-type-select">
                                Category Type:
                            </label>
                            <select
                                id="category-type-select"
                                className="AdminAddCategory-content1-topcontainer-select"
                                value={categoryType}
                                onChange={(e) => {
                                    setCategoryType(e.target.value);
                                    setFormData({ name: '', parent: '', sub: '' });
                                    setErrors({});
                                }}
                                aria-describedby="category-type-help"
                            >
                                <option value="parent">Parent Category</option>
                                <option value="sub">Sub Category</option>
                                <option value="grandchild">Category</option>
                            </select>
                            <span id="category-type-help" className="sr-only">
                                Select the type of category you want to {isEdit ? 'edit' : 'create'}
                            </span>
                        </div>
                    </div>
                </div>
                <div className="AdminAddCategory-content1-formContainer">
                    <form
                        onSubmit={handleSubmit}
                        className="AdminAddCategory-content1-formContainer-form"
                        noValidate
                    >
                        {categoryType === 'parent' && (
                            <div className="AdminAddCategory-field-group">
                                <label htmlFor="parent-name">Category Name:</label>
                                <input
                                    id="parent-name"
                                    type="text"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    placeholder="Enter parent category name"
                                    aria-describedby={errors.name || mainCategoryError === 'DUPLICATE_NAME' ? "parent-name-error" : undefined}
                                    aria-invalid={!!(errors.name || mainCategoryError === 'DUPLICATE_NAME')}
                                />
                                {/* Show required field error or duplicate name error */}
                                {(errors.name || mainCategoryError === 'DUPLICATE_NAME') && (
                                    <div id="parent-name-error" className="AdminAddCategory-content1-error-message" role="alert">
                                        {mainCategoryError === 'DUPLICATE_NAME' && (
                                            <span>⚠️ This main category name already exists.</span>
                                        )}
                                        {errors.name && <span>⚠️ {errors.name}</span>}
                                    </div>
                                )}
                            </div>
                        )}
                        {categoryType === 'sub' && (
                            <>
                                <div className="AdminAddCategory-field-group">
                                    <label htmlFor="sub-parent">Parent Category:</label>
                                    <select
                                        id="sub-parent"
                                        name="parent"
                                        value={formData.parent}
                                        onChange={handleChange}
                                        aria-describedby={errors.parent ? "sub-parent-error" : undefined}
                                        aria-invalid={!!errors.parent}
                                    >
                                        <option value="">Select Parent Category</option>
                                        {mainCategories.map(parent => (
                                            <option key={parent.id} value={parent.id}>
                                                {parent.name} (Code: {parent.category_code})
                                            </option>
                                        ))}
                                    </select>
                                    {errors.parent && (
                                        <div id="sub-parent-error" className="AdminAddCategory-content1-error-message" role="alert">
                                            ⚠️ {errors.parent}
                                        </div>
                                    )}
                                </div>
                                <div className="AdminAddCategory-field-group">
                                    <label htmlFor="sub-name">Sub Category Name:</label>
                                    <input
                                        id="sub-name"
                                        type="text"
                                        name="name"
                                        value={formData.name}
                                        onChange={handleChange}
                                        placeholder="Enter sub category name"
                                        aria-describedby={errors.name || subCategoryError === 'DUPLICATE_NAME' ? "sub-name-error" : undefined}
                                        aria-invalid={!!(errors.name || subCategoryError === 'DUPLICATE_NAME')}
                                    />
                                    {/* Show required field error or duplicate name error under the input */}
                                    {(errors.name || subCategoryError === 'DUPLICATE_NAME') && (
                                        <div id="sub-name-error" className="AdminAddCategory-content1-error-message" role="alert">
                                            {subCategoryError === 'DUPLICATE_NAME' && (
                                                <span>⚠️ This sub category name already exists under this parent.</span>
                                            )}
                                            {errors.name && <span>⚠️ {errors.name}</span>}
                                        </div>
                                    )}
                                </div>
                            </>
                        )}
                        {categoryType === 'grandchild' && (
                            <>
                                <div className="AdminAddCategory-field-group">
                                    <label htmlFor="grandchild-parent">Parent Category:</label>
                                    <select
                                        id="grandchild-parent"
                                        name="parent"
                                        value={formData.parent}
                                        onChange={handleChange}
                                        aria-describedby={errors.parent ? "grandchild-parent-error" : undefined}
                                        aria-invalid={!!errors.parent}
                                    >
                                        <option value="">Select Parent Category</option>
                                        {mainCategories.map(parent => (
                                            <option key={parent.id} value={parent.id}>
                                                {parent.name} (Code: {parent.category_code})
                                            </option>
                                        ))}
                                    </select>
                                    {errors.parent && (
                                        <div id="grandchild-parent-error" className="AdminAddCategory-content1-error-message" role="alert">
                                            ⚠️ {errors.parent}
                                        </div>
                                    )}
                                </div>
                                <div className="AdminAddCategory-field-group">
                                    <label htmlFor="grandchild-sub">Sub Category:</label>
                                    <select
                                        id="grandchild-sub"
                                        name="sub"
                                        value={formData.sub}
                                        onChange={handleChange}
                                        disabled={!formData.parent}
                                        aria-describedby={errors.sub ? "grandchild-sub-error" : undefined}
                                        aria-invalid={!!errors.sub}
                                    >
                                        <option value="">Select Sub Category</option>
                                        {formData.parent && filteredSubCategories.length > 0 ? (
                                            filteredSubCategories.map(sub => (
                                                <option key={sub.id} value={sub.id}>
                                                    {sub.name} (Code: {sub.category_code})
                                                </option>
                                            ))
                                        ) : null}
                                    </select>
                                    {errors.sub && (
                                        <div id="grandchild-sub-error" className="AdminAddCategory-content1-error-message" role="alert">
                                            ⚠️ {errors.sub}
                                        </div>
                                    )}
                                </div>
                                <div className="AdminAddCategory-field-group">
                                    <label htmlFor="grandchild-name">Category Item Name:</label>
                                    <input
                                        id="grandchild-name"
                                        type="text"
                                        name="name"
                                        value={formData.name}
                                        onChange={handleChange}
                                        placeholder="Enter category item name"
                                        aria-describedby={errors.name || categoryItemError === 'DUPLICATE_NAME' ? "grandchild-name-error" : undefined}
                                        aria-invalid={!!(errors.name || categoryItemError === 'DUPLICATE_NAME')}
                                    />
                                    {/* Show required field error or duplicate name error under the input */}
                                    {(errors.name || categoryItemError === 'DUPLICATE_NAME') && (
                                        <div id="grandchild-name-error" className="AdminAddCategory-content1-error-message" role="alert">
                                            {categoryItemError === 'DUPLICATE_NAME' && (
                                                <span>⚠️ This category item name already exists under this sub category.</span>
                                            )}
                                            {errors.name && <span>⚠️ {errors.name}</span>}
                                        </div>
                                    )}
                                </div>
                            </>
                        )}
                        <div className="AdminAddCategory-content1-formContainer-form-submit">
                            <button 
                                type="submit" 
                                disabled={isSubmitting}
                                aria-describedby="submit-button-help"
                            >
                                {isEdit ? '💾 Save Changes' : '➕ Add Category'}
                            </button>
                            <button 
                                type="button" 
                                onClick={onClose}
                                aria-label="Cancel and close form"
                            >
                                Exit
                            </button>
                            <span id="submit-button-help" className="sr-only">
                                {isSubmitting ? 'Processing request...' : `Click to ${isEdit ? 'save changes' : 'add new category'}`}
                            </span>
                        </div>
                    </form>
                    {localSuccess && (
                        <div className="AdminAddCategory-success-message" role="alert" aria-live="polite">
                            ✅ {localSuccess}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AdminAddCategory;