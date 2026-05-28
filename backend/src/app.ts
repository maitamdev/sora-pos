import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import { env } from './config/env';
import routes from './routes';
import { errorMiddleware } from './middlewares/error.middleware';

const app = express();

// ===== MIDDLEWARES =====
// Logger
app.use(morgan('dev'));

// CORS
const allowedOrigins = env.corsOrigin.split(',').map(o => o.trim());
app.use(cors({
  origin: allowedOrigins.length === 1 && allowedOrigins[0] === '*' ? '*' : allowedOrigins,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// Parse JSON body
app.use(express.json({ limit: '10mb' }));

// Parse URL-encoded body
app.use(express.urlencoded({ extended: true }));

// ===== ROUTES =====
app.use('/api', routes);

// ===== ERROR HANDLING =====
app.use(errorMiddleware);

// 404 handler
app.use((_req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route không tồn tại',
  });
});

export default app;
