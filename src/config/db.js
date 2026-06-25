const mongoose = require("mongoose");

const MONGO_URL =
  process.env.MONGO_URL ||
  "mongodb://admin:admin1234@localhost:27017/antiSocial?authSource=admin";

const syncModelIndexes = async () => {
  await Promise.all(
    mongoose.modelNames().map((name) => mongoose.model(name).syncIndexes()),
  );
};

const connectDB = async () => {
  mongoose.set("strictQuery", false);
  await mongoose.connect(MONGO_URL, {
    serverSelectionTimeoutMS: 5000,
  });
  await syncModelIndexes();
  console.log("Conexión a MongoDB establecida");
};

module.exports = connectDB;
