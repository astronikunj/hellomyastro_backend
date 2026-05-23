'use strict';

const { Ticket, User, HelpSupport, sequelize } = require('../models');
const { successResponse, errorResponse } = require('../utils/responseHandler');
const asyncHandler = require('../utils/asyncHandler');
const { Op } = require('sequelize');

/**
 * Add New Ticket
 */
const addTicket = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const { helpSupportId, subject, description, chatWithus } = req.body;

  const ticketNumber = `TKT-${Date.now()}`;

  const ticket = await Ticket.create({
    helpSupportId,
    subject,
    description,
    ticketNumber,
    userId,
    createdBy: userId,
    modifiedBy: userId,
    ticketStatus: 'Open'
  });

  return successResponse(res, 'Ticket created successfully', { recordList: ticket });
});

/**
 * Get User Tickets
 */
const getTicket = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  
  const tickets = await Ticket.findAll({
    where: { userId },
    include: [{ model: HelpSupport, as: 'supportCategory', attributes: ['name'] }],
    order: [['createdAt', 'DESC']]
  });

  return successResponse(res, 'Tickets fetched successfully', { recordList: tickets });
});

module.exports = {
  addTicket,
  getTicket
};
