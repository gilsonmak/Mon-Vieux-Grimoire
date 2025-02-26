const multer = require('multer');
const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

// Stockage en mémoire avec multer + Filtrage des fichiers
const storage = multer.memoryStorage();
const upload = multer({ storage,
  // Vérification du type MIME du fichier pour autoriser uniquement les images
  fileFilter: (req, file, callback) => {
    if (!file.originalname.match(/\.(jpg|jpeg|png|webp)$/)) {
      return callback(new Error("Seuls les fichiers JPG, JPEG, PNG et WEBP sont autorisés !"), false);
    }
    callback(null, true);
  }
});

// Middleware pour transformer l'image en format `.webp` et la sauvegarder
const processImage = async (req, res, next) => {
  if (!req.file) {
    return next(); // Passe au middleware suivant si aucune image n'est téléchargée
  }

  try {
    const imagePath = path.join(__dirname, '../images');
    if (!fs.existsSync(imagePath)) {
      fs.mkdirSync(imagePath, { recursive: true });
    }

    const { buffer, originalname } = req.file;
    const timestamp = Date.now();
    const safeName = path.basename(originalname).replace(/\s+/g, '_').replace(/[^a-zA-Z0-9_.-]/g, '');
    const filename = `${timestamp}-${safeName.split('.')[0]}.webp`;

    // Conversion et enregistrement de l'image en `.webp`
    await sharp(buffer)
      .resize({ width: 1000 }) // Redimensionne l'image pour optimiser le stockage et la vitesse
      .webp({ quality: 80 })
      .toFile(path.join(imagePath, filename));

    // Nettoyage du buffer pour éviter les fuites de mémoire
    req.file.buffer = null;

    // Mise à jour des infos du fichier pour l'utiliser dans le contrôleur
    req.file.filename = filename;
    req.file.path = `/images/${filename}`;

    next(); // Passe au middleware suivant
  } catch (error) {
    console.error('Erreur lors de la conversion de l\'image :', error);
    res.status(500).json({ message: 'Erreur lors du traitement de l\'image.', error });
  }
};

module.exports = { upload, processImage };
