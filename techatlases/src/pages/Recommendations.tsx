import { useState, useMemo } from "react";
import {
  Sparkles, X, Loader2, Zap, Clock, Target,
  ArrowRight, ChevronDown, ChevronUp, BookOpen, Layers, Map, Save, Check
} from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import Navbar from "@/components/Navbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import SpaceBackground from "@/components/SpaceBackground";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { toast } from "@/hooks/use-toast";
import { motion, AnimatePresence } from "framer-motion";
import LearningRoadmap from "@/components/LearningRoadmap";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface Recommendation {
  name: string;
  category: string;
  reason: string;
  priority: "high" | "medium" | "low";
  difficulty: "beginner" | "intermediate" | "advanced";
  timeToLearn: number;
  synergy: string;
}

interface RecommendationResult {
  recommendations: Recommendation[];
  summary: string;
}

const CAREER_GOALS = [
  "Full-Stack Developer",
  "Frontend Specialist",
  "Backend Engineer",
  "DevOps / SRE",
  "Data Engineer",
  "ML / AI Engineer",
  "Cloud Architect",
  "Mobile Developer",
  "Security Engineer",
  "Engineering Manager",
];

const EXPERIENCE_LEVELS = [
  { value: "junior", label: "Junior (0-2 years)" },
  { value: "mid", label: "Mid-Level (3-5 years)" },
  { value: "senior", label: "Senior (6-10 years)" },
  { value: "staff", label: "Staff+ (10+ years)" },
];

const PRIORITY_CONFIG = {
  high: { color: "hsl(160 100% 45%)", bg: "bg-emerald-500/10", text: "text-emerald-400", label: "High Priority" },
  medium: { color: "hsl(45 100% 55%)", bg: "bg-yellow-500/10", text: "text-yellow-400", label: "Medium" },
  low: { color: "hsl(210 100% 56%)", bg: "bg-blue-500/10", text: "text-blue-400", label: "Nice to Have" },
};

const DIFFICULTY_CONFIG = {
  beginner: { progress: 33, label: "Beginner" },
  intermediate: { progress: 66, label: "Intermediate" },
  advanced: { progress: 100, label: "Advanced" },
};

