import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, Send } from "lucide-react";
import { api } from "@/lib/api";

/* ─── Spreads data ─── */
const SPREADS = [
  {
    left: {
      date: "8th March, 2026",
      headline: "PYTHON CROWNED SUPREME RULER OF THE CODING REALM",
      subheadline: "The serpentine language tightens its grip on data science, AI, and web — leaving rivals gasping",
      column: {
        title: "AI Boom Fuels Unprecedented Demand",
        body: "In what analysts are calling the most remarkable ascent since the invention of the transistor, Python has solidified its position as the undisputed champion of programming languages. The language, originally conceived by Guido van Rossum in 1991, now commands a staggering 35% market share across all developer surveys conducted this quarter. Industry observers attribute this dominance to the explosive growth of artificial intelligence and machine learning, fields where Python's elegant syntax and vast library ecosystem have made it the lingua franca of innovation. Companies from fintech startups to the mightiest banks now list Python proficiency as a non-negotiable requirement.",
      },
      sidebar: {
        title: "MARKET WATCH",
        items: [
          { label: "Python Devs", value: "↑ 42%" },
          { label: "AI Postings", value: "↑ 67%" },
          { label: "COBOL", value: "↓ 89%" },
          { label: "Rust Jobs", value: "↑ 31%" },
        ],
      },
    },
    right: {
      headline: "UNIVERSITIES ABANDON JAVA EN MASSE",
      subheadline: "Oxford, Cambridge & Imperial announce sweeping curriculum changes — students rejoice",
      column: {
        title: "The Academic Exodus",
        body: "Leading institutions across the Commonwealth have begun wholesale replacement of Java curricula with Python-based programmes. Oxford, Cambridge, and Imperial College London have all announced sweeping changes to their Computer Science departments, citing student demand and industry alignment as primary motivators. 'It would be pedagogical malpractice to ignore the shift,' remarked Professor Alistair Blackwood of King's College. The ripple effects are expected to reshape graduate hiring patterns for the next decade. Meanwhile, Java instructors have been offered generous retraining packages to transition into teaching Python and data science modules.",
      },
      quote: "\"The future belongs to those who can speak Python fluently.\" — Prof. A. Blackwood, King's College",
      ad: "LEARN TENSORFLOW IN A FORTNIGHT — Or Your Money Back! — Enquire at the Royal Academy of Computing, Pall Mall",
    },
  },
  {
    left: {
      date: "8th March, 2026",
      headline: "ARTIFICIAL INTELLIGENCE DECLARES WAR ON BOILERPLATE CODE",
      subheadline: "GitHub Copilot, ChatGPT, and Claude transform the craft of software engineering forever",
      column: {
        title: "Copilot Writes 46% of All New Code",
        body: "In a revelation that has sent shockwaves through the software engineering establishment, GitHub has disclosed that its AI-powered Copilot assistant now generates nearly half of all new code committed to repositories on its platform. The implications are staggering — entire classes of repetitive programming tasks have been rendered obsolete practically overnight. Junior developers report completing tasks in hours that previously required days, whilst senior engineers find themselves in the unfamiliar role of 'AI code reviewers,' scrutinising machine-generated solutions with the same rigour once reserved for human pull requests.",
      },
      sidebar: {
        title: "AI TOOL RANKINGS",
        items: [
          { label: "ChatGPT", value: "★★★★★" },
          { label: "Copilot", value: "★★★★☆" },
          { label: "Claude", value: "★★★★★" },
          { label: "Gemini", value: "★★★★☆" },
        ],
      },
    },
    right: {
      headline: "THE GREAT DEBUGGING REVOLUTION",
      subheadline: "AI assistants identify bugs in seconds that once consumed entire engineering sprints",
      column: {
        title: "A Very Clever Colleague Who Never Sleeps",
        body: "Perhaps no area of software development has been more dramatically transformed than the ancient art of debugging. Where once a developer might spend the better part of a week hunting an elusive null pointer exception, AI assistants can now identify and suggest fixes for common bugs in mere seconds. Claude, Anthropic's formidable offering, has proven particularly adept at understanding complex codebases and providing contextually appropriate solutions. 'It's rather like having a very clever colleague who never sleeps and never judges you for your variable naming choices,' observed one senior engineer at Barclays.",
      },
      quote: "\"We didn't replace developers — we gave them superpowers.\" — GitHub CEO",
      ad: "WANTED: Prompt Engineers of Good Character — Apply to His Majesty's Digital Service — Whitehall, London SW1",
    },
  },
  {
    left: {
      date: "8th March, 2026",
      headline: "RUST EMERGES AS THE SYSTEMS LANGUAGE OF THE FUTURE",
      subheadline: "Memory safety without garbage collection wins hearts across the industry — C++ developers begin quiet migration",
      column: {
        title: "The White House Endorses Memory Safety",
        body: "In an extraordinary intervention into the world of programming languages, the White House has issued a formal recommendation urging developers to adopt memory-safe languages such as Rust. The endorsement, unprecedented in its specificity, has sent shockwaves through the C and C++ communities. Rust's ownership model, which guarantees memory safety at compile time without the overhead of garbage collection, has proven irresistible to organisations managing critical infrastructure. The Linux kernel now accepts Rust code alongside C, marking a watershed moment in systems programming history.",
      },
      sidebar: {
        title: "RUST ADOPTION",
        items: [
          { label: "GitHub Stars", value: "↑ 58%" },
          { label: "Job Postings", value: "↑ 124%" },
          { label: "Avg Salary", value: "$145K" },
          { label: "Satisfaction", value: "87%" },
        ],
      },
    },
    right: {
      headline: "WEBASSEMBLY BREAKS FREE FROM THE BROWSER",
      subheadline: "WASI standard enables serverless computing at near-native speed — Docker founders take notice",
      column: {
        title: "Beyond the Browser Sandbox",
        body: "WebAssembly, once confined to accelerating web applications, has burst through the boundaries of the browser to become a universal runtime for server-side computing. The WebAssembly System Interface (WASI) now allows compiled modules to run on any operating system, with performance rivalling native binaries. Solomon Hykes, co-founder of Docker, famously declared that had WASM existed in 2008, there would have been no need to create Docker at all. Cloud providers are racing to offer WASM-based serverless platforms, promising cold start times measured in microseconds rather than the seconds typical of container-based solutions.",
      },
      quote: "\"If WASM+WASI existed in 2008, we wouldn't have needed to create Docker.\" — Solomon Hykes",
      ad: "SYSTEMS PROGRAMMERS WANTED — Must enjoy arguing about lifetimes — Competitive Salary & Biscuits Provided",
    },
  },
  {
    left: {
      date: "8th March, 2026",
      headline: "JAVASCRIPT FRAMEWORKS MULTIPLY LIKE RABBITS IN SPRING",
      subheadline: "React maintains its throne whilst Svelte and Solid mount a spirited challenge — developers report fatigue",
      column: {
        title: "React: The Empire Endures",
        body: "Despite predictions of its imminent demise published annually since approximately 2018, React continues to dominate the frontend landscape with the quiet confidence of a seasoned monarch. Meta's venerable library powers an estimated 40% of all web applications, a figure that has remained remarkably stable even as competitors sharpen their knives. The introduction of Server Components has breathed new life into the ecosystem, silencing critics who had begun composing obituaries. Meanwhile, Next.js has become the de facto standard for React applications, with Vercel reporting a 340% increase in enterprise deployments.",
      },
      sidebar: {
        title: "FRAMEWORK CENSUS",
        items: [
          { label: "React", value: "40.2%" },
          { label: "Next.js", value: "22.1%" },
          { label: "Vue", value: "18.7%" },
          { label: "Svelte", value: "12.4%" },
        ],
      },
    },
    right: {
      headline: "THE TYPESCRIPT MANDATE",
      subheadline: "Typed superset now accounts for 78% of all new frontend projects — holdouts face recruitment drought",
      column: {
        title: "Plain JavaScript Regarded With Suspicion",
        body: "In what future historians may regard as the most significant shift in web development since the abandonment of table-based layouts, TypeScript has become effectively mandatory for professional JavaScript development. A mere curiosity when Microsoft first unveiled it in 2012, the typed superset now accounts for 78% of all new frontend projects. Companies refusing to adopt it report increasing difficulty in recruiting talent, as younger developers regard plain JavaScript with the same suspicion one might reserve for a telegram. The type system, once derided as unnecessary ceremony, is now celebrated as the foundation upon which large-scale applications are safely constructed.",
      },
      quote: "\"Any sufficiently advanced JavaScript project eventually reinvents TypeScript, badly.\" — Anonymous",
      ad: "DISTINGUISHED GENTLEMEN'S CODING CLUB — Meetups Every Fortnight — Port, Cheese & Pull Requests — Members Only",
    },
  },
  {
    left: {
      date: "8th March, 2026",
      headline: "CLOUD INFRASTRUCTURE ENTERS THE ERA OF EDGE COMPUTING",
      subheadline: "Cloudflare, Vercel, and Deno Deploy bring computation closer to users — latency becomes a relic",
      column: {
        title: "The Death of Cold Starts",
        body: "The cloud computing landscape has undergone a fundamental transformation as edge computing platforms proliferate across the globe. Cloudflare Workers, running in over 300 data centres worldwide, now serve billions of requests daily with sub-millisecond cold start times. Vercel's Edge Functions and Deno Deploy have similarly positioned themselves as alternatives to traditional server-based architectures. The implications for user experience are profound — applications that once required careful CDN configuration now deliver instantaneous responses regardless of the user's geographical location, rendering the concept of server region selection obsolete for many use cases.",
      },
      sidebar: {
        title: "CLOUD METRICS",
        items: [
          { label: "Edge Nodes", value: "300+" },
          { label: "Avg Latency", value: "< 5ms" },
          { label: "Serverless ↑", value: "89%" },
          { label: "K8s Adoption", value: "72%" },
        ],
      },
    },
    right: {
      headline: "THE DATABASE RENAISSANCE",
      subheadline: "PlanetScale, Neon, and Turso challenge the old guard — PostgreSQL declared 'database of the decade'",
      column: {
        title: "PostgreSQL's Quiet Triumph",
        body: "While attention has been lavished upon the latest JavaScript frameworks and AI tools, a quieter revolution has been unfolding in the database world. PostgreSQL, the venerable open-source relational database, has been crowned 'Database of the Decade' by DB-Engines, completing a remarkable ascent from worthy alternative to undisputed champion. New serverless offerings from Neon and Supabase have made PostgreSQL accessible to individual developers and startups, whilst PlanetScale continues to push the boundaries of MySQL scalability. The emergence of embedded databases like Turso (built on libSQL) signals a future where databases run at the edge alongside application code.",
      },
      quote: "\"PostgreSQL is the Linux of databases — it wins by being boringly excellent.\" — Hacker News",
      ad: "DATABASE ADMINISTRATORS BALL — Annual Gathering at the Savoy — Black Tie & SQL Required — RSVP Immediately",
    },
  },
];

