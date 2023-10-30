const express = require("express");

const router = express.Router();

router.get("/about", (req, res, next) => {
  res.send(`<h1>About Us Page</h1>`);
});

router.get("/contact", (req, res, next) => {
  res.send(`<h1>Contact Us Page</h1>`);
});

router.get("/", (req, res, next) => {
  res.send(`<h1>asslamu alaikum</h1>`);
});

module.exports = router;
