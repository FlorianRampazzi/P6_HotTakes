const express = require('express');
const auth = require('../middleware/auth');
const router = express.Router();
const multer = require('../middleware/multer-config');

const sauceCtrl = require('../controllers/sauce');

router.get('/', auth, sauceCtrl.displaySauces);
router.post('/', auth, multer, sauceCtrl.createSauce);
router.get('/:id', auth, sauceCtrl.displayOneSauce);
router.put('/:id', auth, multer, sauceCtrl.modifiyOneSauce);
router.delete('/:id', auth, sauceCtrl.deleteOneSauce);
router.post('/:id/like', auth, sauceCtrl.likedSauce);

module.exports = router;