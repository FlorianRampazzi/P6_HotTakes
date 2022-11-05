// Importation du plugin multer
const multer = require('multer');

// Définition des 3 types d'extensions attendus
const MIME_TYPES = {
  'image/jpg': 'jpg',
  'image/jpeg': 'jpg',
  'image/png': 'png'
};

/*  Initialisation d'un storage multer
    ajout de la clé  destination et vérification de la présence du dossier images
    ajout de la clé filename et récupération du nom du fichier
    remplacement des espaces par des underscores et suppression de l'extension présente dans le nom du fichier
    récupération du type d'extension du fichier.
    Renommage du fichier avec le nom corrigé, ajout d'un timestamp et de l'extension*/
const storage = multer.diskStorage({
  destination: (req, file, callback) => {
    callback(null, 'images');
  },
  
  filename: (req, file, callback) => {
    const name = file.originalname.split(' ').join('_').split('.')[0];
    const extension = MIME_TYPES[file.mimetype];
    callback(null, name + Date.now() + '.' + extension);
  }
});

// Exportation du storage pour une seule image
module.exports = multer({storage}).single('image');