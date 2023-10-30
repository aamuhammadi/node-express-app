const express = require("express");
const appRoutes = require("./src/routes/app.routes");

const app = express();
const port = 8080;

app.use("/api", appRoutes);

app.use((req, res) => {
  res.status(404).send(`<h1>404 - Page Not Found</h1>`);
});

app.listen(port, () => {
  console.log(`app is listening at port ${port}`);
});
