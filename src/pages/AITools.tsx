import { useState, useMemo } from "react";
import { Cpu, BarChart3, TrendingUp, Users, Search, X, ThumbsUp, ThumbsDown, Minus } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import Navbar from "@/components/Navbar";
import PageTransition from "@/components/PageTransition";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
} from "recharts";
import { motion, AnimatePresence } from "framer-motion";

const NEON_COLORS = [
  "hsl(var(--primary))",
  "hsl(210 100% 56%)",
  "hsl(280 100% 65%)",
  "hsl(160 100% 45%)",
  "hsl(45 100% 55%)",
  "hsl(340 100% 55%)",
  "hsl(190 100% 50%)",
  "hsl(30 100% 55%)",
];

interface ToolStats {
  name: string;
  category: string | null;
  userCount: number;
  avgAdoption: number;
  sentiments: { positive: number; neutral: number; negative: number };
  useCases: Record<string, number>;
  regions: Record<string, number>;
}

const AITools = () => {
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [compareTools, setCompareTools] = useState<string[]>([]);

  const { data: rawData } = useQuery({
    queryKey: ["ai-tools-usage"],
    queryFn: () => api.get('/ai-tools/usage'),
  });

  const toolStats = useMemo(() => {
    if (!rawData) return [];
    const map: Record<string, ToolStats> = {};
    rawData.forEach((r) => {
      const name = r.tool_name ?? "Unknown";
      if (!map[name]) {
        map[name] = {
          name,
          category: r.tool_category,
          userCount: 0,
          avgAdoption: 0,
          sentiments: { positive: 0, neutral: 0, negative: 0 },
          useCases: {},
          regions: {},
        };
      }
      const t = map[name];
      t.userCount++;
      t.avgAdoption += r.adoption_score ?? 0;
      const s = (r.sentiment ?? "neutral").toLowerCase();
      if (s === "positive") t.sentiments.positive++;
      else if (s === "negative") t.sentiments.negative++;
      else t.sentiments.neutral++;
      if (r.use_case) t.useCases[r.use_case] = (t.useCases[r.use_case] || 0) + 1;
      if (r.region_name) t.regions[r.region_name] = (t.regions[r.region_name] || 0) + 1;
    });
    return Object.values(map)
      .map((t) => ({ ...t, avgAdoption: t.userCount > 0 ? Math.round(t.avgAdoption / t.userCount) : 0 }))
      .sort((a, b) => b.userCount - a.userCount);
  }, [rawData]);

  const categories = useMemo(() => {
    const set = new Set(toolStats.map((t) => t.category).filter(Boolean) as string[]);
    return Array.from(set).sort();
  }, [toolStats]);

  const filtered = useMemo(() => {
    return toolStats.filter((t) => {
      if (search && !t.name.toLowerCase().includes(search.toLowerCase())) return false;
      if (selectedCategory && t.category !== selectedCategory) return false;
      return true;
    });
  }, [toolStats, search, selectedCategory]);

  const maxUsers = Math.max(...toolStats.map((t) => t.userCount), 1);

  const toggleCompare = (name: string) => {
    setCompareTools((prev) =>
      prev.includes(name) ? prev.filter((n) => n !== name) : prev.length < 4 ? [...prev, name] : prev
    );
  };

  const compareData = useMemo(() => {
    return toolStats.filter((t) => compareTools.includes(t.name));
  }, [toolStats, compareTools]);

  const sentimentOverall = useMemo(() => {
    const totals = { positive: 0, neutral: 0, negative: 0 };
    toolStats.forEach((t) => {
      totals.positive += t.sentiments.positive;
      totals.neutral += t.sentiments.neutral;
      totals.negative += t.sentiments.negative;
    });
    const total = totals.positive + totals.neutral + totals.negative || 1;
    return [
      { name: "Positive", value: totals.positive, pct: Math.round((totals.positive / total) * 100) },
      { name: "Neutral", value: totals.neutral, pct: Math.round((totals.neutral / total) * 100) },
      { name: "Negative", value: totals.negative, pct: Math.round((totals.negative / total) * 100) },
    ];
  }, [toolStats]);

  const useCaseData = useMemo(() => {
    const map: Record<string, number> = {};
    toolStats.forEach((t) => {
      Object.entries(t.useCases).forEach(([uc, count]) => {
        map[uc] = (map[uc] || 0) + count;
      });
    });
    return Object.entries(map)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 8);
  }, [toolStats]);

  const radarData = useMemo(() => {
    if (compareData.length === 0) return [];
    return [
      { metric: "Users", ...Object.fromEntries(compareData.map((t) => [t.name, t.userCount])) },
      { metric: "Adoption", ...Object.fromEntries(compareData.map((t) => [t.name, t.avgAdoption])) },
      { metric: "Positive %", ...Object.fromEntries(compareData.map((t) => [t.name, Math.round((t.sentiments.positive / (t.userCount || 1)) * 100)])) },
      { metric: "Use Cases", ...Object.fromEntries(compareData.map((t) => [t.name, Object.keys(t.useCases).length * 20])) },
      { metric: "Regions", ...Object.fromEntries(compareData.map((t) => [t.name, Object.keys(t.regions).length * 15])) },
    ];
  }, [compareData]);

  const chartConfig = Object.fromEntries(
    compareData.map((t, i) => [t.name, { label: t.name, color: NEON_COLORS[i % NEON_COLORS.length] }])
  );

  const SENTIMENT_COLORS = ["hsl(160 100% 45%)", "hsl(45 100% 55%)", "hsl(340 100% 55%)"];

  return (
    <PageTransition>
    <div className="min-h-screen bg-background cyber-grid">
      <Navbar />
      <div className="pt-20 px-4 max-w-7xl mx-auto pb-12">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-3 mb-2">
          <Cpu className="w-8 h-8 text-primary" />
          <h1 className="text-3xl font-bold text-foreground">AI Tools Adoption</h1>
        </motion.div>
        <p className="text-muted-foreground mb-8">Usage analytics, sentiment breakdown, and tool comparison</p>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {[
            { label: "Total Tools", value: toolStats.length, icon: Cpu },
            { label: "Total Usage Records", value: rawData?.length ?? 0, icon: BarChart3 },
            { label: "Avg Adoption Score", value: toolStats.length > 0 ? Math.round(toolStats.reduce((s, t) => s + t.avgAdoption, 0) / toolStats.length) : 0, icon: TrendingUp },
            { label: "Unique Use Cases", value: useCaseData.length, icon: Users },
          ].map((stat, i) => (
            <motion.div key={stat.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
              <Card className="border-primary/20 bg-card/80 backdrop-blur">
                <CardContent className="p-4 flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-primary/10">
                    <stat.icon className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">{stat.label}</p>
                    <p className="text-2xl font-bold text-foreground">{stat.value}</p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="bg-muted/50 border border-border">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="tools">All Tools</TabsTrigger>
            <TabsTrigger value="compare">Compare ({compareTools.length})</TabsTrigger>
          </TabsList>

          {/* OVERVIEW TAB */}
          <TabsContent value="overview">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Adoption Bar Chart */}
              <Card className="border-primary/20 bg-card/80 backdrop-blur">
                <CardHeader><CardTitle className="text-sm text-foreground">Tool Adoption</CardTitle></CardHeader>
                <CardContent>
                  <ChartContainer config={{ users: { label: "Users", color: "hsl(var(--primary))" } }} className="h-[300px]">
                    <BarChart data={filtered.slice(0, 10)} layout="vertical" margin={{ left: 80 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis type="number" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                      <YAxis type="category" dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={11} width={75} />
                      <ChartTooltip content={<ChartTooltipContent />} />
                      <Bar dataKey="userCount" name="users" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} />
                    </BarChart>
                  </ChartContainer>
                </CardContent>
              </Card>

              {/* Sentiment Pie */}
              <Card className="border-primary/20 bg-card/80 backdrop-blur">
                <CardHeader><CardTitle className="text-sm text-foreground">Overall Sentiment</CardTitle></CardHeader>
                <CardContent className="flex items-center justify-center">
                  <ChartContainer config={{ sentiment: { label: "Sentiment" } }} className="h-[300px] w-full">
                    <PieChart>
                      <Pie data={sentimentOverall} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} label={({ name, pct }) => `${name} ${pct}%`}>
                        {sentimentOverall.map((_, i) => (
                          <Cell key={i} fill={SENTIMENT_COLORS[i]} />
                        ))}
                      </Pie>
                      <ChartTooltip content={<ChartTooltipContent />} />
                    </PieChart>
                  </ChartContainer>
                </CardContent>
              </Card>

              {/* Use Cases */}
              <Card className="border-primary/20 bg-card/80 backdrop-blur lg:col-span-2">
                <CardHeader><CardTitle className="text-sm text-foreground">Top Use Cases</CardTitle></CardHeader>
                <CardContent>
                  <ChartContainer config={{ count: { label: "Mentions", color: "hsl(210 100% 56%)" } }} className="h-[250px]">
                    <BarChart data={useCaseData} margin={{ bottom: 40 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={11} angle={-25} textAnchor="end" />
                      <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                      <ChartTooltip content={<ChartTooltipContent />} />
                      <Bar dataKey="count" fill="hsl(210 100% 56%)" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ChartContainer>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* ALL TOOLS TAB */}
          <TabsContent value="tools">
            <div className="flex flex-wrap items-center gap-3 mb-6">
              <div className="relative flex-1 min-w-[200px] max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search AI tools..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-9 bg-muted/30 border-border"
                />
              </div>
              <div className="flex flex-wrap gap-2">
                <Badge
                  variant={selectedCategory === null ? "default" : "outline"}
                  className="cursor-pointer"
                  onClick={() => setSelectedCategory(null)}
                >
                  All
                </Badge>
                {categories.map((c) => (
                  <Badge
                    key={c}
                    variant={selectedCategory === c ? "default" : "outline"}
                    className="cursor-pointer"
                    onClick={() => setSelectedCategory(selectedCategory === c ? null : c)}
                  >
                    {c}
                  </Badge>
                ))}
              </div>
            </div>

            <div className="space-y-3">
              <AnimatePresence mode="popLayout">
                {filtered.map((tool, i) => {
                  const total = tool.sentiments.positive + tool.sentiments.neutral + tool.sentiments.negative || 1;
                  const posPct = Math.round((tool.sentiments.positive / total) * 100);
                  const neuPct = Math.round((tool.sentiments.neutral / total) * 100);
                  const negPct = Math.round((tool.sentiments.negative / total) * 100);
                  const isComparing = compareTools.includes(tool.name);

                  return (
                    <motion.div
                      key={tool.name}
                      layout
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      transition={{ delay: i * 0.03 }}
                    >
                      <Card className={`border-primary/10 bg-card/80 backdrop-blur transition-all ${isComparing ? "ring-1 ring-primary" : ""}`}>
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                                <Cpu className="w-4 h-4 text-primary" />
                              </div>
                              <div>
                                <h3 className="font-semibold text-foreground">{tool.name}</h3>
                                {tool.category && <span className="text-xs text-muted-foreground">{tool.category}</span>}
                              </div>
                            </div>
                            <button
                              onClick={() => toggleCompare(tool.name)}
                              className={`text-xs px-3 py-1 rounded-full border transition-colors ${
                                isComparing
                                  ? "bg-primary text-primary-foreground border-primary"
                                  : "border-border text-muted-foreground hover:border-primary hover:text-primary"
                              }`}
                            >
                              {isComparing ? "Remove" : "Compare"}
                            </button>
                          </div>

                          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-3">
                            <div>
                              <p className="text-xs text-muted-foreground">Users</p>
                              <p className="text-lg font-bold text-foreground">{tool.userCount}</p>
                            </div>
                            <div>
                              <p className="text-xs text-muted-foreground">Avg Adoption</p>
                              <p className="text-lg font-bold text-foreground">{tool.avgAdoption}%</p>
                            </div>
                            <div>
                              <p className="text-xs text-muted-foreground">Use Cases</p>
                              <p className="text-lg font-bold text-foreground">{Object.keys(tool.useCases).length}</p>
                            </div>
                            <div>
                              <p className="text-xs text-muted-foreground">Regions</p>
                              <p className="text-lg font-bold text-foreground">{Object.keys(tool.regions).length}</p>
                            </div>
                          </div>

                          {/* Popularity bar */}
                          <div className="mb-3">
                            <div className="flex justify-between text-xs text-muted-foreground mb-1">
                              <span>Popularity</span>
                              <span>{Math.round((tool.userCount / maxUsers) * 100)}%</span>
                            </div>
                            <Progress value={(tool.userCount / maxUsers) * 100} className="h-1.5" />
                          </div>

                          {/* Sentiment bar */}
                          <div>
                            <p className="text-xs text-muted-foreground mb-1">Sentiment</p>
                            <div className="flex h-2 rounded-full overflow-hidden">
                              <div style={{ width: `${posPct}%`, background: SENTIMENT_COLORS[0] }} />
                              <div style={{ width: `${neuPct}%`, background: SENTIMENT_COLORS[1] }} />
                              <div style={{ width: `${negPct}%`, background: SENTIMENT_COLORS[2] }} />
                            </div>
                            <div className="flex gap-4 mt-1.5">
                              <span className="text-xs text-muted-foreground flex items-center gap-1">
                                <ThumbsUp className="w-3 h-3" style={{ color: SENTIMENT_COLORS[0] }} /> {posPct}%
                              </span>
                              <span className="text-xs text-muted-foreground flex items-center gap-1">
                                <Minus className="w-3 h-3" style={{ color: SENTIMENT_COLORS[1] }} /> {neuPct}%
                              </span>
                              <span className="text-xs text-muted-foreground flex items-center gap-1">
                                <ThumbsDown className="w-3 h-3" style={{ color: SENTIMENT_COLORS[2] }} /> {negPct}%
                              </span>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
              {filtered.length === 0 && (
                <p className="text-center text-muted-foreground py-12">No AI tools found.</p>
              )}
            </div>
          </TabsContent>

          {/* COMPARE TAB */}
          <TabsContent value="compare">
            {compareData.length === 0 ? (
              <Card className="border-primary/20 bg-card/80 backdrop-blur">
                <CardContent className="p-12 text-center">
                  <Cpu className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">Select up to 4 tools from the "All Tools" tab to compare.</p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-6">
                {/* Selected tools */}
                <div className="flex flex-wrap gap-2">
                  {compareData.map((t, i) => (
                    <Badge key={t.name} className="gap-1 cursor-pointer" style={{ backgroundColor: NEON_COLORS[i % NEON_COLORS.length] }} onClick={() => toggleCompare(t.name)}>
                      {t.name} <X className="w-3 h-3" />
                    </Badge>
                  ))}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Radar */}
                  <Card className="border-primary/20 bg-card/80 backdrop-blur">
                    <CardHeader><CardTitle className="text-sm text-foreground">Multi-Metric Comparison</CardTitle></CardHeader>
                    <CardContent>
                      <ChartContainer config={chartConfig} className="h-[350px]">
                        <RadarChart data={radarData} cx="50%" cy="50%" outerRadius="70%">
                          <PolarGrid stroke="hsl(var(--border))" />
                          <PolarAngleAxis dataKey="metric" stroke="hsl(var(--muted-foreground))" fontSize={11} />
                          <PolarRadiusAxis stroke="hsl(var(--border))" fontSize={10} />
                          {compareData.map((t, i) => (
                            <Radar key={t.name} name={t.name} dataKey={t.name} stroke={NEON_COLORS[i % NEON_COLORS.length]} fill={NEON_COLORS[i % NEON_COLORS.length]} fillOpacity={0.15} />
                          ))}
                          <ChartTooltip content={<ChartTooltipContent />} />
                        </RadarChart>
                      </ChartContainer>
                    </CardContent>
                  </Card>

                  {/* Side-by-side stats */}
                  <Card className="border-primary/20 bg-card/80 backdrop-blur">
                    <CardHeader><CardTitle className="text-sm text-foreground">Side-by-Side Stats</CardTitle></CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {compareData.map((t, i) => {
                          const total = t.sentiments.positive + t.sentiments.neutral + t.sentiments.negative || 1;
                          return (
                            <div key={t.name} className="p-3 rounded-lg border border-border/50 bg-muted/20">
                              <div className="flex items-center gap-2 mb-2">
                                <div className="w-3 h-3 rounded-full" style={{ background: NEON_COLORS[i % NEON_COLORS.length] }} />
                                <span className="font-semibold text-foreground text-sm">{t.name}</span>
                                {t.category && <Badge variant="outline" className="text-xs">{t.category}</Badge>}
                              </div>
                              <div className="grid grid-cols-3 gap-2 text-center">
                                <div>
                                  <p className="text-lg font-bold text-foreground">{t.userCount}</p>
                                  <p className="text-xs text-muted-foreground">Users</p>
                                </div>
                                <div>
                                  <p className="text-lg font-bold text-foreground">{t.avgAdoption}%</p>
                                  <p className="text-xs text-muted-foreground">Adoption</p>
                                </div>
                                <div>
                                  <p className="text-lg font-bold text-foreground">{Math.round((t.sentiments.positive / total) * 100)}%</p>
                                  <p className="text-xs text-muted-foreground">Positive</p>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Adoption comparison bar */}
                <Card className="border-primary/20 bg-card/80 backdrop-blur">
                  <CardHeader><CardTitle className="text-sm text-foreground">Adoption Score Comparison</CardTitle></CardHeader>
                  <CardContent>
                    <ChartContainer config={chartConfig} className="h-[200px]">
                      <BarChart data={compareData} margin={{ left: 20 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                        <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                        <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                        <ChartTooltip content={<ChartTooltipContent />} />
                        <Bar dataKey="avgAdoption" name="Avg Adoption">
                          {compareData.map((_, i) => (
                            <Cell key={i} fill={NEON_COLORS[i % NEON_COLORS.length]} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ChartContainer>
                  </CardContent>
                </Card>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
    </PageTransition>
  );
};

export default AITools;
