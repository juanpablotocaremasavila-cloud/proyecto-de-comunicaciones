// backend/src/routes/goalRoutes.js
const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/goalController');

router.get('/',           ctrl.getAll);
router.get('/:id',        ctrl.getById);
router.post('/',          ctrl.create);
router.put('/:id',        ctrl.update);
router.patch('/:id/save', ctrl.addSaving);
router.delete('/:id',     ctrl.remove);

module.exports = router;
