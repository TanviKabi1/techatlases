import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import dotenv from 'dotenv';
import prisma from './lib/prisma.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors({
  origin: true, 
  credentials: true
}));
app.use(express.json());
app.use(morgan('dev'));


app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  
  res.setHeader("Content-Security-Policy", "default-src * 'unsafe-inline' 'unsafe-eval' data: blob:; script-src * 'unsafe-inline' 'unsafe-eval'; style-src * 'unsafe-inline';");
  next();
});

app.get('/api/health-check', async (req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    res.json({ status: 'ok', database: 'connected', environment: process.env.NODE_ENV });
  } catch (err) {
    res.status(500).json({ 
      status: 'error', 
      database: 'disconnected', 
      error: err.message,
      code: err.code,
      meta: err.meta
    });
  }
});

// Mount routes
import authRoutes from './routes/auth.js';
import developerRoutes from './routes/developers.js';
import techRoutes from './routes/technologies.js';
import aiRoutes from './routes/aitools.js';
import crudRoutes from './routes/crud.js';
import serviceRoutes from './routes/services.js';

app.use('/api/auth', authRoutes);
app.use('/api/developers', developerRoutes);
app.use('/api/technologies', techRoutes);
app.use('/api/ai-tools', aiRoutes);
app.use('/api/crud', crudRoutes);
app.use('/api/services', serviceRoutes);

if (process.env.NODE_ENV !== 'production' || process.env.VERCEL !== '1') {
  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

// Global Error Handler for debugging production
app.use((err, req, res, next) => {
  console.error('SERVER ERROR:', err);
  res.status(500).json({ 
    error: 'Internal Server Error', 
    message: err.message,
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
  });
});

export default app;
export { prisma };
