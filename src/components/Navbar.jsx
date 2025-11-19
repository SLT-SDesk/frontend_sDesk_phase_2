import React, { useState } from 'react';

// Responsive Navbar with logo and hamburger menu
const Navbar = () => {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <nav className="bg-white shadow-md px-4 py-2 flex items-center justify-between">
      {/* Logo */}
      <div className="flex items-center">
        <img src="/vite.svg" alt="SDesk Logo" className="h-8 w-8 mr-2" />
        <span className="font-bold text-xl text-gray-800">SDesk</span>
      </div>
      {/* Desktop Menu */}
      <div className="hidden md:flex space-x-6">
        <a href="/MyAssignedIncidents" className="text-gray-700 hover:text-blue-600">My Incidents</a>
        {/* Add more links as needed */}
      </div>
      {/* Hamburger for mobile */}
      <div className="md:hidden">
        <button onClick={() => setMenuOpen(!menuOpen)} className="focus:outline-none">
          <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
      </div>
      {/* Mobile Menu Dropdown */}
      {menuOpen && (
        <div className="absolute top-14 left-0 w-full bg-white shadow-md md:hidden z-10">
          <a href="/MyAssignedIncidents" className="block px-4 py-2 text-gray-700 hover:bg-blue-50">My Incidents</a>
          {/* Add more links as needed */}
        </div>
      )}
    </nav>
  );
};

export default Navbar;
