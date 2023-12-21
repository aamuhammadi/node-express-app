const User = require("../models/user");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { SECRET_KEY } = require("../config/env");
const path = require("path");
const fs = require("fs");
const { getIo } = require("../utils/socket");

exports.register = async (req, res) => {
  const { firstName, lastName, email, password } = req.body;

  if (password.length < 8) {
    return res
      .status(400)
      .json({ message: "Password must be at least 8 characters long" });
  }

  try {
    const existingUser = await User.findOne({ email: email });
    if (existingUser) {
      return res
        .status(400)
        .json({ message: "User with this email already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({
      firstName,
      lastName,
      email,
      password: hashedPassword,
    });

    const savedUser = await newUser.save();
    res
      .status(201)
      .json({ message: "User created successfully", user: savedUser });
  } catch (error) {
    res.status(500).json({ message: "Something went wrong" });
  }
};
exports.login = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email: email });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const token = jwt.sign(
      { userId: user._id, email: user.email },
      SECRET_KEY,
      { expiresIn: "1h" }
    );

    const { password: userPassword, ...userWithoutPassword } = user._doc;

    res.status(200).json({
      message: "Sign in successful",
      user: userWithoutPassword,
      token: token,
    });
  } catch (error) {
    res.status(500).json({ message: "Something went wrong" });
  }
};

exports.getUserInfo = async (req, res) => {
  try {
    const userId = req.user._id;

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const { password, ...userWithoutPassword } = user._doc;

    res.status(200).json({
      message: "User information retrieved",
      user: userWithoutPassword,
    });
  } catch (error) {
    res.status(500).json({ message: "Something went wrong" });
  }
};

exports.updateUser = async (req, res) => {
  const userId = req.user._id;
  const { firstName, lastName, email, password, phone, address } = req.body;

  try {
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    user.firstName = firstName || user.firstName;
    user.lastName = lastName || user.lastName;
    user.email = email || user.email;
    user.phone = phone || user.phone;
    user.address = address || user.address;

    if (password) {
      const hashedPassword = await bcrypt.hash(password, 10);
      user.password = hashedPassword;
    }

    const newProfileImage = req.file;

    if (newProfileImage) {
      if (user.profileImage) {
        user.profileImage.filename = newProfileImage.originalname;
        user.profileImage.filePath = newProfileImage.path;
      } else {
        user.profileImage = {
          filename: newProfileImage.originalname,
          filePath: newProfileImage.path,
        };
      }
    }

    const updatedUser = await user.save();

    const { password: userPassword, ...userWithoutPassword } = updatedUser._doc;

    res.status(200).json({
      message: "User updated successfully",
      user: userWithoutPassword,
    });
  } catch (error) {
    res.status(500).json({ message: "Something went wrong" });
  }
};

exports.getAllUsers = async (req, res) => {
  try {
    const userId = req.user._id;

    const user = await User.findById(userId);

    if (user.userType !== "admin") {
      return res
        .status(403)
        .json({ error: "Permission denied. Only admin can access this." });
    }

    const users = await User.find({ userType: "user" });

    res.status(200).json(users);
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).json({ error: "Somethig went wrong" });
  }
};

exports.deleteUserById = async (req, res) => {
  try {
    const adminUserId = req.user._id;
    const { userId } = req.params;

    const adminUser = await User.findById(adminUserId);
    if (adminUser.userType !== "admin") {
      return res
        .status(403)
        .json({ error: "Permission denied. Only admin can access this." });
    }

    const userToDelete = await User.findById(userId);
    if (!userToDelete) {
      return res.status(404).json({ error: "User not found." });
    }

    await User.findByIdAndDelete(userId);

    res.status(200).json({ message: "User deleted successfully." });
  } catch (error) {
    console.error("Error deleting user:", error);
    res.status(500).json({ error: "Something went wrong." });
  }
};

exports.attachments = async (req, res) => {
  try {
    const userId = req.user._id;

    const user = await User.findById(userId);

    if (req.files.length === 0) {
      return res.status(400).json({ error: "Please attach files" });
    }

    if (req.files && req.files.length > 5) {
      return res
        .status(400)
        .json({ error: "Maximum 5 files allowed per request" });
    }

    if (req.files) {
      const totalFileSize = req.files.reduce((acc, file) => acc + file.size, 0);
      if (totalFileSize > 50 * 1024 * 1024) {
        return res
          .status(400)
          .json({ error: "Maximum total file size is 50MB" });
      }
    }

    const attachments = req.files;

    const processFiles = async (files, attachmentArray) => {
      if (files) {
        files.forEach((file) => {
          attachmentArray.push({
            filename: file.originalname,
            filePath: file.path,
          });
        });
      }
    };

    await processFiles(attachments, user.attachments);

    await user.save();

    const userAttachments = user.attachments;

    const io = getIo();
    io.emit("userAttachments", { attachments: userAttachments });

    return res.status(201).json(userAttachments);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Something Went Wrong!" });
  }
};

exports.downloadAttachment = async (req, res) => {
  try {
    const filename = req.params.filename;
    const attachmentsType = req.params.attachmentsType;

    const attachmentDirectory = path.join(
      __dirname,
      `../data/${attachmentsType}`
    );

    const filePath = path.join(attachmentDirectory, filename);

    if (fs.existsSync(filePath)) {
      res.download(filePath, (err) => {
        if (err) {
          console.error(err);
          return res.status(500).json({ message: "Something went wrong" });
        }
      });
    } else {
      return res.status(404).json({ message: "File not found" });
    }
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Something went wrong" });
  }
};
