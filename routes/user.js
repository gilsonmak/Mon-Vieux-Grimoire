const express = require('express'); // Importation d'Express pour créer un routeur
const router = express.Router(); // Création d'un routeur Express
const userCtrl = require('../controllers/user'); // Importation du contrôleur qui gère l'inscription et la connexion des utilisateurs

// Route pour l'inscription d'un nouvel utilisateur
router.post('/signup', userCtrl.signup);

// Route pour la connexion d'un utilisateur existant
router.post('/login', userCtrl.login);

module.exports = router; // Exportation du routeur pour être utilisé dans l'application
