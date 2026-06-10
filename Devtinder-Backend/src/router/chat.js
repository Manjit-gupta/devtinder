const express = require('express');
const { userAuth } = require('../middlewares/auth');
const Message = require('../models/message');
const ConnectionRequest = require('../models/connectionRequest');
const chatRouter = express.Router();

chatRouter.get('/chat/:targetUserId', userAuth, async (req, res) => {
    try {
        const { targetUserId } = req.params;
        const userId = req.user._id;

        // Verify they are connections
        const isConnection = await ConnectionRequest.findOne({
            $or: [
                { fromUserId: userId, toUserId: targetUserId, status: 'Accepted' },
                { fromUserId: targetUserId, toUserId: userId, status: 'Accepted' }
            ]
        });

        if (!isConnection) {
            return res.status(403).json({ error: "You can only chat with your accepted connections", status: 403 });
        }

        const messages = await Message.find({
            $or: [
                { senderId: userId, receiverId: targetUserId },
                { senderId: targetUserId, receiverId: userId }
            ]
        }).sort({ createdAt: 1 }).populate('senderId', 'firstName lastName photoUrl');

        res.json({ data: messages });
    } catch (error) {
        res.status(400).json({ error: error.message, status: 400 });
    }
});

module.exports = chatRouter;
