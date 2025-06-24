import { useState, Fragment } from 'react'

const UnlockOrder = ({ order = [], skills, cycleError }) => {
  const [isPathVisible, setIsPathVisible] = useState(false);

  const getSkillById = (id) => {
    return skills.find(skill => skill._id === id)
  }

  const getLevelColor = (level) => {
    switch (level) {
      case 'Beginner': return 'bg-green-100 text-green-800'
      case 'Intermediate': return 'bg-yellow-100 text-yellow-800'
      case 'Advanced': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusIcon = (completed) => {
    return completed ? '✅' : '⏳'
  }
  
  if (cycleError) {
    return (
        <div className="bg-white rounded-lg shadow-md p-6 flex flex-col items-center justify-center text-center" style={{minHeight: '400px'}}>
            <h2 className="text-2xl font-bold text-red-600 mb-4">Cycle Detected!</h2>
            <p className="text-gray-600">
              A learning order cannot be generated because a circular dependency exists in your skills.
              <br />
              Please remove the prerequisite that creates the cycle.
            </p>
        </div>
    )
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-xl font-semibold text-gray-800 mb-4">Learning Order</h2>
      
      {order.length === 0 ? (
        <div className="flex items-center justify-center h-20 bg-gray-50 rounded-lg">
          <p className="text-gray-500">Add skills and prerequisites to see the learning order.</p>
        </div>
      ) : (
        <>
          {!isPathVisible ? (
            <div className="text-center py-8">
              <button
                onClick={() => setIsPathVisible(true)}
                className="bg-indigo-600 text-white font-semibold py-3 px-6 rounded-lg hover:bg-indigo-700 transition-colors shadow-md"
              >
                Generate Learning Path
              </button>
            </div>
          ) : (
            <div className="bg-gray-50 border rounded-lg p-8">
              <div className="flex items-center justify-center flex-wrap gap-4">
                {order.map((skillId, index) => {
                  const skill = getSkillById(skillId)
                  if (!skill) return null

                  return (
                    <Fragment key={skillId}>
                      <div className="flex items-center justify-center h-24 w-24 bg-indigo-600 text-white rounded-full shadow-lg text-center font-medium p-2">
                        <span>{skill.name}</span>
                      </div>

                      {index < order.length - 1 && (
                         <svg className="w-16 h-16 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                        </svg>
                      )}
                    </Fragment>
                  )
                })}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}

export default UnlockOrder 