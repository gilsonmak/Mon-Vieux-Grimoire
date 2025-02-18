const mongoose = require('mongoose'); // Importation de Mongoose pour interagir avec MongoDB

// Définition du schéma du livre
const bookSchema = mongoose.Schema({
    userId: { type: String, required: true }, // Identifiant de l'utilisateur ayant ajouté le livre
    title: { type: String, required: true }, // Titre du livre
    author: { type: String, required: true }, // Auteur du livre
    imageUrl: { type: String, required: true }, // URL de l'image de couverture du livre
    year: { type: String, required: true }, // Année de publication du livre
    genre: { type: String, required: true }, // Genre du livre (ex: Science-fiction, Thriller, etc.)
    ratings: [ // Tableau contenant les notes attribuées par les utilisateurs
        {
            userId: { type: String, required: true }, // Identifiant de l'utilisateur ayant noté le livre
            grade: { type: Number, required: true }, // Note attribuée par l'utilisateur (ex: sur 5 ou 10)
        }
    ],
    averageRating: { type: Number, default: 0 }, // Note moyenne du livre, initialisée à 0
});

// Exportation du modèle 'Book' basé sur le schéma défini
module.exports = mongoose.model('Book', bookSchema);
