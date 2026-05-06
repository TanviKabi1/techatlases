import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function main() {
  console.log('Seeding database...');

  try {
    // 0. Cleanup existing data (order matters for foreign keys)
    await prisma.developerTechnology.deleteMany({});
    await prisma.developerAITool.deleteMany({});
    await prisma.developer.deleteMany({});
    await prisma.aITool.deleteMany({});
    await prisma.technology.deleteMany({});
    await prisma.techCategory.deleteMany({});
    await prisma.region.deleteMany({});
    await prisma.user.deleteMany({});

    console.log('Cleanup complete.');

    // 1. Create Admin User
    const admin = await prisma.user.create({
      data: {
        email: 'admin@techatlas.io',
        password: 'admin123', // In a real app, use bcrypt here
        role: 'ADMIN',
        name: 'System Admin'
      }
    });
    console.log('Admin user created.');

    // 2. Create Regions
    const regionsData = [
      { name: 'North America', continent: 'Americas' },
      { name: 'Western Europe', continent: 'Europe' },
      { name: 'East Asia', continent: 'Asia' },
      { name: 'South Asia', continent: 'Asia' },
      { name: 'Southeast Asia', continent: 'Asia' },
      { name: 'Latin America', continent: 'Americas' }
    ];

    const regions = [];
    for (const r of regionsData) {
      const region = await prisma.region.create({ data: r });
      regions.push(region);
    }
    console.log('Regions created.');

    // 3. Create Categories & Tech
    const category = await prisma.techCategory.create({
      data: { name: 'Programming Languages' }
    });

    const techs = ['JavaScript', 'TypeScript', 'Python', 'Java', 'Go', 'Rust'];
    for (const t of techs) {
      await prisma.technology.create({
        data: { name: t, category_id: category.id }
      });
    }
    console.log('Tech data created.');

    // 4. Create sample developers (First 10 for quick seed)
    for (let i = 1; i <= 20; i++) {
      await prisma.developer.create({
        data: {
          name: `Developer ${i}`,
          email: `dev${i}@example.com`,
          country: 'India',
          region_id: regions[i % regions.length].id,
          age: 20 + i,
          years_coding: i,
          education_level: "Bachelor's Degree",
          is_remote: true
        }
      });
    }
    console.log('Sample developers created.');

    console.log('Seeding complete successfully!');
    return true;
  } catch (error) {
    console.error('Seeding error:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Allow running directly
if (process.argv[1] && process.argv[1].endsWith('seed.js')) {
  main().catch(e => {
    console.error(e);
    process.exit(1);
  });
}
