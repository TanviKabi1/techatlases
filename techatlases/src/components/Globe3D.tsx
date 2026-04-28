import { useRef, useEffect, useState, useMemo, useCallback } from "react";
import Globe from "react-globe.gl";
import * as THREE from "three";
import { useTheme } from "@/contexts/ThemeContext";
import { AnimatePresence, motion } from "framer-motion";
import { TrendingUp, Zap } from "lucide-react";

// Helper to convert "230 25% 7%" to "hsl(230, 25%, 7%)" for better compatibility
const toHSL = (hslStr: string | undefined) => {
  if (!hslStr) return "hsl(0, 0%, 0%)";
  const parts = hslStr.split(" ");
  if (parts.length < 3) return `hsl(${hslStr})`;
  return `hsl(${parts[0]}, ${parts[1]}, ${parts[2]})`;
};

// Country centroids for point markers (lat, lng)
const COUNTRY_COORDS: Record<string, { lat: number; lng: number }> = {
  USA: { lat: 39.8, lng: -98.5 },
  Canada: { lat: 56.1, lng: -106.3 },
  Mexico: { lat: 23.6, lng: -102.5 },
  Brazil: { lat: -14.2, lng: -51.9 },
  Argentina: { lat: -38.4, lng: -63.6 },
  Colombia: { lat: 4.5, lng: -74.2 },
  Chile: { lat: -35.6, lng: -71.5 },
  Peru: { lat: -9.2, lng: -75.0 },
  Ecuador: { lat: -1.8, lng: -78.1 },
  UK: { lat: 55.3, lng: -3.4 },
  Ireland: { lat: 53.1, lng: -7.6 },
  France: { lat: 46.2, lng: 2.2 },
  Spain: { lat: 40.4, lng: -3.7 },
  Portugal: { lat: 39.3, lng: -8.2 },
  Germany: { lat: 51.1, lng: 10.4 },
  Italy: { lat: 41.8, lng: 12.5 },
  Netherlands: { lat: 52.1, lng: 5.2 },
  Belgium: { lat: 50.5, lng: 4.4 },
  Austria: { lat: 47.5, lng: 14.5 },
  Poland: { lat: 51.9, lng: 19.1 },
  "Czech Republic": { lat: 49.8, lng: 15.4 },
  Sweden: { lat: 60.1, lng: 18.6 },
  Romania: { lat: 45.9, lng: 24.9 },
  Hungary: { lat: 47.1, lng: 19.5 },
  Croatia: { lat: 45.1, lng: 15.2 },
  Serbia: { lat: 44.0, lng: 21.0 },
  Ukraine: { lat: 48.3, lng: 31.1 },
  Turkey: { lat: 38.9, lng: 35.2 },
  Russia: { lat: 61.5, lng: 105.3 },
  India: { lat: 20.5, lng: 78.9 },
  China: { lat: 35.8, lng: 104.1 },
  Japan: { lat: 36.2, lng: 138.2 },
  "South Korea": { lat: 35.9, lng: 127.7 },
  Thailand: { lat: 15.8, lng: 100.9 },
  Vietnam: { lat: 14.0, lng: 108.2 },
  Philippines: { lat: 12.8, lng: 121.7 },
  Malaysia: { lat: 4.2, lng: 101.9 },
  Singapore: { lat: 1.3, lng: 103.8 },
  Indonesia: { lat: -0.7, lng: 113.9 },
  Australia: { lat: -25.2, lng: 133.7 },
  "New Zealand": { lat: -40.9, lng: 174.8 },
  Nigeria: { lat: 9.0, lng: 8.6 },
  Ghana: { lat: 7.9, lng: -1.0 },
  Kenya: { lat: -0.02, lng: 37.9 },
  Ethiopia: { lat: 9.1, lng: 40.4 },
  "South Africa": { lat: -30.5, lng: 22.9 },
  Egypt: { lat: 26.8, lng: 30.8 },
  Morocco: { lat: 31.7, lng: -7.0 },
  Zimbabwe: { lat: -19.0, lng: 29.1 },
  Iran: { lat: 32.4, lng: 53.6 },
  UAE: { lat: 23.4, lng: 53.8 },
  "Saudi Arabia": { lat: 23.8, lng: 45.0 },
  Jordan: { lat: 30.5, lng: 36.2 },
  Lebanon: { lat: 33.8, lng: 35.8 },
  Israel: { lat: 31.0, lng: 34.8 },
  Pakistan: { lat: 30.3, lng: 69.3 },
  Bangladesh: { lat: 23.6, lng: 90.3 },
  Taiwan: { lat: 23.6, lng: 120.9 },
};

