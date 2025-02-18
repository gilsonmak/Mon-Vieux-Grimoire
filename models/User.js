const mongoose = require('mongoose'); // Importation de Mongoose pour interagir avec MongoDB
const uniqueValidator = require('mongoose-unique-validator'); // Importation du plugin pour garantir l'unicité des champs

// Définition du schéma utilisateur
const userSchema = mongoose.Schema({
    email: { type: String, required: true, unique: true }, // Adresse e-mail unique et obligatoire
    password: { type: String, required: true } // Mot de passe obligatoire (sera haché avant stockage)
});

// Application du plugin mongoose-unique-validator pour éviter les doublons d'e-mails
userSchema.plugin(uniqueValidator);

// Exportation du modèle 'User' basé sur le schéma défini
module.exports = mongoose.model('User', userSchema);
