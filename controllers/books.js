const Book = require('../models/Book');
const fs = require('fs');

exports.getAllBooks = (req, res, next) => {
    Book.find()
    .then(books => res.status(200).json(books))
    .catch(error => res.status(400).json({ error }));
};

exports.getOneBook = (req, res, next) => {
    Book.findOne({_id: req.params.id})
    .then(book => res.status(200).json(book))
    .catch(error => res.status(404).json({ error }));
};

exports.createBook = (req, res, next) => {
    const bookObject = JSON.parse(req.body.book);
    delete bookObject._id;
    delete bookObject._userId;
    const book = new Book({
        ...bookObject,
        userId: req.auth.userId,
        imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`
    });
  
    book.save()
    .then(() => { res.status(201).json({message: 'Livre ajouté avec succès !'})})
    .catch(error => { res.status(400).json( { error: 'Erreur lors de la création du livre' })});
 };

 exports.modifyBook = (req, res, next) => {
    const bookObject = req.file ? {
        ...JSON.parse(req.body.book),
        imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`
    } : { ...req.body };
  
    delete bookObject._userId;
    Book.findOne({_id: req.params.id})
        .then((book) => {
            if (book.userId != req.auth.userId) {
                res.status(401).json({ message : 'Not authorized'});
            } else {
                const filename = book.imageUrl.split("/images/")[1];
                req.file &&
                  fs.unlink(`images/${filename}`, (err) => {
                    if (err) console.log('Erreur lors de la suppression de l\'image:',err);
                  });
                Book.updateOne({ _id: req.params.id}, { ...bookObject, _id: req.params.id})
                .then(() => res.status(200).json({message : 'Livre modifié!'}))
                .catch(error => res.status(401).json({ error }));
            }
        })
        .catch((error) => {
            res.status(400).json({ error });
        });
 };
 
 exports.deleteBook = (req, res, next) => {
    Book.findOne({ _id: req.params.id})
        .then(book => {
            if (book.userId != req.auth.userId) {
                res.status(401).json({message: 'Not authorized'});
            } else {
                const filename = book.imageUrl.split('/images/')[1];
                fs.unlink(`images/${filename}`, () => {
                    Book.deleteOne({_id: req.params.id})
                        .then(() => { res.status(200).json({ message: 'Livre supprimé !'})})
                        .catch(error => res.status(401).json({ error }));
                });
            }
        })
        .catch( error => {
            res.status(500).json({ error });
        });
 };

 exports.rateBook = (req, res, next) => {
    const userId = req.auth.userId;
    const { rating } = req.body;

    if (rating < 0 || rating > 5) {
       return res.status(400).json({ message: 'La note doit être comprise entre 0 et 5 '});
    }

    Book.findOne ({ _id: req.params.id})
    .then(book => {
        if (!book) {
           return res.status(404).json({ message: 'Livre non trouvé !'});
        }
        const userRating = book.ratings.find(rating => rating.userId === userId);
        if (userRating) {
            return res.status(403).json({ message: 'Vous avez déjà noté ce livre '});
        }

        book.ratings.push({ userId, grade: rating })

        book.averageRating = book.ratings.reduce((accumulateur, rating) => accumulateur + rating.grade, 0) / book.ratings.length;

        book.save()
             .then((updateBook) => res.status(200).json(updateBook))
             .catch(error => res.status(400).json({ error }));

    } )
    .catch(error => res.status(400).json({ error: 'Une erreur est survenue ' }));
 };

 exports.bestRatingBook = (req, res) => {
    Book.find().sort({ averageRating: -1 }).limit(3)
    .then(books => res.status(200).json(books))
    .catch(error => res.status(400).json({ error }));
 }
 