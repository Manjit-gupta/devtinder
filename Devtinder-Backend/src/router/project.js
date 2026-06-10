const express = require('express');
const { userAuth } = require('../middlewares/auth');
const Project = require('../models/project');
const projectRouter = express.Router();

// Retrieve all projects of a user
projectRouter.get('/project/user/:userId', userAuth, async (req, res) => {
    try {
        const projects = await Project.find({ userId: req.params.userId }).sort({ createdAt: -1 });
        res.json({ data: projects });
    } catch (error) {
        res.status(400).json({ requestId: req.requestId, error: error.message, status: 400 });
    }
});

// Retrieve my projects
projectRouter.get('/project/me', userAuth, async (req, res) => {
    try {
        const projects = await Project.find({ userId: req.user._id }).sort({ createdAt: -1 });
        res.json({ data: projects });
    } catch (error) {
        res.status(400).json({ requestId: req.requestId, error: error.message, status: 400 });
    }
});

// Create a project
projectRouter.post('/project', userAuth, async (req, res) => {
    try {
        const { title, description, techStack, repoLink, liveLink, imageUrl } = req.body;
        
        if (!title || !description) {
            throw new Error("Title and description are required");
        }

        const project = new Project({
            userId: req.user._id,
            title,
            description,
            techStack,
            repoLink,
            liveLink,
            imageUrl
        });

        await project.save();
        res.status(201).json({ message: "Project created successfully", data: project });
    } catch (error) {
        res.status(400).json({ requestId: req.requestId, error: error.message, status: 400 });
    }
});

// Delete a project
projectRouter.delete('/project/:projectId', userAuth, async (req, res) => {
    try {
        const project = await Project.findOneAndDelete({
            _id: req.params.projectId,
            userId: req.user._id // Ensure user owns the project
        });

        if (!project) {
            throw new Error("Project not found or unauthorized");
        }

        res.json({ message: "Project deleted successfully" });
    } catch (error) {
        res.status(400).json({ requestId: req.requestId, error: error.message, status: 400 });
    }
});

module.exports = projectRouter;
