//pr voir routes api attendues par frontend: frontend\src\utils\constants.js

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const path = require("path");

const Book = require("./models/Book");
const booksRoutes = require("./routes/books");
const userRoutes = require("./routes/user");

const app = express();

mongoose
  .connect(
    "mongodb+srv://juliettemaret:passwordmongodb@cluster0.gnxzg.mongodb.net/mon-vieux-grimoire?retryWrites=true&w=majority&appName=Cluster0",
    { useNewUrlParser: true, useUnifiedTopology: true }
  )
  .then(() => console.log("Connexion à MongoDB réussie !"))
  .catch(() => console.log("Connexion à MongoDB échouée !"));

app.use(express.json()); //peut-être à enlever puisque j'ai déclaré var bodyparser en haut ?

app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content, Accept, Content-Type, Authorization"
  );
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET, POST, PUT, DELETE, PATCH, OPTIONS"
  );
  next();
});

/*app.use("/api/books", booksRoutes);*/
app.use("/api/auth", userRoutes);
app.use("images", express.static(path.join(__dirname, "images")));

app.post("/api/books", (req, res, next) => {
  delete req.body._id;
  const book = new Book({
    ...req.body,
  });
  book
    .save()
    .then(() => res.status(201).json({ message: "objet enregistré" }))
    .catch((error) => res.json({ error }));
});

app.put("/api/books/:id", (req, res, next) => {
  Book.updateOne({ _id: req.params.id }, { ...req.body, _id: req.params.id })
    .then(() => res.status(200).json({ message: "livre mis à jour" }))
    .catch((error) => res.status(400).json({ error }));
});

app.delete("/api/books/:id", (req, res, next) => {
  Book.deleteOne({ _id: req.params.id }).then(() =>
    res
      .status(200)
      .json({ message: "livre supprimé." })
      .catch((error) => ({ error }))
  );
});

app.get("/api/books/:id", (req, res, next) => {
  Book.findOne({ _id: req.params.id })
    .then((book) => res.status(200).json(book))
    .catch((error) => res.status(404).json({ error }));
  console.log("ID du livre à modifier :", req.params.id);
});

app.get("/api/books", (req, res, next) => {
  Book.find()
    .then((books) => res.status(200).json(books))
    .catch((error) => res.status(400).json({ error }));
});

module.exports = app;
