const DB_NAME = "expressjs-training-db";
const DB = `mongodb://127.0.0.1:27017/${DB_NAME}`;
const PORT = 8080;
const SECRET_KEY = "mySecretKey1";

module.exports = {
  DB,
  PORT,
  DB_NAME,
  SECRET_KEY,
};
