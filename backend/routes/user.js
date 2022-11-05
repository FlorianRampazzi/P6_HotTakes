// Importation du package Express et de son Router
const express = require('express');
const router = express.Router();

// Importation du controller User
const userCtrl = require('../controllers/user');

// Routes utilisateurs
router.post('/signup',  userCtrl.signUp);
router.post('/login', userCtrl.login);

module.exports = router;