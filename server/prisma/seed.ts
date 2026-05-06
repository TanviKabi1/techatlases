import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

export async function main() {
  console.log('Seeding database...');

  // 0. Cleanup existing data (order matters for foreign keys)
  console.log('Cleaning up old data...');
  await prisma.usesAI.deleteMany();
  await prisma.developerTech.deleteMany();
  await prisma.workProfile.deleteMany();
  await prisma.developer.deleteMany();
  await prisma.company.deleteMany();
  console.log('Cleanup complete.');

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
    'Frontend': ['React', 'Next.js', 'Vue.js', 'TypeScript', 'Tailwind CSS', 'Angular', 'Svelte'],
    'Backend': ['Node.js', 'Python', 'Go', 'PostgreSQL', 'Rust', 'Ruby on Rails', 'Java Spring'],
    'Data Science': ['PyTorch', 'Scikit-learn', 'Pandas', 'TensorFlow', 'R'],
    'DevOps': ['Docker', 'Kubernetes', 'Terraform', 'GitHub Actions'],
    'Mobile': ['React Native', 'Flutter', 'Swift', 'Kotlin'],
    'AI & LLM': ['OpenAI API', 'LangChain', 'LlamaIndex', 'Hugging Face'],
    'Cloud Computing': ['AWS', 'Google Cloud', 'Azure', 'Vercel']
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
    { name: 'Replit Ghostwriter', description: 'AI assistant for local and cloud coding', category: 'Development' },
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

  // Define Country Profiles for better distribution
  const countryProfiles: Record<string, { region: string, prefTech: string[], prefAI: string[], count: number }> = {
    'USA': { region: 'North America', prefTech: ['Python', 'PyTorch', 'AWS', 'OpenAI API'], prefAI: ['ChatGPT', 'GitHub Copilot'], count: 40 },
    'India': { region: 'South Asia', prefTech: ['React', 'Node.js', 'Flutter', 'TypeScript'], prefAI: ['GitHub Copilot', 'v0.dev'], count: 50 },
    'Germany': { region: 'Western Europe', prefTech: ['Rust', 'Go', 'Kubernetes', 'Docker'], prefAI: ['Claude 3', 'Tabnine'], count: 25 },
    'UK': { region: 'Western Europe', prefTech: ['TypeScript', 'Next.js', 'Node.js', 'AWS'], prefAI: ['GitHub Copilot', 'Phind'], count: 20 },
    'Japan': { region: 'East Asia', prefTech: ['Vue.js', 'TypeScript', 'PostgreSQL'], prefAI: ['Midjourney', 'Cursor'], count: 15 },
    'Brazil': { region: 'Latin America', prefTech: ['React Native', 'Tailwind CSS', 'Node.js'], prefAI: ['ChatGPT', 'Claude 3'], count: 15 },
    'Nigeria': { region: 'Africa', prefTech: ['React', 'Node.js', 'Next.js'], prefAI: ['ChatGPT', 'Perplexity'], count: 15 },
    'Canada': { region: 'North America', prefTech: ['Python', 'Pandas', 'Scikit-learn'], prefAI: ['OpenAI API', 'Claude 3'], count: 15 },
    'Australia': { region: 'Oceania', prefTech: ['React', 'Next.js', 'AWS'], prefAI: ['GitHub Copilot', 'Phind'], count: 10 },
    'France': { region: 'Western Europe', prefTech: ['Vue.js', 'Node.js', 'Docker'], prefAI: ['Claude 3', 'Phind'], count: 10 },
  };

  // 5. Seed Companies
  const industries = ['Finance', 'Education', 'Healthcare', 'E-commerce', 'Robotics', 'Deep Tech', 'Services', 'SaaS'];
  const sizes = ['Startup', 'Medium', 'Large', 'Enterprise'];
  
  console.log('Generating companies...');
  const dbRegions = await prisma.region.findMany();
  const regionMap = Object.fromEntries(dbRegions.map(r => [r.name, r.id]));

  for (const [country, profile] of Object.entries(countryProfiles)) {
    const regionId = regionMap[profile.region];
    if (!regionId) continue;

    // Create 1-2 companies per country
    for (let j = 0; j < 2; j++) {
      await prisma.company.create({
        data: {
          name: `${country} ${industries[Math.floor(Math.random() * industries.length)]} ${j+1}`,
          size: sizes[Math.floor(Math.random() * sizes.length)] ?? "Medium",
          industry: industries[Math.floor(Math.random() * industries.length)] ?? "Services",
          region: { connect: { id: regionId } },

        }
      });
    }
  }

  // 6. Seed Developers
  const educationLevels = ['Bachelors', 'Masters', 'PhD', 'Associate', 'Self-taught'];
  const roles = ['Frontend Developer', 'Backend Engineer', 'Fullstack Engineer', 'Machine Learning Engineer', 'SRE/DevOps', 'Solutions Architect', 'Product Manager'];
  const empTypes = ['Full-time', 'Contract', 'Freelance'];
  const remoteTypes = ['Remote', 'On-site', 'Hybrid'];
  const sentiments = ['Positive', 'Neutral', 'Negative'];
  const useCases = ['Production Coding', 'Learning/Upskilling', 'Automation'];

  const dbCompanies = await prisma.company.findMany();
  const dbTechs = await prisma.technology.findMany();
  const dbAiTools = await prisma.aITool.findMany();

  console.log('Generating developers with country-specific profiles...');
  let totalDevsCreated = 0;

  for (const [country, profile] of Object.entries(countryProfiles)) {
    const regionId = regionMap[profile.region];
    if (!regionId) continue;

    const countryCompanies = dbCompanies.filter(c => c.regionId === regionId);

    for (let i = 0; i < profile.count; i++) {
      const dev = await prisma.developer.create({
        data: {
          name: `Talent_${country}_${i}`,
          email: `talent_${country}_${i}@techatlas.io`,
          age: 21 + Math.floor(Math.random() * 30),
          country: country,
          region: { connect: { id: regionId } },

          yearsCoding: 1 + Math.floor(Math.random() * 20),
          educationLevel: educationLevels[Math.floor(Math.random() * educationLevels.length)] ?? "Bachelors",
        }
      });

      // 7. Work Profile
      const randomCompany = countryCompanies.length > 0 
        ? countryCompanies[Math.floor(Math.random() * countryCompanies.length)]
        : dbCompanies[Math.floor(Math.random() * dbCompanies.length)];

      if (randomCompany) {
        await prisma.workProfile.create({
          data: {
            developerId: dev.id,
            companyId: randomCompany.id,
            jobRole: roles[Math.floor(Math.random() * roles.length)] ?? "Fullstack Engineer",
            employmentType: empTypes[Math.floor(Math.random() * empTypes.length)] ?? "Full-time",
            salary: 45000 + Math.floor(Math.random() * 140000),
            remoteWork: remoteTypes[Math.floor(Math.random() * remoteTypes.length)] ?? "Remote",
          }
        });
      }

      // 8. Tech Proficiencies (3-7 per dev, weighted by profile)
      const numTechs = 3 + Math.floor(Math.random() * 4);
      const countryTechs = dbTechs.filter(t => profile.prefTech.includes(t.name));
      const otherTechs = dbTechs.filter(t => !profile.prefTech.includes(t.name));
      
      // Pick 2-3 from preferred, rest from others
      const selectedTechs = [
        ...countryTechs.sort(() => 0.5 - Math.random()).slice(0, 2 + Math.floor(Math.random() * 2)),
        ...otherTechs.sort(() => 0.5 - Math.random()).slice(0, numTechs - 2)
      ].slice(0, numTechs);

      for (const tech of selectedTechs) {
        await prisma.developerTech.create({
          data: {
            developerId: dev.id,
            technologyId: tech.id,
            proficiency: 1 + Math.floor(Math.random() * 4),
            yearsUsed: 1 + Math.floor(Math.random() * 10),
          }
        });
      }

      // 9. AI Tool Usage (2-4 per dev, weighted by profile)
      const numAi = 2 + Math.floor(Math.random() * 2);
      const countryAi = dbAiTools.filter(t => profile.prefAI.includes(t.name));
      const otherAi = dbAiTools.filter(t => !profile.prefAI.includes(t.name));

      const selectedAi = [
        ...countryAi.sort(() => 0.5 - Math.random()).slice(0, 2),
        ...otherAi.sort(() => 0.5 - Math.random()).slice(0, numAi - 2)
      ].slice(0, numAi);

      for (const tool of selectedAi) {
        await prisma.usesAI.create({
          data: {
            developerId: dev.id,
            aiToolId: tool.id,
            sentiment: sentiments[Math.floor(Math.random() * sentiments.length)] ?? "Neutral",
            useCase: useCases[Math.floor(Math.random() * useCases.length)] ?? "Automation",
            adoptionScore: 1 + Math.floor(Math.random() * 9),
          }
        });
      }
      totalDevsCreated++;
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

  console.log(`Seeding completed successfully. Created ${totalDevsCreated} developers.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
