// backend/src/routes/summaryRoutes.js
const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/summaryController');

router.get('/',        ctrl.getSummary);
router.get('/monthly', ctrl.getMonthly);

module.exports = router;
