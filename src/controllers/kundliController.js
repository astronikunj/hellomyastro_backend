'use strict';

const { Kundli, KundaliMatching, Wallet, WalletTransaction, sequelize } = require('../models');
const kundliService = require('../services/kundliService');
const { successResponse, errorResponse } = require('../utils/responseHandler');
const asyncHandler = require('../utils/asyncHandler');
const { KUNDLI_PDF_PRICE, TRANSACTION_TYPES } = require('../utils/constants');
const { Op } = require('sequelize');

/**
 * Add or Update Kundli
 * Handles wallet deduction if it's not the first kundli for the user
 */
const addKundli = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const { kundali, amount, is_match } = req.body;

  if (!Array.isArray(kundali)) {
    return errorResponse(res, 'Kundali must be an array', 400);
  }

  const resultList = [];
  const t = await sequelize.transaction();

  try {
    for (const k of kundali) {
      let kundliRecord;

      if (k.id) {
        // Update existing
        kundliRecord = await Kundli.findByPk(k.id);
        if (kundliRecord) {
          const pdfPath = await kundliService.getKundliPDF({
            lang: k.lang || 'en',
            name: k.name,
            lat: k.latitude,
            lon: k.longitude,
            dob: k.birthDate,
            tob: k.birthTime,
            tz: k.timezone || '5.5',
            pob: k.birthPlace,
            pdf_type: k.pdf_type || 'small'
          });

          await kundliRecord.update({
            name: k.name,
            gender: k.gender,
            birthDate: k.birthDate,
            birthTime: k.birthTime,
            birthPlace: k.birthPlace,
            latitude: k.latitude,
            longitude: k.longitude,
            timezone: k.timezone || '5.5',
            pdf_type: k.pdf_type || 'small',
            match_type: k.match_type || 'north',
            forMatch: k.forMatch || false,
            pdf_link: pdfPath || kundliRecord.pdf_link,
            modifiedBy: userId
          }, { transaction: t });
          
          resultList.push(kundliRecord);
        }
      } else {
        // Create new
        const kundliCount = await Kundli.count({ where: { createdBy: userId } });
        const shouldCharge = !is_match && kundliCount > 0;

        if (shouldCharge) {
          const wallet = await Wallet.findOne({ where: { userId } });
          const requiredAmount = parseFloat(amount || KUNDLI_PDF_PRICE);

          if (!wallet || parseFloat(wallet.balance) < requiredAmount) {
            throw new Error('Insufficient funds in the wallet');
          }

          const balanceBefore = parseFloat(wallet.balance);
          const balanceAfter = balanceBefore - requiredAmount;

          await wallet.update({ 
            balance: balanceAfter,
            totalSpent: parseFloat(wallet.totalSpent) + requiredAmount
          }, { transaction: t });

          await WalletTransaction.create({
            walletId: wallet.id,
            userId,
            type: TRANSACTION_TYPES.DEBIT,
            amount: requiredAmount,
            balanceBefore,
            balanceAfter,
            description: 'Kundli PDF Generation',
            referenceType: 'admin',
            status: 'success'
          }, { transaction: t });
        }

        const pdfPath = await kundliService.getKundliPDF({
          lang: k.lang || 'en',
          name: k.name,
          lat: k.latitude,
          lon: k.longitude,
          dob: k.birthDate,
          tob: k.birthTime,
          tz: k.timezone || '5.5',
          pob: k.birthPlace,
          pdf_type: k.pdf_type || 'small'
        });

        const newKundli = await Kundli.create({
          name: k.name,
          gender: k.gender,
          birthDate: k.birthDate,
          birthTime: k.birthTime,
          birthPlace: k.birthPlace,
          latitude: k.latitude,
          longitude: k.longitude,
          timezone: k.timezone || '5.5',
          pdf_type: k.pdf_type || 'small',
          match_type: k.match_type || 'north',
          forMatch: k.forMatch || false,
          pdf_link: pdfPath || '',
          createdBy: userId,
          modifiedBy: userId
        }, { transaction: t });

        resultList.push(newKundli);
      }
    }

    await t.commit();
    return successResponse(res, 'Kundali processed successfully', { recordList: resultList });
  } catch (error) {
    await t.rollback();
    return errorResponse(res, error.message, 500);
  }
});

/**
 * Get User's Kundalis
 */
const getKundalis = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const { s } = req.query;

  const where = { createdBy: userId, forMatch: false };
  if (s) {
    where.name = { [Op.like]: `%${s}%` };
  }

  const kundalis = await Kundli.findAll({
    where,
    order: [['createdAt', 'DESC']]
  });

  return successResponse(res, 'Kundalis fetched successfully', { recordList: kundalis });
});

/**
 * Get Single Kundali PDF Link
 */
const getKundali = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const kundali = await Kundli.findByPk(id);

  if (!kundali) {
    return errorResponse(res, 'Kundali not found', 404);
  }

  // In Node.js we serve from public folder
  const pdfUrl = `${process.env.APP_URL || ''}/public/${kundali.pdf_link}`;

  return successResponse(res, 'Kundali fetched successfully', { 
    recordList: { status: 200, response: pdfUrl } 
  });
});

/**
 * Update Kundali Info
 */
const updateKundali = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const userId = req.user.id;
  const kundali = await Kundli.findByPk(id);

  if (!kundali) {
    return errorResponse(res, 'Kundali not found', 404);
  }

  await kundali.update({
    ...req.body,
    modifiedBy: userId
  });

  return successResponse(res, 'Kundali updated successfully', { recordList: kundali });
});

