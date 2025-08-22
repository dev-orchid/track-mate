const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const authAccount = require("../models/authModel");
const { generateCompanyId } = require("../utils/generateCompanyId")

exports.userRegisteration = async (req, res) => {
  const { firstName, lastName, email, company_name, password } = req.body;
  console.log(req.body);
  // Validate the request
  if (!firstName || !lastName || !email || !password || !company_name) {
    return res
      .status(400)
      .json({ success: false, message: "Missing required fields" });
  }

  try {
    // Check if the user already exists
    const existingUser = await authAccount.findOne({ email });
    if (existingUser) {
      return res
        .status(400)
        .json({ success: false, message: "Account already exists" });
    }

    // Hash the password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
	const company_id = generateCompanyId();
    // Create and save the new user
    const newAccount = new authAccount({
      firstName,
      lastName,
      email,
      password: hashedPassword,
      company_name,
	  company_id
    });

    await newAccount.save();

    return res
      .status(201)
      .json({ success: true, message: "Account registered successfully" });
  } catch (error) {
    console.error("Registration error:", error);
    return res.status(500).json({ success: false, message: error });
  }
};
exports.authenticateLogin = async (req, res) => {
  const { email, password } = req.body;

  // Validate the request
  if (!email || !password) {
    return res
      .status(400)
      .json({ success: false, message: "Missing required fields" });
  }

  try {
    // Find user by email
    const user = await authAccount.findOne({ email });
    if (!user) {
      return res
        .status(400)
        .json({ success: false, message: "User not found" });
    }

    // Check password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid password" });
    }

    // Generate a JWT token
    const token = jwt.sign(
      { userId: user._id, email: user.email },
      process.env.JWT_SECRET,
      {
        expiresIn: "7d",
      }
    );

    res
      .status(200)
      .json({ success: true, message: "Login successful", token, user });
  } catch (error) {
    console.error("Login error:", error);
    return res.status(500).json({ success: false, message: error });
  }
};
