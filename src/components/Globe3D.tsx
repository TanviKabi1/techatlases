import { useRef, useEffect, useState, useMemo, useCallback } from "react";
import Globe from "react-globe.gl";
import * as THREE from "three";

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

// Collaboration arcs
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
  onCountrySelect: (country: string | null) => void;
  autoRotate: boolean;
}

interface PointData {
  lat: number;
  lng: number;
  country: string;
  count: number;
  color: string;
  size: number;
}

interface ArcDatum {
  startLat: number;
  startLng: number;
  endLat: number;
  endLng: number;
  color: [string, string];
  label: string;
}

const Globe3D = ({ data, selectedRegion, onCountrySelect, autoRotate }: Globe3DProps) => {
  const globeRef = useRef<any>();
  const containerRef = useRef<HTMLDivElement>(null);
  const [geoJson, setGeoJson] = useState<any>(null);
  const [hoveredCountry, setHoveredCountry] = useState<string | null>(null);
  const [dimensions, setDimensions] = useState({ width: 600, height: 500 });

  const countMap = useMemo(() => {
    const map: Record<string, number> = {};
    data.forEach((d) => { map[d.country] = d.count; });
    return map;
  }, [data]);

  const maxCount = useMemo(() => Math.max(...data.map((d) => d.count), 1), [data]);

  // Load GeoJSON
  useEffect(() => {
    fetch("https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json")
      .then((res) => res.json())
      .then(async (topoData) => {
        const topojson = await import("topojson-client");
        const countries = topojson.feature(topoData, topoData.objects.countries as any);
        setGeoJson(countries);
      });
  }, []);

  // Resize observer
  useEffect(() => {
    if (!containerRef.current) return;
    const obs = new ResizeObserver((entries) => {
      const { width, height } = entries[0].contentRect;
      setDimensions({ width: Math.floor(width), height: Math.floor(height) });
    });
    obs.observe(containerRef.current);
    return () => obs.disconnect();
  }, []);

  // Configure globe on mount
  useEffect(() => {
    if (!globeRef.current) return;
    const globe = globeRef.current;

    // Camera position
    globe.pointOfView({ lat: 20, lng: 10, altitude: 2.2 }, 0);

    // Controls
    const controls = globe.controls();
    if (controls) {
      controls.enableDamping = true;
      controls.dampingFactor = 0.1;
      controls.rotateSpeed = 0.5;
      controls.zoomSpeed = 0.8;
      controls.minDistance = 150;
      controls.maxDistance = 500;
    }

    // Custom globe material
    const scene = globe.scene();
    if (scene) {
      scene.background = new THREE.Color(0x050a15);

      // Atmosphere
      const ambientLight = new THREE.AmbientLight(0x334466, 0.5);
      scene.add(ambientLight);
    }
  }, [geoJson]);

  // Auto-rotate
  useEffect(() => {
    if (!globeRef.current) return;
    const controls = globeRef.current.controls();
    if (controls) {
      controls.autoRotate = autoRotate;
      controls.autoRotateSpeed = 0.5;
    }
  }, [autoRotate]);

  // Filtered countries for region
  const regionCountries = useMemo(() => {
    if (selectedRegion === "All") return null;
    return REGIONS[selectedRegion] || null;
  }, [selectedRegion]);

  // Point data for developer markers
  const pointsData = useMemo<PointData[]>(() => {
    return data
      .filter((d) => COUNTRY_COORDS[d.country])
      .filter((d) => !regionCountries || regionCountries.includes(d.country))
      .map((d) => {
        const coords = COUNTRY_COORDS[d.country];
        const intensity = d.count / maxCount;
        let color: string;
        if (intensity > 0.7) color = "#3b82f6";
        else if (intensity > 0.4) color = "#22d3ee";
        else if (intensity > 0.15) color = "#a855f7";
        else color = "#7c3aed";

        return {
          lat: coords.lat,
          lng: coords.lng,
          country: d.country,
          count: d.count,
          color,
          size: Math.max(0.15, (d.count / maxCount) * 0.8),
        };
      });
  }, [data, maxCount, regionCountries]);

  // Arc data
  const arcsData = useMemo<ArcDatum[]>(() => {
    return ARC_DATA.filter((arc) => {
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
      return {
        startLat: sc.lat,
        startLng: sc.lng,
        endLat: ec.lat,
        endLng: ec.lng,
        color: ["#22d3ee", "#a855f7"] as [string, string],
        label: arc.label,
      };
    });
  }, [regionCountries]);

  // Polygon color based on developer count
  const getPolygonColor = useCallback(
    (feat: any) => {
      const isHovered = hoveredCountry === feat?.properties?.name;
      if (isHovered) return "rgba(34, 211, 238, 0.4)";

      // Check if in selected region
      if (regionCountries) {
        const name = feat?.properties?.name;
        if (!regionCountries.includes(name)) return "rgba(15, 23, 42, 0.3)";
      }
      return "rgba(30, 41, 59, 0.6)";
    },
    [hoveredCountry, regionCountries]
  );

  const getPolygonStroke = useCallback(
    (feat: any) => {
      const isHovered = hoveredCountry === feat?.properties?.name;
      if (isHovered) return "#22d3ee";
      return "#1e40af22";
    },
    [hoveredCountry]
  );

  const pointLabel = useCallback(
    (d: object) => {
      const point = d as PointData;
      return `
        <div style="
          background: rgba(5, 10, 25, 0.95);
          border: 1px solid rgba(34, 211, 238, 0.5);
          border-radius: 10px;
          padding: 12px 16px;
          color: #e2e8f0;
          font-family: 'Space Grotesk', sans-serif;
          box-shadow: 0 0 25px rgba(34, 211, 238, 0.2);
          min-width: 160px;
        ">
          <div style="font-size: 14px; font-weight: 700; color: #22d3ee; margin-bottom: 6px;">${point.country}</div>
          <div style="font-size: 12px; display: flex; justify-content: space-between; margin-bottom: 3px;">
            <span style="color: #94a3b8;">Developers</span>
            <span style="color: #f1f5f9; font-weight: 600;">${point.count.toLocaleString()}</span>
          </div>
          <div style="margin-top: 6px; height: 3px; border-radius: 2px; background: rgba(100,116,139,0.3); overflow: hidden;">
            <div style="height: 100%; width: ${(point.count / maxCount) * 100}%; background: linear-gradient(90deg, #3b82f6, #22d3ee); border-radius: 2px;"></div>
          </div>
        </div>
      `;
    },
    [maxCount]
  );

  return (
    <div ref={containerRef} className="w-full h-full min-h-[400px] relative">
      {geoJson && (
        <Globe
          ref={globeRef}
          width={dimensions.width}
          height={dimensions.height}
          globeImageUrl="//unpkg.com/three-globe/example/img/earth-night.jpg"
          backgroundImageUrl=""
          backgroundColor="rgba(0,0,0,0)"
          atmosphereColor="#3b82f6"
          atmosphereAltitude={0.2}
          // Polygons (countries)
          polygonsData={geoJson.features}
          polygonCapColor={getPolygonColor}
          polygonSideColor={() => "rgba(15, 23, 42, 0.2)"}
          polygonStrokeColor={getPolygonStroke}
          polygonAltitude={(feat: any) =>
            hoveredCountry === feat?.properties?.name ? 0.02 : 0.005
          }
          onPolygonHover={(feat: any) => {
            setHoveredCountry(feat?.properties?.name || null);
          }}
          onPolygonClick={(feat: any) => {
            const name = feat?.properties?.name;
            onCountrySelect(name || null);
          }}
          // Points (developer markers)
          pointsData={pointsData}
          pointLat="lat"
          pointLng="lng"
          pointColor="color"
          pointAltitude="size"
          pointRadius={0.4}
          pointLabel={pointLabel}
          pointsMerge={false}
          // Arcs
          arcsData={arcsData}
          arcStartLat="startLat"
          arcStartLng="startLng"
          arcEndLat="endLat"
          arcEndLng="endLng"
          arcColor="color"
          arcDashLength={0.5}
          arcDashGap={0.3}
          arcDashAnimateTime={2000}
          arcStroke={0.4}
          arcAltitudeAutoScale={0.4}
        />
      )}

      {/* Loading overlay */}
      {!geoJson && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-3" />
            <p className="text-muted-foreground text-sm">Loading globe data...</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default Globe3D;
