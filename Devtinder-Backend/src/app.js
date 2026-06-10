const express = require('express');
const crypto = require('crypto');
const helmet = require('helmet');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const swaggerUi = require('swagger-ui-express');
const swaggerDefinition = require('./config/swagger');
const app = express();
const cookieParser = require('cookie-parser');
require('dotenv').config();
app.use(cookieParser());
app.use(express.json());

// ── Security ──────────────────────────────────────────────────────────────────
app.use(helmet());

app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true,          // allow cookies to be sent cross-origin
}));

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,  // 15 minutes
  max: 100,                   // max 100 requests per IP per window
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests, please try again later.', status: 429 },
});
app.use(limiter);

// ── Request ID ────────────────────────────────────────────────────────────────
app.use((req, res, next) => {
  req.requestId = crypto.randomUUID();
  next();
});

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDefinition));

app.get('/health', (req, res) => res.status(200).json({ status: 'ok' }));


const authRouter = require('./router/auth');
const profileRouter = require('./router/profile');
const requestRouter = require('./router/request');
const userRouter = require('./router/user');
const projectRouter = require('./router/project');
const chatRouter = require('./router/chat');
const activityRouter = require('./router/activity');

app.use('/', authRouter);
app.use('/', profileRouter);
app.use('/', requestRouter);
app.use('/', userRouter);
app.use('/', projectRouter);
app.use('/', chatRouter);
app.use('/', activityRouter);

module.exports = app;
