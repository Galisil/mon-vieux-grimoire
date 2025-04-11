const mongoose = require("mongoose");

// Configuration de la connexion à la base de données de test
const connectDB = async () => {
  try {
    // Si une connexion existe déjà, on la ferme d'abord
    if (mongoose.connection.readyState === 1) {
      await mongoose.connection.close();
    }

    await mongoose.connect(
      "mongodb+srv://juliettemaret:passwordmongodb@cluster0.gnxzg.mongodb.net/mon-vieux-grimoire-test?retryWrites=true&w=majority&appName=Cluster0"
    );
    console.log("✅ Connexion à la base de données de test réussie");
  } catch (error) {
    console.error(
      "❌ Erreur de connexion à la base de données de test:",
      error
    );
    throw error;
  }
};

// Fonction pour fermer la connexion à la base de données
const closeDB = async () => {
  try {
    await mongoose.connection.close();
    console.log("✅ Connexion à la base de données de test fermée");
  } catch (error) {
    console.error("❌ Erreur lors de la fermeture de la connexion:", error);
  }
};

module.exports = { connectDB, closeDB };
