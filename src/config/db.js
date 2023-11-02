const { default: mongoose } = require("mongoose");
const { DB, DB_NAME } = require("./env");

const connectDB = async () => {
  await mongoose
    .connect(DB, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    })
    .then(() => {
      console.log(`Database Connected 🎯 DATA-BASE NAME: ${DB_NAME}`);
    })
    .catch((err) => {
      console.log("!🚨ERROR ==> ", err);
    });
};

module.exports = connectDB;
