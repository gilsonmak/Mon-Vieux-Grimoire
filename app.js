const express = require('express'); // Importation d'Express pour créer l'application web
const mongoose = require('mongoose'); // Importation de Mongoose pour interagir avec MongoDB
const path = require('path'); // Importation du module Path pour gérer les chemins de fichiers

// Importation des routes pour les livres et les utilisateurs
const booksRoutes = require('./routes/books');
const userRoutes = require('./routes/user');

const app = express(); // Création de l'application Express

app.use(express.json()); // Middleware pour parser automatiquement les requêtes en JSON

require('dotenv').config(); // Chargement des variables d'environnement depuis un fichier .env

// Connexion à la base de données MongoDB
mongoose.connect(process.env.MONGODB, // Utilisation de l'URL stockée dans le fichier .env
    { useNewUrlParser: true, // Utilisation du nouveau parser d'URL de Mongoose
      useUnifiedTopology: true }) // Activation du moteur de gestion des connexions de Mongoose
    .then(() => console.log('Connexion à MongoDB réussie !')) // Message en cas de succès
    .catch(() => console.log('Connexion à MongoDB échouée !')); // Message en cas d'échec

// Middleware pour configurer les en-têtes CORS (permettant la communication entre différents domaines)
app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*'); // Autorise toutes les origines à accéder à l'API
    res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content, Accept, Content-Type, Authorization'); // Autorise certains en-têtes
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS'); // Autorise ces méthodes HTTP
    next(); // Passe au middleware suivant
});

// Configuration des routes
app.use('/api/books', booksRoutes); // Routes pour les livres (CRUD, notation, etc.)
app.use('/api/auth', userRoutes); // Routes pour l'authentification des utilisateurs (inscription, connexion)
app.use('/images', express.static(path.join(__dirname, 'images'))); // Gestion des fichiers statiques (images des livres)

module.exports = app; // Exportation de l'application pour l'utiliser dans server.js
