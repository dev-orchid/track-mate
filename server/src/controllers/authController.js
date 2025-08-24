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

    // Hash the password test
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

  if (!email || !password) {
    return res.status(400).json({ success: false, message: "Missing required fields" });
  }

  try {
    const user = await authAccount.findOne({ email });
    if (!user) {
      return res.status(400).json({ success: false, message: "User not found" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ success: false, message: "Invalid password" });
    }

    // Generate tokens
    const accessToken = jwt.sign(
      { userId: user._id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: "59m" }
    );

    const refreshToken = jwt.sign(
      { userId: user._id },
      process.env.REFRESH_TOKEN_SECRET,
      { expiresIn: "1h" }
    );

    // Save refresh token WITHOUT triggering validation
    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });

    const { password: _, ...safeUser } = user.toObject();

    res.status(200).json({
      success: true,
      message: "Login successful",
      accessToken,
      refreshToken,
      user: safeUser,
    });
  } catch (error) {
    console.error("Login error:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};


// controllers/authController.js
exports.refreshAccessToken = async (req, res) => {
  const { refreshToken } = req.body;

  if (!refreshToken) {
    return res.status(401).json({ success: false, message: "No refresh token provided" });
  }

  try {
    // Verify refresh token
    const decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);

    // Check if user exists and token matches
    const user = await authAccount.findById(decoded.userId);
    if (!user || user.refreshToken !== refreshToken) {
      return res.status(403).json({ success: false, message: "Invalid refresh token" });
    }

    // Issue new access token
    const newAccessToken = jwt.sign(
      { userId: user._id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: "59m" }
    );

    // Issue new refresh token
    const newRefreshToken = jwt.sign(
      { userId: user._id },
      process.env.REFRESH_TOKEN_SECRET,
      { expiresIn: "1h" }
    ); 

    // Save new refresh token in DB
    user.refreshToken = newRefreshToken;
    
    await user.save({ validateBeforeSave: false });

    // Return both tokens
    res.status(200).json({
      success: true,
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
    });
  } catch (err) {
    console.error("Refresh token error:", err);
    res.status(403).json({ success: false, message: "Invalid or expired refresh token" });
  }
};


