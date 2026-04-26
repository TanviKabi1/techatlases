import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';

const prisma = new PrismaClient();

async function main() {
  const sqlFile = path.resolve('db/advanced_sql.sql');
  const sql = fs.readFileSync(sqlFile, 'utf8');

  // Simple splitting by semicolon (works for views)
  const statements = sql
    .split(';')
    .map(s => s.trim())
    .filter(s => s.length > 0 && !s.includes('DELIMITER') && !s.includes('//'));

  for (const statement of statements) {
    try {
      console.log(`Executing: ${statement.substring(0, 50)}...`);
      await prisma.$executeRawUnsafe(statement);
    } catch (error) {
      console.error(`Failed to execute: ${statement.substring(0, 50)}...`);
      console.error(error.message);
    }
  }
}

main().finally(() => prisma.$disconnect());
