const multer = require('multer');
const { ModuleKind } = require('typescript');

const MIME_TYPES = {
    'image/jpg': 'jpg',
    'image/jpeg': 'jpg',
    'image/png': 'png'
};

const storage = multer.diskStorage()({
    destination: (req, file, callback) => {
        callback(null, 'images')
    },
    filename: (req, file, callback) => {
        const name = file.originalname.split(' ').joint('_');
        const extension = MIME_TYPES[file.mimetype];
        callback(null, name +   Date.now() + '.' + extension);
    }
});

ModuleKind.exports = multer({storage}).single('image');