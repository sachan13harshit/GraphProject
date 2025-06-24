import { useState, useEffect } from 'react'
import axios from 'axios'

const API_BASE_URL = 'http://localhost:5000/api'

const SkillList = ({ skills, onSkillUpdated, onSkillDeleted, token }) => {
  const [editingId, setEditingId] = useState(null)
  const [editData, setEditData] = useState({})
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')

  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => {
        setMessage('');
      }, 10000); // 10 seconds

      return () => {
        clearTimeout(timer);
      };
    }
  }, [message]);

  const handleEdit = (skill) => {
    setEditingId(skill._id)
    setEditData({
      name: skill.name,
      description: skill.description,
      level: skill.level,
      completed: skill.completed
    })
  }

  const handleCancelEdit = () => {
    setEditingId(null)
    setEditData({})
  }

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target
    setEditData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }))
  }

  const handleSave = async (skillId) => {
    setLoading(true)
    setMessage('')

    try {
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      await axios.put(`${API_BASE_URL}/skills/${skillId}`, editData, { headers });
      setMessage('✅ Skill updated successfully!')
      setEditingId(null)
      setEditData({})
      onSkillUpdated()
    } catch (error) {
      setMessage(`❌ Error: ${error.response?.data?.message || error.message}`)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (skillId) => {
    if (!window.confirm('Are you sure you want to delete this skill? This will also remove it from all prerequisites.')) {
      return
    }

    setLoading(true)
    setMessage('')

    try {
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      await axios.delete(`${API_BASE_URL}/skills/${skillId}`, { headers });
      setMessage('✅ Skill deleted successfully!')
      onSkillDeleted()
    } catch (error) {
      setMessage(`❌ Error: ${error.response?.data?.message || error.message}`)
    } finally {
      setLoading(false)
    }
  }

  const handleRemovePrerequisite = async (skillId, prerequisiteId) => {
    setLoading(true)
    setMessage('')

    try {
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      await axios.delete(`${API_BASE_URL}/skills/${skillId}/remove-prerequisite/${prerequisiteId}`, { headers });
      setMessage('✅ Prerequisite removed successfully!')
      onSkillUpdated()
    } catch (error) {
      setMessage(`❌ Error: ${error.response?.data?.message || error.message}`)
    } finally {
      setLoading(false)
    }
  }

  const getLevelColor = (level) => {
    switch (level) {
      case 'Beginner': return 'bg-green-100 text-green-800'
      case 'Intermediate': return 'bg-yellow-100 text-yellow-800'
      case 'Advanced': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusColor = (completed) => {
    return completed ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-xl font-semibold text-gray-800 mb-4">📋 Skills List</h2>
      
      {message && (
        <div className={`mb-4 p-3 rounded-lg ${
          message.includes('✅') ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
        }`}>
          {message}
        </div>
      )}

      {skills.length === 0 ? (
        <p className="text-gray-500 text-center py-8">No skills added yet. Add your first skill above!</p>
      ) : (
        <div className="space-y-4">
          {skills.map(skill => (
            <div key={skill._id} className="border border-gray-200 rounded-lg p-4">
              {editingId === skill._id ? (
                // Edit Mode
                <div className="space-y-3">
                  <input
                    type="text"
                    name="name"
                    value={editData.name}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                  <textarea
                    name="description"
                    value={editData.description}
                    onChange={handleInputChange}
                    rows="2"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                  <div className="flex space-x-2">
                    <select
                      name="level"
                      value={editData.level}
                      onChange={handleInputChange}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    >
                      <option value="Beginner">Beginner</option>
                      <option value="Intermediate">Intermediate</option>
                      <option value="Advanced">Advanced</option>
                    </select>
                    <label className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        name="completed"
                        checked={editData.completed}
                        onChange={handleInputChange}
                        className="rounded"
                      />
                      <span className="text-sm">Completed</span>
                    </label>
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleSave(skill._id)}
                      disabled={loading}
                      className="flex-1 bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 disabled:opacity-50"
                    >
                      {loading ? 'Saving...' : 'Save'}
                    </button>
                    <button
                      onClick={handleCancelEdit}
                      className="flex-1 bg-gray-600 text-white py-2 px-4 rounded-md hover:bg-gray-700"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                // View Mode
                <div>
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-semibold text-gray-900">{skill.name}</h3>
                    <div className="flex space-x-2">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getLevelColor(skill.level)}`}>
                        {skill.level}
                      </span>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(skill.completed)}`}>
                        {skill.completed ? '✅ Completed' : '⏳ Pending'}
                      </span>
                    </div>
                  </div>
                  
                  {skill.description && (
                    <p className="text-gray-600 text-sm mb-3">{skill.description}</p>
                  )}

                  {skill.prerequisites && skill.prerequisites.length > 0 && (
                    <div className="mb-3">
                      <p className="text-sm font-medium text-gray-700 mb-1">Prerequisites:</p>
                      <div className="flex flex-wrap gap-1">
                        {skill.prerequisites.map(prereq => (
                          <div key={prereq._id} className="flex items-center space-x-1 bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs">
                            <span>{prereq.name}</span>
                            <button
                              onClick={() => handleRemovePrerequisite(skill._id, prereq._id)}
                              className="text-blue-600 hover:text-blue-800"
                              title="Remove prerequisite"
                            >
                              ×
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleEdit(skill)}
                      className="flex-1 bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700 text-sm"
                    >
                      ✏️ Edit
                    </button>
                    <button
                      onClick={() => handleDelete(skill._id)}
                      disabled={loading}
                      className="flex-1 bg-red-600 text-white py-2 px-4 rounded-md hover:bg-red-700 disabled:opacity-50 text-sm"
                    >
                      🗑️ Delete
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default SkillList 