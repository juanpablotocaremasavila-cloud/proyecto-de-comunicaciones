// backend/src/routes/categoryRoutes.js
const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/categoryController');

router.get('/',      ctrl.getAll);
router.get('/:type', ctrl.getByType);

module.exports = router;
