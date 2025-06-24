const express = require('express');
const router = express.Router();
const {
  getAllSkills,
  createSkill,
  updateSkill,
  deleteSkill,
  addPrerequisite,
  removePrerequisite,
  getTopologicalSort,
  getSkillStatus
} = require('../controllers/skillController');
const { protect } = require('../middleware/auth');

router.use(protect);

router.route('/')
  .get(getAllSkills)
  .post(createSkill);

router.route('/status').get(getSkillStatus);
router.route('/topo-sort').get(getTopologicalSort);

router.route('/:id')
  .put(updateSkill)
  .delete(deleteSkill);

router.route('/:id/add-prerequisite').post(addPrerequisite);
router.route('/:id/prerequisites/:pid').delete(removePrerequisite);

module.exports = router; 