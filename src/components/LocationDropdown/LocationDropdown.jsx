import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { IoMdArrowDropright, IoMdArrowDropdown } from 'react-icons/io';
import { IoIosClose } from 'react-icons/io';
import { IoSearchOutline } from 'react-icons/io5';
import './LocationDropdown.css';
import { fetchLocationsRequest } from '../../redux/location/locationSlice';

const LocationDropdown = ({ onSelect, onClose }) => {
    const [expanded, setExpanded] = useState({});
    const [regions, setRegions] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const dispatch = useDispatch();
    
    // Get data from Redux store
    const { locations, loading: isLoading, error } = useSelector((state) => state.location);

    useEffect(() => {
        // Fetch locations using Redux action
        dispatch(fetchLocationsRequest());
    }, [dispatch]);

    useEffect(() => {
        if (locations && locations.length > 0) {
            // Group locations by region and province
            const groupedByRegion = locations.reduce((acc, location) => {
                const region = location.region || 'Other';
                const province = location.province || 'Other';
                
                if (!acc[region]) {
                    acc[region] = {};
                }
                if (!acc[region][province]) {
                    acc[region][province] = [];
                }
                acc[region][province].push(location);
                return acc;
            }, {});

            // Convert to array structure
            const regionArray = Object.entries(groupedByRegion).map(([regionName, provinces]) => ({
                name: regionName,
                provinces: Object.entries(provinces).map(([provinceName, locs]) => ({
                    name: provinceName,
                    locations: locs
                }))
            }));

            setRegions(regionArray);
        }
    }, [locations]);

    const toggleExpand = (key) => {
        setExpanded((prev) => ({
            ...prev,
            [key]: !prev[key],
        }));
    };

    const handleSelect = (location) => {
        onSelect({ name: location.locationName, number: location.locationCode });
        onClose();
    };

    const handleSearch = (query) => {
        setSearchQuery(query);
        if (!query.trim()) {
            setSearchResults([]);
            return;
        }

        const results = locations.filter(location => {
            const searchTerm = query.toLowerCase();
            return (
                location.locationName.toLowerCase().includes(searchTerm) ||
                (location.region && location.region.toLowerCase().includes(searchTerm)) ||
                (location.province && location.province.toLowerCase().includes(searchTerm))
            );
        });

        setSearchResults(results);
    };

    useEffect(() => {
        document.body.style.overflow = 'hidden';
        return () => {
            document.body.style.overflow = 'auto';
        };
    }, []);

    if (isLoading) {
        return <div className="AdminLocationTree-content">Loading locations...</div>;
    }

    if (error) {
        return <div className="AdminLocationTree-content">Error: {error}</div>;
    }

    return (
        <div className="AdminLocationTree-content">
            <div className="AdminLocationTree-content-TreePopup">
                <div className="AdminLocationTree-content-TreePopup-Header">
                    <h3>Select Location</h3>
                    <button
                        onClick={onClose}
                        className="AdminLocationTree-content-TreePopup-Header-closeButton"
                    >
                        <IoIosClose size={30} />
                    </button>
                </div>
                <div className="AdminLocationTree-content-TreePopup-SearchBox">
                    <IoSearchOutline className="search-icon" />
                    <input
                        type="text"
                        placeholder="Search locations..."
                        value={searchQuery}
                        onChange={(e) => handleSearch(e.target.value)}
                        className="AdminLocationTree-content-TreePopup-SearchInput"
                    />
                </div>
                <div className="AdminLocationTree-content-TreePopup-Body">
                    {searchQuery ? (
                        <div className="AdminLocationTree-search-results">
                            {searchResults.map((location, index) => (
                                <div
                                    key={index}
                                    className="AdminLocationTree-search-result-item"
                                    onClick={() => handleSelect(location)}
                                >
                                    <div className="location-name">{location.locationName}</div>
                                    <div className="location-path">{location.region} {'>'} {location.province}</div>
                                </div>
                            ))}
                            {searchResults.length === 0 && (
                                <div className="no-results">No locations found</div>
                            )}
                        </div>
                    ) : 
                        regions.map((region, regionIndex) => (
                        <div key={regionIndex} className="AdminLocationTree-node">
                            <div
                                className="AdminLocationTree-content-TreePopup-Body-Label"
                                onClick={() => toggleExpand(`region-${regionIndex}`)}
                            >
                                {expanded[`region-${regionIndex}`] ? (
                                    <IoMdArrowDropdown className="arrow-icon" />
                                ) : (
                                    <IoMdArrowDropright className="arrow-icon" />
                                )}
                                {region.name}
                            </div>
                            {expanded[`region-${regionIndex}`] && (
                                <div className="AdminLocationTree-content-TreePopup-Body-SubNodes">
                                    {region.provinces.map((province, provinceIndex) => (
                                        <div key={provinceIndex} className="AdminLocationTree-sublocation">
                                            <div
                                                className="AdminLocationTree-content-TreePopup-Body-Label"
                                                onClick={() => toggleExpand(`province-${regionIndex}-${provinceIndex}`)}
                                                style={{ paddingLeft: '20px' }}
                                            >
                                                {expanded[`province-${regionIndex}-${provinceIndex}`] ? (
                                                    <IoMdArrowDropdown className="arrow-icon" />
                                                ) : (
                                                    <IoMdArrowDropright className="arrow-icon" />
                                                )}
                                                {province.name}
                                            </div>
                                            {expanded[`province-${regionIndex}-${provinceIndex}`] && (
                                                <div className="AdminLocationTree-content-TreePopup-Body-SubNodes">
                                                    {province.locations.map((location, locationIndex) => (
                                                        <div
                                                            key={locationIndex}
                                                            className="AdminLocationTree-content-TreePopup-Body-SubNodes-Label AdminLocationTree-item"
                                                            onClick={() => handleSelect(location)}
                                                            style={{ paddingLeft: '40px' }}
                                                        >
                                                            {location.locationName}
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default LocationDropdown;