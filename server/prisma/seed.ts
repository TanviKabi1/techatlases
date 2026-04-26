import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // 1. Seed Regions
  const regions = [
    { name: 'North America', continent: 'Americas' },
    { name: 'Western Europe', continent: 'Europe' },
    { name: 'Eastern Europe', continent: 'Europe' },
    { name: 'South Asia', continent: 'Asia' },
    { name: 'East Asia', continent: 'Asia' },
    { name: 'Latin America', continent: 'Americas' },
    { name: 'Africa', continent: 'Africa' },
    { name: 'Oceania', continent: 'Oceania' },
    { name: 'Middle East', continent: 'Asia' },
    { name: 'Southeast Asia', continent: 'Asia' }
  ];

  for (const region of regions) {
    await prisma.region.upsert({
      where: { name: region.name },
      update: {},
      create: region,
    });
  }

  // 2. Seed Tech Categories
  const categories = [
    { name: 'Frontend', description: 'Web client side technologies and frameworks', popularityScore: 95 },
    { name: 'Backend', description: 'Server side logic, APIs and databases', popularityScore: 90 },
    { name: 'Data Science', description: 'Machine learning, data analysis and visualization', popularityScore: 85 },
    { name: 'DevOps', description: 'Infrastructure, monitoring and CI/CD', popularityScore: 80 },
    { name: 'Mobile', description: 'Mobile application development for iOS and Android', popularityScore: 75 },
    { name: 'AI & LLM', description: 'Artificial Intelligence and Large Language Models', popularityScore: 98 },
    { name: 'Cloud Computing', description: 'Cloud infrastructure and serverless solutions', popularityScore: 88 },
    { name: 'Cybersecurity', description: 'Application and infrastructure security', popularityScore: 70 },
    { name: 'Game Dev', description: 'Game engine development and interactive media', popularityScore: 65 },
    { name: 'Embedded', description: 'Firmware and low-level system programming', popularityScore: 60 }
  ];

  for (const cat of categories) {
    await prisma.techCategory.upsert({
      where: { name: cat.name },
      update: {},
      create: {
        name: cat.name,
        description: cat.description,
        popularityScore: cat.popularityScore
      },
    });
  }

  // 3. Seed Technologies
  const techMap: Record<string, string[]> = {
    'Frontend': ['React', 'Next.js', 'Vue.js', 'TypeScript', 'Tailwind CSS'],
    'Backend': ['Node.js', 'Python', 'Go', 'PostgreSQL', 'Rust'],
    'Data Science': ['PyTorch', 'Scikit-learn', 'Pandas'],
    'DevOps': ['Docker', 'Kubernetes'],
    'Mobile': ['React Native', 'Flutter'],
    'AI & LLM': ['OpenAI API', 'LangChain'],
    'Cloud Computing': ['AWS']
  };

  for (const [catName, techs] of Object.entries(techMap)) {
    const category = await prisma.techCategory.findUnique({ where: { name: catName } });
    if (category) {
      for (const techName of techs) {
        await prisma.technology.upsert({
          where: { name: techName },
          update: { categoryId: category.id },
          create: { name: techName, categoryId: category.id },
        });
      }
    }
  }

  // 4. Seed AI Tools
  const aiTools = [
    { name: 'GitHub Copilot', description: 'AI pair programmer for code autocompletion', category: 'Development' },
    { name: 'ChatGPT', description: 'General purpose LLM for research and drafting', category: 'Productivity' },
    { name: 'Claude 3', description: 'Anthropic model with long context window', category: 'Productivity' },
    { name: 'Cursor', description: 'AI-first code editor integrated with LLMs', category: 'Development' },
    { name: 'Midjourney', description: 'High-quality AI image generation', category: 'Design' },
    { name: 'v0.dev', description: 'Generative UI system for React/Tailwind', category: 'Frontend' },
    { name: 'Replit Ghostwriter', description: 'AI assistant for local and code coding', category: 'Development' },
    { name: 'Tabnine', description: 'Private AI code completion engine', category: 'Development' },
    { name: 'Phind', description: 'Search engine for developers powered by AI', category: 'Productivity' },
    { name: 'Perplexity', description: 'Conversational search and discovery', category: 'Productivity' }
  ];

  for (const tool of aiTools) {
    await prisma.aITool.upsert({
      where: { name: tool.name },
      update: {},
      create: tool,
    });
  }

  // 5. Seed Companies
  const industries = ['Finance', 'Education', 'Healthcare', 'E-commerce', 'Robotics', 'Deep Tech', 'Services', 'SaaS'];
  const sizes = ['Startup', 'Medium', 'Large', 'Enterprise'];
  const companyNames = ['Quantum Leap', 'EcoSync', 'CyberDyne', 'IndiTech', 'Nexus Systems', 'Alpha Stream', 'Beta Labs', 'Gamma Corp'];

  const dbRegions = await prisma.region.findMany();
  
  for (const name of companyNames) {
    await prisma.company.create({
      data: {
        name,
        size: sizes[Math.floor(Math.random() * sizes.length)],
        industry: industries[Math.floor(Math.random() * industries.length)],
        regionId: dbRegions[Math.floor(Math.random() * dbRegions.length)].id,
      }
    });
  }

  // 6. Seed Developers (200 records)
  const countries = ['USA', 'Germany', 'India', 'Japan', 'Brazil', 'Nigeria', 'UK', 'Canada'];
  const educationLevels = ['Bachelors', 'Masters', 'PhD', 'Associate', 'Self-taught'];

  console.log('Generating 200 developers...');
  const dbCompanies = await prisma.company.findMany();
  const dbTechs = await prisma.technology.findMany();
  const dbAiTools = await prisma.aITool.findMany();

  for (let i = 1; i <= 200; i++) {
    const dev = await prisma.developer.create({
      data: {
        name: `Talent_${i}`,
        email: `talent_${i}@techatlas.io`,
        age: 21 + (i % 35),
        country: countries[i % countries.length],
        regionId: dbRegions[Math.floor(Math.random() * dbRegions.length)].id,
        yearsCoding: 1 + (i % 22),
        educationLevel: educationLevels[i % educationLevels.length],
      }
    });

    // 7. Seed Work Profile
    const roles = ['Frontend Developer', 'Backend Engineer', 'Fullstack Engineer', 'Machine Learning Engineer', 'SRE/DevOps', 'Solutions Architect', 'Product Manager'];
    const empTypes = ['Full-time', 'Contract', 'Freelance'];
    const remoteTypes = ['Remote', 'On-site', 'Hybrid'];

    await prisma.workProfile.create({
      data: {
        developerId: dev.id,
        companyId: dbCompanies[Math.floor(Math.random() * dbCompanies.length)].id,
        jobRole: roles[Math.floor(Math.random() * roles.length)],
        employmentType: empTypes[Math.floor(Math.random() * empTypes.length)],
        salary: 45000 + Math.floor(Math.random() * 140000),
        remoteWork: remoteTypes[Math.floor(Math.random() * remoteTypes.length)],
      }
    });

    // 8. Tech Proficiencies (3-7 per dev)
    const numTechs = 3 + Math.floor(Math.random() * 4);
    const selectedTechs = dbTechs.sort(() => 0.5 - Math.random()).slice(0, numTechs);

    for (const tech of selectedTechs) {
      await prisma.developerTech.create({
        data: {
          developerId: dev.id,
          technologyId: tech.id,
          proficiency: 1 + Math.floor(Math.random() * 4),
          yearsUsed: 1 + Math.floor(Math.random() * 12),
        }
      });
    }

    // 9. AI Tool Usage (2-4 per dev)
    const numAi = 2 + Math.floor(Math.random() * 2);
    const selectedAi = dbAiTools.sort(() => 0.5 - Math.random()).slice(0, numAi);
    const sentiments = ['Positive', 'Neutral', 'Negative'];
    const useCases = ['Production Coding', 'Learning/Upskilling', 'Automation'];

    for (const tool of selectedAi) {
      await prisma.usesAI.create({
        data: {
          developerId: dev.id,
          aiToolId: tool.id,
          sentiment: sentiments[Math.floor(Math.random() * sentiments.length)],
          useCase: useCases[Math.floor(Math.random() * useCases.length)],
          adoptionScore: 1 + Math.floor(Math.random() * 9),
        }
      });
    }
  }

  // 10. Admin User
  const adminEmail = 'admin@techatlas.io';
  const hashedPassword = await bcrypt.hash('admin123', 10);
  
  await prisma.user.upsert({
    where: { email: adminEmail },
    update: {},
    create: {
      email: adminEmail,
      password: hashedPassword,
      roles: {
        create: { role: 'admin' }
      },
      profile: {
        create: {
          email: adminEmail,
          displayName: 'System Admin'
        }
      }
    }
  });

  console.log('Seeding completed successfully.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
