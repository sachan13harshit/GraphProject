
const topologicalSort = (skills) => {
  const inDegree = new Map();
  const adj = new Map();
  const sortedOrder = [];
  const queue = [];

  skills.forEach(skill => {
    adj.set(skill._id.toString(), []);
    inDegree.set(skill._id.toString(), 0);
  });

  skills.forEach(skill => {
    skill.prerequisites.forEach(prereq => {
      const prereqId = prereq._id.toString();
      const skillId = skill._id.toString();
      adj.get(prereqId).push(skillId);
      inDegree.set(skillId, inDegree.get(skillId) + 1);
    });
  });

  inDegree.forEach((degree, skillId) => {
    if (degree === 0) {
      queue.push(skillId);
    }
  });

  while (queue.length > 0) {
    const skillId = queue.shift();
    sortedOrder.push(skillId);

    adj.get(skillId).forEach(neighborId => {
      inDegree.set(neighborId, inDegree.get(neighborId) - 1);
      if (inDegree.get(neighborId) === 0) {
        queue.push(neighborId);
      }
    });
  }

  if (sortedOrder.length !== skills.length) {
    throw new Error('A cycle was detected in the skill graph.');
  }

  return sortedOrder;
};

function hasCycle(skills) {
  const visited = new Set();
  const recStack = new Set();
  const graph = new Map(skills.map(s => [s._id.toString(), s.prerequisites]));

  function dfs(skillId) {
    if (recStack.has(skillId)) return true;
    if (visited.has(skillId)) return false;
    
    visited.add(skillId);
    recStack.add(skillId);
    
    const prerequisites = graph.get(skillId) || [];
    for (const prereqId of prerequisites) {
      if (dfs(prereqId.toString())) {
        return true;
      }
    }
    
    recStack.delete(skillId);
    return false;
  }
  
  for (const skill of skills) {
    if (!visited.has(skill._id.toString())) {
      if (dfs(skill._id.toString())) {
        return true;
      }
    }
  }
  
  return false;
}


function getUnlockableSkills(skills) {
  const unlockable = [];
  
  skills.forEach(skill => {
    if (skill.completed) return; 
    
    const allPrereqsCompleted = skill.prerequisites.every(prereqId => {
      const prereq = skills.find(s => s._id.toString() === prereqId.toString());
      return prereq && prereq.completed;
    });
    
    if (allPrereqsCompleted) {
      unlockable.push(skill._id.toString());
    }
  });
  
  return unlockable;
}

function getLockedSkills(skills) {
  const locked = [];
  
  skills.forEach(skill => {
    if (skill.completed) return; 
    
    const hasIncompletePrereqs = skill.prerequisites.some(prereqId => {
      const prereq = skills.find(s => s._id.toString() === prereqId.toString());
      return !prereq || !prereq.completed;
    });
    
    if (hasIncompletePrereqs) {
      locked.push(skill._id.toString());
    }
  });
  
  return locked;
}

module.exports = {
  topologicalSort,
  hasCycle,
  getUnlockableSkills,
  getLockedSkills
}; 