// Base collaboration arcs
const ARC_DATA = [
  { startCountry: "India", endCountry: "USA", label: "Tech Collaboration" },
  { startCountry: "Germany", endCountry: "UK", label: "EU Partnership" },
  { startCountry: "Japan", endCountry: "Singapore", label: "APAC Network" },
  { startCountry: "Brazil", endCountry: "USA", label: "Americas Corridor" },
  { startCountry: "Australia", endCountry: "India", label: "Indo-Pacific Link" },
  { startCountry: "France", endCountry: "Canada", label: "Francophone Axis" },
  { startCountry: "South Korea", endCountry: "USA", label: "K-Tech Bridge" },
  { startCountry: "Nigeria", endCountry: "UK", label: "Africa-Europe Link" },
  { startCountry: "China", endCountry: "Germany", label: "Silk Road Digital" },
  { startCountry: "UAE", endCountry: "India", label: "Gulf Corridor" },
];

const REGIONS: Record<string, string[]> = {
  Asia: ["India", "China", "Japan", "South Korea", "Thailand", "Vietnam", "Philippines", "Malaysia", "Singapore", "Indonesia", "Taiwan", "Pakistan", "Bangladesh"],
  Europe: ["UK", "Ireland", "France", "Spain", "Portugal", "Germany", "Italy", "Netherlands", "Belgium", "Austria", "Poland", "Czech Republic", "Sweden", "Romania", "Hungary", "Croatia", "Serbia", "Ukraine"],
  "North America": ["USA", "Canada", "Mexico"],
  "South America": ["Brazil", "Argentina", "Colombia", "Chile", "Peru", "Ecuador"],
  Africa: ["Nigeria", "Ghana", "Kenya", "Ethiopia", "South Africa", "Egypt", "Morocco", "Zimbabwe"],
  "Middle East": ["Turkey", "Iran", "UAE", "Saudi Arabia", "Jordan", "Lebanon", "Israel"],
  Oceania: ["Australia", "New Zealand"],
};

interface CountryData {
  country: string;
  count: number;
}

interface Globe3DProps {
  data: CountryData[];
  selectedRegion: string;
  selectedCountry?: string | null;
  onCountrySelect: (country: string | null) => void;
  autoRotate: boolean;
}

interface TowerData {
  lat: number;
  lng: number;
  country: string;
  count: number;
  color: string;
  height: number;
  radius: number;
  isDominant: boolean;
}

interface ArcDatum {
  startLat: number;
  startLng: number;
  startAlt: number;
  endLat: number;
  endLng: number;
  endAlt: number;
  color: [string, string];
  label: string;
  dashAnimateTime: number;
  dashLength: number;
  dashGap: number;
}

