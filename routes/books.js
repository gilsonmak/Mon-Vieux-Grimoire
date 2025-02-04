const express = require('express');
const router = express.Router();

const bookCtrl = require('../controllers/books');

router.get('/', bookCtrl.getAllBooks);
router.get('/:id', bookCtrl.getOneBooks);
router.post('/',bookCtrl.createBook);

  












module.exports = router;