import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Star, Bookmark, Map, TrendingUp, Plus, X, Sparkles,
  ArrowRight, BookOpen, Target, Zap, Trophy, Brain,
  ClipboardList, Wrench, CheckSquare, Trash2
} from "lucide-react";
import Navbar from "@/components/Navbar";
import PageTransition from "@/components/PageTransition";
import SpaceBackground from "@/components/SpaceBackground";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { Link } from "react-router-dom";
import { Progress } from "@/components/ui/progress";

const CAREER_PATHS = [
  { id: "frontend", label: "Frontend Developer", techs: ["React", "TypeScript", "CSS", "Next.js", "Tailwind", "Vite"] },
  { id: "backend", label: "Backend Developer", techs: ["Node.js", "Python", "PostgreSQL", "Docker", "Redis", "Express"] },
  { id: "data", label: "Data Scientist", techs: ["Python", "SQL", "TensorFlow", "Pandas", "R", "Numpy", "Scikit-Learn"] },
  { id: "ai", label: "AI Engineer", techs: ["Python", "PyTorch", "TensorFlow", "LangChain", "MLOps", "OpenAI"] },
  { id: "devops", label: "DevOps Engineer", techs: ["Docker", "Kubernetes", "AWS", "Terraform", "CI/CD", "GitHub Actions"] },
  { id: "fullstack", label: "Full-Stack Developer", techs: ["React", "Node.js", "TypeScript", "PostgreSQL", "Docker", "Prisma"] },
];

const TREND_OPTIONS = [
  { name: "AI Tools Growth", category: "AI" },
  { name: "Cloud Adoption", category: "Cloud" },
  { name: "Framework Popularity", category: "Frameworks" },
  { name: "Language Trends", category: "Languages" },
  { name: "Remote Work Growth", category: "Workplace" },
  { name: "Salary Trends", category: "Career" },
];

