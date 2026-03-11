import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export function useDashboardData() {
  const devCount = useQuery({
    queryKey: ["dashboard-dev-count"],
    queryFn: async () => {
      const { count } = await supabase.from("developers").select("*", { count: "exact", head: true });
      return count ?? 0;
    },
  });

  const techCount = useQuery({
    queryKey: ["dashboard-tech-count"],
    queryFn: async () => {
      const { count } = await supabase.from("technology").select("*", { count: "exact", head: true });
      return count ?? 0;
    },
  });

  const aiToolCount = useQuery({
    queryKey: ["dashboard-ai-count"],
    queryFn: async () => {
      const { count } = await supabase.from("ai_tool").select("*", { count: "exact", head: true });
      return count ?? 0;
    },
  });

  const regionCount = useQuery({
    queryKey: ["dashboard-region-count"],
    queryFn: async () => {
      const { count } = await supabase.from("region").select("*", { count: "exact", head: true });
      return count ?? 0;
    },
  });

  const workProfileCount = useQuery({
    queryKey: ["dashboard-wp-count"],
    queryFn: async () => {
      const { count } = await supabase.from("work_profile").select("*", { count: "exact", head: true });
      return count ?? 0;
    },
  });

  const aiUsageCount = useQuery({
    queryKey: ["dashboard-ai-usage-count"],
    queryFn: async () => {
      const { count } = await supabase.from("uses_ai").select("*", { count: "exact", head: true });
      return count ?? 0;
    },
  });

  const companyCount = useQuery({
    queryKey: ["dashboard-company-count"],
    queryFn: async () => {
      const { count } = await supabase.from("company").select("*", { count: "exact", head: true });
      return count ?? 0;
    },
  });

  // Top technologies by developer count
  const topTech = useQuery({
    queryKey: ["dashboard-top-tech"],
    queryFn: async () => {
      const { data } = await supabase.from("developer_technology_view").select("technology_name");
      if (!data) return [];
      const counts: Record<string, number> = {};
      data.forEach((r) => {
        if (r.technology_name) counts[r.technology_name] = (counts[r.technology_name] || 0) + 1;
      });
      return Object.entries(counts)
        .map(([name, count]) => ({ name, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 10);
    },
  });

  // AI tool adoption
  const aiAdoption = useQuery({
    queryKey: ["dashboard-ai-adoption"],
    queryFn: async () => {
      const { data } = await supabase.from("ai_tool_usage_view").select("tool_name");
      if (!data) return [];
      const counts: Record<string, number> = {};
      data.forEach((r) => {
        if (r.tool_name) counts[r.tool_name] = (counts[r.tool_name] || 0) + 1;
      });
      return Object.entries(counts)
        .map(([name, count]) => ({ name, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 8);
    },
  });

  // Tech category distribution
  const categoryInsights = useQuery({
    queryKey: ["dashboard-category-insights"],
    queryFn: async () => {
      const { data } = await supabase
        .from("tech_category_insights")
        .select("category_name, developer_count, technology_count, avg_proficiency")
        .order("developer_count", { ascending: false });
      return (data ?? []).filter((d) => d.category_name).slice(0, 8);
    },
  });

  // Developers by region
  const devsByRegion = useQuery({
    queryKey: ["dashboard-devs-by-region"],
    queryFn: async () => {
      const { data } = await supabase.from("developer_technology_view").select("region_name");
      if (!data) return [];
      const counts: Record<string, number> = {};
      data.forEach((r) => {
        if (r.region_name) {
          counts[r.region_name] = (counts[r.region_name] || 0) + 1;
        }
      });
      return Object.entries(counts)
        .map(([name, count]) => ({ name, count }))
        .sort((a, b) => b.count - a.count);
    },
  });

  // Salary by job role
  const salaryByRole = useQuery({
    queryKey: ["dashboard-salary-role"],
    queryFn: async () => {
      const { data } = await supabase
        .from("developer_technology_view")
        .select("job_role, salary, developer_id");
      if (!data) return [];
      const roleData: Record<string, { total: number; count: number }> = {};
      const seen = new Set<string>();
      data.forEach((r) => {
        if (r.job_role && r.salary && r.developer_id) {
          const key = `${r.developer_id}-${r.job_role}`;
          if (!seen.has(key)) {
            seen.add(key);
            if (!roleData[r.job_role]) roleData[r.job_role] = { total: 0, count: 0 };
            roleData[r.job_role].total += Number(r.salary);
            roleData[r.job_role].count += 1;
          }
        }
      });
      return Object.entries(roleData)
        .map(([role, d]) => ({ role, avgSalary: Math.round(d.total / d.count) }))
        .sort((a, b) => b.avgSalary - a.avgSalary)
        .slice(0, 8);
    },
  });

  // Experience distribution
  const experienceDist = useQuery({
    queryKey: ["dashboard-experience"],
    queryFn: async () => {
      const { data } = await supabase.from("developers").select("years_coding");
      if (!data) return [];
      const buckets: Record<string, number> = {
        "0-2": 0, "3-5": 0, "6-10": 0, "11-15": 0, "16-20": 0, "20+": 0,
      };
      data.forEach((d) => {
        const y = d.years_coding ?? 0;
        if (y <= 2) buckets["0-2"]++;
        else if (y <= 5) buckets["3-5"]++;
        else if (y <= 10) buckets["6-10"]++;
        else if (y <= 15) buckets["11-15"]++;
        else if (y <= 20) buckets["16-20"]++;
        else buckets["20+"]++;
      });
      return Object.entries(buckets).map(([range, count]) => ({ range, count }));
    },
  });

  // Proficiency by region (for heatmap-like table)
  const proficiencyByRegion = useQuery({
    queryKey: ["dashboard-proficiency-region"],
    queryFn: async () => {
      const { data } = await supabase
        .from("developer_technology_view")
        .select("region_name, category_name, proficiency");
      if (!data) return [];
      const map: Record<string, Record<string, { sum: number; count: number }>> = {};
      data.forEach((r) => {
        if (!r.region_name || !r.category_name) return;
        if (!map[r.region_name]) map[r.region_name] = {};
        if (!map[r.region_name][r.category_name])
          map[r.region_name][r.category_name] = { sum: 0, count: 0 };
        map[r.region_name][r.category_name].sum += r.proficiency ?? 0;
        map[r.region_name][r.category_name].count += 1;
      });
      return map;
    },
  });

  // Developers by education
  const devsByEducation = useQuery({
    queryKey: ["dashboard-devs-education"],
    queryFn: async () => {
      const { data } = await supabase.from("developers").select("education_level");
      if (!data) return [];
      const counts: Record<string, number> = {};
      data.forEach((d) => {
        const level = d.education_level || "Unknown";
        counts[level] = (counts[level] || 0) + 1;
      });
      return Object.entries(counts)
        .map(([name, count]) => ({ name, count }))
        .sort((a, b) => b.count - a.count);
    },
  });

  // Sentiment breakdown
  const sentimentData = useQuery({
    queryKey: ["dashboard-sentiment"],
    queryFn: async () => {
      const { data } = await supabase.from("ai_tool_usage_view").select("sentiment, job_role");
      if (!data) return { overall: [], byRole: [] };
      const sentiments: Record<string, number> = {};
      const roleMap: Record<string, Record<string, number>> = {};
      data.forEach((r) => {
        const s = (r.sentiment ?? "neutral").toLowerCase();
        sentiments[s] = (sentiments[s] || 0) + 1;
        if (r.job_role) {
          if (!roleMap[r.job_role]) roleMap[r.job_role] = {};
          roleMap[r.job_role][s] = (roleMap[r.job_role][s] || 0) + 1;
        }
      });
      const overall = Object.entries(sentiments).map(([name, value]) => ({ name, value }));
      const byRole = Object.entries(roleMap)
        .map(([role, sents]) => ({ role, ...sents }))
        .slice(0, 6);
      return { overall, byRole };
    },
  });

  const isLoading =
    devCount.isLoading || techCount.isLoading || aiToolCount.isLoading || regionCount.isLoading;

  return {
    summary: {
      developers: devCount.data ?? 0,
      technologies: techCount.data ?? 0,
      aiTools: aiToolCount.data ?? 0,
      regions: regionCount.data ?? 0,
      workProfiles: workProfileCount.data ?? 0,
      aiUsage: aiUsageCount.data ?? 0,
      companies: companyCount.data ?? 0,
    },
    isLoading,
    topTech: topTech.data ?? [],
    aiAdoption: aiAdoption.data ?? [],
    categoryInsights: categoryInsights.data ?? [],
    devsByRegion: devsByRegion.data ?? [],
    salaryByRole: salaryByRole.data ?? [],
    experienceDist: experienceDist.data ?? [],
    proficiencyByRegion: proficiencyByRegion.data ?? {},
    devsByEducation: devsByEducation.data ?? [],
    sentimentData: sentimentData.data ?? { overall: [], byRole: [] },
  };
}