/* ─── Styles ─── */
const paperBg = `
  repeating-linear-gradient(0deg, transparent, transparent 28px, rgba(139,115,85,0.08) 28px, rgba(139,115,85,0.08) 29px),
  linear-gradient(135deg, hsl(36 33% 89%) 0%, hsl(38 35% 85%) 25%, hsl(34 30% 82%) 50%, hsl(37 32% 86%) 75%, hsl(35 28% 83%) 100%)
`;
const serifFont = "'Playfair Display', 'Georgia', 'Times New Roman', serif";
const bodyFont = "'Georgia', 'Times New Roman', serif";

/* ─── Floating Message Bubble ─── */
function FloatingMessage({ message, index }: { message: { display_name: string; message: string; created_at: string }; index: number }) {
  const age = (Date.now() - new Date(message.created_at).getTime()) / 60000; // minutes
  const opacity = Math.max(0.3, 1 - age / 10);
  const yOffset = (index * 67) % 400;
  const xOffset = (index * 131) % 60;
  const delay = index * 0.15;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8, x: 20 }}
      animate={{ opacity, scale: 1, x: 0 }}
      exit={{ opacity: 0, scale: 0.7 }}
      transition={{ delay, duration: 0.5 }}
      className="absolute pointer-events-none"
      style={{
        top: `${yOffset}px`,
        left: `${xOffset}%`,
        maxWidth: "90%",
      }}
    >
      <motion.div
        animate={{ y: [0, -6, 0] }}
        transition={{ repeat: Infinity, duration: 3 + index * 0.5, ease: "easeInOut" }}
        className="glass rounded-xl px-3 py-2 border border-primary/20"
        style={{ background: "hsl(var(--background) / 0.7)" }}
      >
        <p className="text-[10px] sm:text-xs text-foreground leading-snug">{message.message}</p>
        <p className="text-[8px] text-muted-foreground mt-0.5 italic">— {message.display_name}</p>
      </motion.div>
    </motion.div>
  );
}

