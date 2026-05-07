import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
dotenv.config();

const prisma = new PrismaClient();

async function checkAdmin() {
  const email = 'admin@techatlas.io';
  const password = 'admin123';
  
  try {
    const user = await prisma.user.findUnique({
      where: { email },
      include: { roles: true }
    });
    
    if (!user) {
      console.log('User not found');
      return;
    }
    
    console.log('User found:', user.email);
    console.log('Roles:', user.roles.map(r => r.role));
    
    const isMatch = await bcrypt.compare(password, user.password);
    console.log('Password match:', isMatch);
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkAdmin();
