// controllers/authController.js

const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const authAccount = require("../models/authModel");
const { generateCompanyId } = require("../utils/generateCompanyId");

// 1. User Registration
exports.userRegisteration = async (req, res) => {
  const { firstName, lastName, email, company_name, password } = req.body;

  if (!firstName || !lastName || !email || !password || !company_name) {
    return res
      .status(400)
      .json({ success: false, message: "Missing required fields" });
  }

  try {
    const existingUser = await authAccount.findOne({ email });
    if (existingUser) {
      return res
        .status(400)
        .json({ success: false, message: "Account already exists" });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    const company_id = generateCompanyId();

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
    return res.status(500).json({ success: false, message: error.message });
  }
};

// 2. Authenticate Login & Issue Tokens
exports.authenticateLogin = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res
      .status(400)
      .json({ success: false, message: "Missing required fields" });
  }

  try {
    const user = await authAccount.findOne({ email });
    if (!user) {
      return res
        .status(400)
        .json({ success: false, message: "User not found" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid password" });
    }

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

    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });

    const { password: _, refreshToken: __, ...safeUser } = user.toObject();

    return res.status(200).json({
      success: true,
      message: "Login successful",
      accessToken,
      refreshToken,
      user: safeUser
    });
  } catch (error) {
    console.error("Login error:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// 3. Get Current User
exports.getCurrentUser = async (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res
      .status(401)
      .json({ success: false, message: "No token provided" });
  }

  const token = authHeader.split(" ")[1];
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    const user = await authAccount
      .findById(payload.userId)
      .select("-password -refreshToken");

    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    return res.status(200).json({ success: true, user });
  } catch (err) {
    console.error("getCurrentUser error:", err);
    return res
      .status(403)
      .json({ success: false, message: "Invalid or expired token" });
  }
};

// 4. Refresh Access Token
exports.refreshAccessToken = async (req, res) => {
  const { refreshToken } = req.body;
  if (!refreshToken) {
    return res
      .status(401)
      .json({ success: false, message: "No refresh token provided" });
  }

  try {
    const decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);
    const user = await authAccount.findById(decoded.userId);
    if (!user || user.refreshToken !== refreshToken) {
      return res
        .status(403)
        .json({ success: false, message: "Invalid refresh token" });
    }

    const newAccessToken = jwt.sign(
      { userId: user._id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: "59m" }
    );

    const newRefreshToken = jwt.sign(
      { userId: user._id },
      process.env.REFRESH_TOKEN_SECRET,
      { expiresIn: "1h" }
    );

    user.refreshToken = newRefreshToken;
    await user.save({ validateBeforeSave: false });

    return res.status(200).json({
      success: true,
      accessToken: newAccessToken,
      refreshToken: newRefreshToken
    });
  } catch (err) {
    console.error("Refresh token error:", err);
    return res
      .status(403)
      .json({ success: false, message: "Invalid or expired refresh token" });
  }
};

//5. update account details
exports.updateCurrentUser = async (req, res) => {
  // 1. Verify token and extract userId
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith("Bearer ")) {
    return res
      .status(401)
      .json({ success: false, message: "No token provided" });
  }
  const token = authHeader.split(" ")[1];
  let payload;
  try {
    payload = jwt.verify(token, process.env.JWT_SECRET);
  } catch (err) {
    return res
      .status(403)
      .json({ success: false, message: "Invalid or expired token" });
  }

  // 2. Build update object
  const { firstName, lastName, email, company_name } = req.body;
  const updates = {};
  if (firstName) updates.firstName = firstName;
  if (lastName)  updates.lastName = lastName;
  if (email)     updates.email = email;
  if (company_name) updates.company_name = company_name;

  // 3. Perform update
  try {
    const updatedUser = await authAccount.findByIdAndUpdate(
      payload.userId,
      { $set: updates },
      { new: true, select: "-password -refreshToken" }
    );
    if (!updatedUser) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }
    res.json({ success: true, user: updatedUser });
  } catch (err) {
    console.error("Update error:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};