/* ─── Message Pool Sidebar ─── */
function MessagePool() {
  const [messages, setMessages] = useState<{ id: string; display_name: string; message: string; created_at: string }[]>([]);
  const [input, setInput] = useState("");
  const [name, setName] = useState("");
  const [sending, setSending] = useState(false);
  const poolRef = useRef<HTMLDivElement>(null);

  // Fetch initial messages
  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const data = await api.get('/crud/newspaper_messages?sort=created_at&order=desc&limit=20');
        if (data.rows) setMessages(data.rows);
      } catch (e) {
        console.error("Failed to fetch messages", e);
      }
    };
    fetchMessages();

    // Polling for new messages as a temporary replacement for realtime
    const poll = setInterval(fetchMessages, 10000);

    // Auto-cleanup expired messages every 30s
    const cleanup = setInterval(() => {
      setMessages((prev) => prev.filter((m) => Date.now() - new Date(m.created_at).getTime() < 10 * 60 * 1000));
    }, 30000);

    return () => {
      clearInterval(poll);
      clearInterval(cleanup);
    };
  }, []);

  const sendMessage = async () => {
    const trimmed = input.trim();
    if (!trimmed || trimmed.length > 200) return;
    setSending(true);
    await api.post("/crud/newspaper_messages", {
      display_name: name.trim().slice(0, 30) || "Anonymous",
      message: trimmed.slice(0, 200),
    });
    setInput("");
    setSending(false);
  };

  return (
    <div className="relative flex flex-col h-full">
      {/* Floating messages area */}
      <div ref={poolRef} className="flex-1 relative min-h-[300px] overflow-hidden">
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          {messages.length === 0 && (
            <p className="text-muted-foreground text-xs italic text-center px-4">
              No messages yet — be the first to leave a note on the bulletin board!
            </p>
          )}
        </div>
        <AnimatePresence>
          {messages.map((msg, i) => (
            <FloatingMessage key={msg.id} message={msg} index={i} />
          ))}
        </AnimatePresence>
      </div>

      {/* Input area */}
      <div className="mt-auto space-y-2 p-3 rounded-xl glass border border-border/30">
        <p
          className="text-[10px] tracking-[0.15em] uppercase text-center text-muted-foreground"
          style={{ fontFamily: serifFont }}
        >
          Community Bulletin Board
        </p>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value.slice(0, 30))}
          placeholder="Your name (optional)"
          className="w-full px-3 py-1.5 rounded-lg text-xs bg-background/60 border border-border/40 text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/40"
        />
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value.slice(0, 200))}
            onKeyDown={(e) => e.key === "Enter" && sendMessage()}
            placeholder="Leave a message..."
            className="flex-1 px-3 py-1.5 rounded-lg text-xs bg-background/60 border border-border/40 text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/40"
          />
          <button
            onClick={sendMessage}
            disabled={sending || !input.trim()}
            className="px-3 py-1.5 rounded-lg bg-primary/20 text-primary hover:bg-primary/30 disabled:opacity-30 transition-colors"
          >
            <Send className="w-3.5 h-3.5" />
          </button>
        </div>
        <p className="text-[9px] text-muted-foreground text-center">Messages float for 10 minutes</p>
      </div>
    </div>
  );
}

