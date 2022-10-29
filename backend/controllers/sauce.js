const Sauce = require('../models/Sauce');

exports.createSauce = (req, res, next) => {
    const sauceObject = JSON.parse(req.body.sauce);
    delete sauceObject._id;
    delete sauceObject.userId;
    const sauce = new Sauce({
        ...sauceObject,
        userId: req.auth.userId,
        imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`
    });

    sauce.save()
        .then(() => res.status(201).json({message: 'Nouvelle sauce enregistrée'}))
        .catch(error => res.status(400).json({error}))

    // delete req.body.id;
    // const sauce = new Sauce({
    //     ...req.body
    // });
    // sauce.save()
    //     .then(() => req.status(201).json({ message : 'Sauce enregistrée !'}))
    //     .catch( error => res.status(400).json({error}));
    // next();
};

exports.displaySauces = (req, res, next) => {
    //Récupérer les sauces depuis la base de donnée Mangodb
    Sauce.find()
        .then( sauces => req.status(200).json(sauces))
        .catch( error => res.status(400).json({error}));
};

exports.displayOneSauce = (req, res, next) => {
    const sauceObject = req.file ? {
        ...JSON.parse(req.body.sauce),
        imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`
    } : { ...req.body };
    
    delete sauceObject.userId;

    Sauce.findOne({_id:req.params.id})
        .then(thing => {
            if (thing.userId != req.auth.userId) {
                res.status(401).json({message: 'Non-autorisé'});
            } else {
                Sauce.updateOne({_id: req.params.id}, {...thingObject, _id: req.params.id})
                    .then(() => res.status(200).json({message: 'Sauce modifiée'}))
                    .catch( error => res.status(400).json({error}));
            }
        })
        .catch((error) => res.status(400).json({error}))
};

exports.modifiyOneSauce = (req, res, next) => {
    Sauce.updateOne({_id: req.params.id}, {...req.body, _id: req.params.id})
        .then(() => req.status(200).json({message: "Sauce modifiéé"}))
        .catch(error => res.status(400).json({error}));
};

exports.deleteOneSauce = (req, res, next) => {
    Sauce.deleteOne({_id: req.params.id})
        .then(() => req.status(200).json({message: "Sauce supprimée"}))
        .catch(error => res.status(400).json({error}));
};

exports.likedSauce = (req, res, next) => {
    Sauce.findOne({_id: req.params.id})
        .then(sauce => req.status(200).json(sauce))
        .catch(error => res.status(404).json({error}));
};