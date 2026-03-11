import { useMemo } from "react";
import { motion } from "framer-motion";
import { Clock, Zap, Flag, ChevronRight, Trophy } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

interface Recommendation {
  name: string;
  category: string;
  reason: string;
  priority: "high" | "medium" | "low";
  difficulty: "beginner" | "intermediate" | "advanced";
  timeToLearn: number;
  synergy: string;
}

interface LearningRoadmapProps {
  recommendations: Recommendation[];
}

const PRIORITY_ORDER = { high: 0, medium: 1, low: 2 };
const DIFFICULTY_ORDER = { beginner: 0, intermediate: 1, advanced: 2 };

const PHASE_CONFIG = {
  high: { label: "Phase 1 — Core Skills", accent: "text-emerald-400", dot: "bg-emerald-400", line: "from-emerald-400" },
  medium: { label: "Phase 2 — Growth Skills", accent: "text-yellow-400", dot: "bg-yellow-400", line: "from-yellow-400" },
  low: { label: "Phase 3 — Exploration", accent: "text-blue-400", dot: "bg-blue-400", line: "from-blue-400" },
};

const LearningRoadmap = ({ recommendations }: LearningRoadmapProps) => {
  const sorted = useMemo(() => {
    return [...recommendations].sort((a, b) => {
      const p = PRIORITY_ORDER[a.priority] - PRIORITY_ORDER[b.priority];
      if (p !== 0) return p;
      return DIFFICULTY_ORDER[a.difficulty] - DIFFICULTY_ORDER[b.difficulty];
    });
  }, [recommendations]);

  const totalWeeks = useMemo(() => sorted.reduce((s, r) => s + r.timeToLearn, 0), [sorted]);

  const phases = useMemo(() => {
    const groups: Record<string, Recommendation[]> = {};
    sorted.forEach((r) => {
      (groups[r.priority] ??= []).push(r);
    });
    return (["high", "medium", "low"] as const)
      .filter((p) => groups[p]?.length)
      .map((p) => ({ priority: p, items: groups[p], config: PHASE_CONFIG[p] }));
  }, [sorted]);

  let cumulativeWeeks = 0;

  return (
    <div className="space-y-6">
      {/* Summary bar */}
      <div className="flex items-center justify-between flex-wrap gap-3 px-1">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Clock className="w-4 h-4" />
          <span>Estimated total: <strong className="text-foreground">{totalWeeks} weeks</strong></span>
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Flag className="w-4 h-4" />
          <span>{sorted.length} milestones</span>
        </div>
      </div>

      {/* Timeline */}
      {phases.map((phase, phaseIdx) => (
        <div key={phase.priority}>
          <motion.h3
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: phaseIdx * 0.15 }}
            className={`text-sm font-semibold mb-4 ${phase.config.accent}`}
          >
            {phase.config.label}
          </motion.h3>

          <div className="relative ml-4 border-l border-border/50 pl-6 space-y-6">
            {phase.items.map((rec, i) => {
              const startWeek = cumulativeWeeks;
              cumulativeWeeks += rec.timeToLearn;
              const progressPct = Math.round((cumulativeWeeks / totalWeeks) * 100);
              const isLast = phaseIdx === phases.length - 1 && i === phase.items.length - 1;

              return (
                <motion.div
                  key={rec.name}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: phaseIdx * 0.15 + i * 0.08 }}
                  className="relative"
                >
                  {/* Dot on the timeline */}
                  <div className={`absolute -left-[calc(1.5rem+5px)] top-1.5 w-2.5 h-2.5 rounded-full ${phase.config.dot} ring-2 ring-background`} />

                  <div className="bg-card/60 backdrop-blur border border-border/40 rounded-lg p-4 hover:border-primary/30 transition-colors">
                    <div className="flex items-start justify-between gap-3 mb-2">
                      <div>
                        <h4 className="font-semibold text-foreground flex items-center gap-2">
                          {rec.name}
                          {isLast && <Trophy className="w-4 h-4 text-yellow-400" />}
                        </h4>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant="outline" className="text-xs">{rec.category}</Badge>
                          <Badge variant="secondary" className="text-xs capitalize">{rec.difficulty}</Badge>
                        </div>
                      </div>
                      <span className="text-xs text-muted-foreground whitespace-nowrap mt-1">
                        Week {startWeek + 1}–{cumulativeWeeks}
                      </span>
                    </div>

                    <p className="text-xs text-muted-foreground mb-3 leading-relaxed">{rec.reason}</p>

                    <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
                      <Zap className="w-3 h-3" />
                      <span>Synergy: {rec.synergy}</span>
                    </div>

                    {/* Cumulative progress */}
                    <div className="flex items-center gap-2 mt-3">
                      <Progress value={progressPct} className="h-1.5 flex-1" />
                      <span className="text-xs text-foreground font-medium">{progressPct}%</span>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      ))}

      {/* Finish line */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.6 }}
        className="flex items-center gap-3 ml-4 pl-6 pt-2"
      >
        <div className="absolute -left-0 w-2.5 h-2.5 rounded-full bg-primary ring-2 ring-background" />
        <Trophy className="w-5 h-5 text-primary" />
        <span className="text-sm font-semibold text-foreground">Roadmap Complete — ~{totalWeeks} weeks</span>
      </motion.div>
    </div>
  );
};

export default LearningRoadmap;
