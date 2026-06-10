const http = require('http');
const app = require('./app');
const { initializeSocket } = require('./utils/socketUtils');
const connectDB = require('./config/database');

const PORT = process.env.PORT || 3000;

connectDB()
  .then(() => {
    console.log("Database connected successfully");
    
    const server = http.createServer(app);
    initializeSocket(server);
    
    server.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  })
  .catch((error) => {
    console.error("Database connection failed:", error);
  });
