// Importation du modèle User et des plugins bcrypt et JSONWebToken
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/user');

/*  Création de la fonction SignUp pour l'inscription.
    Récupération du mot de passe et encryptage de celui-ci avec bcrypt.
    création d'un nouvel utilisateur depuis le modèle User.
    Récupération de la requêtes avec le mot de passe crypté et le mail et ajout dans le nouvel utilisateur créé.
    Ajout du nouvel utilisateur à la base donnée. */
exports.signUp = (req, res, next) => {
    bcrypt.hash(req.body.password, 10)
        .then(hash => {
            const user = new User({
                email: req.body.email,
                password: hash
            });
            user.save()
                .then(() => res.status(201).json({message : 'Nouvel utilisateur enregistré !'}))
                .catch( error => res.status(400).json({error}));
        })
        .catch( error => res.status(500).json({error}));
};
 /* Création de la fonction Login pour la connexion.
    Recherche dans la base de donnée d'un utilisateur correspondant au mail de la requête.
    Si aucun utilisateur correspondant, retourne une erreur 401 Unauthorized et un message d'erreur.
    Sinon, compare le mot de passe dans la bdd avec celui de la requête.
        Si le mot de passe de correspond pas, retourne une erreur 401 Unauthorized et un message d'erreur.
        Sinon ajout de l'_id de la requête en userId
            Création d'un token aléatoire secret depuis l'userId, avec une durée de vie de 24h.
    Sinon renvoi une erreur server 500 Internal error*/
exports.login = (req, res, next) => {
    User.findOne({email: req.body.email})
        .then(user => {
            if (user === null) {
                res.status(401).json({message: 'Identifiant et/ou mot de passe incorrect'})
            } else {
                bcrypt.compare(req.body.password, user.password)
                    .then(valid => {
                        if (!valid) {
                            res.status(401).json({message : 'Identifiant et/ou mot de passe incorrect'});
                        } else {
                            res.status(200).json({
                                userId: user._id,
                                token: jwt.sign(
                                    {userId: user._id},
                                    'RANDOM_TOKEN_SECRET',
                                    {expiresIn: '24h'}
                                )
                            })
                        }
                    })
                    .catch( error => res.status(404).json({error}));
            }
        })
        .catch( error => res.status(500).json({error}));
};