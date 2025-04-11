const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth.js");
const multer = require("../middleware/multer-config.js");

const booksController = require("./booksController.js");

router.get("/", /*auth,*/ booksController.getAllBooks);

router.post("/", auth, multer, booksController.createBook);

router.get("/:id", /*auth,*/ booksController.getOneBook);

router.put("/:id", auth, multer, booksController.modifyBook);

router.delete("/:id", auth, booksController.deleteBook);

router.post("/:id/rating", auth, booksController.rateBook);

module.exports = router;