const MyDashboard = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [techInput, setTechInput] = useState("");

  useEffect(() => {
    if (!loading && !user) navigate("/login");
  }, [user, loading, navigate]);

  // Fetch saved technologies
  const { data: savedTechs = [] } = useQuery({
    queryKey: ["saved-technologies", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const res = await api.get(`/crud/saved_technologies?userId=${user!.id}&sort=created_at&order=desc`);
      return res.rows || [];
    },
  });

  // Fetch saved trends
  const { data: savedTrends = [] } = useQuery({
    queryKey: ["saved-trends", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const res = await api.get(`/crud/saved_trends?userId=${user!.id}&sort=created_at&order=desc`);
      return res.rows || [];
    },
  });

  // Fetch roadmap
  const { data: roadmap = [] } = useQuery({
    queryKey: ["user-roadmap", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const res = await api.get(`/crud/user_roadmap?userId=${user!.id}&sort=priority&order=asc`);
      return res.rows || [];
    },
  });

  // Mutations
  const addTech = useMutation({
    mutationFn: async (name: string) => {
      await api.post(`/crud/saved_technologies`, { userId: user!.id, technologyName: name });
    },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["saved-technologies"] }); toast({ title: "Technology saved!" }); },
    onError: () => toast({ title: "Already saved or error", variant: "destructive" }),
  });

  const removeTech = useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/crud/saved_technologies/${id}`);
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["saved-technologies"] }),
  });

  const toggleTrend = useMutation({
    mutationFn: async (trend: { name: string; category: string }) => {
      const existing = savedTrends.find((t: any) => t.trend_name === trend.name);
      if (existing) {
        await api.delete(`/crud/saved_trends/${existing.id}`);
      } else {
        await api.post(`/crud/saved_trends`, {
          user_id: user!.id,
          trend_name: trend.name,
          trend_category: trend.category,
        });
      }
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["saved-trends"] }),
  });

  const addToRoadmap = useMutation({
    mutationFn: async (techName: string) => {
      await api.post(`/crud/user_roadmap`, {
        user_id: user!.id,
        technology_name: techName,
        priority: roadmap.length,
        status: "planned",
      });
    },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["user-roadmap"] }); toast({ title: "Added to roadmap!" }); },
    onError: () => toast({ title: "Already in roadmap", variant: "destructive" }),
  });

  const updateRoadmapStatus = useMutation({
    mutationFn: async ({ id, status, progress }: { id: string; status: string; progress?: number }) => {
      const data: any = { status };
      if (progress !== undefined) data.progress = progress;
      else if (status === "completed") data.progress = 100;
      else if (status === "planned") data.progress = 0;
      
      await api.put(`/crud/user_roadmap/${id}`, data);
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["user-roadmap"] }),
  });

  const removeFromRoadmap = useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/crud/user_roadmap/${id}`);
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["user-roadmap"] }),
  });

  // Suggest next techs based on saved
  const suggestions = (() => {
    const savedNames = savedTechs.map((t: any) => t.technology_name.toLowerCase());
    
    // If no skills saved, suggest popular starter skills
    if (savedNames.length === 0) {
      return ["React", "Python", "JavaScript", "Node.js", "SQL", "Docker"];
    }

    const matched = CAREER_PATHS.filter(p => p.techs.some(t => savedNames.includes(t.toLowerCase())));
    const suggested = new Set<string>();
    
    // Add skills from matched paths
    matched.forEach(p => p.techs.forEach(t => {
      if (!savedNames.includes(t.toLowerCase())) suggested.add(t);
    }));

    // If still few suggestions, add from most popular paths
    if (suggested.size < 4) {
      CAREER_PATHS.slice(0, 3).forEach(p => p.techs.forEach(t => {
        if (!savedNames.includes(t.toLowerCase())) suggested.add(t);
      }));
    }

    return Array.from(suggested).slice(0, 6);
  })();

  if (loading) return null;
  if (!user) return null;

  const handleAddTech = () => {
    if (!techInput.trim()) return;
    addTech.mutate(techInput.trim());
    setTechInput("");
  };

  return (
    <PageTransition>
      <div className="min-h-screen relative overflow-hidden">
        <SpaceBackground />
        <Navbar />
        <div className="max-w-6xl mx-auto pt-20 px-4 pb-12">
          {/* Header */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
            <h1 className="text-3xl sm:text-4xl font-bold text-foreground mb-2">
              Welcome back, <span className="text-primary text-glow-blue">{(user as any).user_metadata?.display_name || (user as any).display_name || "Developer"}</span>
            </h1>
            <p className="text-muted-foreground">Your personalized developer intelligence hub.</p>
          </motion.div>

          <Tabs defaultValue="skills" className="space-y-6">
            <TabsList className="glass border border-border/30">
              <TabsTrigger value="skills"><Star className="w-4 h-4 mr-1" /> My Skills</TabsTrigger>
              <TabsTrigger value="roadmap"><Map className="w-4 h-4 mr-1" /> Roadmap</TabsTrigger>
              <TabsTrigger value="trends"><TrendingUp className="w-4 h-4 mr-1" /> Trends</TabsTrigger>
              <TabsTrigger value="career"><Target className="w-4 h-4 mr-1" /> Career Sim</TabsTrigger>
            </TabsList>

            {/* ── My Skills ── */}
            <TabsContent value="skills">
              <div className="grid lg:grid-cols-2 gap-6">
                <Card className="glass border-border/30">
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Star className="w-5 h-5 text-primary" /> Saved Technologies
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex gap-2 mb-4">
                      <Input
                        value={techInput}
                        onChange={e => setTechInput(e.target.value)}
                        onKeyDown={e => e.key === "Enter" && handleAddTech()}
                        placeholder="Add a technology..."
                        className="bg-muted/50"
                      />
                      <Button onClick={handleAddTech} size="icon" className="shrink-0"><Plus className="w-4 h-4" /></Button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <AnimatePresence>
                        {savedTechs.map((t: any) => (
                          <motion.div key={t.id} initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}>
                            <Badge variant="secondary" className="gap-1 pr-1 text-sm">
                              {t.technology_name}
                              <button onClick={() => removeTech.mutate(t.id)} className="ml-1 hover:text-destructive">
                                <X className="w-3 h-3" />
                              </button>
                            </Badge>
                          </motion.div>
                        ))}
                      </AnimatePresence>
                      {savedTechs.length === 0 && (
                        <p className="text-sm text-muted-foreground">Add technologies you know to get personalized suggestions.</p>
                      )}
                    </div>
                  </CardContent>
                </Card>

                <Card className="glass border-border/30">
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Sparkles className="w-5 h-5 text-accent" /> Suggested Next Skills
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {suggestions.length > 0 ? (
                      <div className="space-y-2">
                        {suggestions.map(s => (
                          <motion.div
                            key={s}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="flex items-center justify-between glass-hover rounded-lg p-3"
                          >
                            <span className="text-sm text-foreground font-medium">{s}</span>
                            <Button size="sm" variant="ghost" onClick={() => addToRoadmap.mutate(s)} className="text-xs gap-1">
                              <Plus className="w-3 h-3" /> Add to Roadmap
                            </Button>
                          </motion.div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-6">
                        <Brain className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                        <p className="text-sm text-muted-foreground">Save some technologies to get AI-powered suggestions.</p>
                      </div>
                    )}
                    <Link to="/recommendations" className="block mt-4">
                      <Button variant="outline" className="w-full border-primary/30 gap-2">
                        <Zap className="w-4 h-4" /> Get AI Recommendations
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* ── Learning Roadmap ── */}
            <TabsContent value="roadmap">
              <Card className="glass border-border/30">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Map className="w-5 h-5 text-primary" /> Learning Roadmap
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {roadmap.length > 0 ? (
                    <div className="space-y-4">
                      {roadmap.map((item: any, i: number) => {
                        const statusColor = 
                          item.status === "completed" ? "bg-green-500" :
                          item.status === "in_progress" ? "bg-blue-500" : "bg-muted-foreground/40";
                        
                        return (
                          <motion.div
                            key={item.id}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: i * 0.05 }}
                            className="flex items-center justify-between group p-2 rounded-lg hover:bg-muted/30 transition-colors"
                          >
                            <div className="flex items-center gap-4">
                              <div className={`w-2.5 h-2.5 rounded-full ${statusColor} shadow-[0_0_8px_rgba(var(--primary),0.5)]`} />
                              <span className={`text-sm font-medium transition-colors ${
                                item.status === "completed" ? "text-muted-foreground line-through" : "text-foreground"
                              }`}>
                                {item.technology_name}
                              </span>
                            </div>
                            
                            <div className="flex items-center gap-1 opacity-60 group-hover:opacity-100 transition-opacity">
                              <Button
                                size="icon"
                                variant="ghost"
                                onClick={() => updateRoadmapStatus.mutate({ id: item.id, status: "planned" })}
                                className={`w-8 h-8 ${item.status === "planned" ? "bg-muted text-foreground" : "text-muted-foreground hover:text-foreground"}`}
                              >
                                <ClipboardList className="w-4 h-4" />
                              </Button>
                              <Button
                                size="icon"
                                variant="ghost"
                                onClick={() => updateRoadmapStatus.mutate({ id: item.id, status: "in_progress" })}
                                className={`w-8 h-8 ${item.status === "in_progress" ? "bg-blue-500/10 text-blue-500" : "text-muted-foreground hover:text-blue-500"}`}
                              >
                                <Wrench className="w-4 h-4" />
                              </Button>
                              <Button
                                size="icon"
                                variant="ghost"
                                onClick={() => updateRoadmapStatus.mutate({ id: item.id, status: "completed" })}
                                className={`w-8 h-8 ${item.status === "completed" ? "bg-green-500/10 text-green-500" : "text-muted-foreground hover:text-green-500"}`}
                              >
                                <CheckSquare className="w-4 h-4" />
                              </Button>
                              <div className="w-[1px] h-4 bg-border/50 mx-1" />
                              <Button
                                size="icon"
                                variant="ghost"
                                onClick={() => removeFromRoadmap.mutate(item.id)}
                                className="w-8 h-8 text-muted-foreground hover:text-destructive"
                              >
                                <X className="w-4 h-4" />
                              </Button>
                            </div>
                          </motion.div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <BookOpen className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
                      <p className="text-muted-foreground mb-6">Your roadmap is empty. Start by getting some recommendations!</p>
                      <Link to="/recommendations">
                        <Button className="gap-2">
                          <Sparkles className="w-4 h-4" /> Get AI Roadmap
                        </Button>
                      </Link>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* ── Trend Tracker ── */}
            <TabsContent value="trends">
              <Card className="glass border-border/30">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-accent" /> Trend Tracker
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-4">Bookmark trends to track on your dashboard.</p>
                  <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {TREND_OPTIONS.map(trend => {
                      const isSaved = savedTrends.some((t: any) => t.trend_name === trend.name);
                      return (
                        <motion.button
                          key={trend.name}
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => toggleTrend.mutate(trend)}
                          className={`glass-hover rounded-xl p-4 text-left transition-all ${
                            isSaved ? "border border-primary/40 bg-primary/5" : "border border-border/30"
                          }`}
                        >
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-sm font-semibold text-foreground">{trend.name}</span>
                            <Bookmark className={`w-4 h-4 ${isSaved ? "text-primary fill-primary" : "text-muted-foreground"}`} />
                          </div>
                          <span className="text-xs text-muted-foreground">{trend.category}</span>
                        </motion.button>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* ── Career Simulator ── */}
            <TabsContent value="career">
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {CAREER_PATHS.map((path, i) => (
                  <motion.div
                    key={path.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.08 }}
                  >
                    <Card className="glass glass-hover border-border/30 h-full">
                      <CardHeader className="pb-3">
                        <CardTitle className="text-base flex items-center gap-2">
                          <Trophy className="w-4 h-4 text-primary" />
                          {path.label}
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-xs text-muted-foreground mb-3">Recommended stack:</p>
                        <div className="flex flex-wrap gap-1.5 mb-4">
                          {path.techs.map(t => {
                            const known = savedTechs.some((s: any) => s.technology_name.toLowerCase() === t.toLowerCase());
                            return (
                              <Badge key={t} variant={known ? "default" : "outline"} className={`text-xs ${known ? "" : "border-border/50 text-muted-foreground"}`}>
                                {known && "✓ "}{t}
                              </Badge>
                            );
                          })}
                        </div>
                        <div className="text-xs text-muted-foreground flex justify-between items-center">
                          <span>
                            {path.techs.filter(t => savedTechs.some((s: any) => s.technology_name.toLowerCase() === t.toLowerCase())).length}/{path.techs.length} skills matched
                          </span>
                          <span className="font-mono text-primary">
                            {Math.round((path.techs.filter(t => savedTechs.some((s: any) => s.technology_name.toLowerCase() === t.toLowerCase())).length / path.techs.length) * 100)}%
                          </span>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </PageTransition>
  );
};

export default MyDashboard;
