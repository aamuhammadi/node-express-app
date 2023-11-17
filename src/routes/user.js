const express = require("express");
const userController = require("../controllers/user");
const { protect } = require("../utils/protect");

const router = express.Router();

router.post("/register", userController.register);
router.post("/login", userController.login);
router.get("/info", protect, userController.getUserInfo);
router.put("/update", protect, userController.updateUser);

module.exports = router;
