const express = require("express");
const appRoutes = require("./src/routes/website");
const userRoutes = require("./src/routes/user");
const cors = require("cors");
const path = require("path");

const connectDB = require("./src/config/db");
const { PORT } = require("./src/config/env");

const app = express();
connectDB();

const port = PORT || 8080;

app.use(express.json());
app.use(cors());
app.use("/src/data", express.static(path.join(__dirname, "src/data")));

app.use(appRoutes);
app.use("/api/user", userRoutes);

app.use((req, res) => {
  res.status(404).send(`<h1>404 - Page Not Found</h1>`);
});

app.listen(port, (err) => {
  if (err) console.log("!🚨 ERROR ==>", err);
  console.log(`🚀 listening at port ${port}`);
});
