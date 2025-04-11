const request = require("supertest");
const mongoose = require("mongoose");
const app = require("../app");
const Book = require("../books/BookModel");
const { connectDB, closeDB } = require("../config/database");

// Avant tous les tests, on se connecte à la base de données de test
beforeAll(async () => {
  await connectDB();
});

// Après tous les tests, on ferme la connexion
afterAll(async () => {
  await closeDB();
});

// Avant chaque test, on vide la collection de livres
beforeEach(async () => {
  await Book.deleteMany({});
});

//test pour la récupération de tous les livres
describe("Tests de la route GET /api/books", () => {
  // Test 1 : Vérifier que la route retourne une liste vide quand il n'y a pas de livres
  it("devrait retourner une liste vide quand il n'y a pas de livres", async () => {
    // On fait une requête GET à /api/books
    const response = await request(app).get("/api/books").expect(200); // On vérifie que le statut est 200 (OK)

    // On vérifie que la réponse est un tableau vide
    expect(response.body).toEqual([]);
  });

  // Test 2 : Vérifier que la route retourne tous les livres
  it("devrait retourner tous les livres", async () => {
    // On crée un livre de test dans la base de données
    const testBook = new Book({
      title: "Test Book",
      author: "Test Author",
      year: 2024,
      genre: "Test Genre",
      ratings: [],
      averageRating: 0,
      userId: "123456789",
    });
    await testBook.save();

    // On fait une requête GET à /api/books
    const response = await request(app).get("/api/books").expect(200);

    // On vérifie que la réponse contient bien notre livre de test
    expect(response.body).toHaveLength(1);
    expect(response.body[0].title).toBe("Test Book");
  });
});

//test pour la récupération d'un livre spécifique
describe("Tests de la route GET /api/books/:id", () => {
  it("devrait retourner le livre s'il existe", async () => {
    const testBook = new Book({
      title: "Test Book",
      author: "Test Author",
      year: 2024,
      genre: "Test Genre",
      ratings: [],
      averageRating: 0,
      userId: "123456789",
    });
    const savedBook = await testBook.save();

    const response = await request(app)
      .get(`/api/books/${savedBook._id}`)
      .expect(200);

    expect(response.body.title).toBe("Test Book");
    expect(response.body.author).toBe("Test Author");
    expect(response.body.year).toBe(2024);
  });
  it("devrait retourner une erreur 404 si le livre n'existe pas", async () => {
    const fakeId = new mongoose.Types.ObjectId();

    await request(app).get(`/api/books/:${fakeId}`).expect(404);
  });
});

//test pour la création d'un livre
describe("Tests de la route POST /api/books", () => {
  let authToken;

  //créer un utilisateur de test et obtenir son token pour pouvoir enregistrer un livre
  beforeAll(async () => {
    const signupResponse = await request(app).post("/api/auth/signup").send({
      email: "test@test.com",
      password: "password123",
    });

    // Se connecter pour obtenir le token
    const loginResponse = await request(app).post("/api/auth/login").send({
      email: "test@test.com",
      password: "password123",
    });

    authToken = loginResponse.body.token;
  });

  it("devrait créer un nouveau livre", async () => {
    const bookData = {
      title: "Nouveau Livre",
      author: "Nouvel Auteur",
      year: 2024,
      genre: "Nouveau Genre",
      ratings: [],
      averageRating: 0,
      userId: new mongoose.Types.ObjectId(),
    };

    const response = await request(app)
      .post("/api/books")
      .set("Authorization", `Bearer ${authToken}`)
      .send(bookData)
      .expect(201);

    expect(response.body.message).toBe("objet enregistré");

    const savedBook = await Book.findOne(response.body._id);
    expect(savedBook).toBeTruthy();
    expect(savedBook.title).toBe(bookData.title);
  });

  it("devrait retourner une erreur 400 si les données renseignées sont invalides", async () => {
    const invalidBookData = {
      title: "Livre invalide",
    };

    await request(app)
      .post("/api/books")
      .set("Authorization", `Bearer ${authToken}`)
      .send(invalidBookData)
      .expect(400);
  });
});
