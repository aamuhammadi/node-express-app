const User = require("../models/user");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { SECRET_KEY } = require("../config/env");

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
