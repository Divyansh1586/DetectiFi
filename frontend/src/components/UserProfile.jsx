import React, { useState, useRef, useEffect } from 'react';
import { Button } from "@/components/ui/button"; // Assuming Button is used or can be removed if not needed
import profileDefault from "../assets/profile.png"; // Default profile image

const UserProfile = ({ user, onLogout }) => {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  if (!user) return null;

  return (
    <div className="relative" ref={dropdownRef}>
      <img
        src={user.picture || profileDefault}
        alt="Profile"
        className="w-10 h-10 md:w-12 md:h-12 rounded-full cursor-pointer border-2 border-gray-300 hover:border-red-600"
        onClick={() => setDropdownOpen((prev) => !prev)}
      />
      {dropdownOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-white border rounded shadow-lg py-2 z-50">
          <div className="px-4 py-3 text-sm text-gray-800 border-b">
            Logged in as: <strong>{user.name || user.email || "User"}</strong>
          </div>
          <button
            onClick={onLogout}
            className="w-full text-left px-4 py-3 text-sm text-red-600 hover:bg-gray-100 transition-colors duration-150"
          >
            Logout
          </button>
        </div>
      )}
    </div>
  );
};

export default UserProfile; 