/* ─── Folded cover ─── */
function FoldedCover({ onClick }: { onClick: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9, rotateY: -90 }}
      transition={{ duration: 0.5 }}
      onClick={onClick}
      className="cursor-pointer mx-auto w-full select-none"
      style={{ perspective: "1200px", maxWidth: "360px", aspectRatio: "3 / 4" }}
      whileHover={{ scale: 1.03 }}
      whileTap={{ scale: 0.98 }}
    >
      <div className="relative rounded-sm overflow-hidden shadow-2xl h-full" style={{ background: paperBg }}>
        <div
          className="absolute pointer-events-none opacity-[0.07] rounded-full"
          style={{ width: 140, height: 140, top: "10%", right: "6%", background: "radial-gradient(circle, hsl(25 60% 30%) 0%, transparent 70%)" }}
        />
        <div className="absolute left-1/2 top-0 bottom-0 w-px -translate-x-1/2 pointer-events-none" style={{ background: "rgba(139,115,85,0.25)" }} />
        <div className="absolute inset-0 pointer-events-none border-[3px] rounded-sm" style={{ borderColor: "hsl(25 30% 70% / 0.3)" }} />

        <div className="relative z-10 p-6 sm:p-8 h-full flex flex-col justify-between">
          <div>
            <div className="text-center border-b-[3px] border-double border-[hsl(25_30%_25%)] pb-3 mb-4">
              <p className="text-[8px] sm:text-[9px] tracking-[0.3em] uppercase mb-1" style={{ fontFamily: serifFont, color: "hsl(25 30% 35%)" }}>
                Est. 2024 — The World's Premier Technology Gazette
              </p>
              <h2 className="font-bold tracking-tight leading-none" style={{ fontFamily: serifFont, fontSize: "clamp(1.4rem, 4vw, 2rem)", color: "hsl(25 30% 15%)" }}>
                THE TECHATLAS<br />CHRONICLE
              </h2>
              <p className="mt-2 text-[9px] tracking-[0.15em]" style={{ fontFamily: bodyFont, color: "hsl(25 30% 40%)" }}>
                8th March, 2026 • Vol. XLII • Price: One Shilling
              </p>
            </div>

            <div className="flex items-center gap-2 my-3">
              <div className="flex-1 h-px" style={{ background: "hsl(25 30% 60%)" }} />
              <div className="w-1.5 h-1.5 rotate-45 border" style={{ borderColor: "hsl(25 30% 60%)" }} />
              <div className="flex-1 h-px" style={{ background: "hsl(25 30% 60%)" }} />
            </div>

            <p className="text-center font-bold leading-tight mb-2" style={{ fontFamily: serifFont, fontSize: "clamp(0.65rem, 1.6vw, 0.85rem)", color: "hsl(25 30% 12%)" }}>
              PYTHON CROWNED SUPREME<br />RULER OF THE CODING REALM
            </p>
            <p className="text-center italic mb-3" style={{ fontFamily: bodyFont, fontSize: "clamp(0.5rem, 1.1vw, 0.65rem)", color: "hsl(25 30% 35%)" }}>
              AI declares war on boilerplate • Rust rises • Edge computing arrives
            </p>

            <div className="flex items-center gap-2 mb-3">
              <div className="flex-1 h-[2px]" style={{ background: "hsl(25 30% 25%)" }} />
              <div className="flex-1 h-[2px]" style={{ background: "hsl(25 30% 25%)" }} />
            </div>

            <div className="grid grid-cols-2 gap-3 mb-3">
              <div>
                <p className="font-bold uppercase text-[7px] tracking-wide mb-0.5 border-b pb-0.5" style={{ fontFamily: serifFont, color: "hsl(25 30% 15%)", borderColor: "hsl(25 30% 55%)" }}>
                  AI Boom Fuels Demand
                </p>
                <p className="text-justify leading-snug" style={{ fontFamily: bodyFont, fontSize: "6px", color: "hsl(25 30% 30%)", display: "-webkit-box", WebkitLineClamp: 6, WebkitBoxOrient: "vertical" as any, overflow: "hidden" }}>
                  Python has solidified its position as the undisputed champion of programming languages, commanding a staggering 35% market share across all surveys...
                </p>
              </div>
              <div>
                <p className="font-bold uppercase text-[7px] tracking-wide mb-0.5 border-b pb-0.5" style={{ fontFamily: serifFont, color: "hsl(25 30% 15%)", borderColor: "hsl(25 30% 55%)" }}>
                  Copilot Writes 46% of Code
                </p>
                <p className="text-justify leading-snug" style={{ fontFamily: bodyFont, fontSize: "6px", color: "hsl(25 30% 30%)", display: "-webkit-box", WebkitLineClamp: 6, WebkitBoxOrient: "vertical" as any, overflow: "hidden" }}>
                  GitHub has disclosed that its AI-powered Copilot assistant now generates nearly half of all new code committed to repositories...
                </p>
              </div>
            </div>
          </div>

          <div className="mt-auto">
            <div className="border-t border-b py-1.5 text-center mb-3" style={{ borderColor: "hsl(25 30% 45%)" }}>
              <p className="italic" style={{ fontFamily: bodyFont, fontSize: "7px", color: "hsl(25 30% 30%)", letterSpacing: "0.04em" }}>
                FIVE EDITIONS INSIDE — Rust, WebAssembly, Cloud, Frameworks & More
              </p>
            </div>
            <motion.p
              animate={{ opacity: [0.4, 0.8, 0.4] }}
              transition={{ repeat: Infinity, duration: 2 }}
              className="text-center text-[10px] tracking-[0.2em] uppercase"
              style={{ fontFamily: serifFont, color: "hsl(25 30% 45%)" }}
            >
              — Tap to Read —
            </motion.p>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

