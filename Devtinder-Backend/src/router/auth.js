
const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/user');
const { validateSignupData } = require('../utils/validation');
const authrouter = express.Router();

authrouter.post('/signup', async (req, res) => {
  // Create a new user instance
  try {
    validateSignupData(req);
    const { firstName, lastName, emailId, password, age, gender, skills, bio, photoUrl } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({
      firstName,
      lastName,
      emailId,
      password: hashedPassword,
      age,
      gender,
      skills,
      bio,
      photoUrl: photoUrl,
    });
    await user.save();
    res.send({ message: "User registered successfully" });
  } catch (error) {
    res.status(400).json({ requestId: req.requestId, error: error.message, status: 400 });
  }
});

authrouter.post('/login', async (req, res) => {
  try {
    const { emailId, password } = req.body;
    if (!emailId || !password) {
      throw new Error("Email and Password are required");
    }
    const user = await User.findOne({ emailId });                
    if (!user) {
      throw new Error("Invalid email or password");
    }
    const isMatch = await user.validatePassword(password);
    if (isMatch) {
      const token = await user.getJWT();
      const userObj = user.toObject();
      delete userObj.password;
      res.send({ message: "Login successful", token, user: userObj });
    } else {
      throw new Error("Invalid email or password");
    }
  } catch (error) {
    res.status(400).json({ requestId: req.requestId, error: error.message, status: 400 });
  }
});

authrouter.post('/logout', (req, res) => {
    res.send({ message: "Logged out successfully" });
})

module.exports = authrouter;