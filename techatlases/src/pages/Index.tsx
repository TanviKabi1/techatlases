import { lazy, Suspense, useRef } from "react";
import { motion, useScroll, useTransform, useInView } from "framer-motion";
import { ArrowRight, Sparkles, Brain, Globe, Rocket, ChevronDown } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import PageTransition from "@/components/PageTransition";
import SpaceBackground from "@/components/SpaceBackground";

const TechGalaxy3D = lazy(() => import("@/components/TechGalaxy3D"));
const TechSolarSystem = lazy(() => import("@/components/TechSolarSystem"));
import TechNewspaper from "@/components/TechNewspaper";
import InteractiveParticleNetwork from "@/components/InteractiveParticleNetwork";

/* ─── Animated section wrapper ─── */
function ScrollSection({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-100px" });
  return (
    <motion.section
      ref={ref}
      initial={{ opacity: 0, y: 60 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.9, ease: "easeOut" }}
      className={className}
    >
      {children}
    </motion.section>
  );
}

/* ─── Stat pill ─── */
function StatPill({ value, label, delay }: { value: string; label: string; delay: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true }}
      transition={{ delay, type: "spring", stiffness: 200 }}
      className="glass glass-hover rounded-2xl px-6 py-4 text-center"
    >
      <div className="text-2xl sm:text-3xl font-bold text-primary text-glow-blue">{value}</div>
      <div className="text-xs text-muted-foreground mt-1">{label}</div>
    </motion.div>
  );
}

/* ─── Connection lines ─── */
const CONNECTIONS = [
  { from: "Python", to: "TensorFlow" },
  { from: "Python", to: "PyTorch" },
  { from: "JavaScript", to: "React" },
  { from: "JavaScript", to: "Node.js" },
  { from: "TypeScript", to: "React" },
  { from: "Docker", to: "Kubernetes" },
  { from: "Go", to: "Docker" },
];

function TechConnection({ from, to, idx }: { from: string; to: string; idx: number }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true }}
      transition={{ delay: 0.3 + idx * 0.1 }}
      className="flex items-center gap-2 text-xs text-muted-foreground"
    >
      <span className="text-primary font-medium">{from}</span>
      <span className="flex-1 h-px bg-gradient-to-r from-primary/40 to-accent/40" />
      <span className="text-accent font-medium">{to}</span>
    </motion.div>
  );
}

