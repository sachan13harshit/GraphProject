const SkillStatus = ({ status = { unlockable: [], locked: [], total: 0 }, skills }) => {
  const { unlockable, locked, total } = status

  const getSkillName = (skillId) => {
    const skill = skills.find(s => s._id === skillId)
    return skill ? skill.name : skillId
  }

  const completedSkills = skills.filter(skill => skill.completed).length;
  const completionPercentage = total > 0 ? Math.round((completedSkills / total) * 100) : 0;

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-xl font-semibold text-gray-800 mb-4">🔓 Skill Status</h2>
      
      {/* Summary Cards */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-blue-50 p-4 rounded-lg text-center">
          <div className="text-2xl font-bold text-blue-600">{total}</div>
          <div className="text-sm text-blue-800">Total Skills</div>
        </div>
        <div className="bg-green-50 p-4 rounded-lg text-center">
          <div className="text-2xl font-bold text-green-600">{unlockable.length}</div>
          <div className="text-sm text-green-800">Ready to Unlock</div>
        </div>
        <div className="bg-red-50 p-4 rounded-lg text-center">
          <div className="text-2xl font-bold text-red-600">{locked.length}</div>
          <div className="text-sm text-red-800">Locked</div>
        </div>
      </div>

      <div className="mb-6">
        <h3 className="text-lg font-medium text-gray-800 mb-3 flex items-center">
          <span className="text-green-600 mr-2">🔓</span>
          Ready to Unlock ({unlockable.length})
        </h3>
        {unlockable.length === 0 ? (
          <p className="text-gray-500 text-sm italic">No skills ready to unlock</p>
        ) : (
          <div className="space-y-2">
            {unlockable.map(skillId => (
              <div key={skillId} className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg">
                <span className="text-green-800 font-medium">{getSkillName(skillId)}</span>
                <span className="text-green-600 text-sm">Ready!</span>
              </div>
            ))}
          </div>
        )}
      </div>

      <div>
        <h3 className="text-lg font-medium text-gray-800 mb-3 flex items-center">
          <span className="text-red-600 mr-2">🔒</span>
          Locked Skills ({locked.length})
        </h3>
        {locked.length === 0 ? (
          <p className="text-gray-500 text-sm italic">No locked skills</p>
        ) : (
          <div className="space-y-2">
            {locked.map(skillId => (
              <div key={skillId} className="flex items-center justify-between p-3 bg-red-50 border border-red-200 rounded-lg">
                <span className="text-red-800 font-medium">{getSkillName(skillId)}</span>
                <span className="text-red-600 text-sm">Missing Prerequisites</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {total > 0 && (
        <div className="mt-6">
          <div className="flex justify-between text-sm text-gray-600 mb-2">
            <span>Progress</span>
            <span>{completionPercentage}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-gradient-to-r from-green-500 to-blue-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${completionPercentage}%` }}
            ></div>
          </div>
        </div>
      )}

      <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg mt-6">
        <h3 className="font-semibold text-blue-800">Summary</h3>
        <p className="text-sm text-blue-700 mt-2">Total Skills: <span className="font-bold">{total}</span></p>
      </div>
    </div>
  )
}

export default SkillStatus 