const Globe3D = ({ data, selectedRegion, selectedCountry, onCountrySelect, autoRotate }: Globe3DProps) => {
  const globeRef = useRef<any>();
  const containerRef = useRef<HTMLDivElement>(null);
  const [geoJson, setGeoJson] = useState<any>(null);
  const [hoveredCountry, setHoveredCountry] = useState<string | null>(null);
  const [dimensions, setDimensions] = useState({ width: 600, height: 500 });
  const { theme } = useTheme();

  const activeCountry = selectedCountry || hoveredCountry;

  // Theme colors as standard CSS strings
  const themePrimary = useMemo(() => theme?.colors ? toHSL(theme.colors.primary) : "#3b82f6", [theme]);
  const themeSecondary = useMemo(() => theme?.colors ? toHSL(theme.colors.secondary) : "#a855f7", [theme]);
  const themeAccent = useMemo(() => theme?.colors ? toHSL(theme.colors.accent) : "#22d3ee", [theme]);
  const themeBg = useMemo(() => theme?.colors ? toHSL(theme.colors.background) : "#020617", [theme]);

  const countMap = useMemo(() => {
    const map: Record<string, number> = {};
    if (data) data.forEach((d) => { map[d.country] = d.count; });
    return map;
  }, [data]);

  const maxCount = useMemo(() => {
    if (!data || data.length === 0) return 1;
    return Math.max(...data.map((d) => d.count), 1);
  }, [data]);

  // Remove pulseTime effect entirely as per user request

  // Load GeoJSON
  useEffect(() => {
    fetch("https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json")
      .then((res) => res.json())
      .then(async (topoData) => {
        const topojson = await import("topojson-client");
        const countries = topojson.feature(topoData, topoData.objects.countries as any);
        setGeoJson(countries);
      })
      .catch(err => console.error("Globe: GeoJSON Load Failed", err));
  }, []);

  // Resize observer
  useEffect(() => {
    if (!containerRef.current) return;
    const obs = new ResizeObserver((entries) => {
      if (entries[0]) {
        const { width, height } = entries[0].contentRect;
        setDimensions({ width: Math.floor(width) || 600, height: Math.floor(height) || 500 });
      }
    });
    obs.observe(containerRef.current);
    return () => obs.disconnect();
  }, []);

  // Filtered countries for region
  const regionCountries = useMemo(() => {
    if (selectedRegion === "All") return null;
    return REGIONS[selectedRegion] || null;
  }, [selectedRegion]);

  // Tower clustering and generation
  const towersData = useMemo<TowerData[]>(() => {
    const arcCountries = new Set<string>();
    ARC_DATA.forEach(arc => {
      arcCountries.add(arc.startCountry);
      arcCountries.add(arc.endCountry);
    });

    const relevantDataCountries = data ? data.map(d => d.country) : [];
    const allRelevantCountries = Array.from(new Set([...relevantDataCountries, ...Array.from(arcCountries)]))
      .filter((country) => COUNTRY_COORDS[country])
      .filter((country) => !regionCountries || regionCountries.includes(country));

    const towers: TowerData[] = [];

    allRelevantCountries.forEach(country => {
      const coords = COUNTRY_COORDS[country];
      const count = countMap[country] || 2;
      const intensity = count / maxCount;
      const height = Math.max(0.05, intensity * 0.6);
      
      let color: string;
      if (intensity > 0.7) color = themePrimary;
      else if (intensity > 0.4) color = themeSecondary;
      else if (intensity > 0.15) color = themeAccent;
      else color = themeSecondary;

      towers.push({
        lat: coords.lat,
        lng: coords.lng,
        country,
        count,
        color,
        height,
        radius: 0.7,
        isDominant: true
      });

      if (intensity > 0.3) {
        const numMicro = Math.floor(intensity * 4);
        for (let i = 0; i < numMicro; i++) {
          towers.push({
            lat: coords.lat + (Math.random() - 0.5) * 2,
            lng: coords.lng + (Math.random() - 0.5) * 2,
            country,
            count: count / 4,
            color: color,
            height: height * (0.3 + Math.random() * 0.4),
            radius: 0.3,
            isDominant: false
          });
        }
      }
    });

    return towers;
  }, [data, countMap, maxCount, regionCountries, themePrimary, themeSecondary, themeAccent]);

  // Randomized overlapping arc data
  const arcsData = useMemo<ArcDatum[]>(() => {
    const countryNames = Object.keys(COUNTRY_COORDS);
    
    // Generate a set of random ambient arcs to create "overlap"
    const randomArcs = Array.from({ length: 15 }).map(() => {
      const startIdx = Math.floor(Math.random() * countryNames.length);
      let endIdx = Math.floor(Math.random() * countryNames.length);
      if (startIdx === endIdx) endIdx = (startIdx + 1) % countryNames.length;
      
      return {
        startCountry: countryNames[startIdx],
        endCountry: countryNames[endIdx],
        label: "Data Packet"
      };
    });

    const combinedArcs = [...ARC_DATA, ...randomArcs];

    return combinedArcs.filter((arc) => {
      const sc = COUNTRY_COORDS[arc.startCountry];
      const ec = COUNTRY_COORDS[arc.endCountry];
      if (!sc || !ec) return false;
      if (regionCountries) {
        return regionCountries.includes(arc.startCountry) || regionCountries.includes(arc.endCountry);
      }
      return true;
    }).map((arc) => {
      const sc = COUNTRY_COORDS[arc.startCountry];
      const ec = COUNTRY_COORDS[arc.endCountry];
      
      const startIntensity = (countMap[arc.startCountry] || 2) / maxCount;
      const endIntensity = (countMap[arc.endCountry] || 2) / maxCount;
      
      const startAlt = Math.max(0.05, startIntensity * 0.6);
      const endAlt = Math.max(0.05, endIntensity * 0.6);

      return {
        startLat: sc.lat,
        startLng: sc.lng,
        startAlt,
        endLat: ec.lat,
        endLng: ec.lng,
        endAlt,
        color: [themeSecondary, themePrimary] as [string, string],
        label: arc.label,
        dashAnimateTime: 1000 + Math.random() * 3000, // Randomized time
        dashLength: 0.2 + Math.random() * 0.6,
        dashGap: 1 + Math.random() * 3,
      };
    });
  }, [countMap, maxCount, regionCountries, themePrimary, themeSecondary]);

  // Setup scene atmospheric effects
  useEffect(() => {
    if (!globeRef.current || !theme || !theme.colors) return;
    const globe = globeRef.current;
    const scene = globe.scene();
    if (!scene) return;
    
    // Clear old custom layers
    const toRemove: THREE.Object3D[] = [];
    scene.traverse((obj: any) => { if (obj.isAtmosphereLayer) toRemove.push(obj); });
    toRemove.forEach(obj => scene.remove(obj));

    // Convert colors to format THREE likes
    const colorBg = new THREE.Color(themeBg);
    const colorPrimary = new THREE.Color(themePrimary);
    const colorSecondary = new THREE.Color(themeSecondary);

    // 1. Background Gradient Sphere
    const bgSphereGeom = new THREE.SphereGeometry(600, 32, 32);
    const bgSphereMat = new THREE.ShaderMaterial({
      side: THREE.BackSide,
      uniforms: {
        color1: { value: colorBg },
        color2: { value: colorPrimary },
        isDark: { value: theme.isDark ? 1.0 : 0.0 }
      },
      vertexShader: `
        varying vec3 vNormal;
        void main() {
          vNormal = normalize(normal);
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        varying vec3 vNormal;
        uniform vec3 color1;
        uniform vec3 color2;
        uniform float isDark;
        void main() {
          float intensity = pow(0.7 - dot(vNormal, vec3(0, 0, 1.0)), 2.0);
          vec3 finalColor = mix(color1, color2, intensity * (isDark > 0.5 ? 0.3 : 0.15));
          gl_FragColor = vec4(finalColor, 1.0);
        }
      `
    });
    const bgSphere = new THREE.Mesh(bgSphereGeom, bgSphereMat);
    (bgSphere as any).isAtmosphereLayer = true;
    scene.add(bgSphere);

    // 2. Particle Stars/Dots
    const starsCount = theme.isDark ? 1500 : 800;
    const starsGeom = new THREE.BufferGeometry();
    const starsPos = new Float32Array(starsCount * 3);
    const starsColors = new Float32Array(starsCount * 3);
    
    for (let i = 0; i < starsCount; i++) {
      const r = 250 + Math.random() * 350;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      
      starsPos[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      starsPos[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      starsPos[i * 3 + 2] = r * Math.cos(phi);

      const mixed = colorPrimary.clone().lerp(colorSecondary, Math.random());
      starsColors[i * 3] = mixed.r;
      starsColors[i * 3 + 1] = mixed.g;
      starsColors[i * 3 + 2] = mixed.b;
    }
    
    starsGeom.setAttribute('position', new THREE.BufferAttribute(starsPos, 3));
    starsGeom.setAttribute('color', new THREE.BufferAttribute(starsColors, 3));
    
    const starsMat = new THREE.PointsMaterial({
      size: 1.5,
      vertexColors: true,
      transparent: true,
      opacity: theme.isDark ? 0.6 : 0.3,
      sizeAttenuation: true
    });
    const starField = new THREE.Points(starsGeom, starsMat);
    (starField as any).isAtmosphereLayer = true;
    scene.add(starField);

    // 3. Fog and Lighting
    scene.fog = new THREE.FogExp2(colorBg, 0.0015);
    
    const ambientIntensity = theme.isDark ? 0.4 : 0.7;
    const ambientLight = new THREE.AmbientLight(colorPrimary, ambientIntensity);
    (ambientLight as any).isAtmosphereLayer = true;
    scene.add(ambientLight);

    const pointLight = new THREE.PointLight(colorSecondary, theme.isDark ? 1 : 0.5, 800);
    pointLight.position.set(200, 100, 300);
    (pointLight as any).isAtmosphereLayer = true;
    scene.add(pointLight);

    // Initial camera position
    globe.pointOfView({ lat: 20, lng: 10, altitude: 2.2 }, 0);
  }, [theme, themeBg, themePrimary, themeSecondary]);

  // Debounce for smooth hover transitions between elements
  const hoverTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const handleHover = useCallback((countryName: string | null) => {
    if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);
    if (countryName) {
      setHoveredCountry(countryName);
    } else {
      hoverTimeoutRef.current = setTimeout(() => {
        setHoveredCountry(null);
      }, 50); // Small debounce to prevent flickering
    }
  }, []);

  // Update autoRotate dynamically when prop changes
  useEffect(() => {
    if (globeRef.current) {
      const controls = globeRef.current.controls();
      if (controls) {
        controls.autoRotate = autoRotate;
      }
    }
  }, [autoRotate]);

  if (!theme) return null;

  return (
    <div ref={containerRef} className="w-full h-full min-h-[500px] relative" style={{ pointerEvents: 'auto', zIndex: 20 }}>
      {geoJson && (
        <Globe
          ref={globeRef}
          width={dimensions.width}
          height={dimensions.height}
          globeImageUrl={theme?.isDark ? "//unpkg.com/three-globe/example/img/earth-night.jpg" : "//unpkg.com/three-globe/example/img/earth-blue-marble.jpg"}
          backgroundColor="rgba(0,0,0,0)"
          atmosphereColor={themePrimary}
          atmosphereAltitude={0.2}
          
          // Polygons (Countries)
          polygonsData={geoJson.features}
          polygonCapColor={(feat: any) => {
            const name = feat?.properties?.name;
            if (selectedCountry === name) return themePrimary;
            if (hoveredCountry === name) return `hsla(${theme?.colors?.primary || "0 0% 100%"} / 0.5)`;
            if (countMap[name]) return `hsla(${theme?.colors?.primary || "0 0% 100%"} / 0.2)`;
            return "rgba(255, 255, 255, 0.05)";
          }}
          polygonSideColor={() => "rgba(15, 23, 42, 0.1)"}
          polygonStrokeColor={(feat: any) => (selectedCountry === feat?.properties?.name || hoveredCountry === feat?.properties?.name) ? "#ffffff" : "rgba(255,255,255,0.2)"}
          polygonAltitude={0.015}
          polygonsTransitionDuration={300}
          onPolygonHover={(feat: any) => handleHover(feat?.properties?.name || null)}
          onPolygonClick={(feat: any) => onCountrySelect(feat?.properties?.name || null)}

          // Towers (Points Data)
          pointsData={towersData}
          pointLat="lat"
          pointLng="lng"
          pointColor={(pt: any) => hoveredCountry === pt.country ? themePrimary : pt.color}
          pointAltitude="height"
          pointRadius="radius"
          pointsMerge={false}
          onPointHover={(pt: any) => handleHover(pt?.country || null)}
          onPointClick={(pt: any) => onCountrySelect(pt.country)}
          
          // Arcs (Staggered data flows)
          arcsData={arcsData}
          arcStartLat="startLat"
          arcStartLng="startLng"
          arcStartAltitude="startAlt"
          arcEndLat="endLat"
          arcEndLng="endLng"
          arcEndAltitude="endAlt"
          arcColor={(arc: any) => (hoveredCountry === arc.startCountry || hoveredCountry === arc.endCountry) ? [themeAccent, themePrimary] : arc.color}
          arcDashLength="dashLength"
          arcDashGap="dashGap"
          arcDashAnimateTime="dashAnimateTime"
          arcStroke={0.3}
          arcAltitudeAutoScale={0.5}
          onArcHover={(arc: any) => handleHover(arc?.startCountry || null)}
          onArcClick={(arc: any) => onCountrySelect(arc?.startCountry || null)}
          
          // Animation
          onGlobeReady={() => {
            if (globeRef.current) {
              const controls = globeRef.current.controls();
              if (controls) {
                controls.autoRotate = autoRotate;
                controls.autoRotateSpeed = 0.5;
                controls.enableDamping = true;
                controls.dampingFactor = 0.05;
              }
            }
          }}
        />
      )}

      {/* Enhanced Floating Intelligence Card (Bottom Left Anchor) */}
      <AnimatePresence>
        {activeCountry && (
          <motion.div
            key={activeCountry}
            initial={{ opacity: 0, y: 15, x: -10 }}
            animate={{ opacity: 1, y: 0, x: 0 }}
            exit={{ opacity: 0, y: 10, x: -10, transition: { duration: 0.2 } }}
            className="absolute bottom-8 left-8 pointer-events-none z-50"
          >
            <div 
              className="glass p-5 rounded-3xl min-w-[260px] shadow-[0_0_40px_rgba(0,0,0,0.3)] border-2 transition-all duration-300 backdrop-blur-xl bg-card/60" 
              style={{ 
                borderColor: `hsla(${theme.colors.primary} / 0.4)`,
                boxShadow: `0 0 20px hsla(${theme.colors.primary} / 0.1)`
              }}
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div 
                    className="w-3 h-3 rounded-full" 
                    style={{ 
                      backgroundColor: themePrimary,
                      boxShadow: `0 0 15px ${themePrimary}`,
                    }} 
                  />
                  <h4 className="text-lg font-bold text-foreground tracking-tight">
                    {activeCountry}
                  </h4>
                </div>
                <div className="px-2 py-0.5 rounded-full bg-primary/10 border border-primary/20 text-[9px] font-bold text-primary uppercase tracking-widest">
                  Active Hub
                </div>
              </div>

              {countMap[activeCountry] ? (
                <div className="space-y-3">
                  <div className="flex justify-between items-end">
                    <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">Transmission Rate</span>
                    <span className="text-xl font-mono font-bold text-foreground tabular-nums">
                      {countMap[activeCountry]}
                    </span>
                  </div>
                  <div className="w-full h-1.5 bg-muted/30 rounded-full overflow-hidden">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${(countMap[activeCountry] / maxCount) * 100}%` }}
                      className="h-full rounded-full"
                      style={{ background: `linear-gradient(90deg, ${themeSecondary}, ${themePrimary})` }}
                    />
                  </div>
                  <div className="flex items-center gap-2 pt-1">
                    <Zap className="w-3 h-3 text-accent animate-pulse" />
                    <span className="text-[10px] text-accent font-semibold italic">Syncing with global neural net...</span>
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-2 text-muted-foreground/60 py-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-muted-foreground/30" />
                  <span className="text-[11px] italic">Establishing connection...</span>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes pulse {
          0% { transform: scale(1); opacity: 1; }
          50% { transform: scale(1.2); opacity: 0.7; }
          100% { transform: scale(1); opacity: 1; }
        }
      `}} />
    </div>
  );
};

export default Globe3D;
