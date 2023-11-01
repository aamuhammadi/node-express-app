const express = require("express");
const websiteController = require("../controllers/website");

const router = express.Router();

router.get("/about", websiteController.about);

router.get("/contact", websiteController.contact);

router.get("/", websiteController.home);

module.exports = router;
