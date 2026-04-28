import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { motion, AnimatePresence } from "framer-motion";
import {
  Code2, Search, X, GitCompare, Users, Clock, TrendingUp,
  Layers, ChevronDown, ChevronUp, BarChart3,
} from "lucide-react";
import Navbar from "@/components/Navbar";
import PageTransition from "@/components/PageTransition";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface TechDetail {
  id: string;
  name: string;
  category_name: string | null;
  developer_count: number;
  avg_proficiency: number;
  avg_years_used: number;
}

const Technologies = () => {
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [compareList, setCompareList] = useState<string[]>([]);
  const [expandedTech, setExpandedTech] = useState<string | null>(null);

  // Fetch all technologies with stats
  const { data: technologies = [], isLoading } = useQuery({
    queryKey: ["tech-explorer"],
    queryFn: async () => {
      // Fetching processed data from new backend
      const data = await api.get('/developers/top-tech');
      // The old frontend did complex processing. For now, we'll try to map the top-tech response
      // or implement a fuller route if needed. 
      // To keep UI working, I'll fetch raw data if specific processing is needed.
      const rawData = await api.get('/crud/developers_tech?limit=1000&include=technology.category'); 
      const techIds = await api.get('/crud/technology?limit=500');
      
      const techMap: Record<string, {
        devs: Set<string>;
        profSum: number;
        yearsSum: number;
        count: number;
        category: string | null;
      }> = {};

      rawData.rows?.forEach((row: any) => {
        const name = row.technology?.name;
        if (!name) return;
        if (!techMap[name]) {
          techMap[name] = {
            devs: new Set(),
            profSum: 0,
            yearsSum: 0,
            count: 0,
            category: row.technology?.category?.name || "Uncategorized",
          };
        }
        const t = techMap[name];
        if (row.developerId) t.devs.add(row.developerId);
        t.profSum += row.proficiency || 0;
        t.yearsSum += row.yearsUsed || 0;
        t.count += 1;
      });

      const idMap: Record<string, string> = {};
      techIds.rows?.forEach((t: any) => { idMap[t.name] = t.id; });

      return Object.entries(techMap)
        .map(([name, stats]): TechDetail => ({
          id: idMap[name] || name,
          name,
          category_name: stats.category,
          developer_count: stats.devs.size,
          avg_proficiency: stats.count > 0 ? Math.round((stats.profSum / stats.count) * 10) / 10 : 0,
          avg_years_used: stats.count > 0 ? Math.round((stats.yearsSum / stats.count) * 10) / 10 : 0,
        }))
        .sort((a, b) => b.developer_count - a.developer_count);
    },
  });

  // Fetch category insights
  const { data: categories = [] } = useQuery({
    queryKey: ["tech-categories"],
    queryFn: () => api.get('/developers/category-insights'),
  });

  const categoryNames = useMemo(
    () => [...new Set(technologies.map((t) => t.category_name).filter(Boolean))] as string[],
    [technologies]
  );

  const filtered = useMemo(() => {
    return technologies.filter((t) => {
      const matchSearch = !search || t.name.toLowerCase().includes(search.toLowerCase());
      const matchCat = !selectedCategory || t.category_name === selectedCategory;
      return matchSearch && matchCat;
    });
  }, [technologies, search, selectedCategory]);

  const compareItems = useMemo(
    () => technologies.filter((t) => compareList.includes(t.id)),
    [technologies, compareList]
  );

  const toggleCompare = (id: string) => {
    setCompareList((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : prev.length < 4 ? [...prev, id] : prev
    );
  };

  const maxDevCount = useMemo(
    () => Math.max(...technologies.map((t) => t.developer_count), 1),
    [technologies]
  );

  return (
    <PageTransition>
    <div className="min-h-screen bg-background cyber-grid">
      <Navbar />
      <div className="pt-20 px-4 max-w-7xl mx-auto pb-12">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <Code2 className="w-8 h-8 text-primary" />
            <h1 className="text-3xl font-bold text-foreground text-glow-blue">Technology Explorer</h1>
          </div>
          <p className="text-muted-foreground">
            Search, filter, and compare {technologies.length} technologies across {categoryNames.length} categories
          </p>
        </motion.div>

        {/* Search & Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="glass rounded-xl p-4 mb-6 space-y-3"
        >
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search technologies..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10 bg-muted/50 border-border"
            />
            {search && (
              <button onClick={() => setSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2">
                <X className="w-4 h-4 text-muted-foreground hover:text-foreground" />
              </button>
            )}
          </div>
          <div className="flex flex-wrap gap-2">
            <Badge
              variant={selectedCategory === null ? "default" : "outline"}
              className="cursor-pointer"
              onClick={() => setSelectedCategory(null)}
            >
              All
            </Badge>
            {categoryNames.map((cat) => (
              <Badge
                key={cat}
                variant={selectedCategory === cat ? "default" : "outline"}
                className="cursor-pointer"
                onClick={() => setSelectedCategory(selectedCategory === cat ? null : cat)}
              >
                {cat}
              </Badge>
            ))}
          </div>
        </motion.div>

        {/* Compare Panel */}
        <AnimatePresence>
          {compareList.length > 0 && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="glass rounded-xl p-5 mb-6 overflow-hidden"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <GitCompare className="w-5 h-5 text-accent" />
                  <h2 className="font-semibold text-foreground">
                    Comparing {compareItems.length} Technologies
                  </h2>
                </div>
                <Button variant="ghost" size="sm" onClick={() => setCompareList([])}>
                  Clear All
                </Button>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {compareItems.map((tech) => (
                  <div key={tech.id} className="rounded-lg bg-muted/40 p-4 border border-border relative">
                    <button
                      onClick={() => toggleCompare(tech.id)}
                      className="absolute top-2 right-2"
                    >
                      <X className="w-3.5 h-3.5 text-muted-foreground hover:text-foreground" />
                    </button>
                    <h3 className="font-semibold text-foreground text-sm mb-3">{tech.name}</h3>
                    <div className="space-y-2 text-xs">
                      <CompareBar label="Developers" value={tech.developer_count} max={maxDevCount} color="bg-primary" />
                      <CompareBar label="Proficiency" value={tech.avg_proficiency} max={10} color="bg-accent" />
                      <CompareBar label="Avg Years" value={tech.avg_years_used} max={10} color="bg-secondary" />
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Category Overview */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-3 mb-8"
        >
          {categories.map((cat, i) => (
            <motion.button
              key={cat.category_name}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 + i * 0.05 }}
              onClick={() =>
                setSelectedCategory(
                  selectedCategory === cat.category_name ? null : cat.category_name
                )
              }
              className={`glass glass-hover rounded-xl p-3 text-left transition-all hover:border-primary/30 ${
                selectedCategory === cat.category_name ? "border-primary/50 ring-1 ring-primary/20" : ""
              }`}
            >
              <Layers className="w-4 h-4 text-accent mb-1" />
              <p className="text-xs font-semibold text-foreground truncate">{cat.category_name}</p>
              <p className="text-[10px] text-muted-foreground">
                {cat.technology_count} techs · {cat.developer_count} devs
              </p>
            </motion.button>
          ))}
        </motion.div>

        {/* Technology List */}
        {isLoading ? (
          <div className="text-center text-muted-foreground py-16">Loading technologies...</div>
        ) : filtered.length === 0 ? (
          <div className="text-center text-muted-foreground py-16">No technologies found.</div>
        ) : (
          <div className="space-y-2">
            {filtered.map((tech, i) => {
              const isExpanded = expandedTech === tech.id;
              const isCompared = compareList.includes(tech.id);
              const popularityPct = (tech.developer_count / maxDevCount) * 100;

              return (
                <motion.div
                  key={tech.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: Math.min(i * 0.03, 0.5) }}
                  className="glass rounded-xl overflow-hidden"
                >
                  <div
                    className="p-4 flex items-center gap-4 cursor-pointer hover:bg-muted/30 transition-colors"
                    onClick={() => setExpandedTech(isExpanded ? null : tech.id)}
                  >
                    {/* Rank */}
                    <span className="text-xs text-muted-foreground w-6 text-right font-mono">
                      {technologies.indexOf(tech) + 1}
                    </span>

                    {/* Name & Category */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-foreground text-sm">{tech.name}</span>
                        {tech.category_name && (
                          <Badge variant="outline" className="text-[10px] px-1.5 py-0">
                            {tech.category_name}
                          </Badge>
                        )}
                      </div>
                      {/* Popularity bar */}
                      <div className="mt-1.5 h-1.5 rounded-full bg-muted overflow-hidden max-w-xs">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${popularityPct}%` }}
                          transition={{ delay: 0.3 + Math.min(i * 0.03, 0.5), duration: 0.6 }}
                          className="h-full rounded-full bg-primary"
                        />
                      </div>
                    </div>

                    {/* Quick Stats */}
                    <div className="hidden sm:flex items-center gap-6 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Users className="w-3.5 h-3.5" /> {tech.developer_count}
                      </span>
                      <span className="flex items-center gap-1">
                        <TrendingUp className="w-3.5 h-3.5" /> {tech.avg_proficiency}/10
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" /> {tech.avg_years_used}y
                      </span>
                    </div>

                    {/* Compare toggle */}
                    <Button
                      variant={isCompared ? "default" : "outline"}
                      size="sm"
                      className="text-xs h-7 px-2"
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleCompare(tech.id);
                      }}
                    >
                      <GitCompare className="w-3 h-3 mr-1" />
                      {isCompared ? "✓" : "+"}
                    </Button>

                    {isExpanded ? (
                      <ChevronUp className="w-4 h-4 text-muted-foreground" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-muted-foreground" />
                    )}
                  </div>

                  {/* Expanded Detail */}
                  <AnimatePresence>
                    {isExpanded && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden"
                      >
                        <TechDetailPanel tech={tech} maxDevCount={maxDevCount} />
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </div>
    </PageTransition>
  );
};

function CompareBar({ label, value, max, color }: { label: string; value: number; max: number; color: string }) {
  const pct = Math.round((value / max) * 100);
  return (
    <div>
      <div className="flex justify-between text-muted-foreground mb-0.5">
        <span>{label}</span>
        <span className="text-foreground font-mono">{value}</span>
      </div>
      <div className="h-1.5 rounded-full bg-muted overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.5 }}
          className={`h-full rounded-full ${color}`}
        />
      </div>
    </div>
  );
}

function TechDetailPanel({ tech, maxDevCount }: { tech: TechDetail; maxDevCount: number }) {
  const profPct = (tech.avg_proficiency / 10) * 100;
  const popPct = (tech.developer_count / maxDevCount) * 100;

  return (
    <div className="px-4 pb-4 pt-2 border-t border-border">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatBlock
          icon={<Users className="w-4 h-4 text-primary" />}
          label="Developer Adoption"
          value={`${tech.developer_count} developers`}
          sub={`${Math.round(popPct)}% of max`}
          barPct={popPct}
          barColor="bg-primary"
        />
        <StatBlock
          icon={<BarChart3 className="w-4 h-4 text-accent" />}
          label="Avg Proficiency"
          value={`${tech.avg_proficiency} / 10`}
          sub={tech.avg_proficiency >= 7 ? "Advanced" : tech.avg_proficiency >= 4 ? "Intermediate" : "Beginner"}
          barPct={profPct}
          barColor="bg-accent"
        />
        <StatBlock
          icon={<Clock className="w-4 h-4 text-secondary" />}
          label="Avg Experience"
          value={`${tech.avg_years_used} years`}
          sub={tech.avg_years_used >= 5 ? "Well-established" : tech.avg_years_used >= 2 ? "Growing" : "Emerging"}
          barPct={(tech.avg_years_used / 10) * 100}
          barColor="bg-secondary"
        />
      </div>
    </div>
  );
}

function StatBlock({
  icon, label, value, sub, barPct, barColor,
}: {
  icon: React.ReactNode; label: string; value: string; sub: string;
  barPct: number; barColor: string;
}) {
  return (
    <div className="rounded-lg bg-muted/30 p-3">
      <div className="flex items-center gap-2 mb-2">
        {icon}
        <span className="text-xs text-muted-foreground">{label}</span>
      </div>
      <p className="text-sm font-bold text-foreground mb-0.5">{value}</p>
      <p className="text-[10px] text-muted-foreground mb-2">{sub}</p>
      <div className="h-1.5 rounded-full bg-muted overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${Math.min(barPct, 100)}%` }}
          transition={{ duration: 0.6 }}
          className={`h-full rounded-full ${barColor}`}
        />
      </div>
    </div>
  );
}

export default Technologies;
