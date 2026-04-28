import { useState, useMemo } from "react";
import { motion } from "framer-motion";

// Simplified world map paths keyed by country name
// These are approximate simplified SVG paths for major countries
const COUNTRY_PATHS: Record<string, { d: string; cx: number; cy: number }> = {
  "USA": { d: "M60,120 L130,120 L135,130 L140,125 L145,130 L130,145 L110,140 L100,145 L85,140 L70,145 L55,135 Z", cx: 100, cy: 132 },
  "Canada": { d: "M55,85 L150,85 L155,95 L150,105 L140,100 L135,110 L130,105 L120,110 L110,105 L100,110 L90,105 L80,110 L70,105 L60,110 L55,100 Z", cx: 105, cy: 97 },
  "Mexico": { d: "M65,145 L100,145 L105,155 L110,165 L100,170 L90,165 L80,168 L70,160 L60,155 Z", cx: 85, cy: 157 },
  "Brazil": { d: "M150,195 L180,180 L195,185 L200,200 L195,220 L185,235 L170,240 L155,230 L145,215 L140,200 Z", cx: 170, cy: 210 },
  "Argentina": { d: "M145,240 L170,240 L175,255 L170,275 L160,290 L150,285 L145,270 L140,255 Z", cx: 158, cy: 265 },
  "Colombia": { d: "M125,175 L145,170 L155,180 L150,195 L140,200 L130,195 L120,185 Z", cx: 138, cy: 185 },
  "Chile": { d: "M135,255 L145,255 L148,270 L145,290 L140,305 L135,295 L133,275 Z", cx: 140, cy: 280 },
  "Peru": { d: "M120,195 L140,200 L145,215 L140,230 L130,235 L120,225 L115,210 Z", cx: 130, cy: 215 },
  "Ecuador": { d: "M115,185 L125,185 L130,195 L120,200 L112,195 Z", cx: 122, cy: 192 },
  "UK": { d: "M245,100 L255,95 L258,105 L252,112 L245,108 Z", cx: 251, cy: 103 },
  "Ireland": { d: "M238,98 L245,95 L247,103 L242,107 L237,103 Z", cx: 242, cy: 101 },
  "France": { d: "M252,115 L268,112 L275,120 L272,132 L260,135 L250,128 Z", cx: 262, cy: 123 },
  "Spain": { d: "M242,130 L265,128 L268,138 L255,145 L240,140 Z", cx: 253, cy: 136 },
  "Portugal": { d: "M236,132 L242,130 L244,142 L238,145 Z", cx: 240, cy: 138 },
  "Germany": { d: "M268,105 L285,102 L290,112 L285,120 L272,118 L266,112 Z", cx: 278, cy: 112 },
  "Italy": { d: "M278,122 L288,120 L292,130 L288,142 L282,148 L278,138 Z", cx: 284, cy: 134 },
  "Netherlands": { d: "M262,100 L272,98 L274,105 L268,108 Z", cx: 268, cy: 103 },
  "Belgium": { d: "M258,108 L268,106 L270,112 L262,114 Z", cx: 264, cy: 110 },
  "Austria": { d: "M285,115 L300,113 L302,120 L290,122 Z", cx: 293, cy: 117 },
  "Poland": { d: "M290,100 L310,98 L315,108 L305,115 L288,112 Z", cx: 302, cy: 106 },
  "Czech Republic": { d: "M285,108 L300,106 L302,113 L290,115 Z", cx: 293, cy: 110 },
  "Sweden": { d: "M285,70 L295,65 L300,80 L295,95 L288,90 L283,80 Z", cx: 291, cy: 80 },
  "Romania": { d: "M310,118 L325,116 L328,125 L318,128 L308,124 Z", cx: 318, cy: 122 },
  "Hungary": { d: "M300,118 L312,116 L315,123 L305,126 Z", cx: 308, cy: 120 },
  "Croatia": { d: "M292,122 L302,120 L305,128 L295,130 Z", cx: 298, cy: 125 },
  "Serbia": { d: "M305,125 L315,123 L318,132 L310,135 Z", cx: 312, cy: 129 },
  "Ukraine": { d: "M315,100 L340,98 L345,110 L335,118 L315,115 Z", cx: 330, cy: 108 },
  "Turkey": { d: "M325,128 L360,125 L365,135 L345,140 L325,138 Z", cx: 345, cy: 133 },
  "Russia": { d: "M320,50 L500,40 L520,60 L510,80 L480,90 L450,85 L420,90 L390,85 L360,90 L340,95 L325,90 L315,75 Z", cx: 420, cy: 70 },
  "India": { d: "M410,145 L435,140 L445,155 L440,175 L430,190 L420,185 L415,170 L405,160 Z", cx: 425, cy: 165 },
  "China": { d: "M440,100 L500,95 L510,110 L505,130 L490,140 L470,138 L455,130 L445,120 L435,110 Z", cx: 475, cy: 118 },
  "Japan": { d: "M520,115 L530,110 L535,120 L530,135 L522,130 L518,122 Z", cx: 527, cy: 122 },
  "South Korea": { d: "M510,118 L520,115 L522,125 L515,128 Z", cx: 516, cy: 122 },
  "Thailand": { d: "M460,165 L470,160 L475,175 L468,185 L460,180 Z", cx: 467, cy: 173 },
  "Vietnam": { d: "M472,158 L480,155 L485,168 L478,180 L470,175 Z", cx: 477, cy: 167 },
  "Philippines": { d: "M498,165 L508,160 L512,172 L505,180 L498,175 Z", cx: 505, cy: 170 },
  "Malaysia": { d: "M462,190 L480,188 L482,196 L468,198 Z", cx: 472, cy: 193 },
  "Singapore": { d: "M468,200 L475,199 L476,204 L470,205 Z", cx: 472, cy: 202 },
  "Indonesia": { d: "M458,205 L510,200 L515,210 L500,215 L475,218 L455,215 Z", cx: 487, cy: 210 },
  "Australia": { d: "M480,250 L535,240 L545,255 L540,280 L520,290 L495,285 L478,270 Z", cx: 512, cy: 268 },
  "New Zealand": { d: "M550,285 L558,280 L562,290 L558,300 L552,298 Z", cx: 556, cy: 290 },
  "Nigeria": { d: "M275,185 L295,183 L298,195 L285,200 L272,195 Z", cx: 285, cy: 192 },
  "Ghana": { d: "M262,185 L275,183 L277,195 L268,198 L260,193 Z", cx: 268, cy: 190 },
  "Kenya": { d: "M335,195 L348,192 L352,205 L342,210 L332,205 Z", cx: 342, cy: 200 },
  "Ethiopia": { d: "M340,180 L358,178 L362,190 L350,195 L338,192 Z", cx: 350, cy: 186 },
  "South Africa": { d: "M305,255 L330,250 L338,265 L328,280 L312,278 L302,268 Z", cx: 320, cy: 266 },
  "Egypt": { d: "M310,145 L330,142 L335,155 L325,165 L308,160 Z", cx: 322, cy: 153 },
  "Morocco": { d: "M240,148 L260,145 L262,158 L252,162 L238,158 Z", cx: 250, cy: 153 },
  "Zimbabwe": { d: "M325,240 L340,238 L343,248 L335,252 L322,248 Z", cx: 333, cy: 245 },
  "Iran": { d: "M365,130 L390,128 L395,142 L385,150 L365,148 Z", cx: 380, cy: 140 },
  "UAE": { d: "M380,158 L392,155 L395,162 L385,165 Z", cx: 387, cy: 160 },
  "Saudi Arabia": { d: "M350,150 L378,148 L382,165 L368,172 L348,168 Z", cx: 365, cy: 160 },
  "Jordan": { d: "M338,142 L348,140 L350,150 L342,152 Z", cx: 344, cy: 146 },
  "Lebanon": { d: "M335,135 L340,133 L342,140 L337,142 Z", cx: 338, cy: 137 },
};

