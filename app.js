const express = require("express");

const app = express();
const port = 8080;

app.get("/", (req, res) => {
  res.send("asslamu alaikum");
});

app.listen(port, () => {
  console.log(`app is listening at port ${port}`);
});
