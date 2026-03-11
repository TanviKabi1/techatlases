import { lazy, Suspense, useState, useMemo } from "react";
import { Globe, Users, MapPin, TrendingUp, RotateCw, Filter, Zap } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/Navbar";
import PageTransition from "@/components/PageTransition";
import { motion, AnimatePresence } from "framer-motion";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const Globe3D = lazy(() => import("@/components/Globe3D"));

const REGIONS = ["All", "Asia", "Europe", "North America", "South America", "Africa", "Middle East", "Oceania"];

const GlobalMap = () => {
  const [autoRotate, setAutoRotate] = useState(true);
  const [selectedRegion, setSelectedRegion] = useState("All");
  const [selectedCountry, setSelectedCountry] = useState<string | null>(null);

  const { data: countryData = [], isLoading } = useQuery({
    queryKey: ["developers-by-country"],
    queryFn: async () => {
      const { data, error } = await supabase.from("developers").select("country");
      if (error) throw error;
      const counts: Record<string, number> = {};
      data?.forEach((d) => {
        if (d.country) counts[d.country] = (counts[d.country] || 0) + 1;
      });
      return Object.entries(counts)
        .map(([country, count]) => ({ country, count }))
        .sort((a, b) => b.count - a.count);
    },
  });

  // Fetch top tech per country when selected
  const { data: countryTech = [] } = useQuery({
    queryKey: ["country-tech", selectedCountry],
    enabled: !!selectedCountry,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("developer_technology_view")
        .select("technology_name, country")
        .eq("country", selectedCountry!);
      if (error) throw error;
      const techCounts: Record<string, number> = {};
      data?.forEach((d) => {
        if (d.technology_name) techCounts[d.technology_name] = (techCounts[d.technology_name] || 0) + 1;
      });
      return Object.entries(techCounts)
        .map(([name, count]) => ({ name, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 5);
    },
  });

  // Fetch AI tool usage for selected country
  const { data: countryAI = [] } = useQuery({
    queryKey: ["country-ai", selectedCountry],
    enabled: !!selectedCountry,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("ai_tool_usage_view")
        .select("tool_name, country")
        .eq("country", selectedCountry!);
      if (error) throw error;
      const toolCounts: Record<string, number> = {};
      data?.forEach((d) => {
        if (d.tool_name) toolCounts[d.tool_name] = (toolCounts[d.tool_name] || 0) + 1;
      });
      return Object.entries(toolCounts)
        .map(([name, count]) => ({ name, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 3);
    },
  });

  const totalDevs = countryData.reduce((s, d) => s + d.count, 0);
  const totalCountries = countryData.length;
  const selectedCountryData = useMemo(
    () => countryData.find((d) => d.country === selectedCountry),
    [countryData, selectedCountry]
  );

  return (
    <PageTransition>
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-20 px-4 max-w-[1600px] mx-auto pb-12">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6"
        >
          <div className="flex items-center gap-3">
            <Globe className="w-8 h-8 text-primary" />
            <div>
              <h1 className="text-3xl font-bold text-foreground text-glow-blue">
                Global Developer Map
              </h1>
              <p className="text-muted-foreground text-sm">
                Interactive 3D visualization across {totalCountries} countries
              </p>
            </div>
          </div>

          {/* Controls */}
          <div className="flex items-center gap-4 flex-wrap">
            <div className="flex items-center gap-2">
              <RotateCw className="w-4 h-4 text-muted-foreground" />
              <span className="text-xs text-muted-foreground">Auto-rotate</span>
              <Switch checked={autoRotate} onCheckedChange={setAutoRotate} />
            </div>
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-muted-foreground" />
              <Select value={selectedRegion} onValueChange={setSelectedRegion}>
                <SelectTrigger className="w-[160px] h-8 text-xs glass border-primary/20">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {REGIONS.map((r) => (
                    <SelectItem key={r} value={r}>{r}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </motion.div>

        {/* Stats row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
          {[
            { icon: Users, label: "Total Developers", value: totalDevs.toLocaleString(), color: "text-primary" },
            { icon: MapPin, label: "Countries", value: totalCountries, color: "text-accent" },
            { icon: TrendingUp, label: "Top Country", value: countryData[0]?.country || "—", color: "text-secondary" },
            { icon: Zap, label: "Region", value: selectedRegion, color: "text-primary" },
          ].map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="glass glass-hover rounded-xl p-3 flex items-center gap-3"
            >
              <stat.icon className={`w-4 h-4 ${stat.color}`} />
              <div>
                <p className="text-[10px] text-muted-foreground uppercase tracking-wider">{stat.label}</p>
                <p className="text-sm font-bold text-foreground">{stat.value}</p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Main content */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Globe */}
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="lg:col-span-3 glass rounded-2xl overflow-hidden"
            style={{ height: "560px" }}
          >
            <Suspense
              fallback={
                <div className="w-full h-full flex items-center justify-center">
                  <div className="text-center">
                    <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-3" />
                    <p className="text-muted-foreground text-sm">Initializing 3D globe...</p>
                  </div>
                </div>
              }
            >
              {!isLoading && (
                <Globe3D
                  data={countryData}
                  selectedRegion={selectedRegion}
                  onCountrySelect={setSelectedCountry}
                  autoRotate={autoRotate}
                />
              )}
            </Suspense>
          </motion.div>

          {/* Sidebar */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
            className="space-y-4"
          >
            {/* Selected country detail */}
            <AnimatePresence mode="wait">
              {selectedCountry && selectedCountryData ? (
                <motion.div
                  key={selectedCountry}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="glass rounded-xl p-4"
                >
                  <h3 className="text-lg font-bold text-foreground text-glow-cyan mb-3">
                    {selectedCountry}
                  </h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Developers</span>
                      <span className="text-foreground font-semibold">{selectedCountryData.count.toLocaleString()}</span>
                    </div>
                    {countryTech.length > 0 && (
                      <div>
                        <span className="text-muted-foreground text-xs uppercase tracking-wider">Top Languages</span>
                        <div className="mt-1 space-y-1.5">
                          {countryTech.map((t, i) => (
                            <div key={t.name} className="flex items-center gap-2">
                              <div className="flex-1 h-1.5 rounded-full bg-muted overflow-hidden">
                                <div
                                  className="h-full rounded-full"
                                  style={{
                                    width: `${(t.count / countryTech[0].count) * 100}%`,
                                    background: i === 0 ? "hsl(var(--primary))" : i === 1 ? "hsl(var(--accent))" : "hsl(var(--secondary))",
                                  }}
                                />
                              </div>
                              <span className="text-xs text-foreground w-20 truncate">{t.name}</span>
                              <span className="text-[10px] text-muted-foreground font-mono">{t.count}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    {countryAI.length > 0 && (
                      <div className="pt-2 border-t border-primary/10">
                        <span className="text-muted-foreground text-xs uppercase tracking-wider">Top AI Tools</span>
                        <div className="mt-1 space-y-1">
                          {countryAI.map((a) => (
                            <div key={a.name} className="flex justify-between text-xs">
                              <span className="text-foreground">{a.name}</span>
                              <span className="text-accent font-mono">{a.count}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  key="placeholder"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="glass rounded-xl p-4 text-center"
                >
                  <MapPin className="w-6 h-6 text-muted-foreground mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">
                    Click a country on the globe to view details
                  </p>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Legend */}
            <div className="glass rounded-xl p-4">
              <h4 className="text-xs font-semibold text-foreground uppercase tracking-wider mb-3">
                Developer Density
              </h4>
              <div className="space-y-2 text-xs">
                {[
                  { color: "#3b82f6", label: "High", desc: "15+" },
                  { color: "#22d3ee", label: "Medium", desc: "8–14" },
                  { color: "#a855f7", label: "Low", desc: "3–7" },
                  { color: "#7c3aed", label: "Minimal", desc: "1–2" },
                ].map((item) => (
                  <div key={item.label} className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full" style={{ background: item.color, boxShadow: `0 0 8px ${item.color}55` }} />
                    <span className="text-foreground">{item.label}</span>
                    <span className="text-muted-foreground ml-auto">{item.desc}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Top countries list */}
            <div className="glass rounded-xl p-4">
              <h4 className="text-xs font-semibold text-foreground uppercase tracking-wider mb-3">
                Top Countries
              </h4>
              <div className="space-y-2">
                {countryData.slice(0, 8).map((item, i) => {
                  const pct = (item.count / totalDevs) * 100;
                  return (
                    <button
                      key={item.country}
                      onClick={() => setSelectedCountry(item.country)}
                      className={`w-full flex items-center gap-2 text-left hover:bg-primary/5 rounded px-1 py-0.5 transition-colors ${
                        selectedCountry === item.country ? "bg-primary/10" : ""
                      }`}
                    >
                      <span className="text-[10px] text-muted-foreground w-4 text-right">{i + 1}</span>
                      <span className="text-xs text-foreground flex-1 truncate">{item.country}</span>
                      <div className="w-16 h-1.5 rounded-full bg-muted overflow-hidden">
                        <div
                          className="h-full rounded-full"
                          style={{
                            width: `${pct}%`,
                            background: i < 2 ? "#3b82f6" : i < 5 ? "#22d3ee" : "#a855f7",
                          }}
                        />
                      </div>
                      <span className="text-[10px] font-mono text-muted-foreground w-6 text-right">{item.count}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Arcs info */}
            <div className="glass rounded-xl p-4">
              <h4 className="text-xs font-semibold text-foreground uppercase tracking-wider mb-3">
                Collaboration Arcs
              </h4>
              <p className="text-[11px] text-muted-foreground">
                Animated arcs represent technology collaboration corridors and developer migration patterns between ecosystems.
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
    </PageTransition>
  );
};

export default GlobalMap;
