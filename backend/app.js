// Importation des fichiers et package nécessaires
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const app = express();
const path = require('path');

// Définition du dossier images comme statique
app.use('/images', express.static(path.join(__dirname, 'images')));

// Importation des routes Utilisateurs et Sauce
const userRoutes = require('./routes/user');
const sauceRoutes = require('./routes/sauce');

// Utilisation d'express afin de pouvoir lire les rêquetes
app.use(express.json());

//Connection à la base de donnée MongoDB via Mongoose
mongoose.connect('mongodb+srv://FRSK:C52ArFE3gGiAe3O7@cluster0.ryjzl0m.mongodb.net/?retryWrites=true&w=majority', {useNewUrlParser: true, useUnifiedTopology: true})
  .then(() => console.log('Connexion à MongoDB réussie !'))
  .catch(() => console.log('Connexion à MongoDB échouée !'));

//Définition des headers CORS
app.use(cors());
// app.use((req, res, next) => {
//     res.setHeader('Access-Control-Allow-Origin', '*');
//     res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content, Accept, Content-Type, Authorization');
//     res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
//     next();
// });

// Utilisation des routes api pour l'authentification uutilisateur et les sauces
app.use('/api/auth', userRoutes);
app.use('/api/sauces', sauceRoutes);

module.exports = app;