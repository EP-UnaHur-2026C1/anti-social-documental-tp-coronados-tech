const mongoose = require("mongoose");

const MONGO_URL =
  process.env.MONGO_URL ||
  "mongodb://admin:admin1234@localhost:27017/antiSocial?authSource=admin";

const connectDB = async () => {
  mongoose.set("strictQuery", false);
  await mongoose.connect(MONGO_URL, {
    serverSelectionTimeoutMS: 5000,
  });
  console.log("Conexión a MongoDB establecida");
};

module.exports = connectDB;
