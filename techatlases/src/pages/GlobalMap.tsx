import { lazy, Suspense, useState, useMemo } from "react";
import { Globe, Users, MapPin, TrendingUp, RotateCw, Filter, Zap } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import Navbar from "@/components/Navbar";
import PageTransition from "@/components/PageTransition";
import { motion, AnimatePresence } from "framer-motion";
import SpaceBackground from "@/components/SpaceBackground";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

import Globe3D from "@/components/Globe3D";

const REGIONS = ["All", "Asia", "Europe", "North America", "South America", "Africa", "Middle East", "Oceania"];

const GlobalMap = () => {
  const [autoRotate, setAutoRotate] = useState(true);
  const [selectedRegion, setSelectedRegion] = useState("All");
  const [selectedCountry, setSelectedCountry] = useState<string | null>(null);

  const { data: countryData = [], isLoading } = useQuery({
    queryKey: ["developers-by-country"],
    queryFn: async () => {
      const res = await api.get('/crud/developers?limit=2000');
      const counts: Record<string, number> = {};
      res.rows?.forEach((d: any) => {
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
      // Fetch more rows to ensure we cover all developers' tech
      const res = await api.get(`/crud/developers_tech?limit=2000&include=technology,developer`);
      const techCounts: Record<string, number> = {};
      
      res.rows?.forEach((d: any) => {
        // Filter by country on frontend since generic crud doesn't support nested relation filtering
        if (d.developer?.country === selectedCountry) {
          const name = d.technology?.name;
          if (name) techCounts[name] = (techCounts[name] || 0) + 1;
        }
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
      const res = await api.get('/ai-tools/usage');
      const countryAI = res.filter((r: any) => r.country === selectedCountry);
      const toolCounts: Record<string, number> = {};
      countryAI.forEach((d: any) => {
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
    <div className="min-h-screen relative overflow-hidden">
      <SpaceBackground />
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
            className="lg:col-span-3 bg-card/20 border border-primary/20 rounded-3xl overflow-hidden relative shadow-2xl backdrop-blur-md"
            style={{ height: "640px", zIndex: 10 }}
          >
            <div className="absolute top-6 left-6 z-20 pointer-events-none">
              <div className="flex items-center gap-2 mb-1">
                <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                <span className="text-[10px] font-bold text-primary uppercase tracking-[0.2em]">Quantum Network Active</span>
              </div>
              <h2 className="text-2xl font-bold text-foreground">Global Intelligence Hub</h2>
            </div>

            <Suspense
              fallback={
                <div className="w-full h-full flex items-center justify-center bg-background/50 backdrop-blur-xl">
                  <div className="text-center">
                    <div className="w-12 h-12 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                    <p className="text-muted-foreground text-sm font-medium tracking-wide">Synchronizing Neural Arcs...</p>
                  </div>
                </div>
              }
            >
              {!isLoading && (
                <Globe3D
                  data={countryData}
                  selectedRegion={selectedRegion}
                  selectedCountry={selectedCountry}
                  onCountrySelect={setSelectedCountry}
                  autoRotate={autoRotate}
                />
              )}
            </Suspense>

            {/* Bottom Gradient Overlay for depth */}
            <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-background/80 to-transparent pointer-events-none z-10" />
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
                  className="glass rounded-2xl p-5 border-primary/30 shadow-2xl backdrop-blur-2xl bg-primary/5"
                >
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xl font-bold text-foreground tracking-tight">
                      {selectedCountry}
                    </h3>
                    <div className="px-2 py-1 rounded-md bg-primary/20 text-primary text-[10px] font-bold uppercase tracking-wider">
                      Active Node
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-muted-foreground uppercase font-semibold">Total Developers</span>
                      <span className="text-base font-mono font-bold text-foreground">{selectedCountryData.count.toLocaleString()}</span>
                    </div>

                    {countryTech.length > 0 && (
                      <div className="space-y-3 pt-4 border-t border-primary/10">
                        <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest">Technological Stack</span>
                        <div className="space-y-3">
                          {countryTech.map((t, i) => (
                            <div key={t.name} className="space-y-1">
                              <div className="flex justify-between text-[11px]">
                                <span className="text-foreground font-medium">{t.name}</span>
                                <span className="text-muted-foreground font-mono">{t.count}</span>
                              </div>
                              <div className="h-1.5 w-full rounded-full bg-muted/30 overflow-hidden">
                                <motion.div
                                  initial={{ width: 0 }}
                                  animate={{ width: `${(t.count / countryTech[0].count) * 100}%` }}
                                  className="h-full rounded-full"
                                  style={{
                                    background: i === 0 ? "hsl(var(--primary))" : i === 1 ? "hsl(var(--accent))" : "hsl(var(--secondary))",
                                    boxShadow: `0 0 10px ${i === 0 ? "hsl(var(--primary) / 0.3)" : "none"}`
                                  }}
                                />
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {countryAI.length > 0 && (
                      <div className="pt-4 border-t border-primary/10">
                        <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest mb-2 block">AI Integration</span>
                        <div className="grid grid-cols-1 gap-2">
                          {countryAI.map((a) => (
                            <div key={a.name} className="flex items-center justify-between bg-muted/20 rounded-lg p-2 border border-primary/5 hover:border-primary/20 transition-colors">
                              <span className="text-[11px] text-foreground font-medium">{a.name}</span>
                              <span className="text-[11px] text-accent font-bold font-mono">{a.count}</span>
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
            <div className="glass rounded-2xl p-4 border-primary/20 shadow-xl backdrop-blur-xl">
              <h4 className="text-xs font-bold text-foreground uppercase tracking-widest mb-4 flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-accent" />
                Connectivity Density
              </h4>
              <div className="space-y-3 text-xs">
                {[
                  { color: "hsl(var(--primary))", label: "Global Hub", desc: "15+" },
                  { color: "hsl(var(--accent))", label: "Active Node", desc: "8–14" },
                  { color: "hsl(var(--secondary))", label: "Developing", desc: "3–7" },
                  { color: "hsl(var(--muted-foreground) / 0.5)", label: "Emerging", desc: "1–2" },
                ].map((item) => (
                  <div key={item.label} className="flex items-center gap-3">
                    <span className="w-2.5 h-2.5 rounded-full" style={{ background: item.color, boxShadow: `0 0 10px ${item.color}` }} />
                    <span className="text-foreground font-medium">{item.label}</span>
                    <span className="text-muted-foreground ml-auto font-mono text-[10px]">{item.desc}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Top countries list */}
            <div className="glass rounded-2xl p-4 border-primary/20 shadow-xl backdrop-blur-xl">
              <h4 className="text-xs font-bold text-foreground uppercase tracking-widest mb-4 flex items-center gap-2">
                <TrendingUp className="w-3 h-3 text-primary" />
                Regional Dominance
              </h4>
              <div className="space-y-2.5">
                {countryData.slice(0, 8).map((item, i) => {
                  const pct = (item.count / totalDevs) * 100;
                  return (
                    <button
                      key={item.country}
                      onClick={() => setSelectedCountry(item.country)}
                      className={`w-full group flex items-center gap-3 text-left hover:bg-primary/10 rounded-xl px-2 py-1.5 transition-all border border-transparent ${
                        selectedCountry === item.country ? "bg-primary/15 border-primary/20" : ""
                      }`}
                    >
                      <span className="text-[10px] font-mono text-muted-foreground w-4 text-right">{i + 1}</span>
                      <span className="text-xs font-semibold text-foreground flex-1 truncate">{item.country}</span>
                      <div className="w-16 h-1.5 rounded-full bg-muted/30 overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${pct}%` }}
                          className="h-full rounded-full"
                          style={{
                            background: i < 2 ? "hsl(var(--primary))" : i < 5 ? "hsl(var(--accent))" : "hsl(var(--secondary))",
                            boxShadow: `0 0 8px ${i < 2 ? "hsl(var(--primary) / 0.4)" : "hsl(var(--accent) / 0.4)"}`
                          }}
                        />
                      </div>
                      <span className="text-[10px] font-mono text-foreground font-bold w-6 text-right">{item.count}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Arcs info */}
            <div className="glass rounded-2xl p-4 border-primary/20 shadow-xl backdrop-blur-xl bg-primary/5">
              <h4 className="text-xs font-bold text-foreground uppercase tracking-widest mb-2 flex items-center gap-2">
                <Zap className="w-3 h-3 text-primary animate-pulse" />
                Data Transmission
              </h4>
              <p className="text-[10px] leading-relaxed text-muted-foreground/80">
                Neural arcs represent active knowledge exchange corridors and infrastructure collaboration between sovereign data hubs.
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
