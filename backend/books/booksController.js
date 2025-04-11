const Book = require("./BookModel");
const fs = require("fs");

exports.createBook = (req, res, next) => {
  let bookObject;

  // Si les données sont envoyées en FormData (depuis le frontend)
  if (req.body.book) {
    bookObject = JSON.parse(req.body.book);
  }
  // Si les données sont envoyées en JSON direct (depuis Postman)
  else {
    bookObject = req.body;
  }

  delete bookObject._id;
  delete bookObject._userId;

  const book = new Book({
    ...bookObject,
    userId: req.auth.userId,
    imageUrl: req.file
      ? `${req.protocol}://${req.get("host")}/images/${req.file.filename}`
      : null,
  });

  book
    .save()
    .then(() => {
      res.status(201).json({ message: "objet enregistré" });
    })
    .catch((error) => {
      res.status(400).json({ error });
    });
};

exports.modifyBook = (req, res, next) => {
  const bookObject = req.file
    ? {
        ...JSON.parse(req.body.book),
        imageUrl: `${req.protocol}://${req.get("host")}/images/${
          req.file.filename
        }`,
      }
    : { ...req.body };

  delete bookObject._userId;
  Book.findOne({ _id: req.params.id })
    .then((book) => {
      if (book.userId != req.auth.userId) {
        res.status(401).json({ message: "Not authorized" });
      } else {
        Book.updateOne(
          { _id: req.params.id },
          { ...bookObject, _id: req.params.id }
        )
          .then(() => res.status(200).json({ message: "Objet modifié!" }))
          .catch((error) => res.status(401).json({ error }));
      }
    })
    .catch((error) => {
      res.status(400).json({ error });
    });
};

exports.deleteBook = (req, res, next) => {
  Book.findOne({ _id: req.params.id })
    .then((book) => {
      if (!book) {
        return res.status(404).json({ message: "Livre non trouvé" });
      }
      if (book.userId != req.auth.userId) {
        return res.status(401).json({ message: "non-autorisé" });
      }

      // Si le livre a une image, on la supprime d'abord
      if (book.imageUrl) {
        const filename = book.imageUrl.split("/images/")[1];
        fs.unlink(`images/${filename}`, (error) => {
          if (error) {
            console.error("Erreur lors de la suppression de l'image:", error);
          }
          // Une fois l'image supprimée (ou en cas d'erreur), on supprime le livre
          deleteBookFromDB();
        });
      } else {
        // Si pas d'image, on supprime directement le livre
        deleteBookFromDB();
      }

      function deleteBookFromDB() {
        Book.deleteOne({ _id: req.params.id })
          .then(() => {
            res.status(200).json({ message: "livre supprimé" });
          })
          .catch((error) => res.status(401).json({ error }));
      }
    })
    .catch((error) => res.status(500).json({ error }));
};

exports.getOneBook = (req, res, next) => {
  Book.findOne({ _id: req.params.id })
    .then((book) => res.status(200).json(book))
    .catch((error) => res.status(404).json({ error }));
};

exports.getAllBooks = (req, res, next) => {
  Book.find()
    .then((books) => res.status(200).json(books))
    .catch((error) => res.status(400).json({ error }));
};

exports.rateBook = (req, res, next) => {
  const { rating } = req.body;
  const userId = req.auth.userId;

  Book.findOne({ _id: req.params.id })
    .then((book) => {
      console.log("voilà les ratings du livre: ", book.ratings);
      const userRatingIndex = book.ratings.findIndex(
        (ratingId) => ratingId === userId
      );
      if (!userRatingIndex) {
        book.ratings.push({ userId: rating.grade });
      } else {
        book.ratings.push({
          userId: userId,
          grade: rating,
        });
      }
      const sum = book.ratings.reduce((acc, curr) => acc + curr.grade, 0);
      book.averageRating = Math.round((sum / book.ratings.length) * 10) / 10;
      return book.save();
    })
    .then((updatedRate) => {
      console.log("voilà les ratings du livre: ", updatedRate.ratings);
      res.status(200).json(updatedRate);
    })
    .catch((error) => res.status(404).json({ error }));
};
