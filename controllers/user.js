// Importation des modules nécessaires : bcrypt pour le hashage des mots de passe, jwt pour les tokens, User pour le modèle d'utilisateur
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Route pour l'inscription d'un nouvel utilisateur
exports.signup = (req, res, next) => {
    // Hashage du mot de passe avec bcrypt (niveau de salage 10)
    bcrypt.hash(req.body.password, 10)
    .then(hash => {
        // Création d'un nouvel utilisateur avec l'email et le mot de passe hashé
        const user = new User({
            email: req.body.email,
            password: hash
        });

        // Sauvegarde de l'utilisateur dans la base de données
        user.save()
        .then(() => res.status(201).json({ message: 'Utilisateur créé !' })) // Réponse en cas de succès
        .catch(error => res.status(400).json({ error })); // Erreur si la création échoue
    })
    .catch(error => res.status(500).json({ error })); // Erreur si le hashage échoue
};

// Route pour la connexion d'un utilisateur existant
exports.login = (req, res, next) => {
    // Recherche de l'utilisateur dans la base de données avec l'email
    User.findOne({ email: req.body.email })
    .then(user => {
        if (!user) { // Si l'utilisateur n'est pas trouvé
            return res.status(401).json({ message: 'Paire login/mot de passe incorrecte' });
        }
        
        // Comparaison du mot de passe fourni avec le mot de passe hashé de l'utilisateur
        bcrypt.compare(req.body.password, user.password)
            .then(valid => {
                if (!valid) { // Si la comparaison échoue (mots de passe incorrects)
                    return res.status(401).json({ message: 'Paire login/mot de passe incorrecte' });
                }

                // Si la connexion réussit, envoie un token JWT signé avec l'ID de l'utilisateur et une expiration de 24 heures
                res.status(200).json({
                    userId: user._id,
                    token: jwt.sign(
                        { userId: user._id },
                        process.env.TOKEN_SECRET, // Clé secrète pour signer le token (doit être définie dans les variables d'environnement)
                        { expiresIn: '24h' } // Le token expire dans 24 heures
                    )
                });
            })
            .catch(error => res.status(500).json({ error })); // Erreur en cas de problème lors de la comparaison du mot de passe
    })
    .catch(error => res.status(500).json({ error })); // Erreur en cas de problème lors de la recherche de l'utilisateur
};
