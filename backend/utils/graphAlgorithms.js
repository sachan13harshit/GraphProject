/**
 * Topological Sort using Kahn's Algorithm
 * Returns a valid learning order for skills
 */
const topologicalSort = (skills) => {
  const inDegree = new Map();
  const adj = new Map();
  const sortedOrder = [];
  const queue = [];

  // Initialize adjacency list and in-degree map
  skills.forEach(skill => {
    adj.set(skill._id.toString(), []);
    inDegree.set(skill._id.toString(), 0);
  });

  // Build adjacency list and calculate in-degrees
  skills.forEach(skill => {
    skill.prerequisites.forEach(prereq => {
      const prereqId = prereq._id.toString();
      const skillId = skill._id.toString();
      adj.get(prereqId).push(skillId);
      inDegree.set(skillId, inDegree.get(skillId) + 1);
    });
  });

  // Initialize queue with nodes having in-degree of 0
  inDegree.forEach((degree, skillId) => {
    if (degree === 0) {
      queue.push(skillId);
    }
  });

  // Process queue
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

  // Check for cycles
  if (sortedOrder.length !== skills.length) {
    throw new Error('A cycle was detected in the skill graph.');
  }

  return sortedOrder;
};

/**
 * Detect cycles in the skill graph using DFS
 */
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

/**
 * Get skills that are ready to unlock (all prerequisites completed)
 */
function getUnlockableSkills(skills) {
  const unlockable = [];
  
  skills.forEach(skill => {
    if (skill.completed) return; // Skip already completed skills
    
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

/**
 * Get skills that are locked (missing prerequisites)
 */
function getLockedSkills(skills) {
  const locked = [];
  
  skills.forEach(skill => {
    if (skill.completed) return; // Skip completed skills
    
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