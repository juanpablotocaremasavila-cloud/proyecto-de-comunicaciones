// backend/src/routes/alertRoutes.js
const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/alertController');

router.get('/',         ctrl.getAll);
router.get('/:id',      ctrl.getById);
router.post('/',        ctrl.create);
router.put('/:id',      ctrl.update);
router.patch('/:id/pay', ctrl.markPaid);
router.delete('/:id',   ctrl.remove);

module.exports = router;