/* ─── Page side ─── */
function PageSide({ data, side }: { data: any; side: "left" | "right" }) {
  const isLeft = side === "left";
  const hasDate = data.date;
  const hasSidebar = data.sidebar;
  const hasAd = data.ad;
  const hasQuote = data.quote;

  return (
    <div className="relative h-full overflow-hidden" style={{ background: paperBg }}>
      <div
        className="absolute pointer-events-none opacity-[0.06] rounded-full"
        style={{
          width: 120, height: 120,
          top: isLeft ? "8%" : "auto", bottom: isLeft ? "auto" : "10%",
          right: isLeft ? "10%" : "auto", left: isLeft ? "auto" : "8%",
          background: "radial-gradient(circle, hsl(25 60% 30%) 0%, transparent 70%)",
        }}
      />

      <div className="relative z-10 p-4 sm:p-5 md:p-6 h-full flex flex-col">
        {/* Masthead */}
        {isLeft && hasDate && (
          <div className="text-center border-b-[2px] border-double border-[hsl(25_30%_25%)] pb-2 mb-2">
            <p className="text-[8px] sm:text-[9px] tracking-[0.3em] uppercase" style={{ fontFamily: serifFont, color: "hsl(25 30% 35%)" }}>
              The TechAtlas Chronicle
            </p>
            <div className="flex items-center justify-center gap-3 mt-0.5 text-[8px] sm:text-[9px]" style={{ fontFamily: bodyFont, color: "hsl(25 30% 45%)" }}>
              <span>London</span><span>•</span><span>{data.date}</span>
            </div>
          </div>
        )}

        {/* Headline */}
        <h3 className="leading-tight mb-1" style={{ fontFamily: serifFont, fontSize: "clamp(0.6rem, 1.4vw, 0.88rem)", fontWeight: 900, color: "hsl(25 30% 12%)" }}>
          {data.headline}
        </h3>
        <p className="italic mb-2" style={{ fontFamily: bodyFont, fontSize: "clamp(0.48rem, 0.9vw, 0.6rem)", color: "hsl(25 30% 30%)" }}>
          {data.subheadline}
        </p>

        <div className="h-[1.5px] mb-2" style={{ background: "hsl(25 30% 50%)" }} />

        {/* Body */}
        <div className="flex-1 flex gap-3 min-h-0 overflow-hidden">
          <div className="flex-1 min-w-0">
            <h4
              className="font-bold uppercase tracking-wide mb-1 border-b pb-0.5"
              style={{ fontFamily: serifFont, fontSize: "clamp(0.48rem, 0.85vw, 0.6rem)", color: "hsl(25 30% 15%)", borderColor: "hsl(25 30% 55%)" }}
            >
              {data.column.title}
            </h4>
            <p
              className="text-justify leading-relaxed overflow-hidden"
              style={{
                fontFamily: bodyFont,
                fontSize: "clamp(0.44rem, 0.72vw, 0.58rem)",
                color: "hsl(25 30% 22%)",
                display: "-webkit-box",
                WebkitLineClamp: 18,
                WebkitBoxOrient: "vertical" as any,
              }}
            >
              {data.column.body}
            </p>
          </div>

          {hasSidebar && (
            <div className="border-l pl-2 min-w-[75px] sm:min-w-[95px]" style={{ borderColor: "hsl(25 30% 55%)" }}>
              <h4 className="font-bold mb-2 tracking-[0.15em] uppercase" style={{ fontFamily: serifFont, fontSize: "0.48rem", color: "hsl(25 30% 15%)" }}>
                {data.sidebar.title}
              </h4>
              <div className="space-y-1.5">
                {data.sidebar.items.map((item: any, i: number) => (
                  <div key={i} className="flex justify-between border-b border-dotted pb-0.5" style={{ fontFamily: bodyFont, fontSize: "0.47rem", color: "hsl(25 30% 25%)", borderColor: "hsl(25 30% 65%)" }}>
                    <span>{item.label}</span>
                    <span className="font-bold ml-1 whitespace-nowrap">{item.value}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Quote */}
        {hasQuote && (
          <div className="mt-2 border-l-2 pl-2 py-1" style={{ borderColor: "hsl(25 30% 40%)" }}>
            <p className="italic" style={{ fontFamily: bodyFont, fontSize: "clamp(0.42rem, 0.65vw, 0.52rem)", color: "hsl(25 30% 28%)" }}>
              {data.quote}
            </p>
          </div>
        )}

        {/* Ad */}
        {hasAd && (
          <div className="mt-auto pt-1.5 border-t border-b py-1 text-center" style={{ borderColor: "hsl(25 30% 45%)" }}>
            <p className="italic" style={{ fontFamily: bodyFont, fontSize: "clamp(0.4rem, 0.65vw, 0.5rem)", color: "hsl(25 30% 30%)", letterSpacing: "0.04em" }}>
              {data.ad}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

/* ─── Main ─── */
export default function TechNewspaper() {
  const [isOpen, setIsOpen] = useState(false);
  const [spreadIndex, setSpreadIndex] = useState(0);
  const [direction, setDirection] = useState(0);

  const goNext = () => {
    if (spreadIndex < SPREADS.length - 1) { setDirection(1); setSpreadIndex((p) => p + 1); }
  };
  const goPrev = () => {
    if (spreadIndex > 0) { setDirection(-1); setSpreadIndex((p) => p - 1); }
  };

  const spread = SPREADS[spreadIndex];
  const easing = [0.22, 1, 0.36, 1] as [number, number, number, number];
  const flipVariants = {
    enter: (dir: number) => ({ rotateY: dir > 0 ? 60 : -60, opacity: 0 }),
    center: { rotateY: 0, opacity: 1, transition: { duration: 0.6, ease: easing } },
    exit: (dir: number) => ({ rotateY: dir > 0 ? -60 : 60, opacity: 0, transition: { duration: 0.4, ease: easing } }),
  };

  return (
    <div className="relative" style={{ perspective: "2000px" }}>
      <AnimatePresence mode="wait">
        {!isOpen ? (
          <div key="cover-layout" className="grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-6 items-start max-w-6xl mx-auto">
            <FoldedCover onClick={() => setIsOpen(true)} />
            <div className="hidden lg:block h-[460px]">
              <MessagePool />
            </div>
          </div>
        ) : (
          <motion.div
            key="open-layout"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="grid grid-cols-1 xl:grid-cols-[1fr_240px] gap-4 items-start max-w-7xl mx-auto"
          >
            {/* Newspaper spread */}
            <motion.div
              initial={{ scale: 0.85, rotateY: -40 }}
              animate={{ scale: 1, rotateY: 0 }}
              exit={{ scale: 0.85, rotateY: -40 }}
              transition={{ duration: 0.6, ease: easing }}
              className="relative"
            >
              {/* Close */}
              <button
                onClick={() => setIsOpen(false)}
                className="absolute -top-9 right-0 z-30 text-[10px] tracking-[0.2em] uppercase px-3 py-1 rounded-full transition-colors"
                style={{ fontFamily: serifFont, color: "hsl(25 30% 45%)", background: "hsl(36 33% 89% / 0.6)", border: "1px solid hsl(25 30% 60%)" }}
              >
                ✕ Close
              </button>

              {/* Nav */}
              <button
                onClick={goPrev}
                disabled={spreadIndex === 0}
                className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-8 sm:-translate-x-11 z-20 p-1.5 rounded-full disabled:opacity-20 transition-opacity"
                style={{ background: "hsl(36 33% 85%)", color: "hsl(25 30% 25%)" }}
              >
                <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>
              <button
                onClick={goNext}
                disabled={spreadIndex === SPREADS.length - 1}
                className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-8 sm:translate-x-11 z-20 p-1.5 rounded-full disabled:opacity-20 transition-opacity"
                style={{ background: "hsl(36 33% 85%)", color: "hsl(25 30% 25%)" }}
              >
                <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>

              {/* Spread — click left half = prev, right half = next */}
              <AnimatePresence mode="wait" custom={direction}>
                <motion.div
                  key={spreadIndex}
                  custom={direction}
                  variants={flipVariants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  style={{ transformStyle: "preserve-3d", minHeight: "600px", aspectRatio: "1.35 / 1" }}
                  className="grid grid-cols-2 rounded-sm overflow-hidden shadow-2xl"
                >
                  <div
                    className="relative border-r cursor-pointer"
                    style={{ borderColor: "hsl(25 30% 55% / 0.4)" }}
                    onClick={goPrev}
                    title={spreadIndex > 0 ? "← Previous page" : undefined}
                  >
                    <div className="absolute right-0 top-0 bottom-0 w-6 pointer-events-none z-10" style={{ background: "linear-gradient(to left, rgba(100,80,60,0.15), transparent)" }} />
                    <PageSide data={spread.left} side="left" />
                  </div>
                  <div
                    className="relative cursor-pointer"
                    onClick={goNext}
                    title={spreadIndex < SPREADS.length - 1 ? "Next page →" : undefined}
                  >
                    <div className="absolute left-0 top-0 bottom-0 w-6 pointer-events-none z-10" style={{ background: "linear-gradient(to right, rgba(100,80,60,0.15), transparent)" }} />
                    <PageSide data={spread.right} side="right" />
                  </div>
                </motion.div>
              </AnimatePresence>

              {/* Page dots */}
              <div className="flex justify-center gap-2 mt-3">
                {SPREADS.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => { setDirection(i > spreadIndex ? 1 : -1); setSpreadIndex(i); }}
                    className="w-2 h-2 rounded-full transition-all"
                    style={{ background: i === spreadIndex ? "hsl(25 30% 25%)" : "hsl(25 30% 65%)" }}
                  />
                ))}
              </div>
            </motion.div>

            {/* Message pool sidebar */}
            <div className="hidden xl:block" style={{ minHeight: "520px" }}>
              <MessagePool />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Mobile message pool (shown below on small screens) */}
      <div className="mt-6 lg:hidden">
        <MessagePool />
      </div>
    </div>
  );
}
