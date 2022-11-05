// Importation du package JSONWebToken
const jwt = require('jsonwebtoken');

/*  Récupération du bearer token contenu dans le header > authorization et split afin de récupérer uniquement le token sans le "bearer ".
    Décodage du token et verification de la validité avec JWT verify()
    Récupération de l'userId associé au token
    Ajout de l'userId dans la requete avec la clée auth
    Si erreur, retourne l'erreur 401 Unauthorized */
module.exports = (req, res, next) => {
   try {
       const token = req.headers.authorization.split(' ')[1];
       const decodedToken = jwt.verify(token, 'RANDOM_TOKEN_SECRET');
       const userId = decodedToken.userId;
       req.auth = {
           userId: userId
       };
	next();
   } catch(error) {
       res.status(401).json({ error });
   }
};