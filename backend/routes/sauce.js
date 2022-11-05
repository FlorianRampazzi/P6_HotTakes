// Importation des middlewares et du package Express et de son router.
const express = require('express');
const auth = require('../middleware/auth');
const multer = require('../middleware/multer-config');
const router = express.Router();

// Importation du controller Sauce
const sauceCtrl = require('../controllers/sauce');

//Routes API pour le CRUD + route pour le like
router.get('/', auth, sauceCtrl.displayAllSauces);
router.post('/', auth, multer, sauceCtrl.createSauce);
router.get('/:id', auth, sauceCtrl.displayOneSauce);
router.put('/:id', auth, multer, sauceCtrl.modifiyOneSauce);
router.delete('/:id', auth, sauceCtrl.deleteOneSauce);
router.post('/:id/like', auth, sauceCtrl.likedSauce);

module.exports = router;