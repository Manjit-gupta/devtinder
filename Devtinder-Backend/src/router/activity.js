const express = require('express');
const { userAuth } = require('../middlewares/auth');
const User = require('../models/user');
const Project = require('../models/project');
const ConnectionRequest = require('../models/connectionRequest');
const activityRouter = express.Router();

// Fetch chronologically sorted projects from all accepted connections
activityRouter.get('/activity', userAuth, async (req, res) => {
    try {
        const userId = req.user._id;

        // Find all accepted connection requests
        const connections = await ConnectionRequest.find({
            $or: [
                { fromUserId: userId, status: 'Accepted' },
                { toUserId: userId, status: 'Accepted' }
            ]
        });

        // Get array of connection ObjectIds
        const connectionIds = connections.map(c => 
            c.fromUserId.toString() === userId.toString() ? c.toUserId : c.fromUserId
        );

        // Include own ID to see your own activity optionally, but usually activity feed is friends
        // We will just do connectionIds
        if (connectionIds.length === 0) {
            return res.json({ data: [] }); // No connections, no activity
        }

        // Fetch projects created by these connections, sorted by newest
        const activityFeed = await Project.find({
            userId: { $in: connectionIds }
        })
        .sort({ createdAt: -1 })
        .limit(20) // top 20 recent activities
        .populate('userId', 'firstName lastName photoUrl title');

        res.json({ data: activityFeed });
    } catch (error) {
        res.status(400).json({ error: error.message, status: 400 });
    }
});

// Toggle an endorsement on a user's skill
activityRouter.post('/endorse/:targetUserId', userAuth, async (req, res) => {
    try {
        const { targetUserId } = req.params;
        const { skill } = req.body;
        const userId = req.user._id;

        if (!skill) throw new Error("Skill is required to endorse");
        
        // Verify they are connections
        const isConnection = await ConnectionRequest.findOne({
            $or: [
                { fromUserId: userId, toUserId: targetUserId, status: 'Accepted' },
                { fromUserId: targetUserId, toUserId: userId, status: 'Accepted' }
            ]
        });

        if (!isConnection) {
            return res.status(403).json({ error: "You can only endorse your accepted connections", status: 403 });
        }

        const targetUser = await User.findById(targetUserId);
        if (!targetUser) throw new Error("Target user not found");

        if (!targetUser.skills.some(s => s.toLowerCase() === skill.toLowerCase())) {
            throw new Error("Target user does not have this skill listed");
        }

        // Initialize endorsements if empty or undefined
        if (!targetUser.endorsements) targetUser.endorsements = [];

        let skillEndorsement = targetUser.endorsements.find(e => e.skill.toLowerCase() === skill.toLowerCase());
        
        if (!skillEndorsement) {
            // First endorsement for this skill
            targetUser.endorsements.push({ skill, endorsers: [userId] });
        } else {
            // Check if already endorsed
            const hasEndorsed = skillEndorsement.endorsers.includes(userId);
            if (hasEndorsed) {
                // Remove endorsement
                skillEndorsement.endorsers = skillEndorsement.endorsers.filter(id => id.toString() !== userId.toString());
            } else {
                // Add endorsement
                skillEndorsement.endorsers.push(userId);
            }
        }

        await targetUser.save();
        res.json({ message: "Endorsement updated", data: targetUser.endorsements });
    } catch (error) {
        res.status(400).json({ error: error.message, status: 400 });
    }
});

module.exports = activityRouter;
