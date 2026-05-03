import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, ShieldCheck, BrainCircuit, Loader2, CheckCircle2 } from 'lucide-react';

interface AgentStatus {
  id: string;
  name: string;
  icon: React.ReactNode;
  status: 'idle' | 'working' | 'done';
  description: string;
}

interface AgentStatusPanelProps {
  currentStep: number;
}

const AGENTS: AgentStatus[] = [
  {
    id: 'market',
    name: 'Market Intelligence Agent',
    icon: <Search className="w-5 h-5" />,
    description: 'Scanning global tech demand and salary trends...',
    status: 'idle'
  },
  {
    id: 'architect',
    name: 'Technical Stack Architect',
    icon: <ShieldCheck className="w-5 h-5" />,
    description: 'Analyzing architectural synergy and technical depth...',
    status: 'idle'
  },
  {
    id: 'orchestrator',
    name: 'Career Path Strategist',
    icon: <BrainCircuit className="w-5 h-5" />,
    description: 'Synthesizing expert reports into your final roadmap...',
    status: 'idle'
  }
];

export const AgentStatusPanel: React.FC<AgentStatusPanelProps> = ({ currentStep }) => {
  return (
    <div className="grid grid-cols-1 gap-4 w-full max-w-md mx-auto mt-6">
      {AGENTS.map((agent, index) => {
        const isWorking = currentStep === index;
        const isDone = currentStep > index;
        
        return (
          <motion.div
            key={agent.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            className={`p-4 rounded-xl border backdrop-blur-md transition-all duration-500 ${
              isWorking 
                ? 'bg-primary/10 border-primary/40 shadow-[0_0_20px_rgba(var(--primary),0.1)]' 
                : isDone 
                ? 'bg-emerald-500/5 border-emerald-500/20' 
                : 'bg-card/40 border-border/50 opacity-50'
            }`}
          >
            <div className="flex items-center gap-4">
              <div className={`p-2.5 rounded-lg ${
                isWorking ? 'bg-primary text-primary-foreground animate-pulse' : 
                isDone ? 'bg-emerald-500 text-white' : 
                'bg-muted text-muted-foreground'
              }`}>
                {agent.icon}
              </div>
              
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <h4 className={`text-sm font-bold ${
                    isWorking ? 'text-primary' : isDone ? 'text-emerald-400' : 'text-muted-foreground'
                  }`}>
                    {agent.name}
                  </h4>
                  {isWorking && <Loader2 className="w-4 h-4 animate-spin text-primary" />}
                  {isDone && <CheckCircle2 className="w-4 h-4 text-emerald-500" />}
                </div>
                <p className="text-xs text-muted-foreground mt-1 line-clamp-1">
                  {isWorking ? agent.description : isDone ? 'Analysis complete' : 'Waiting...'}
                </p>
              </div>
            </div>
            
            {isWorking && (
              <motion.div 
                className="h-1 bg-primary/20 rounded-full mt-3 overflow-hidden"
                initial={{ width: 0 }}
                animate={{ width: '100%' }}
              >
                <motion.div 
                  className="h-full bg-primary"
                  animate={{ 
                    x: ['-100%', '100%']
                  }}
                  transition={{ 
                    repeat: Infinity, 
                    duration: 1.5,
                    ease: "linear"
                  }}
                  style={{ width: '30%' }}
                />
              </motion.div>
            )}
          </motion.div>
        );
      })}
    </div>
  );
};

export default AgentStatusPanel;
