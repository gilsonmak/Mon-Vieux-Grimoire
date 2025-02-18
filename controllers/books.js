// Importation du modèle Book et du module fs (pour la gestion des fichiers)
const Book = require('../models/Book');
const fs = require('fs');

// Récupère tous les livres depuis la base de données
exports.getAllBooks = (req, res, next) => {
    Book.find()
    .then(books => res.status(200).json(books)) // Retourne les livres en réponse
    .catch(error => res.status(400).json({ error })); // Erreur si la récupération échoue
};

// Récupère un livre spécifique en fonction de son ID
exports.getOneBook = (req, res, next) => {
    Book.findOne({_id: req.params.id})
    .then(book => res.status(200).json(book)) // Retourne le livre en réponse
    .catch(error => res.status(404).json({ error })); // Erreur si le livre n'est pas trouvé
};

// Crée un nouveau livre
exports.createBook = (req, res, next) => {
    // Parse l'objet du livre depuis la requête
    const bookObject = JSON.parse(req.body.book);
    delete bookObject._id; // Supprime l'ID fourni par l'utilisateur (sera généré par MongoDB)
    delete bookObject._userId; // Supprime l'userId si présent

    // Création du livre avec les informations envoyées et l'URL de l'image
    const book = new Book({
        ...bookObject,
        userId: req.auth.userId, // L'ID de l'utilisateur connecté
        imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}` // URL de l'image
    });
  
    // Sauvegarde du livre en base de données
    book.save()
    .then(() => { res.status(201).json({message: 'Livre ajouté avec succès !'})}) // Succès
    .catch(error => { res.status(400).json({ error: 'Erreur lors de la création du livre' })}); // Erreur
};

// Modifie un livre existant
exports.modifyBook = (req, res, next) => {
    // Si une nouvelle image est envoyée, met à jour l'image
    const bookObject = req.file ? {
        ...JSON.parse(req.body.book),
        imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`
    } : { ...req.body };

    delete bookObject._userId; // Supprime l'userId

    // Recherche le livre à modifier
    Book.findOne({_id: req.params.id})
        .then((book) => {
            if (book.userId != req.auth.userId) { // Vérifie que l'utilisateur est autorisé à modifier le livre
                res.status(401).json({ message : 'Not authorized'}); // Utilisateur non autorisé
            } else {
                // Supprime l'ancienne image si elle existe
                const filename = book.imageUrl.split("/images/")[1];
                req.file && fs.unlink(`images/${filename}`, (err) => {
                    if (err) console.log('Erreur lors de la suppression de l\'image:', err); // Erreur de suppression
                });

                // Mise à jour du livre dans la base de données
                Book.updateOne({ _id: req.params.id}, { ...bookObject, _id: req.params.id})
                .then(() => res.status(200).json({message : 'Livre modifié!'})) // Succès
                .catch(error => res.status(401).json({ error })); // Erreur
            }
        })
        .catch((error) => {
            res.status(400).json({ error }); // Erreur si le livre n'est pas trouvé
        });
};

// Supprime un livre
exports.deleteBook = (req, res, next) => {
    // Recherche du livre à supprimer
    Book.findOne({ _id: req.params.id})
        .then(book => {
            if (book.userId != req.auth.userId) { // Vérifie que l'utilisateur est autorisé à supprimer le livre
                res.status(401).json({message: 'Not authorized'}); // Utilisateur non autorisé
            } else {
                // Supprime l'image associée au livre
                const filename = book.imageUrl.split('/images/')[1];
                fs.unlink(`images/${filename}`, () => {
                    // Supprime le livre de la base de données
                    Book.deleteOne({_id: req.params.id})
                        .then(() => { res.status(200).json({ message: 'Livre supprimé !'})}) // Succès
                        .catch(error => res.status(401).json({ error })); // Erreur
                });
            }
        })
        .catch( error => {
            res.status(500).json({ error }); // Erreur si un problème survient
        });
};

// Permet à un utilisateur de noter un livre
exports.rateBook = (req, res, next) => {
    const userId = req.auth.userId;
    const { rating } = req.body;

    // Vérifie si la note est comprise entre 0 et 5
    if (rating < 0 || rating > 5) {
       return res.status(400).json({ message: 'La note doit être comprise entre 0 et 5 '});
    }

    // Recherche du livre à noter
    Book.findOne ({ _id: req.params.id})
    .then(book => {
        if (!book) { // Vérifie si le livre existe
           return res.status(404).json({ message: 'Livre non trouvé !'});
        }

        // Vérifie si l'utilisateur a déjà noté ce livre
        const userRating = book.ratings.find(rating => rating.userId === userId);
        if (userRating) {
            return res.status(403).json({ message: 'Vous avez déjà noté ce livre '});
        }

        // Ajoute la nouvelle note au tableau de ratings du livre
        book.ratings.push({ userId, grade: rating });

        // Recalcule la note moyenne du livre
        book.averageRating = book.ratings.reduce((accumulateur, rating) => accumulateur + rating.grade, 0) / book.ratings.length;

        // Sauvegarde les modifications du livre
        book.save()
             .then((updateBook) => res.status(200).json(updateBook)) // Succès
             .catch(error => res.status(400).json({ error })); // Erreur

    })
    .catch(error => res.status(400).json({ error: 'Une erreur est survenue ' }));
};

// Récupère les 3 livres les mieux notés
exports.bestRatingBook = (req, res) => {
    Book.find().sort({ averageRating: -1 }).limit(3) // Trie les livres par note moyenne et limite les résultats à 3
    .then(books => res.status(200).json(books)) // Retourne les livres avec les meilleures notes
    .catch(error => res.status(400).json({ error })); // Erreur si un problème survient
}
