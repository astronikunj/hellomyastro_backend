'use strict';

const asyncHandler = require('../utils/asyncHandler');
const { successResponse, createdResponse, errorResponse } = require('../utils/responseHandler');
const { Skill } = require('../models');

/**
 * @route GET /api/skills
 * @desc Get all active skills
 */
const getSkills = asyncHandler(async (req, res) => {
  const skills = await Skill.findAll({
    where: { isActive: true },
    order: [['displayOrder', 'ASC'], ['name', 'ASC']]
  });
  return successResponse(res, 'Skills fetched', skills);
});

/**
 * @route POST /api/admin/skills
 * @desc Create a new skill (Admin)
 */
const createSkill = asyncHandler(async (req, res) => {
  const { name, displayOrder } = req.body;
  if (!name) return errorResponse(res, 'Skill name is required', 400);

  const skill = await Skill.create({
    name,
    displayOrder: displayOrder || 0,
    createdBy: req.user.id
  });
  return createdResponse(res, 'Skill created', skill);
});

/**
 * @route PUT /api/admin/skills/:id
 * @desc Update a skill (Admin)
 */
const updateSkill = asyncHandler(async (req, res) => {
  const skill = await Skill.findByPk(req.params.id);
  if (!skill) return errorResponse(res, 'Skill not found', 404);

  await skill.update({
    ...req.body,
    modifiedBy: req.user.id
  });
  return successResponse(res, 'Skill updated', skill);
});

/**
 * @route DELETE /api/admin/skills/:id
 * @desc Delete a skill (Admin)
 */
const deleteSkill = asyncHandler(async (req, res) => {
  const skill = await Skill.findByPk(req.params.id);
  if (!skill) return errorResponse(res, 'Skill not found', 404);

  await skill.destroy();
  return successResponse(res, 'Skill deleted');
});

module.exports = {
  getSkills,
  createSkill,
  updateSkill,
  deleteSkill
};
