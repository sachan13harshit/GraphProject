import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { FaSignOutAlt, FaSync } from 'react-icons/fa';

import AddSkillForm from '../components/AddSkillForm';
import AddPrerequisiteForm from '../components/AddPrerequisiteForm';
import SkillList from '../components/SkillList';
import SkillStatus from '../components/SkillStatus';
import UnlockOrder from '../components/UnlockOrder';

const API_BASE_URL = `${import.meta.env.VITE_BACKEND_URL}/api`;

const HomePage = ({ user, onLogout }) => {
  const [skills, setSkills] = useState([]);
  const [unlockOrder, setUnlockOrder] = useState([]);
  const [skillStatus, setSkillStatus] = useState({ unlockable: [], locked: [], total: 0 });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const refreshData = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const token = user?.token;
      const headers = token ? { Authorization: `Bearer ${token}` } : {};

      const [skillsResponse, unlockOrderResponse, skillStatusResponse] = await Promise.all([
        axios.get(`${API_BASE_URL}/skills`, { headers }),
        axios.get(`${API_BASE_URL}/skills/topo-sort`, { headers }),
        axios.get(`${API_BASE_URL}/skills/status`, { headers }),
      ]);
      setSkills(skillsResponse.data.data);
      setUnlockOrder(unlockOrderResponse.data.data);
      setSkillStatus(skillStatusResponse.data.data);
    } catch (err) {
      setError('Failed to fetch data. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      refreshData();
    }
  }, [user, refreshData]);

  const handleLogout = () => {
    onLogout();
  };

  return (
    <div className="min-h-screen min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8 flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <h1 className="text-xl font-bold text-gray-900">SkillTree</h1>
            <p className="text-sm text-gray-500">Welcome, {user.email}</p>
          </div>
          <div>
            <button
              onClick={refreshData}
              disabled={loading}
              className="p-2 rounded-full text-gray-500 hover:bg-gray-100 hover:text-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
            >
              <FaSync className={loading ? 'animate-spin' : ''} />
            </button>
            <button
              onClick={handleLogout}
              className="ml-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-red-700 bg-red-100 hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
            >
              <FaSignOutAlt className="mr-2" />
              Logout
            </button>
          </div>
        </div>
      </header>

      <main className="py-8">
        <div className="max-w-7xl mx-auto sm:px-6 lg:px-8 space-y-8">
          {error && <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded-md" role="alert"><p>{error}</p></div>}
          
          {/* Row 1: Forms */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <AddSkillForm onSkillAdded={refreshData} token={user?.token} />
            <AddPrerequisiteForm skills={skills} onSkillAdded={refreshData} setError={setError} token={user?.token} />
          </div>

          {/* Row 2: Learning Path */}
          <UnlockOrder order={unlockOrder} skills={skills} />

          {/* Row 3: Skills and Status */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="p-6 bg-white rounded-xl shadow-md">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">Your Skills</h2>
              <SkillList skills={skills} onSkillUpdated={refreshData} onSkillDeleted={refreshData} token={user?.token} />
            </div>
             <SkillStatus status={skillStatus} skills={skills} />
          </div>
        </div>
      </main>
    </div>
  );
};

export default HomePage; 