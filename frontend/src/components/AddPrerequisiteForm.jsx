import { useState, useEffect } from 'react'
import axios from 'axios'

const API_BASE_URL = `${import.meta.env.VITE_BACKEND_URL}/api`;

const AddPrerequisiteForm = ({ onSkillAdded, skills, token }) => {
  const [prerequisiteData, setPrerequisiteData] = useState({
    skillId: '',
    prerequisiteId: ''
  })
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [showCycleErrorModal, setShowCycleErrorModal] = useState(false);

  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => {
        setMessage('');
      }, 10000); 

      return () => {
        clearTimeout(timer);
      };
    }
  }, [message]);

  const handlePrerequisiteChange = (e) => {
    const { name, value } = e.target
    setPrerequisiteData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleAddPrerequisite = async (e) => {
    e.preventDefault()
    if (!prerequisiteData.skillId || !prerequisiteData.prerequisiteId) {
      setMessage('❌ Please select both skill and prerequisite')
      return
    }

    setLoading(true)
    setMessage('')

    try {
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      await axios.post(`${API_BASE_URL}/skills/${prerequisiteData.skillId}/add-prerequisite`, {
        prerequisiteId: prerequisiteData.prerequisiteId
      }, { headers });
      setMessage('✅ Prerequisite added successfully!')
      setPrerequisiteData({ skillId: '', prerequisiteId: '' })
      if (onSkillAdded) {
        onSkillAdded()
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message;
      if (errorMessage.toLowerCase().includes('cycle')) {
        setShowCycleErrorModal(true);
        setPrerequisiteData({ skillId: '', prerequisiteId: '' });
      } else {
        setMessage(`❌ Error: ${errorMessage}`)
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6 h-full">
       {showCycleErrorModal && (
        <div className="fixed inset-0 bg-gradient-to-br from-blue-100/80 to-indigo-200/80 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white p-8 rounded-lg shadow-xl text-center max-w-sm mx-auto">
            <div className="text-5xl mb-4">️️⚠️</div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">Cycle Detected!</h3>
            <p className="text-gray-600 mb-6">
              You cannot add this prerequisite as it would create a circular dependency.
            </p>
            <button
              onClick={() => setShowCycleErrorModal(false)}
              className="w-full bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              OK
            </button>
          </div>
        </div>
      )}

      <h2 className="text-xl font-semibold text-gray-800 mb-4">🔗 Add Prerequisite</h2>
      
       {message && (
        <div className={`mb-4 p-3 rounded-lg ${
          message.includes('✅') ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
        }`}>
          {message}
        </div>
      )}

      <form onSubmit={handleAddPrerequisite} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Target Skill
          </label>
          <select
            name="skillId"
            value={prerequisiteData.skillId}
            onChange={handlePrerequisiteChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white text-gray-900"
          >
            <option value="">Select a skill</option>
            {skills.map(skill => (
              <option key={skill._id} value={skill._id}>
                {skill.name} ({skill.level})
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Prerequisite Skill
          </label>
          <select
            name="prerequisiteId"
            value={prerequisiteData.prerequisiteId}
            onChange={handlePrerequisiteChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white text-gray-900"
          >
            <option value="">Select a prerequisite</option>
            {skills.map(skill => (
              <option key={skill._id} value={skill._id}>
                {skill.name} ({skill.level})
              </option>
            ))}
          </select>
        </div>

        <button
          type="submit"
          disabled={loading || !prerequisiteData.skillId || !prerequisiteData.prerequisiteId}
          className="w-full bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {loading ? 'Adding...' : 'Add Prerequisite'}
        </button>
      </form>
    </div>
  )
}

export default AddPrerequisiteForm 