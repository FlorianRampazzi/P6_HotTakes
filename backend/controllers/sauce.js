// Importation du model Sauce et du package FS
const Sauce = require('../models/sauce');
const fs = require('fs');

/*  Création de la fonction createSauce pour l'ajout d'une sauce.
    Récupération de l'objet sauce.
    Suppression de l'_id et de l'userId générés.
    Création d'une nouvelle sauce depuis le modèle Sauce.
    Ajout des valeurs contenue dans l'objet sauce de la requête.
    Ajout de l'userId d'authentification et du lien imageUrl généré automatiquement.
    Ajout de la nouvelle sauce à la base donnée. */
exports.createSauce = (req, res, next) => {
    const sauceObject = JSON.parse(req.body.sauce);
    delete sauceObject._id;
    delete sauceObject._userId;
    const sauce = new Sauce({
        ...sauceObject,
        userId: req.auth.userId,
        imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`
    });
    
    sauce.save()
        .then(() => res.status(201).json({message: 'Nouvelle sauce enregistrée'}))
        .catch(error => res.status(400).json({error}))
};

/*  Création de la fonction displayOneSauce pour l'affichage d'une seule sauce.
    Récupération dans la base de donnée de la sauce avec le même id correspondant à l'id contenu dans l'url.
    Affichage de la sauce correspondante */
exports.displayOneSauce = (req, res, next) => {
    Sauce.findOne({_id: req.params.id})
        .then(sauce => res.status(200).json(sauce))
        .catch(error => res.status(404).json({error}));
};

/*  Création de la fonction modifyOneSauce pour la modification des information d'une sauce.
    S'il y a une modification de l'image, on applique les valeurs de l'objet sauce contenues dans la requête ET on regénère le lien de la nouvelle image.
    Si l'image n'est pas modifiée, on ajoute juste les informations contenues dans la requete.
    Suppression de l'_userId généré.
    Recherche de la sauce correspondant dans la bdd.
    Si l'userId de la sauce ne correspond pas à l'userId de l'authentification, alors l'utilasateur n'est pas le créateur de la sauce et n'as pas le droit de la modifiée.
        Sinon mettre a jour la sauce et y ajoutant les informations contenues dans l'objet de la requête et rajout de l'_id.*/
exports.modifiyOneSauce = (req, res, next) => {
    const sauceObject = req.file ? {
        ...JSON.parse(req.body.sauce),
        imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`
    } : { ...req.body };
  
    delete sauceObject._userId;
    Sauce.findOne({_id: req.params.id})
        .then((sauce) => {
            if (sauce.userId != req.auth.userId) {
                res.status(403).json({message: 'Non-autorisé'});
            } else {
                Sauce.updateOne({ _id: req.params.id}, { ...sauceObject, _id: req.params.id})
                    .then(() => res.status(200).json({message: 'Sauce modifiée !'}))
                    .catch(error => res.status(401).json({ error }));
            }
        })
        .catch((error) => {
            res.status(400).json({ error });
        });
};

/*  Création de la fonction deleteOneSauce pour la suppression d'une sauce.
    Recherche de la sauce correspondant dans la bdd.
    Si l'userId de la sauce ne correspond pas à l'userId de l'authentification, alors l'utilasateur n'est pas le créateur de la sauce et n'as pas le droit de la modifiée.
        Sinon récupérer l'imageUrl, et couper l'url afin de récupérer uniquement le nom de fichier.
        Supprimé l'image du dossier images grace au package fs.unlink avec le nom récupéré grace au package fs et la fonction unlink().
        Supprimé de la bdd la sauce avec l'id correspondant.*/
exports.deleteOneSauce = (req, res, next) => {
    Sauce.findOne({_id: req.params.id})
        .then(sauce =>  {
            if (sauce.userId != req.auth.userId) {
                res.status(403).json({message: 'Non-autorisé'});
            } else {
                const filename = sauce.imageUrl.split('/images/')[1];
                fs.unlink(`./images/${filename}`, () => {
                Sauce.deleteOne({_id: req.params.id})
                    .then(() => {res.status(200).json({message: 'Sauce supprimée'})})
                    .catch(error => res.status(400).json({error}));
                });
            }
        })
        .catch(error => res.status(500).json({error}));
};

/*  Création de la fonction displayAllSauces pour l'affichage de toutes les sauces présentes dans la bdd.
    Récupérer toute les sauce présentes dans la bdd et les affichées.*/
exports.displayAllSauces = (req, res, next) => {
    Sauce.find()
        .then( sauces => res.status(200).json(sauces))
        .catch( error => res.status(400).json({error}));
};

/*  Création de la fonction likedSauce pour l'ajout d'un like ou d'un dislike sur une sauce.
    Recherche de la sauce correspondante à l'id de la requête.
    3 cas possibles :
        - L'utilisateur like une sauce, like = 1.
        - L'utilisateur annule son like ou son dislike, like = 0.
        - l'utilisateur dislike une sauce, like = -1.*/
exports.likedSauce = (req, res, next) => {
    Sauce.findOne({_id: req.params.id})
        .then((like) => {
            switch (req.body.like) {
                /*  Premier cas : Like = 1.
                    Si l'userId est déjà présent dans le tableau des dislikes : 
                        On désincrémente le compteur dislikes, on incrémente le compteur likes, on enlève l'userId du tableau usersDisliked et on l'ajoute au tableau usersLiked.
                    Sinon :
                        On incrémente le compteur de like et on ajoute l'userId au tableau usersLiked.*/
                case 1 :
                    if (like.usersDisliked.includes(req.body.userId)) {
                        Sauce.updateOne({_id: req.params.id}, {$inc: {dislikes: -1, likes: 1 }, $pull: {usersDisliked: req.body.userId}, $push: {usersLiked: req.body.userId}})
                            .then(() => res.status(201).json({message: 'Dislike changé en like'}))
                            .catch(error => res.status(400).json({error}));

                    } else {
                        Sauce.updateOne({_id: req.params.id}, {$inc: {likes: 1 }, $push: {usersLiked: req.body.userId}})
                            .then(() => res.status(201).json({message: 'Like ajouté'}))
                            .catch(error => res.status(400).json({error}));
                    }
                    break;

                /*  Second cas : Like = 0.
                    Si l'userId est déjà présent dans le tableau usersLiked : 
                        On désincrémente le compteur likes et on retire l'userId du tableau usersLiked.
                    Sinon Si l'userId est déjà présent dans le tableau usersDisliked :
                        On désincrémente le compteur dislikes et on retire l'userId du tableau usersDisliked.*/
                case 0 :
                    if(like.usersLiked.includes(req.body.userId)){
                        Sauce.updateOne({_id: req.params.id}, {$inc: {likes: -1 }, $pull: {usersLiked: req.body.userId}})
                            .then(() => res.status(201).json({message: 'Like retiré'}))
                            .catch(error => res.status(400).json({error}));

                    } else if (like.usersDisliked.includes(req.body.userId)){
                        Sauce.updateOne({_id: req.params.id}, {$inc: {dislikes: -1 }, $pull: {usersDisliked: req.body.userId}})
                            .then(() => res.status(201).json({message: 'Dislike retiré'}))
                            .catch(error => res.status(400).json({error}));
                    }
                    break;

                 /* Troisème cas : Like = -1.
                     Si l'userId est déjà présent dans le tableau usersLiked : 
                        On décrémente le compteur likes, on incrémente le compteur dislikes, on enlève l'userId du tableau usersLiked et on l'ajoute au tableau usersDisliked.
                    Sinon :
                        On incrémente le compteur de dislikes et on ajoute l'userId au tableau usersDisliked.*/
                case -1 :
                    if (like.usersLiked.includes(req.body.userId)) {
                        Sauce.updateOne({_id: req.params.id}, {$inc: {likes: -1, dislikes: 1}, $pull: {usersLiked: req.body.userId}, $push: {usersDisliked: req.body.userId}})
                            .then(() => res.status(201).json({message: 'Like changé en dislike'}))
                            .catch(error => res.status(400).json({error}));
                    } else {
                        Sauce.updateOne({_id: req.params.id}, {$inc: {dislikes: 1 }, $push: {usersDisliked: req.body.userId}})
                            .then(() => res.status(201).json({message: 'Dislike ajouté'}))
                            .catch(error => res.status(400).json({error}));
                    }
                    break;
            }
        })
        .catch(error => res.status(404).json({error}));
};