/**
 * Delete Kundali
 */
const deleteKundali = asyncHandler(async (req, res) => {
  const { id } = req.body;
  const kundali = await Kundli.findByPk(id);

  if (!kundali) {
    return errorResponse(res, 'Kundali not found', 404);
  }

  await kundali.destroy();
  return successResponse(res, 'Kundali deleted successfully');
});

/**
 * Show Single Kundali
 */
const kundaliShow = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const kundali = await Kundli.findByPk(id);

  if (!kundali) {
    return errorResponse(res, 'Kundali not found', 404);
  }

  return successResponse(res, 'Kundali fetched successfully', { recordList: kundali });
});

/**
 * Get Panchang
 */
const getPanchang = asyncHandler(async (req, res) => {
  const { panchangDate, lat, lon, time, tz, lang } = req.body;
  
  const panchangData = await kundliService.getPanchang(
    panchangDate, 
    lat || '11.2', 
    lon || '77.00', 
    time || '05:20', 
    tz || '5.5', 
    lang || 'en'
  );

  return successResponse(res, 'Panchang fetched successfully', { recordList: panchangData });
});

/**
 * Get Kundali Price
 */
const getKundaliPrice = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const kundaliCount = await Kundli.count({ where: { createdBy: userId } });

  return successResponse(res, 'Kundali price fetched successfully', {
    recordList: KUNDLI_PDF_PRICE,
    isFreeSession: kundaliCount === 0
  });
});

/**
 * Tracking Planet Methods
 */
const removeFromTrackPlanet = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  await Kundli.update(
    { isForTrackPlanet: false },
    { where: { createdBy: userId, isForTrackPlanet: true } }
  );
  return successResponse(res, 'Removed Kundali from Track Planet successfully');
});

const addForTrackPlanet = asyncHandler(async (req, res) => {
  const { id } = req.body;
  await Kundli.update(
    { isForTrackPlanet: true },
    { where: { id } }
  );
  return successResponse(res, 'Added Kundali to Track Planet successfully');
});

const getForTrackPlanet = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const trackPlanetKundalis = await Kundli.findAll({
    where: { createdBy: userId, isForTrackPlanet: true }
  });
  return successResponse(res, 'Track Planet Kundalis fetched successfully', { recordList: trackPlanetKundalis });
});

/**
 * Add Kundali Matching (Boy and Girl details)
 */
const addKundaliMatching = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const {
    boyName, boyBirthDate, boyBirthTime, boyBirthPlace,
    girlName, girlBirthDate, girlBirthTime, girlBirthPlace
  } = req.body;

  const matching = await KundaliMatching.create({
    boyName, boyBirthDate, boyBirthTime, boyBirthPlace,
    girlName, girlBirthDate, girlBirthTime, girlBirthPlace,
    createdBy: userId,
    modifiedBy: userId
  });

  return successResponse(res, 'Boys and girls details added successfully', { recordList: matching });
});

/**
 * Get Matching Report
 */
const getMatchReport = asyncHandler(async (req, res) => {
  const { male_kundli_id, female_kundli_id } = req.body;

  const maleRcd = await Kundli.findByPk(male_kundli_id);
  const femaleRcd = await Kundli.findByPk(female_kundli_id);

  if (!maleRcd || !femaleRcd) {
    return errorResponse(res, 'Male or Female Kundli not found', 404);
  }

  const commonParams = (rcd) => ({
    dob: rcd.birthDate.split('-').reverse().join('/'), // YYYY-MM-DD to DD/MM/YYYY
    tob: rcd.birthTime,
    tz: rcd.timezone || '5.5',
    lat: rcd.latitude,
    lon: rcd.longitude,
    lang: 'en'
  });

  const [maleMangalik, femaleMangalik] = await Promise.all([
    kundliService.getManglikDosha(commonParams(maleRcd)),
    kundliService.getManglikDosha(commonParams(femaleRcd))
  ]);

  const matchingParams = {
    boy_dob: maleRcd.birthDate.split('-').reverse().join('/'),
    boy_tob: maleRcd.birthTime,
    boy_tz: maleRcd.timezone || '5.5',
    boy_lat: maleRcd.latitude,
    boy_lon: maleRcd.longitude,
    girl_dob: femaleRcd.birthDate.split('-').reverse().join('/'),
    girl_tob: femaleRcd.birthTime,
    girl_tz: femaleRcd.timezone || '5.5',
    girl_lat: femaleRcd.latitude,
    girl_lon: femaleRcd.longitude,
    lang: 'en'
  };

  let matchingReport;
  if (femaleRcd.match_type?.toLowerCase() === 'north') {
    matchingReport = await kundliService.getAshtakootMatching(matchingParams);
  } else {
    matchingReport = await kundliService.getDashakootMatching(matchingParams);
  }

  return successResponse(res, 'Matching report fetched successfully', {
    recordList: matchingReport,
    girlMangalikRpt: femaleMangalik,
    boyManaglikRpt: maleMangalik
  });
});

module.exports = {
  addKundli,
  getKundalis,
  getKundali,
  updateKundali,
  deleteKundali,
  kundaliShow,
  getPanchang,
  getKundaliPrice,
  removeFromTrackPlanet,
  addForTrackPlanet,
  getForTrackPlanet,
  addKundaliMatching,
  getMatchReport
};
