const express = require('express'); // Importation d'Express pour gérer les routes
const auth = require('../middleware/auth'); // Middleware d'authentification pour sécuriser certaines routes
const multer = require('../middleware/multer-config'); // Middleware pour gérer l'upload des fichiers (images)
const router = express.Router(); // Création d'un routeur Express

const bookCtrl = require('../controllers/books'); // Importation du contrôleur qui gère la logique métier des livres

// Route pour récupérer tous les livres (accessible sans authentification)
router.get('/', bookCtrl.getAllBooks);

// Route pour récupérer les livres ayant les meilleures notes (accessible sans authentification)
router.get('/bestrating', bookCtrl.bestRatingBook);

// Route pour récupérer un livre spécifique via son ID (accessible sans authentification)
router.get('/:id', bookCtrl.getOneBook);

// Route pour ajouter un nouveau livre (nécessite authentification et gestion de fichier avec multer)
router.post('/', auth, multer, bookCtrl.createBook);

// Route pour modifier un livre existant (nécessite authentification et gestion de fichier avec multer)
router.put('/:id', auth, multer, bookCtrl.modifyBook);

// Route pour supprimer un livre (nécessite authentification)
router.delete('/:id', auth, bookCtrl.deleteBook);

// Route pour noter un livre (nécessite authentification)
router.post('/:id/rating', auth, bookCtrl.rateBook);

module.exports = router; // Exportation du routeur pour l'utiliser dans l'application
