const express = require('express');
const { userAuth } = require('../middlewares/auth');
const userRouter = express.Router();
const { getReceivedRequests, getConnections, getFeed } = require('../services/user.service');

userRouter.get('/user/requests/received', userAuth, async (req, res) => {
  try {
    const connectionRequests = await getReceivedRequests(req.user._id);
    res.json({ message: 'Connection requests fetched successfully', connectionRequests });
  } catch (error) {
    res.status(error.statusCode || 400).json({ requestId: req.requestId, error: error.message, status: error.statusCode || 400 });
  }
});

userRouter.get('/user/connections', userAuth, async (req, res) => {
  try {
    const data = await getConnections(req.user._id);
    res.json({ message: 'Connections fetched successfully', data });
  } catch (error) {
    res.status(error.statusCode || 400).json({ requestId: req.requestId, error: error.message, status: error.statusCode || 400 });
  }
});

userRouter.get('/feed', userAuth, async (req, res) => {
  try {
    const page  = parseInt(req.query.page)  || 1;
    const limit = parseInt(req.query.limit) || 10;
    const { skills, location, openToWork } = req.query;
    const filters = { skills, location, openToWork };
    const users = await getFeed(req.user._id, page, limit, filters);
    res.json({ data: users });
  } catch (error) {
    res.status(error.statusCode || 400).json({ requestId: req.requestId, error: error.message, status: error.statusCode || 400 });
  }
});

userRouter.get('/user/github/:username', userAuth, async (req, res) => {
  try {
    const { username } = req.params;
    const response = await fetch(`https://api.github.com/users/${username}/repos?sort=updated&per_page=5`);
    if (!response.ok) {
      if (response.status === 404) throw new Error('GitHub user not found');
      throw new Error('Failed to fetch from GitHub');
    }
    const repos = await response.json();
    const formattedRepos = repos.map(repo => ({
      id: repo.id,
      name: repo.name,
      description: repo.description,
      html_url: repo.html_url,
      language: repo.language,
      stargazers_count: repo.stargazers_count,
      updated_at: repo.updated_at
    }));
    res.json({ message: 'Repos fetched successfully', data: formattedRepos });
  } catch (error) {
    res.status(400).json({ requestId: req.requestId, error: error.message, status: 400 });
  }
});

module.exports = userRouter;