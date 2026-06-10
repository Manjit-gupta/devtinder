const User = require('../models/user');
const ConnectionRequest = require('../models/connectionRequest');

const USER_SAFE_DATA = 'firstName lastName photoUrl gender skills bio about age location openToWork experienceYears githubUrl endorsements';

/**
 * Returns pending (Interested) connection requests sent TO the given user.
 * @param {string} userId
 */
const getReceivedRequests = async (userId) => {
  const connectionRequests = await ConnectionRequest.find({
    toUserId: userId,
    status: 'Interested',
  }).populate('fromUserId', ['firstName', 'lastName', 'photoUrl', 'skills']);

  return connectionRequests;
};

/**
 * Returns all accepted connections for the given user,
 * resolving the "other" user from each connection row.
 * @param {string} userId
 */
const getConnections = async (userId) => {
  const rows = await ConnectionRequest.find({
    $or: [
      { fromUserId: userId, status: 'Accepted' },
      { toUserId:   userId, status: 'Accepted' },
    ],
  })
    .populate('fromUserId', USER_SAFE_DATA)
    .populate('toUserId',   USER_SAFE_DATA);

  const data = rows.map((row) =>
    row.fromUserId._id.toString() === userId.toString()
      ? row.toUserId
      : row.fromUserId
  );

  return data;
};

/**
 * Returns a paginated list of users that the logged-in user has not yet
 * interacted with (i.e. not in any existing connection request).
 * @param {string} userId
 * @param {number} page
 * @param {number} limit  (capped at 50)
 */
const getFeed = async (userId, page = 1, limit = 10, filters = {}) => {
  limit = Math.min(limit, 50);
  const skip = (page - 1) * limit;

  const existingRequests = await ConnectionRequest.find({
    $or: [{ fromUserId: userId }, { toUserId: userId }],
  }).select('fromUserId toUserId');

  const excludeIds = new Set([userId.toString()]);
  existingRequests.forEach((row) => {
    excludeIds.add(row.fromUserId.toString());
    excludeIds.add(row.toUserId.toString());
  });

  const query = { _id: { $nin: Array.from(excludeIds) } };

  if (filters?.skills) {
    // case-insensitive array match
    const skillList = filters.skills.split(',').map(s => s.trim());
    if (skillList.length > 0) {
      query.skills = { $in: skillList.map(s => new RegExp(`^${s}$`, 'i')) };
    }
  }

  if (filters?.location) {
    query.location = new RegExp(filters.location, 'i');
  }

  if (filters?.openToWork === 'true') {
    query.openToWork = true;
  }

  const users = await User.find(query)
    .select(USER_SAFE_DATA)
    .skip(skip)
    .limit(limit);

  return users;
};

module.exports = { getReceivedRequests, getConnections, getFeed };
