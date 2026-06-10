const User = require('../models/user');
const ConnectionRequest = require('../models/connectionRequest');
const { sendEmail } = require('../utils/mailer');

const ALLOWED_SEND_STATUS    = ['Ignore', 'Interested'];
const ALLOWED_RESPOND_STATUS = ['Accepted', 'Rejected'];

/**
 * Sends a connection request from one user to another.
 * @param {string} fromUserId  - logged-in user's _id
 * @param {string} toUserId    - target user's _id
 * @param {string} status      - "Ignore" | "Interested"
 * @returns {{ message: string, data: ConnectionRequest }}
 */
const sendRequest = async (fromUserId, toUserId, status) => {
  if (!ALLOWED_SEND_STATUS.includes(status)) {
    const err = new Error('Invalid status value');
    err.statusCode = 400;
    throw err;
  }

  const toUser = await User.findById(toUserId);
  if (!toUser) {
    const err = new Error('Target user not found');
    err.statusCode = 404;
    throw err;
  }

  const existing = await ConnectionRequest.findOne({
    $or: [
      { fromUserId, toUserId },
      { fromUserId: toUserId, toUserId: fromUserId },
    ],
  });
  if (existing) {
    const err = new Error('Connection request already exists between these users');
    err.statusCode = 400;
    throw err;
  }

  const connectionRequest = new ConnectionRequest({ fromUserId, toUserId, status });
  const data = await connectionRequest.save();

  if (status === 'Interested') {
    // Send email asynchronously
    const fromUser = await User.findById(fromUserId);
    if (fromUser && toUser.emailId) {
      sendEmail({
        to: toUser.emailId,
        subject: `New Connection Request from ${fromUser.firstName}`,
        html: `
          <div style="font-family: sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #ddd; border-radius: 8px;">
            <h2 style="color: #6366f1;">DevTinder Network</h2>
            <p>Hi ${toUser.firstName},</p>
            <p>You have a new connection request from <strong>${fromUser.firstName} ${fromUser.lastName || ''}</strong>.</p>
            <p>Log in to DevTinder to view their profile and accept the match!</p>
            <br/>
            <p style="font-size: 12px; color: #888;">This is an automated notification from DevTinder.</p>
          </div>
        `
      }).catch(console.error); // Catch errors avoiding blocking the request
    }
  }

  return {
    message: `${toUser.firstName} ${status === 'Interested' ? 'received your interest!' : 'has been ignored.'}`,
    data,
  };
};

/**
 * Accepts or rejects a pending connection request directed at the logged-in user.
 * @param {string} loggedInUserId  - _id of the user responding
 * @param {string} requestId       - _id of the ConnectionRequest document
 * @param {string} status          - "Accepted" | "Rejected"
 * @returns {{ message: string, data: ConnectionRequest }}
 */
const respondToRequest = async (loggedInUserId, requestId, status) => {
  if (!ALLOWED_RESPOND_STATUS.includes(status)) {
    const err = new Error('Invalid status value');
    err.statusCode = 400;
    throw err;
  }

  const connectionRequest = await ConnectionRequest.findOne({
    _id:      requestId,
    toUserId: loggedInUserId,
    status:   'Interested',
  });

  if (!connectionRequest) {
    const err = new Error('Connection request not found or already responded to');
    err.statusCode = 404;
    throw err;
  }

  connectionRequest.status = status;
  const data = await connectionRequest.save();

  return {
    message: `Connection request ${status.toLowerCase()} successfully`,
    data,
  };
};

module.exports = { sendRequest, respondToRequest };
