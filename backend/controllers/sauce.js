const Sauce = require('../models/sauce');
const fs = require('fs');

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

exports.displayOneSauce = (req, res, next) => {
    Sauce.findOne({_id: req.params.id})
        .then(sauce => res.status(200).json(sauce))
        .catch(error => res.status(404).json({error}));
};

exports.modifiyOneSauce = (req, res, next) => {
    const sauceObject = req.file ? {
        ...JSON.parse(req.body.sauce),
        imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`
    } : { ...req.body };
  
    delete sauceObject._userId;
    Sauce.findOne({_id: req.params.id})
        .then((sauce) => {
            if (sauce.userId != req.auth.userId) {
                res.status(401).json({message: 'Non-autorisé'});
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

exports.deleteOneSauce = (req, res, next) => {
    Sauce.findOne({_id: req.params.id})
        .then(sauce =>  {
            if (sauce.userId != req.auth.userId) {
                res.status(401).json({message: 'Non-autorisé'});
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

exports.displaySauces = (req, res, next) => {
    //Récupérer les sauces depuis la base de donnée Mangodb
    Sauce.find()
        .then( sauces => res.status(200).json(sauces))
        .catch( error => res.status(400).json({error}));
};

exports.likedSauce = (req, res, next) => {
    Sauce.findOne({_id: req.params.id})
        .then((like) => {
            switch (req.body.like) {
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


            // if (like.usersLiked.includes(req.body.userId) && req.body.like === -1) {
            //     Sauce.updateOne({_id: req.params.id}, {$inc: {likes: -1, dislikes: 1}, $push: {usersDisliked: req.body.userId}, $pull: {usersLiked: req.body.userId}})
            //         .then(() => res.status(201).json({message: 'Like changé en dislike'}))
            //         .catch(error => res.status(400).json({error}));

            // } else if (like.usersDisliked.includes(req.body.userId) && req.body.like === 1) {
            //     Sauce.updateOne({_id: req.params.id}, {$inc: {dislikes: -1, likes: 1 }, $push: {usersLiked: req.body.userId}, $pull: {usersDisliked: req.body.userId}})
            //         .then(() => res.status(201).json({message: 'Dislike changé en like'}))
            //         .catch(error => res.status(400).json({error}));

            // } else if (!like.usersLiked.includes(req.body.userId) && req.body.like === 1) {
            //     Sauce.updateOne({_id: req.params.id}, {$inc: {likes: 1 }, $push: {usersLiked: req.body.userId}})
            //         .then(() => res.status(201).json({message: 'Like ajouté'}))
            //         .catch(error => res.status(400).json({error}));

            // } else if(like.usersLiked.includes(req.body.userId) && req.body.like === 0){
            //     Sauce.updateOne({_id: req.params.id}, {$inc: {likes: -1 }, $pull: {usersLiked: req.body.userId}})
            //         .then(() => res.status(201).json({message: 'Like retiré'}))
            //         .catch(error => res.status(400).json({error}));

            // }  else if (!like.usersDisliked.includes(req.body.userId) && req.body.like === -1) {
            //     Sauce.updateOne({_id: req.params.id}, {$inc: {dislikes: 1 }, $push: {usersDisliked: req.body.userId}})
            //         .then(() => res.status(201).json({message: 'Dislike ajouté'}))
            //         .catch(error => res.status(400).json({error}));

            // } else if (like.usersDisliked.includes(req.body.userId) && req.body.like === 0) {
            //     Sauce.updateOne({_id: req.params.id}, {$inc: {dislikes: -1 }, $pull: {usersDisliked: req.body.userId}})
            //         .then(() => res.status(201).json({message: 'Dislike retiré'}))
            //         .catch(error => res.status(400).json({error}));
            // }
        })
        .catch(error => res.status(404).json({error}));
};