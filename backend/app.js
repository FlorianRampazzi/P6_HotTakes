const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const app = express();
const path = require('path');

app.use('/images', express.static(path.join(__dirname, 'images')));

const userRoutes = require('./routes/user');
const sauceRoutes = require('./routes/sauce');

app.use(express.json());
//mongodb+srv://FRSK:<password>@cluster0.ryjzl0m.mongodb.net/?retryWrites=true&w=majority
mongoose.connect('mongodb+srv://FRSK:C52ArFE3gGiAe3O7@cluster0.ryjzl0m.mongodb.net/?retryWrites=true&w=majority', {useNewUrlParser: true, useUnifiedTopology: true})
  .then(() => console.log('Connexion à MongoDB réussie !'))
  .catch(() => console.log('Connexion à MongoDB échouée !'));

// app.use((req, res, next) => {
//     res.setHeader('Access-Control-Allow-Origin', '*');
//     res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content, Accept, Content-Type, Authorization');
//     res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
//     next();
// });
app.use(cors());

app.use('/api/auth', userRoutes);
app.use('/api/sauces', sauceRoutes);

module.exports = app;