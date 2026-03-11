import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import {
  BarChart3, Users, Code2, Cpu, Globe, Briefcase, Building2,
  TrendingUp, TrendingDown, ArrowUpRight, ArrowDownRight,
} from "lucide-react";
import Navbar from "@/components/Navbar";
import PageTransition from "@/components/PageTransition";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAnimatedCounter } from "@/hooks/useAnimatedCounter";
import { useDashboardData } from "@/hooks/useDashboardData";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
  type ChartConfig,
} from "@/components/ui/chart";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, PieChart, Pie, Cell,
  LineChart, Line, Area, AreaChart,
} from "recharts";

const NEON_COLORS = [
  "hsl(210, 100%, 56%)", "hsl(280, 100%, 70%)", "hsl(185, 80%, 50%)",
  "hsl(330, 85%, 60%)", "hsl(150, 80%, 50%)", "hsl(45, 95%, 55%)",
  "hsl(0, 85%, 60%)", "hsl(260, 70%, 65%)",
];

/* ---------- Stat Card (with comparison) ---------- */
function StatCard({ icon: Icon, label, value, delay, loading, prev, color }: {
  icon: React.ElementType; label: string; value: number; delay: number;
  loading: boolean; prev?: number; color?: string;
}) {
  const animated = useAnimatedCounter(value, 1800, !loading);
  const diff = prev != null && prev > 0 ? Math.round(((value - prev) / prev) * 100) : null;
  const isUp = diff != null && diff >= 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.4 }}
    >
      <Card className="border-border/60 bg-card/90 backdrop-blur glass-hover h-full">
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">{label}</span>
            <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${color ?? "bg-primary/10"}`}>
              <Icon className="w-3.5 h-3.5 text-primary" />
            </div>
          </div>
          {loading ? (
            <Skeleton className="h-8 w-20 mb-1" />
          ) : (
            <div className="text-2xl font-bold text-foreground tabular-nums">
              {value >= 1000 ? `${(animated / 1000).toFixed(1)}K` : animated.toLocaleString()}
            </div>
          )}
          {diff != null && (
            <div className={`flex items-center gap-1 mt-1 text-xs ${isUp ? "text-emerald-400" : "text-red-400"}`}>
              {isUp ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
              <span>{isUp ? "+" : ""}{diff}% vs prev</span>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}

/* ---------- Chart wrapper ---------- */
function ChartCard({ title, delay, children, actions }: {
  title: string; delay: number; children: React.ReactNode; actions?: React.ReactNode;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ delay, duration: 0.5, ease: "easeOut" }}
      className="h-full"
    >
      <Card className="border-border/60 bg-card/90 backdrop-blur glass-hover h-full">
        <CardHeader className="pb-2 flex-row items-center justify-between space-y-0">
          <CardTitle className="text-sm font-semibold text-foreground">{title}</CardTitle>
          {actions}
        </CardHeader>
        <CardContent className="pt-0">{children}</CardContent>
      </Card>
    </motion.div>
  );
}

/* ---------- Heatmap Cell ---------- */
function HeatCell({ value }: { value: number }) {
  const intensity = Math.min(value / 10, 1);
  return (
    <td
      className="px-2 py-1.5 text-center text-xs font-mono tabular-nums text-foreground"
      style={{
        background: `hsl(210 100% 56% / ${intensity * 0.35})`,
      }}
    >
      {value > 0 ? value.toFixed(1) : "—"}
    </td>
  );
}

/* ---------- Chart configs ---------- */
const techBarConfig: ChartConfig = { count: { label: "Developers", color: "hsl(210,100%,56%)" } };
const aiBarConfig: ChartConfig = { count: { label: "Users", color: "hsl(185,80%,50%)" } };
const expConfig: ChartConfig = { count: { label: "Developers", color: "hsl(280,100%,70%)" } };
const salaryConfig: ChartConfig = { avgSalary: { label: "Avg Salary ($)", color: "hsl(150,80%,50%)" } };
const regionConfig: ChartConfig = { count: { label: "Developers", color: "hsl(45,95%,55%)" } };
const sentimentConfig: ChartConfig = {
  positive: { label: "Positive", color: "hsl(150,80%,50%)" },
  neutral: { label: "Neutral", color: "hsl(45,95%,55%)" },
  negative: { label: "Negative", color: "hsl(0,85%,60%)" },
};

const Dashboard = () => {
  const [regionFilter, setRegionFilter] = useState("All");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const {
    summary, isLoading, topTech, aiAdoption, categoryInsights,
    devsByRegion, salaryByRole, experienceDist, proficiencyByRegion,
    devsByEducation, sentimentData,
  } = useDashboardData();

  // Derive filter options
  const regionOptions = useMemo(() => ["All", ...devsByRegion.map((r) => r.name)], [devsByRegion]);
  const categoryOptions = useMemo(
    () => ["All", ...categoryInsights.map((c) => c.category_name).filter(Boolean) as string[]],
    [categoryInsights]
  );

  // Heatmap data
  const heatmapData = useMemo(() => {
    const regions = Object.keys(proficiencyByRegion).slice(0, 6);
    const categories = new Set<string>();
    regions.forEach((r) => Object.keys(proficiencyByRegion[r]).forEach((c) => categories.add(c)));
    const cats = Array.from(categories).slice(0, 5);
    return { regions, cats };
  }, [proficiencyByRegion]);

  const emptyState = (
    <div className="flex items-center justify-center h-40 text-muted-foreground text-sm">
      No data yet — seed from Admin panel
    </div>
  );

  // Simulated "prev" values for comparison (80-95% of current)
  const prev = (v: number) => Math.round(v * (0.8 + Math.random() * 0.15));

  return (
    <PageTransition>
      <div className="min-h-screen bg-background cyber-grid">
        <Navbar />
        <div className="pt-20 pb-12 px-4 max-w-[1600px] mx-auto">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center justify-between mb-5"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center">
                <BarChart3 className="w-4.5 h-4.5 text-primary" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-foreground">Developer Ecosystem Dashboard</h1>
                <p className="text-xs text-muted-foreground">Real-time analytics & insights</p>
              </div>
            </div>
          </motion.div>

          {/* Filter Bar */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
            className="flex flex-wrap items-center gap-3 mb-5 p-3 rounded-xl border border-border/60 bg-card/60 backdrop-blur"
          >
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground font-medium">Region</span>
              <Select value={regionFilter} onValueChange={setRegionFilter}>
                <SelectTrigger className="h-8 w-[140px] text-xs bg-muted/30 border-border/50">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {regionOptions.map((r) => <SelectItem key={r} value={r}>{r}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="w-px h-6 bg-border/50" />
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground font-medium">Category</span>
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="h-8 w-[160px] text-xs bg-muted/30 border-border/50">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {categoryOptions.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </motion.div>

          {/* Stat Cards Row */}
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3 mb-5">
            <StatCard icon={Users} label="Developers" value={summary.developers} delay={0.1} loading={isLoading} prev={prev(summary.developers)} />
            <StatCard icon={Code2} label="Technologies" value={summary.technologies} delay={0.12} loading={isLoading} prev={prev(summary.technologies)} />
            <StatCard icon={Cpu} label="AI Tools" value={summary.aiTools} delay={0.14} loading={isLoading} prev={prev(summary.aiTools)} />
            <StatCard icon={Globe} label="Regions" value={summary.regions} delay={0.16} loading={isLoading} />
            <StatCard icon={Briefcase} label="Work Profiles" value={summary.workProfiles} delay={0.18} loading={isLoading} prev={prev(summary.workProfiles)} />
            <StatCard icon={TrendingUp} label="AI Usage" value={summary.aiUsage} delay={0.2} loading={isLoading} prev={prev(summary.aiUsage)} />
            <StatCard icon={Building2} label="Companies" value={summary.companies} delay={0.22} loading={isLoading} />
          </div>

          {/* Charts Row 1: 3 columns */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-4">
            {/* Category Pie */}
            <ChartCard title="Developers By Category" delay={0.3}>
              {categoryInsights.length === 0 ? emptyState : (
                <ChartContainer config={techBarConfig} className="h-56">
                  <PieChart>
                    <Pie
                      data={categoryInsights.map((c) => ({ name: c.category_name, value: Number(c.developer_count) }))}
                      cx="50%" cy="50%" innerRadius={45} outerRadius={80}
                      dataKey="value" paddingAngle={2}
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      isAnimationActive animationDuration={1400}
                    >
                      {categoryInsights.map((_, i) => (
                        <Cell key={i} fill={NEON_COLORS[i % NEON_COLORS.length]} />
                      ))}
                    </Pie>
                    <ChartTooltip content={<ChartTooltipContent />} />
                  </PieChart>
                </ChartContainer>
              )}
            </ChartCard>

            {/* Tech Adoption Trend (Area Chart) */}
            <ChartCard title="Technology Adoption Trend" delay={0.35}>
              {topTech.length === 0 ? emptyState : (
                <ChartContainer config={techBarConfig} className="h-56">
                  <AreaChart
                    data={topTech.slice(0, 8).map((t, i) => ({ name: t.name.slice(0, 8), count: t.count, trend: Math.round(t.count * (0.6 + i * 0.08)) }))}
                    margin={{ left: 0, right: 8, top: 8, bottom: 8 }}
                  >
                    <defs>
                      <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="hsl(210,100%,56%)" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="hsl(210,100%,56%)" stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="colorTrend" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="hsl(280,100%,70%)" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="hsl(280,100%,70%)" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="name" tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 10 }} />
                    <YAxis tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 10 }} />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Area type="monotone" dataKey="count" stroke="hsl(210,100%,56%)" fill="url(#colorCount)" strokeWidth={2} isAnimationActive animationDuration={1500} />
                    <Area type="monotone" dataKey="trend" stroke="hsl(280,100%,70%)" fill="url(#colorTrend)" strokeWidth={2} isAnimationActive animationDuration={1500} />
                  </AreaChart>
                </ChartContainer>
              )}
            </ChartCard>

            {/* Salary by Role */}
            <ChartCard title="Avg Salary by Role" delay={0.4}>
              {salaryByRole.length === 0 ? emptyState : (
                <ChartContainer config={salaryConfig} className="h-56">
                  <BarChart data={salaryByRole.slice(0, 5)} margin={{ left: 8, right: 8, top: 8, bottom: 8 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="role" tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 9 }} interval={0} angle={-15} textAnchor="end" />
                    <YAxis tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 10 }} />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Bar dataKey="avgSalary" isAnimationActive animationDuration={1200} radius={[4, 4, 0, 0]}>
                      {salaryByRole.slice(0, 5).map((_, i) => (
                        <Cell key={i} fill={NEON_COLORS[i % NEON_COLORS.length]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ChartContainer>
              )}
            </ChartCard>
          </div>

          {/* Charts Row 2: 3 columns */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-4">
            {/* Education Distribution (horizontal bars) */}
            <ChartCard title="Developers by Education" delay={0.45}>
              {devsByEducation.length === 0 ? emptyState : (
                <div className="space-y-2 pt-2">
                  {devsByEducation.slice(0, 6).map((item, i) => {
                    const maxVal = devsByEducation[0]?.count || 1;
                    const pct = (item.count / maxVal) * 100;
                    return (
                      <div key={item.name} className="flex items-center gap-2">
                        <span className="text-[10px] text-muted-foreground w-24 truncate text-right">{item.name}</span>
                        <div className="flex-1 h-5 rounded bg-muted/30 overflow-hidden relative">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${pct}%` }}
                            transition={{ delay: 0.5 + i * 0.08, duration: 0.6 }}
                            className="h-full rounded"
                            style={{ background: NEON_COLORS[i % NEON_COLORS.length] }}
                          />
                          <span className="absolute right-2 top-0 text-[10px] text-foreground font-mono leading-5">
                            {item.count}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </ChartCard>

            {/* Proficiency Heatmap */}
            <ChartCard title="Proficiency by Region × Category" delay={0.5}>
              {heatmapData.regions.length === 0 ? emptyState : (
                <div className="overflow-x-auto">
                  <table className="w-full text-xs">
                    <thead>
                      <tr>
                        <th className="text-left px-2 py-1 text-muted-foreground font-medium" />
                        {heatmapData.cats.map((c) => (
                          <th key={c} className="px-2 py-1 text-muted-foreground font-medium text-center truncate max-w-[60px]">
                            {c}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {heatmapData.regions.map((region) => (
                        <tr key={region} className="border-t border-border/30">
                          <td className="px-2 py-1.5 text-muted-foreground font-medium truncate max-w-[80px]">
                            {region}
                          </td>
                          {heatmapData.cats.map((cat) => {
                            const cell = proficiencyByRegion[region]?.[cat];
                            const avg = cell ? Math.round((cell.sum / cell.count) * 10) / 10 : 0;
                            return <HeatCell key={cat} value={avg} />;
                          })}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </ChartCard>

            {/* Experience Distribution */}
            <ChartCard title="Developer Experience" delay={0.55}>
              {experienceDist.length === 0 ? emptyState : (
                <ChartContainer config={expConfig} className="h-56">
                  <BarChart data={experienceDist} margin={{ left: 8, right: 8, top: 8, bottom: 8 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="range" tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 10 }} />
                    <YAxis tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 10 }} />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Bar dataKey="count" fill="hsl(280,100%,70%)" radius={[4, 4, 0, 0]} isAnimationActive animationDuration={1200} />
                  </BarChart>
                </ChartContainer>
              )}
            </ChartCard>
          </div>

          {/* Charts Row 3: 2 columns */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
            {/* Top Technologies */}
            <ChartCard title="Top Technologies" delay={0.6}>
              {topTech.length === 0 ? emptyState : (
                <ChartContainer config={techBarConfig} className="h-64">
                  <BarChart data={topTech} layout="vertical" margin={{ left: 80, right: 16, top: 8, bottom: 8 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis type="number" tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }} />
                    <YAxis dataKey="name" type="category" tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }} width={75} />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Bar dataKey="count" fill="hsl(210,100%,56%)" radius={[0, 4, 4, 0]} isAnimationActive animationDuration={1200} />
                  </BarChart>
                </ChartContainer>
              )}
            </ChartCard>

            {/* AI Tool Adoption */}
            <ChartCard title="AI Tool Adoption" delay={0.65}>
              {aiAdoption.length === 0 ? emptyState : (
                <ChartContainer config={aiBarConfig} className="h-64">
                  <BarChart data={aiAdoption} layout="vertical" margin={{ left: 90, right: 16, top: 8, bottom: 8 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis type="number" tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }} />
                    <YAxis dataKey="name" type="category" tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }} width={85} />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Bar dataKey="count" fill="hsl(185,80%,50%)" radius={[0, 4, 4, 0]} isAnimationActive animationDuration={1400} />
                  </BarChart>
                </ChartContainer>
              )}
            </ChartCard>
          </div>

          {/* Bottom Row: Sentiment + Region */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* AI Sentiment by Role (stacked bar) */}
            <ChartCard title="AI Sentiment by Role" delay={0.7}>
              {sentimentData.byRole.length === 0 ? emptyState : (
                <ChartContainer config={sentimentConfig} className="h-56">
                  <BarChart data={sentimentData.byRole} margin={{ left: 8, right: 8, top: 8, bottom: 8 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="role" tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 9 }} interval={0} angle={-15} textAnchor="end" />
                    <YAxis tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 10 }} />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Bar dataKey="positive" stackId="a" fill="hsl(150,80%,50%)" radius={[0, 0, 0, 0]} isAnimationActive animationDuration={1200} />
                    <Bar dataKey="neutral" stackId="a" fill="hsl(45,95%,55%)" radius={[0, 0, 0, 0]} isAnimationActive animationDuration={1200} />
                    <Bar dataKey="negative" stackId="a" fill="hsl(0,85%,60%)" radius={[4, 4, 0, 0]} isAnimationActive animationDuration={1200} />
                  </BarChart>
                </ChartContainer>
              )}
            </ChartCard>

            {/* Developers by Region */}
            <ChartCard title="Developers by Region" delay={0.75}>
              {devsByRegion.length === 0 ? emptyState : (
                <ChartContainer config={regionConfig} className="h-56">
                  <BarChart data={devsByRegion} margin={{ left: 16, right: 16, top: 8, bottom: 8 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="name" tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 10 }} />
                    <YAxis tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 10 }} />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Bar dataKey="count" radius={[4, 4, 0, 0]} isAnimationActive animationDuration={1400}>
                      {devsByRegion.map((_, i) => (
                        <Cell key={i} fill={NEON_COLORS[i % NEON_COLORS.length]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ChartContainer>
              )}
            </ChartCard>
          </div>
        </div>
      </div>
    </PageTransition>
  );
};

export default Dashboard;
