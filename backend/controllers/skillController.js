const Skill = require('../models/Skill');
const { topologicalSort, hasCycle, getUnlockableSkills, getLockedSkills } = require('../utils/graphAlgorithms');

const getAllSkills = async (req, res) => {
  try {
    const skills = await Skill.find({ user: req.user.id }).populate('prerequisites', 'name');
    
    res.status(200).json({
      success: true,
      count: skills.length,
      data: skills
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

const createSkill = async (req, res) => {
  try {
    const { name, description, level } = req.body;
    
    const skill = await Skill.create({
      user: req.user.id,
      name,
      description: description || '',
      level: level || 'Beginner'
    });
    
    res.status(201).json({
      success: true,
      data: skill
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// Update a skill
const updateSkill = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, completed, level } = req.body;
    
    let skill = await Skill.findById(id);

    if (!skill) {
      return res.status(404).json({ success: false, message: 'Skill not found' });
    }

    // Check if user owns the skill
    if (skill.user.toString() !== req.user.id) {
      return res.status(401).json({ success: false, message: 'Not authorized' });
    }

    skill = await Skill.findByIdAndUpdate(
      id,
      { name, description, completed, level },
      { new: true, runValidators: true }
    ).populate('prerequisites', 'name completed');
    
    res.status(200).json({
      success: true,
      data: skill
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// Delete a skill
const deleteSkill = async (req, res) => {
  try {
    const { id } = req.params;
    
    const skill = await Skill.findById(id);

    if (!skill) {
      return res.status(404).json({ success: false, message: 'Skill not found' });
    }

    // Check if user owns the skill
    if (skill.user.toString() !== req.user.id) {
      return res.status(401).json({ success: false, message: 'Not authorized' });
    }

    // Remove this skill from other skills' prerequisites for the same user
    await Skill.updateMany(
      { user: req.user.id, prerequisites: id },
      { $pull: { prerequisites: id } }
    );
    
    await Skill.findByIdAndDelete(id);
    
    res.status(200).json({
      success: true,
      message: 'Skill deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Add prerequisite to a skill
const addPrerequisite = async (req, res) => {
  try {
    const { id } = req.params;
    const { prerequisiteId } = req.body;
    
    if (id === prerequisiteId) {
      return res.status(400).json({ success: false, message: 'A skill cannot be its own prerequisite' });
    }
    
    const skill = await Skill.findOne({ _id: id, user: req.user.id });
    if (!skill) {
      return res.status(404).json({ success: false, message: 'Skill not found' });
    }
    
    const prerequisite = await Skill.findOne({ _id: prerequisiteId, user: req.user.id });
    if (!prerequisite) {
      return res.status(404).json({ success: false, message: 'Prerequisite skill not found' });
    }
    
    if (skill.prerequisites.includes(prerequisiteId)) {
      return res.status(400).json({ success: false, message: 'Prerequisite already exists' });
    }
    
    const allSkills = await Skill.find({ user: req.user.id }).lean();
    const tempSkill = allSkills.find(s => s._id.toString() === id);
    tempSkill.prerequisites.push(prerequisite._id);
    
    const skillsForCheck = allSkills.map(s => ({
      ...s,
      prerequisites: s.prerequisites.map(p => p.toString())
    }));

    if (hasCycle(skillsForCheck)) {
      return res.status(400).json({ success: false, message: 'Adding this prerequisite would create a cycle.' });
    }
    
    skill.prerequisites.push(prerequisiteId);
    await skill.save();
    
    const updatedSkill = await Skill.findById(id).populate('prerequisites', 'name completed');
    
    res.status(200).json({
      success: true,
      data: updatedSkill
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Remove prerequisite from a skill
const removePrerequisite = async (req, res) => {
  try {
    const { id, pid } = req.params;
    
    const skill = await Skill.findOne({ _id: id, user: req.user.id });
    if (!skill) {
      return res.status(404).json({ success: false, message: 'Skill not found' });
    }
    
    skill.prerequisites = skill.prerequisites.filter(p => p.toString() !== pid);
    await skill.save();
    
    const updatedSkill = await Skill.findById(id).populate('prerequisites', 'name completed');
    
    res.status(200).json({
      success: true,
      data: updatedSkill
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Get topological sort order
const getTopologicalSort = async (req, res) => {
  try {
    const skills = await Skill.find({ user: req.user.id }).populate('prerequisites');
    
    if (skills.length === 0) {
      return res.status(200).json({
        success: true,
        data: []
      });
    }
    
    const sortedIds = topologicalSort(skills);
    
    res.status(200).json({
      success: true,
      data: sortedIds
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// Get unlockable and locked skills
const getSkillStatus = async (req, res) => {
  try {
    const skills = await Skill.find({ user: req.user.id }).populate('prerequisites', 'name completed');
    
    const unlockable = getUnlockableSkills(skills);
    const locked = getLockedSkills(skills);
    
    res.status(200).json({
      success: true,
      data: {
        unlockable,
        locked,
        total: skills.length
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

module.exports = {
  getAllSkills,
  createSkill,
  updateSkill,
  deleteSkill,
  addPrerequisite,
  removePrerequisite,
  getTopologicalSort,
  getSkillStatus
}; 