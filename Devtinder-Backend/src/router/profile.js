const express = require('express');
const { userAuth } = require('../middlewares/auth');
const { validateEditProfileData } = require('../utils/validation');
const bcrypt = require('bcrypt');
const profilerouter = express.Router();
 
profilerouter.get('/profile/view', userAuth, (req, res) => {
try{
  const user = req.user;
  if(!user){
    throw new Error("User not found");
  }
  res.send(user);}catch(error){
    res.status(400).json({ requestId: req.requestId, error: error.message, status: 400 });
  }
});

profilerouter.patch('/profile/edit', userAuth, async (req, res) => {
    try{
        if(!validateEditProfileData(req)){
            throw new Error("Invalid fields in request body");
        }
        const loggedinuser = req.user;
        Object.keys(req.body).forEach(field => {
            loggedinuser[field] = req.body[field];
        });
        await loggedinuser.save();

    
        res.end("Profile updated successfully" );
    }catch(error){
        return res.status(400).json({ requestId: req.requestId, error: error.message, status: 400 });
    }
})

profilerouter.patch('/profile/password', userAuth, async (req, res) => {
    try{
        const { oldPassword, newPassword } = req.body;
        const loggedinuser = req.user;
        const isMatch = await loggedinuser.validatePassword(oldPassword);
        if(!isMatch){
            throw new Error("Old password is incorrect");
        }
        const hashedNewPassword = await bcrypt.hash(newPassword, 10);
        loggedinuser.password = hashedNewPassword;
        await loggedinuser.save();
        res.send("Password updated successfully");
    }catch(error){
        return res.status(400).json({ requestId: req.requestId, error: error.message, status: 400 });
    }
})

module.exports = profilerouter;