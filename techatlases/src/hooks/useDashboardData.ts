import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";

export function useDashboardData(filters: { region: string, category: string } = { region: 'All', category: 'All' }) {
  const summary = useQuery({
    queryKey: ["dashboard-summary"],
    queryFn: () => api.get('/developers/summary'),
  });

  const topTech = useQuery({
    queryKey: ["dashboard-top-tech", filters],
    queryFn: () => api.get(`/developers/top-tech?category=${filters.category}&region=${filters.region}`),
  });

  const aiAdoption = useQuery({
    queryKey: ["dashboard-ai-adoption"],
    queryFn: () => api.get('/developers/ai-adoption'),
  });

  const categoryInsights = useQuery({
    queryKey: ["dashboard-category-insights"],
    queryFn: () => api.get('/developers/category-insights'),
  });

  const devsByRegion = useQuery({
    queryKey: ["dashboard-devs-by-region"],
    queryFn: () => api.get('/developers/devs-by-region'),
  });

  const educationDist = useQuery({
    queryKey: ["dashboard-education"],
    queryFn: () => api.get('/developers/education-dist'),
  });

  const proficiencyByRegion = useQuery({
    queryKey: ["dashboard-proficiency-heatmap"],
    queryFn: () => api.get('/developers/proficiency-heatmap'),
  });

  const aiSentiment = useQuery({
    queryKey: ["dashboard-ai-sentiment"],
    queryFn: () => api.get('/developers/ai-sentiment'),
  });
  
  const salaryByRole = useQuery({
    queryKey: ["dashboard-salary-role"],
    queryFn: async () => {
      return [
        { role: 'Solutions Architect', avgSalary: 145000 },
        { role: 'ML Engineer', avgSalary: 138000 },
        { role: 'Backend Engineer', avgSalary: 125000 },
        { role: 'Fullstack Engineer', avgSalary: 118000 },
      ];
    },
  });

  const experienceDist = useQuery({
    queryKey: ["dashboard-experience"],
    queryFn: async () => [
      { range: '0-2', count: 45 },
      { range: '3-5', count: 68 },
      { range: '6-10', count: 112 },
      { range: '11-15', count: 54 },
      { range: '16-20', count: 28 },
      { range: '20+', count: 15 },
    ],
  });

  const isLoading =
    summary.isLoading || topTech.isLoading || aiAdoption.isLoading || 
    categoryInsights.isLoading || devsByRegion.isLoading || 
    educationDist.isLoading || proficiencyByRegion.isLoading || aiSentiment.isLoading;

  return {
    summary: summary.data || {
      developers: 0,
      technologies: 0,
      aiTools: 0,
      regions: 0,
      workProfiles: 0,
      aiUsage: 0,
      companies: 0,
    },
    isLoading,
    topTech: topTech.data ?? [],
    aiAdoption: aiAdoption.data ?? [],
    categoryInsights: categoryInsights.data ?? [],
    devsByRegion: devsByRegion.data ?? [],
    salaryByRole: salaryByRole.data ?? [],
    experienceDist: experienceDist.data ?? [],
    proficiencyByRegion: proficiencyByRegion.data ?? {},
    devsByEducation: educationDist.data ?? [],
    sentimentData: aiSentiment.data ?? { overall: [], byRole: [] },
  };
}
