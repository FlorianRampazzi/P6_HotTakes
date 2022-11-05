// Importation du package mongoose et du plugin uniqueValidator
const mongoose = require('mongoose');
const uniqueValidator = require('mongoose-unique-validator');

// Création d'un schema utilisateur mongoose pour la base de donnée
const userSchema = mongoose.Schema({
       email: {type: String, required: true, unique: true},
       password: {type: String, required: true},
});

// Utilisation du plugin UniqueValidator afin de rentre chaque utilisateur unique par son email
userSchema.plugin(uniqueValidator);

// Exportation du model User
module.exports = mongoose.model('User', userSchema);