const Recommendations = () => {
  const [stackInput, setStackInput] = useState("");
  const [currentStack, setCurrentStack] = useState<string[]>([]);
  const [careerGoal, setCareerGoal] = useState("");
  const [experienceLevel, setExperienceLevel] = useState("");
  const [result, setResult] = useState<RecommendationResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [expandedIdx, setExpandedIdx] = useState<number | null>(null);
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [isSaving, setIsSaving] = useState(false);

  // Fetch available technologies for suggestions
  const { data: availableTech } = useQuery({
    queryKey: ["tech-names"],
    queryFn: async () => {
      const res = await api.get('/crud/technology?limit=500');
      return (res.rows ?? []).map((t: any) => t.name).sort();
    },
  });

  const suggestions = useMemo(() => {
    if (!stackInput || !availableTech) return [];
    const lower = stackInput.toLowerCase();
    return availableTech
      .filter((t) => t.toLowerCase().includes(lower) && !currentStack.includes(t))
      .slice(0, 6);
  }, [stackInput, availableTech, currentStack]);

  const addToStack = (tech: string) => {
    if (!currentStack.includes(tech)) {
      setCurrentStack((prev) => [...prev, tech]);
    }
    setStackInput("");
  };

  const removeFromStack = (tech: string) => {
    setCurrentStack((prev) => prev.filter((t) => t !== tech));
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && stackInput.trim()) {
      e.preventDefault();
      addToStack(stackInput.trim());
    }
  };

  const generateRecommendations = async () => {
    if (currentStack.length === 0) {
      toast({ title: "Add your current stack", description: "Select at least one technology you currently use.", variant: "destructive" });
      return;
    }
    if (!careerGoal) {
      toast({ title: "Select a career goal", variant: "destructive" });
      return;
    }
    if (!experienceLevel) {
      toast({ title: "Select your experience level", variant: "destructive" });
      return;
    }

    setIsLoading(true);
    // Don't clear result immediately so the old UI stays until the new one is ready
    setExpandedIdx(null);

    try {
      const data = await api.post('/services/recommend-skills', { currentStack, careerGoal, experienceLevel });
      setResult(data as RecommendationResult);
      toast({ title: "Recommendations generated!", description: `${data.recommendations.length} technologies suggested.` });
    } catch (err: any) {
      console.error(err);
      toast({ title: "Error", description: err.message || "Failed to generate recommendations", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };
  
  const saveRoadmap = async () => {
    if (!result || !user) return;
    setIsSaving(true);
    try {
      const promises = result.recommendations.map((rec, i) => 
        api.post('/crud/user_roadmap', {
          userId: user.id,
          technologyName: rec.name,
          status: 'planned',
          progress: 0,
          priority: i
        }).catch(() => null) // Ignore duplicates
      );
      await Promise.all(promises);
      toast({ title: "Roadmap saved to My Hub!", description: "You can now track your progress in your dashboard." });
    } catch (err) {
      toast({ title: "Error saving roadmap", variant: "destructive" });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden">
      <SpaceBackground />
      <Navbar />
      <div className="pt-20 px-4 max-w-5xl mx-auto pb-12">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-2 flex items-center gap-3">
          <Sparkles className="w-8 h-8 text-primary" />
          <h1 className="text-3xl font-bold text-foreground">Skill Recommendations</h1>
        </motion.div>
        <p className="text-muted-foreground mb-8">AI-powered technology suggestions based on your stack and career goals</p>

        {/* Input Form */}
        <Card className="border-primary/20 bg-card/80 backdrop-blur mb-8">
          <CardContent className="p-6 space-y-5">
            {/* Current Stack */}
            <div>
              <label className="text-sm font-medium text-foreground mb-2 block">Your Current Stack</label>
              <div className="relative">
                <Input
                  placeholder="Type a technology and press Enter..."
                  value={stackInput}
                  onChange={(e) => setStackInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  className="bg-muted/30 border-border"
                />
                {suggestions.length > 0 && (
                  <div className="absolute z-20 top-full mt-1 w-full bg-popover border border-border rounded-lg shadow-xl overflow-hidden">
                    {suggestions.map((s) => (
                      <button
                        key={s}
                        onClick={() => addToStack(s)}
                        className="w-full text-left px-3 py-2 text-sm text-popover-foreground hover:bg-accent transition-colors"
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                )}
              </div>
              {currentStack.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-3">
                  {currentStack.map((tech) => (
                    <Badge key={tech} variant="secondary" className="gap-1 cursor-pointer" onClick={() => removeFromStack(tech)}>
                      {tech} <X className="w-3 h-3" />
                    </Badge>
                  ))}
                </div>
              )}
            </div>

            {/* Career Goal & Experience */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-foreground mb-2 block">Career Goal</label>
                <Select value={careerGoal} onValueChange={setCareerGoal}>
                  <SelectTrigger className="bg-muted/30 border-border">
                    <SelectValue placeholder="Select a career path..." />
                  </SelectTrigger>
                  <SelectContent>
                    {CAREER_GOALS.map((g) => (
                      <SelectItem key={g} value={g}>{g}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium text-foreground mb-2 block">Experience Level</label>
                <Select value={experienceLevel} onValueChange={setExperienceLevel}>
                  <SelectTrigger className="bg-muted/30 border-border">
                    <SelectValue placeholder="Select level..." />
                  </SelectTrigger>
                  <SelectContent>
                    {EXPERIENCE_LEVELS.map((l) => (
                      <SelectItem key={l.value} value={l.value}>{l.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <Button onClick={generateRecommendations} disabled={isLoading} className="w-full sm:w-auto gap-2">
              {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
              {isLoading ? "Analyzing your stack..." : "Get Recommendations"}
            </Button>
          </CardContent>
        </Card>

        {/* Results */}
        {/* Results */}
        {result && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Summary */}
            <Card className="border-primary/20 bg-card/80 backdrop-blur">
              <CardContent className="p-5">
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-primary/10 shrink-0">
                    <Target className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground mb-1">Career Path Summary</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">{result.summary}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Tabs defaultValue="recommendations" className="space-y-6">
              <TabsList className="bg-card/80 backdrop-blur border border-primary/20 p-1 h-auto">
                <TabsTrigger 
                  value="recommendations" 
                  className="gap-2 py-2 px-4 data-[state=active]:bg-primary/20 data-[state=active]:text-foreground text-muted-foreground hover:text-foreground transition-all rounded-md"
                >
                  <Layers className="w-4 h-4" /> Recommendations
                </TabsTrigger>
                <TabsTrigger 
                  value="roadmap" 
                  className="gap-2 py-2 px-4 data-[state=active]:bg-primary/20 data-[state=active]:text-foreground text-muted-foreground hover:text-foreground transition-all rounded-md"
                >
                  <Map className="w-4 h-4" /> Learning Roadmap
                </TabsTrigger>
              </TabsList>

              <TabsContent value="recommendations" className="space-y-6 focus-visible:outline-none">
                {(["high", "medium", "low"] as const).map((priority) => {
                  const items = (result?.recommendations || []).filter((r) => r.priority === priority);
                  if (items.length === 0) return null;
                  const config = PRIORITY_CONFIG[priority];

                  return (
                    <div key={priority} className="space-y-3">
                      <div className="inline-flex items-center gap-2.5 mb-3 px-3.5 py-1.5 rounded-full bg-card/80 backdrop-blur-md border border-primary/20 shadow-sm">
                        <div className="w-2 h-2 rounded-full" style={{ background: config.color, boxShadow: `0 0 10px ${config.color}` }} />
                        <h2 className="text-sm font-bold text-foreground tracking-wide">{config.label}</h2>
                        <span className="text-xs font-mono text-muted-foreground bg-muted/50 px-2 py-0.5 rounded-md">({items.length})</span>
                      </div>
                      <div className="grid gap-3">
                        {items.map((rec, i) => {
                          const globalIdx = result.recommendations.indexOf(rec);
                          const isExpanded = expandedIdx === globalIdx;
                          const diffConfig = DIFFICULTY_CONFIG[rec.difficulty] || DIFFICULTY_CONFIG.intermediate;

                          return (
                            <div
                              key={`${rec.name}-${i}`}
                              className="animate-in fade-in slide-in-from-left-4 duration-300"
                              style={{ animationDelay: `${i * 0.05}s` }}
                            >
                              <Card
                                className={`border-primary/10 bg-card/80 backdrop-blur cursor-pointer transition-all hover:border-primary/30 ${isExpanded ? "ring-1 ring-primary/30" : ""}`}
                                onClick={() => setExpandedIdx(isExpanded ? null : globalIdx)}
                              >
                                <CardContent className="p-4">
                                  <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                      <div className={`w-9 h-9 rounded-lg ${config.bg} flex items-center justify-center`}>
                                        <Layers className={`w-4 h-4 ${config.text}`} />
                                      </div>
                                      <div>
                                        <h3 className="font-semibold text-foreground">{rec.name}</h3>
                                        <div className="flex items-center gap-2 mt-0.5">
                                          <Badge variant="outline" className="text-xs">{rec.category}</Badge>
                                          <span className="text-xs text-muted-foreground flex items-center gap-1">
                                            <Clock className="w-3 h-3" /> ~{rec.timeToLearn} weeks
                                          </span>
                                        </div>
                                      </div>
                                    </div>
                                    <div className="text-muted-foreground">
                                      {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                                    </div>
                                  </div>

                                  {isExpanded && (
                                    <div className="mt-4 pt-4 border-t border-border/50 space-y-4 animate-in fade-in zoom-in-95 duration-200">
                                      <div>
                                        <p className="text-xs text-muted-foreground mb-1 font-medium">Why Learn This</p>
                                        <p className="text-sm text-foreground leading-relaxed">{rec.reason}</p>
                                      </div>
                                      <div className="grid grid-cols-2 gap-4">
                                        <div>
                                          <p className="text-xs text-muted-foreground mb-1 font-medium">Difficulty</p>
                                          <div className="flex items-center gap-2">
                                            <Progress value={diffConfig.progress} className="h-1.5 flex-1" />
                                            <span className="text-xs text-foreground">{diffConfig.label}</span>
                                          </div>
                                        </div>
                                        <div>
                                          <p className="text-xs text-muted-foreground mb-1 font-medium">Time to Productive</p>
                                          <p className="text-sm font-semibold text-foreground">{rec.timeToLearn} weeks</p>
                                        </div>
                                      </div>
                                      <div>
                                        <p className="text-xs text-muted-foreground mb-1 flex items-center gap-1 font-medium">
                                          <Zap className="w-3 h-3 text-yellow-400" /> Synergy with Your Stack
                                        </p>
                                        <p className="text-sm text-foreground">{rec.synergy}</p>
                                      </div>
                                    </div>
                                  )}
                                </CardContent>
                              </Card>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </TabsContent>

              <TabsContent value="roadmap" className="focus-visible:outline-none">
                <Card className="border-primary/20 bg-card/80 backdrop-blur">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
                    <CardTitle className="text-lg font-bold">Generated Path</CardTitle>
                    <Button 
                      size="sm" 
                      onClick={saveRoadmap} 
                      disabled={isSaving}
                      className="gap-2"
                    >
                      {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                      Save to My Hub
                    </Button>
                  </CardHeader>
                  <CardContent className="p-6">
                    <LearningRoadmap recommendations={result.recommendations} />
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        )}

        {/* Empty state when no results yet */}
        {!result && !isLoading && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-16">
            <BookOpen className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">Add your stack, pick a career goal, and let AI suggest your next technologies.</p>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default Recommendations;
