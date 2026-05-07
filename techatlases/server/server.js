import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import dotenv from 'dotenv';
import prisma from './lib/prisma.js';
import bcrypt from 'bcryptjs';

import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '.env') });

const app = express();
const PORT = process.env.PORT || 3000;

// Log environment status (masked)
const dbUrl = process.env.DATABASE_URL || '';
const maskedUrl = dbUrl.replace(/\/\/.*@/, '//****:****@');
console.log(`[Server Sub] Starting in ${process.env.NODE_ENV} mode`);
console.log(`[Server Sub] DATABASE_URL: ${maskedUrl || 'MISSING'}`);
console.log(`[Server Sub] JWT_SECRET: ${process.env.JWT_SECRET ? 'SET' : 'MISSING'}`);

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

app.get('/api/health', async (req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    res.json({ 
      status: 'ok', 
      database: 'connected', 
      provider: 'mysql',
      env: process.env.NODE_ENV
    });
  } catch (error) {
    res.status(500).json({ 
      status: 'error', 
      database: 'disconnected', 
      error: error.message
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

// Database initialization route (run once on deployment)
import fs from 'fs';
app.post('/api/init-db', async (req, res) => {
  try {
    const sqlFile = path.resolve('db/advanced_sql.sql');
    if (!fs.existsSync(sqlFile)) {
      return res.status(404).json({ error: 'SQL file not found' });
    }
    const sql = fs.readFileSync(sqlFile, 'utf8');
    const statements = sql
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0 && !s.includes('DELIMITER') && !s.includes('//'));

    const results = [];
    for (const statement of statements) {
      try {
        await prisma.$executeRawUnsafe(statement);
        results.push({ statement: statement.substring(0, 50) + '...', status: 'success' });
      } catch (err) {
        results.push({ statement: statement.substring(0, 50) + '...', status: 'error', message: err.message });
      }
    }

    // Ensure a default admin user exists
    const userCount = await prisma.user.count();
    if (userCount === 0) {
      const adminEmail = 'admin@techatlas.io';
      const hashedPassword = await bcrypt.hash('admin123', 10);
      await prisma.user.create({
        data: {
          email: adminEmail,
          password: hashedPassword,
          roles: { create: { role: 'admin' } },
          profile: { create: { email: adminEmail, displayName: 'System Admin' } }
        }
      });
      results.push({ statement: 'Seed default admin', status: 'success' });
    }

    res.json({ message: 'Database initialization complete', results });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

if (process.env.NODE_ENV !== 'production' || process.env.VERCEL !== '1') {
  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

export default app;
export { prisma };
