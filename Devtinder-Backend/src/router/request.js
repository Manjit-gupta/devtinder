const express = require('express');
const { userAuth } = require('../middlewares/auth');
const { sendRequest, respondToRequest } = require('../services/request.service');
const requestrouter = express.Router();

requestrouter.post('/request/send/:status/:toUserId', userAuth, async (req, res) => {
  try {
    const result = await sendRequest(req.user._id, req.params.toUserId, req.params.status);
    res.json(result);
  } catch (error) {
    res.status(error.statusCode || 400).json({ requestId: req.requestId, error: error.message, status: error.statusCode || 400 });
  }
});

requestrouter.post('/request/respond/:status/:requestId', userAuth, async (req, res) => {
  try {
    const result = await respondToRequest(req.user._id, req.params.requestId, req.params.status);
    res.json(result);
  } catch (error) {
    res.status(error.statusCode || 400).json({ requestId: req.requestId, error: error.message, status: error.statusCode || 400 });
  }
});

module.exports = requestrouter;