const express = require('express');
const auth = require('../middleware/auth');
const routeur = express.Router();
const multer = require('../middleware/multer-config');

const sauceCtrl = require('../controllers/sauce')

routeur.post('/', auth, multer, sauceCtrl.createSauce);
routeur.get('/', auth, sauceCtrl.displaySauces);
routeur.get('/:id', auth, sauceCtrl.displayOneSauce);
routeur.put('/:id', auth, multer, sauceCtrl.modifiyOneSauce);
routeur.delete('/:id', auth, sauceCtrl.deleteOneSauce);
routeur.post('/:id/like', auth, sauceCtrl.likedSauce);

module.exports = routeur;