const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const multer = require("../middleware/multer-config");

const booksController = require("../controllers/books.js");

router.get("/", auth, booksController.getAllBooks);

router.post("/", auth, multer, booksController.createBook);

router.get("/:id", auth, booksController.getOneBook);

router.put("/:id", auth, booksController.modifyBook);

router.delete("/:id", auth, booksController.deleteBook);

module.exports = router;
