import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { IoMdArrowDropright, IoMdArrowDropdown } from 'react-icons/io';
import { IoIosClose } from 'react-icons/io';
import './CategoryDropDown.css';
import { fetchCategoriesRequest } from '../../redux/categories/categorySlice';

const CategoryDropdown = ({ onSelect, onClose, hideTier3 = false, showOnlyTier3 = false }) => {
    const [expanded, setExpanded] = useState({});
    const [searchTerm, setSearchTerm] = useState('');
    const dispatch = useDispatch();

    // Get data from Redux store
    const { list: mainCategories, loading: isLoading, error } = useSelector((state) => state.categories);
    const loggedInUser = useSelector((state) => state.auth?.user);

    useEffect(() => {
        // Fetch categories using Redux action
        dispatch(fetchCategoriesRequest());
    }, [dispatch]);

    const toggleExpand = (key) => {
        setExpanded((prev) => ({
            ...prev,
            [key]: !prev[key],
        }));
    };

    const handleSelect = (item) => {
        onSelect({ name: item.name, number: item.category_code });
        onClose();
    };

    // Called when clicking the NAME of a main category
    const handleMainCategoryClick = (mainCategory) => {
        if (!mainCategory.subCategories || mainCategory.subCategories.length === 0) {
            // No children → select directly
            handleSelect(mainCategory);
        } else {
            // Has children → toggle expand
            toggleExpand(`main-${mainCategory.id}`);
        }
    };

    // Called when clicking the NAME of a subcategory
    const handleSubCategoryClick = (subcategory) => {
        // Always expand/collapse — subcategory nodes (SUB* codes) are NOT valid
        // for backend reassignment. Only leaf CategoryItems (item.category_code) can be selected.
        toggleExpand(`sub-${subcategory.id}`);
    };

    // Filter categories based on search term (case insensitive)
    const filterCategories = (categories) => {
        let filtered = categories;

        // Filter categories
        if (showOnlyTier3) {
            filtered = filtered.filter(mainCategory => {
                const name = mainCategory.name?.toLowerCase().trim();
                return name === 'tier 3 support' || name === 'tier 3';
            });
        } else if (hideTier3 || loggedInUser?.role === 'user') {
            filtered = filtered.filter(mainCategory => {
                const name = mainCategory.name?.toLowerCase().trim();
                return name !== 'tier 3 support' && name !== 'tier 3';
            });
        }

        if (!searchTerm.trim()) return filtered;

        const searchLower = searchTerm.toLowerCase();

        return filtered.map(mainCategory => {
            const filteredSubCategories = mainCategory.subCategories.map(subCategory => {
                const filteredItems = subCategory.categoryItems.filter(item =>
                    item.name.toLowerCase().includes(searchLower)
                );

                // Include subcategory if it has matching items or if subcategory name matches
                if (filteredItems.length > 0 || subCategory.name.toLowerCase().includes(searchLower)) {
                    return {
                        ...subCategory,
                        categoryItems: filteredItems
                    };
                }
                return null;
            }).filter(Boolean);

            // Include main category if it has matching subcategories or if main category name matches
            if (filteredSubCategories.length > 0 || mainCategory.name.toLowerCase().includes(searchLower)) {
                return {
                    ...mainCategory,
                    subCategories: filteredSubCategories
                };
            }
            return null;
        }).filter(Boolean);
    };

    const filteredCategories = filterCategories(mainCategories);

    // Auto-expand categories when searching
    useEffect(() => {
        if (searchTerm.trim()) {
            const newExpanded = {};
            filteredCategories.forEach(mainCategory => {
                newExpanded[`main-${mainCategory.id}`] = true;
                mainCategory.subCategories.forEach(subCategory => {
                    newExpanded[`sub-${subCategory.id}`] = true;
                });
            });
            setExpanded(newExpanded);
        }
    }, [searchTerm, filteredCategories]);

    if (isLoading) {
        return <div className="AdminCategoryTree-content">Loading categories...</div>;
    }

    if (error) {
        return <div className="AdminCategoryTree-content">Error: {error}</div>;
    }

    return (
        <div className="AdminCategoryTree-content">
            <div className="AdminCategoryTree-content-TreePopup">
                <div className="AdminCategoryTree-content-TreePopup-Header">
                    <h3>Select Category</h3>
                    <button
                        onClick={onClose}
                        className="AdminCategoryTree-content-TreePopup-Header-closeButton"
                    >
                        <IoIosClose size={30} />
                    </button>
                </div>
                <div className="AdminCategoryTree-search-container">
                    <input
                        type="text"
                        placeholder="Search categories..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="AdminCategoryTree-search-input"
                    />
                </div>
                <div className="AdminCategoryTree-content-TreePopup-Body">
                    {filteredCategories.length === 0 && searchTerm.trim() ? (
                        <div className="AdminCategoryTree-no-results">
                            No categories found matching "{searchTerm}"
                        </div>
                    ) : (
                        filteredCategories.map((mainCategory) => (
                            <div key={mainCategory.id} className="AdminCategoryTree-node">
                                <div className="AdminCategoryTree-content-TreePopup-Body-Label">
                                    {/* Arrow: always just toggles expand */}
                                    <span
                                        className="arrow-icon-wrapper"
                                        onClick={(e) => { e.stopPropagation(); toggleExpand(`main-${mainCategory.id}`); }}
                                    >
                                        {mainCategory.subCategories && mainCategory.subCategories.length > 0 ? (
                                            expanded[`main-${mainCategory.id}`]
                                                ? <IoMdArrowDropdown className="arrow-icon" />
                                                : <IoMdArrowDropright className="arrow-icon" />
                                        ) : (
                                            <span className="arrow-icon arrow-icon-placeholder" />
                                        )}
                                    </span>
                                    {/* Name: select if leaf, expand if has children */}
                                    <span
                                        className="category-label-text"
                                        onClick={() => handleMainCategoryClick(mainCategory)}
                                    >
                                        {mainCategory.name}
                                    </span>
                                </div>
                                {expanded[`main-${mainCategory.id}`] && mainCategory.subCategories && mainCategory.subCategories.length > 0 && (
                                    <div className="AdminCategoryTree-content-TreePopup-Body-SubNodes">
                                        {mainCategory.subCategories.map((subcategory) => (
                                            <div key={subcategory.id} className="AdminCategoryTree-subnode">
                                                <div className="AdminCategoryTree-content-TreePopup-Body-SubNodes-Label">
                                                    {/* Arrow: always just toggles expand */}
                                                    <span
                                                        className="arrow-icon-wrapper"
                                                        onClick={(e) => { e.stopPropagation(); toggleExpand(`sub-${subcategory.id}`); }}
                                                    >
                                                        {subcategory.categoryItems && subcategory.categoryItems.length > 0 ? (
                                                            expanded[`sub-${subcategory.id}`]
                                                                ? <IoMdArrowDropdown className="arrow-icon" />
                                                                : <IoMdArrowDropright className="arrow-icon" />
                                                        ) : (
                                                            <span className="arrow-icon arrow-icon-placeholder" />
                                                        )}
                                                    </span>
                                                    {/* Name: select if leaf, expand if has items */}
                                                    <span
                                                        className="category-label-text"
                                                        onClick={() => handleSubCategoryClick(subcategory)}
                                                    >
                                                        {subcategory.name}
                                                    </span>
                                                </div>
                                                {expanded[`sub-${subcategory.id}`] && subcategory.categoryItems && subcategory.categoryItems.length > 0 && (
                                                    <div className="AdminCategoryTree-items">
                                                        {subcategory.categoryItems.map((item) => (
                                                            <div
                                                                key={item.id}
                                                                className="AdminCategoryTree-item"
                                                                onClick={() => handleSelect(item)}
                                                            >
                                                                {item.name}
                                                            </div>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
};

export default CategoryDropdown;