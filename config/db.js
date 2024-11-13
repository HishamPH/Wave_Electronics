const mongoose = require("mongoose");
require("dotenv").config();
const MONGODB_URL = process.env.MONGO_URL;

const connectDB = async () => {
  try {
    await mongoose.connect(MONGODB_URL, { serverSelectionTimeoutMS: 30000 });
  } catch (error) {
    console.error("error in database", error);
  }
};

mongoose.connection.on("connected", () => {
  console.log("Connected to Database Successfully!!!");
});

mongoose.connection.on("disconnected", () => {
  console.log("Failed to Connect the  Database!!!");
});

module.exports = connectDB;