interface CountryData {
  country: string;
  count: number;
}

interface WorldMapSVGProps {
  data: CountryData[];
}

const WorldMapSVG = ({ data }: WorldMapSVGProps) => {
  const [hoveredCountry, setHoveredCountry] = useState<string | null>(null);
  const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 });

  const countMap = useMemo(() => {
    const map: Record<string, number> = {};
    data.forEach((d) => { map[d.country] = d.count; });
    return map;
  }, [data]);

  const maxCount = useMemo(() => Math.max(...data.map((d) => d.count), 1), [data]);

  const getColor = (country: string) => {
    const count = countMap[country] || 0;
    if (count === 0) return "hsl(230 15% 18%)"; // muted
    const intensity = count / maxCount;
    if (intensity > 0.7) return "hsl(210 100% 56%)"; // primary - high
    if (intensity > 0.4) return "hsl(185 80% 50%)"; // accent - medium
    if (intensity > 0.15) return "hsl(270 60% 55%)"; // secondary - low-mid
    return "hsl(270 60% 35%)"; // secondary dim - low
  };

  const getGlow = (country: string) => {
    const count = countMap[country] || 0;
    if (count === 0) return "none";
    const intensity = count / maxCount;
    if (intensity > 0.7) return "drop-shadow(0 0 8px hsl(210 100% 56% / 0.6))";
    if (intensity > 0.4) return "drop-shadow(0 0 6px hsl(185 80% 50% / 0.4))";
    return "drop-shadow(0 0 4px hsl(270 60% 55% / 0.3))";
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setTooltipPos({ x: e.clientX - rect.left, y: e.clientY - rect.top });
  };

  const hoveredData = hoveredCountry ? countMap[hoveredCountry] || 0 : 0;

  return (
    <div className="relative w-full" onMouseMove={handleMouseMove}>
      <svg
        viewBox="0 0 600 330"
        className="w-full h-auto"
        style={{ filter: "drop-shadow(0 0 30px hsl(210 100% 56% / 0.1))" }}
      >
        {/* Ocean background */}
        <rect width="600" height="330" fill="hsl(230 25% 5%)" rx="8" />
        
        {/* Grid lines */}
        {[...Array(12)].map((_, i) => (
          <line key={`v${i}`} x1={i * 50} y1="0" x2={i * 50} y2="330" stroke="hsl(210 100% 56% / 0.05)" strokeWidth="0.5" />
        ))}
        {[...Array(7)].map((_, i) => (
          <line key={`h${i}`} x1="0" y1={i * 50} x2="600" y2={i * 50} stroke="hsl(210 100% 56% / 0.05)" strokeWidth="0.5" />
        ))}

        {/* Countries */}
        {Object.entries(COUNTRY_PATHS).map(([name, { d }]) => (
          <path
            key={name}
            d={d}
            fill={hoveredCountry === name ? "hsl(185 80% 65%)" : getColor(name)}
            stroke={hoveredCountry === name ? "hsl(185 80% 70%)" : "hsl(210 100% 56% / 0.15)"}
            strokeWidth={hoveredCountry === name ? 1.5 : 0.5}
            style={{
              filter: hoveredCountry === name ? "drop-shadow(0 0 12px hsl(185 80% 50% / 0.8))" : getGlow(name),
              transition: "all 0.3s ease",
              cursor: countMap[name] ? "pointer" : "default",
            }}
            onMouseEnter={() => setHoveredCountry(name)}
            onMouseLeave={() => setHoveredCountry(null)}
          />
        ))}

        {/* Pulsing dots for countries with data */}
        {Object.entries(COUNTRY_PATHS).map(([name, { cx, cy }]) => {
          const count = countMap[name] || 0;
          if (count === 0) return null;
          const r = Math.max(2, Math.min(5, (count / maxCount) * 5));
          return (
            <g key={`dot-${name}`}>
              <circle cx={cx} cy={cy} r={r + 2} fill="hsl(185 80% 50% / 0.2)">
                <animate attributeName="r" values={`${r + 1};${r + 4};${r + 1}`} dur="3s" repeatCount="indefinite" />
                <animate attributeName="opacity" values="0.3;0.1;0.3" dur="3s" repeatCount="indefinite" />
              </circle>
              <circle cx={cx} cy={cy} r={r} fill="hsl(185 80% 50%)" opacity="0.8" />
            </g>
          );
        })}
      </svg>

      {/* Tooltip */}
      {hoveredCountry && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="absolute pointer-events-none z-50 px-3 py-2 rounded-lg text-sm"
          style={{
            left: tooltipPos.x + 15,
            top: tooltipPos.y - 10,
            background: "hsl(230 20% 10% / 0.95)",
            border: "1px solid hsl(210 100% 56% / 0.3)",
            boxShadow: "0 0 20px hsl(210 100% 56% / 0.2)",
          }}
        >
          <div className="font-semibold text-foreground">{hoveredCountry}</div>
          <div className="text-accent">
            {hoveredData > 0 ? `${hoveredData} developer${hoveredData > 1 ? "s" : ""}` : "No data"}
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default WorldMapSVG;
