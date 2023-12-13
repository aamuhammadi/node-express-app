const express = require("express");
const userController = require("../controllers/user");
const { protect } = require("../utils/protect");
const upload = require("../utils/multer");

const router = express.Router();

router.post("/register", userController.register);
router.post("/login", userController.login);
router.get("/info", protect, userController.getUserInfo);
router.get("/users", protect, userController.getAllUsers);
router.put("/update", protect, userController.updateUser);
router.delete("/:userId", protect, userController.deleteUserById);
router.put(
  "/profileimage",
  protect,
  upload.array("attachments"),
  userController.profileImage
);

module.exports = router;
