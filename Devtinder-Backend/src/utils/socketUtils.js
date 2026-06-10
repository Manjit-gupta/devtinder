const { Server } = require("socket.io");
const jwt = require("jsonwebtoken");
const User = require("../models/user");
const Message = require("../models/message");

const initializeSocket = (server) => {
    const io = new Server(server, {
        cors: {
            origin: process.env.CLIENT_URL || "http://localhost:5173",
            credentials: true
        }
    });

    // Authenticate socket connections using JWT from cookies
    io.use(async (socket, next) => {
        try {
            // Get token from cookie (requires the frontend to send requests with credentials)
            // Since cookie parsing isn't native to socket headers easily, 
            // the safest way is forcing the client to pass the token in auth.
            const token = socket.handshake.auth.token;
            if (!token) return next(new Error("Authentication error"));

            const decodedObj = jwt.verify(token, process.env.JWT_SECRET || 'DEV@Tinder$790');
            const user = await User.findById(decodedObj._id);
            if (!user) return next(new Error("User not found"));

            socket.user = user;
            next();
        } catch (error) {
            next(new Error("Authentication error"));
        }
    });

    io.on("connection", (socket) => {
        // User joins a room named by their own User ID.
        // This allows anyone checking if they are connected to emit directly to `userId`
        socket.join(socket.user._id.toString());

        socket.on("sendMessage", async ({ receiverId, text }, callback) => {
            try {
                // Save to DB
                const message = new Message({
                    senderId: socket.user._id,
                    receiverId,
                    text
                });
                await message.save();

                const populatedMessage = await message.populate('senderId', 'firstName lastName photoUrl');

                // Emit to the receiver's personal room
                io.to(receiverId).emit("receiveMessage", populatedMessage);

                // Send success callback to sender
                if (typeof callback === "function") callback({ status: "ok", data: populatedMessage });
            } catch (error) {
                console.error("Socket send message error:", error);
                if (typeof callback === "function") callback({ status: "error", error: error.message });
            }
        });

        socket.on("typing", ({ receiverId }) => {
            io.to(receiverId).emit("typing", { senderId: socket.user._id });
        });

        socket.on("stopTyping", ({ receiverId }) => {
            io.to(receiverId).emit("stopTyping", { senderId: socket.user._id });
        });

        socket.on("disconnect", () => {
            // Cleanup happens automatically, user leaves all rooms
        });
    });

    return io;
};

module.exports = { initializeSocket };
