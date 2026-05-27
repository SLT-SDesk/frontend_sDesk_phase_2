import React, { useEffect, useState, useMemo } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { 
  fetchTechniciansRequest, 
  updateTechnicianOnlineStatus 
} from '../../../redux/technicians/technicianSlice';
import socket from '../../../utils/socket';
import { FaUsers, FaSearch, FaCircle } from 'react-icons/fa';
import './Roster.css';

const Roster = () => {
  const dispatch = useDispatch();
  const { technicians, loading } = useSelector((state) => state.technicians);
  const { user } = useSelector((state) => state.auth);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterTeam, setFilterTeam] = useState('All');

  useEffect(() => {
    dispatch(fetchTechniciansRequest());

    const handleStatusChange = ({ serviceNum, active }) => {
      dispatch(updateTechnicianOnlineStatus({ serviceNum, isOnline: active }));
      // Optional: refetch to ensure data consistency
      // dispatch(fetchTechniciansRequest());
    };

    socket.on("technician_status_changed", handleStatusChange);

    return () => {
      socket.off("technician_status_changed", handleStatusChange);
    };
  }, [dispatch]);

  const teams = useMemo(() => {
    const uniqueTeams = [...new Set(technicians.map(t => t.teamName || t.team))].filter(Boolean);
    return ['All', ...uniqueTeams];
  }, [technicians]);

  const filteredTechnicians = useMemo(() => {
    return technicians.filter(tech => {
      const name = tech.name || '';
      const serviceNum = tech.serviceNumber || tech.serviceNum || '';
      const team = tech.teamName || tech.team || '';
      
      const matchesSearch = 
        name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        serviceNum.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesTeam = filterTeam === 'All' || team === filterTeam;
      
      return matchesSearch && matchesTeam;
    });
  }, [technicians, searchTerm, filterTeam]);

  if (loading && technicians.length === 0) {
    return (
      <div className="roster-loading">
        <div className="spinner"></div>
        <p>Loading roster data...</p>
      </div>
    );
  }

  return (
    <div className="roster-container">
      <div className="roster-header">
        <div className="roster-title-section">
          <h1><FaUsers className="title-icon" /> Technician Roster</h1>
          <p className="subtitle">Real-time status and availability of all technical officers</p>
        </div>
        
        <div className="roster-controls">
          <div className="search-box">
            <FaSearch className="search-icon" />
            <input 
              type="text" 
              placeholder="Search by name or service number..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <select 
            className="team-filter"
            value={filterTeam}
            onChange={(e) => setFilterTeam(e.target.value)}
          >
            {teams.map(team => (
              <option key={team} value={team}>{team === 'All' ? 'All Teams' : team}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="roster-grid">
        {filteredTechnicians.length > 0 ? (
          filteredTechnicians.map((tech) => (
            <div key={tech.id || tech.serviceNum} className="technician-card">
              <div className="card-header">
                <div className="avatar">
                  {tech.name?.charAt(0).toUpperCase()}
                </div>
                <div className={`status-indicator ${tech.active ? 'online' : 'offline'}`}>
                  <FaCircle className="status-dot" />
                  {tech.active ? 'Online' : 'Offline'}
                </div>
              </div>
              
              <div className="card-body">
                <h3 className="tech-name">{tech.name}</h3>
                <p className="tech-id">ID: {tech.serviceNumber || tech.serviceNum}</p>
                <div className="tech-info">
                  <span className="info-label">Team:</span>
                  <span className="info-value">{tech.teamName || tech.team || 'N/A'}</span>
                </div>
                <div className="tech-info">
                  <span className="info-label">Tier:</span>
                  <span className="info-value">{tech.tier || 'N/A'}</span>
                </div>
                <div className="tech-info">
                  <span className="info-label">Position:</span>
                  <span className="info-value">{tech.position || 'N/A'}</span>
                </div>
              </div>
              
              <div className="card-footer">
                <div className="contact-info">
                  {tech.email && <span className="email">{tech.email}</span>}
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="no-results">
            <p>No technicians found matching your criteria.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Roster;