/* ─── Main Page ─── */
const Index = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: containerRef });
  const bgY = useTransform(scrollYProgress, [0, 1], ["0%", "30%"]);

  return (
    <PageTransition>
      <div ref={containerRef} className="relative">
        <SpaceBackground />

        {/* ═══════════ SECTION 1 — HERO ═══════════ */}
        <section className="relative min-h-screen flex flex-col items-center justify-center px-4 overflow-hidden">
          {/* Interactive particle network */}
          <InteractiveParticleNetwork />

          {/* 3D Galaxy background */}
          <div className="absolute inset-0 opacity-40 pointer-events-none">
            <Suspense fallback={null}>
              <TechGalaxy3D mode="tech" />
            </Suspense>
          </div>

          {/* Gradient overlays */}
          <div className="absolute inset-0 bg-gradient-to-b from-background/60 via-transparent to-background pointer-events-none" />
          <div className="absolute bottom-0 inset-x-0 h-32 bg-gradient-to-t from-background to-transparent pointer-events-none" />

          <div className="relative z-10 text-center max-w-5xl mx-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-primary/20 bg-primary/5 text-primary text-sm font-medium mb-8"
            >
              <Sparkles className="w-3.5 h-3.5" />
              Global Developer Intelligence Platform
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="text-5xl sm:text-7xl md:text-8xl font-bold tracking-tight mb-6"
            >
              <span className="text-foreground">Explore the</span>
              <br />
              <span className="text-primary text-glow-blue">Developer Universe</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="text-xl sm:text-2xl text-accent font-medium mb-4 text-glow-cyan"
            >
              Discover how technologies evolve, connect, and shape the global ecosystem.
            </motion.p>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.7 }}
              className="text-muted-foreground text-lg max-w-2xl mx-auto mb-10"
            >
              An immersive journey through the galaxy of programming languages, frameworks, and AI tools — powered by real survey data.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.9 }}
              className="flex flex-col sm:flex-row gap-4 justify-center"
            >
              <Link to="/technologies">
                <Button size="lg" className="bg-primary text-primary-foreground hover:bg-primary/80 gap-2 text-base px-8 h-13 btn-glow ripple-container">
                  <Rocket className="w-4 h-4" />
                  Explore the Galaxy
                </Button>
              </Link>
              <Link to="/dashboard">
                <Button size="lg" variant="outline" className="border-primary/30 text-foreground hover:bg-primary/10 gap-2 text-base px-8 h-13 ripple-container">
                  <ArrowRight className="w-4 h-4" />
                  Start Your Journey
                </Button>
              </Link>
            </motion.div>
          </div>

          {/* Scroll indicator */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 2 }}
            className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
          >
            <span className="text-xs text-muted-foreground tracking-widest uppercase">Scroll to explore</span>
            <motion.div animate={{ y: [0, 8, 0] }} transition={{ repeat: Infinity, duration: 1.5 }}>
              <ChevronDown className="w-5 h-5 text-primary/60" />
            </motion.div>
          </motion.div>
        </section>

        {/* ═══════════ SECTION 2 — TECHNOLOGY SOLAR SYSTEM ═══════════ */}
        <ScrollSection className="relative min-h-screen py-24 px-4">
          <div className="max-w-7xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7 }}
              className="text-center mb-8"
            >
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-accent/20 bg-accent/5 text-accent text-xs font-medium mb-4">
                <Sparkles className="w-3 h-3" />
                Technology Solar System
              </div>
              <h2 className="text-4xl sm:text-5xl font-bold text-foreground mb-4">
                The Developer
                <br />
                <span className="text-primary text-glow-blue">Ecosystem</span>
              </h2>
              <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
                Technology domains orbit like planets around the developer core. Click any planet to explore its ecosystem, tools, and analytics.
              </p>
            </motion.div>

            {/* Solar System 3D */}
            <div className="relative h-[600px] lg:h-[700px] rounded-3xl overflow-hidden border border-border/30">
              <div className="absolute inset-0 bg-background/20" />
              <Suspense fallback={
                <div className="flex items-center justify-center h-full">
                  <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                </div>
              }>
                <TechSolarSystem />
              </Suspense>
            </div>

            {/* Connection lines below */}
            <div className="mt-8 grid sm:grid-cols-2 lg:grid-cols-3 gap-3 max-w-3xl mx-auto">
              {CONNECTIONS.map((c, i) => (
                <TechConnection key={i} from={c.from} to={c.to} idx={i} />
              ))}
            </div>
          </div>
        </ScrollSection>

        {/* ═══════════ NEWSPAPER SECTION ═══════════ */}
        <ScrollSection className="relative py-24 px-4">
          <div className="max-w-7xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7 }}
              className="text-center mb-10"
            >
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-primary/20 bg-primary/5 text-primary text-xs font-medium mb-4">
                <Sparkles className="w-3 h-3" />
                Extra! Extra!
              </div>
              <h2 className="text-4xl sm:text-5xl font-bold text-foreground mb-4">
                The Tech
                <br />
                <span className="text-primary text-glow-blue">Chronicle</span>
              </h2>
              <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
                Read the latest dispatches from the frontlines of technology — delivered in the finest broadsheet tradition.
              </p>
            </motion.div>
            <TechNewspaper />
          </div>
        </ScrollSection>

        {/* ═══════════ SECTION 3 — AI REVOLUTION ═══════════ */}
        <ScrollSection className="relative min-h-screen py-24 px-4">
          <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-12 items-center">
            {/* Info panel */}
            <div className="order-2 lg:order-1">
              <motion.div
                initial={{ opacity: 0, x: -40 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.7 }}
              >
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-secondary/30 bg-secondary/5 text-secondary text-xs font-medium mb-4">
                  <Brain className="w-3 h-3" />
                  AI Revolution
                </div>
                <h2 className="text-4xl sm:text-5xl font-bold text-foreground mb-4">
                  The Rise of
                  <br />
                  <span className="text-secondary">AI-Powered</span> Development
                </h2>
                <p className="text-muted-foreground text-lg mb-8">
                  AI tools are reshaping how developers write, debug, and deploy code. Watch as ChatGPT, Copilot, Claude, and Gemini
                  orbit an AI core — each transforming the development landscape.
                </p>

                {/* AI tool cards */}
                <div className="grid grid-cols-2 gap-3 mb-8">
                  {["ChatGPT", "Copilot", "Claude", "Gemini"].map((tool, i) => (
                    <motion.div
                      key={tool}
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: 0.2 + i * 0.1 }}
                      className="glass glass-hover rounded-xl p-3 text-center"
                    >
                      <div className="text-sm font-semibold text-foreground">{tool}</div>
                      <div className="text-xs text-muted-foreground mt-0.5">AI Assistant</div>
                    </motion.div>
                  ))}
                </div>

                <Link to="/ai-tools">
                  <Button className="bg-secondary text-secondary-foreground hover:bg-secondary/80 btn-glow ripple-container gap-2">
                    Explore AI Tools <ArrowRight className="w-4 h-4" />
                  </Button>
                </Link>
              </motion.div>
            </div>

            {/* 3D AI Galaxy */}
            <div className="order-1 lg:order-2 relative h-[500px] lg:h-[600px] rounded-3xl overflow-hidden border border-secondary/20">
              <div className="absolute inset-0 bg-background/40" />
              <Suspense fallback={
                <div className="flex items-center justify-center h-full">
                  <div className="w-8 h-8 border-2 border-secondary border-t-transparent rounded-full animate-spin" />
                </div>
              }>
                <TechGalaxy3D mode="ai" />
              </Suspense>
            </div>
          </div>
        </ScrollSection>

        {/* ═══════════ SECTION 4 — GLOBAL DEVELOPER NETWORK ═══════════ */}
        <ScrollSection className="relative py-24 px-4">
          <div className="max-w-6xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-accent/20 bg-accent/5 text-accent text-xs font-medium mb-4">
              <Globe className="w-3 h-3" />
              Global Network
            </div>
            <h2 className="text-4xl sm:text-5xl font-bold text-foreground mb-4">
              Connected Across
              <br />
              <span className="text-accent text-glow-cyan">The Globe</span>
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto mb-12">
              Developer communities span every continent. Glowing arcs of collaboration link regions,
              sharing knowledge and building the future together.
            </p>

            {/* Stats grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
              <StatPill value="180+" label="Countries" delay={0.1} />
              <StatPill value="50+" label="Languages Tracked" delay={0.2} />
              <StatPill value="30+" label="AI Tools Analyzed" delay={0.3} />
              <StatPill value="100+" label="Frameworks" delay={0.4} />
            </div>

            {/* Globe CTA */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="glass rounded-3xl p-8 sm:p-12 border border-accent/10 max-w-3xl mx-auto"
            >
              <div className="text-6xl mb-4">🌍</div>
              <h3 className="text-2xl font-bold text-foreground mb-3">
                Interactive 3D Globe
              </h3>
              <p className="text-muted-foreground mb-6">
                Click any country to reveal developer analytics — top languages, AI adoption, and collaboration patterns.
              </p>
              <Link to="/map">
                <Button size="lg" className="bg-accent text-accent-foreground hover:bg-accent/80 btn-glow ripple-container gap-2">
                  <Globe className="w-4 h-4" />
                  Explore the Map
                </Button>
              </Link>
            </motion.div>
          </div>
        </ScrollSection>

        {/* ═══════════ SECTION 5 — PERSONALIZED FUTURE ═══════════ */}
        <ScrollSection className="relative py-24 px-4 mb-12">
          <div className="max-w-6xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-primary/20 bg-primary/5 text-primary text-xs font-medium mb-4">
              <Rocket className="w-3 h-3" />
              Your Future
            </div>
            <h2 className="text-4xl sm:text-5xl font-bold text-foreground mb-4">
              Discover What to
              <br />
              <span className="text-primary text-glow-blue">Learn Next</span>
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto mb-12">
              Our AI prediction engine analyzes global trends to build your personalized learning roadmap.
              The future of your tech career starts here.
            </p>

            {/* Feature cards */}
            <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
              {[
                {
                  icon: "🧠",
                  title: "AI-Powered Predictions",
                  desc: "Get personalized technology recommendations based on your current stack and career goals.",
                  link: "/recommendations",
                },
                {
                  icon: "📊",
                  title: "Trend Analytics",
                  desc: "Track technology adoption, salary trends, and developer demographics in real time.",
                  link: "/dashboard",
                },
                {
                  icon: "🗺️",
                  title: "Learning Roadmap",
                  desc: "Build a step-by-step plan to master new technologies with difficulty and time estimates.",
                  link: "/recommendations",
                },
              ].map((f, i) => (
                <motion.div
                  key={f.title}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.15 * i }}
                >
                  <Link to={f.link} className="block">
                    <div className="glass glass-hover rounded-2xl p-6 text-left h-full">
                      <div className="text-4xl mb-4">{f.icon}</div>
                      <h3 className="text-lg font-bold text-foreground mb-2">{f.title}</h3>
                      <p className="text-sm text-muted-foreground">{f.desc}</p>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>

            {/* Final CTA */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="mt-16"
            >
              <Link to="/login">
                <Button size="lg" className="bg-primary text-primary-foreground hover:bg-primary/80 btn-glow ripple-container gap-2 text-base px-10 h-14">
                  <Sparkles className="w-5 h-5" />
                  Start Your Journey
                </Button>
              </Link>
              <p className="text-xs text-muted-foreground mt-4">
                Sign up free to unlock personalized insights and your developer roadmap.
              </p>
            </motion.div>
          </div>
        </ScrollSection>

        {/* Footer */}
        <footer className="relative z-10 border-t border-border/30 py-8 text-center">
          <p className="text-sm text-muted-foreground">
            © 2026 TechAtlas — Global Developer Intelligence Platform
          </p>
        </footer>
      </div>
    </PageTransition>
  );
};

export default Index;
