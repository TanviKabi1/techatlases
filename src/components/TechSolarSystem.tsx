// @ts-nocheck
import { useRef, useMemo, useState, useCallback, Component, ReactNode, useEffect } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";

/* ─── Error boundary ─── */
class SolarSystemErrorBoundary extends Component<{ children: ReactNode; fallback?: ReactNode }, { hasError: boolean }> {
  state = { hasError: false };
  static getDerivedStateFromError() { return { hasError: true }; }
  render() {
    if (this.state.hasError) return this.props.fallback || null;
    return this.props.children;
  }
}

/* ─── Types ─── */
interface Moon {
  name: string;
  color: string;
  orbitRadius: number;
  speed: number;
  size: number;
}

interface PlanetData {
  name: string;
  color: string;
  emissive: string;
  size: number;
  orbitRadius: number;
  speed: number;
  tilt: number;
  description: string;
  moons: Moon[];
}

interface PlanetAnalytics {
  developers: string;
  growth: string;
  avgSalary: string;
  topRegion: string;
}

/* ─── Data ─── */
const PLANETS: PlanetData[] = [
  {
    name: "Frontend Development",
    color: "#3b82f6",
    emissive: "#2563eb",
    size: 0.7,
    orbitRadius: 4.5,
    speed: 0.12,
    tilt: 0.3,
    description: "The visual layer of the web — UI frameworks, rendering engines, and design systems.",
    moons: [
      { name: "React", color: "#61dafb", orbitRadius: 1.2, speed: 0.8, size: 0.12 },
      { name: "Vue", color: "#42b883", orbitRadius: 1.5, speed: 0.6, size: 0.1 },
      { name: "Angular", color: "#dd1b16", orbitRadius: 1.8, speed: 0.5, size: 0.11 },
      { name: "Next.js", color: "#ffffff", orbitRadius: 2.1, speed: 0.45, size: 0.1 },
    ],
  },
  {
    name: "Backend Development",
    color: "#22c55e",
    emissive: "#16a34a",
    size: 0.65,
    orbitRadius: 6.0,
    speed: 0.09,
    tilt: -0.2,
    description: "Server-side logic, APIs, and data processing that power modern applications.",
    moons: [
      { name: "Node.js", color: "#68a063", orbitRadius: 1.3, speed: 0.7, size: 0.11 },
      { name: "Django", color: "#092e20", orbitRadius: 1.6, speed: 0.55, size: 0.1 },
      { name: "Spring", color: "#6db33f", orbitRadius: 1.9, speed: 0.48, size: 0.09 },
      { name: "Go", color: "#00add8", orbitRadius: 2.2, speed: 0.4, size: 0.1 },
    ],
  },
  {
    name: "Artificial Intelligence",
    color: "#a855f7",
    emissive: "#9333ea",
    size: 0.75,
    orbitRadius: 7.8,
    speed: 0.07,
    tilt: 0.4,
    description: "Machine learning, deep learning, and generative AI transforming every industry.",
    moons: [
      { name: "TensorFlow", color: "#ff6f00", orbitRadius: 1.4, speed: 0.65, size: 0.12 },
      { name: "PyTorch", color: "#ee4c2c", orbitRadius: 1.7, speed: 0.5, size: 0.11 },
      { name: "LangChain", color: "#1c3c3c", orbitRadius: 2.0, speed: 0.42, size: 0.09 },
      { name: "Scikit-learn", color: "#f7931e", orbitRadius: 2.3, speed: 0.38, size: 0.1 },
    ],
  },
  {
    name: "Cloud Infrastructure",
    color: "#06b6d4",
    emissive: "#0891b2",
    size: 0.6,
    orbitRadius: 9.5,
    speed: 0.055,
    tilt: -0.15,
    description: "Scalable computing, containerization, and serverless architectures in the cloud.",
    moons: [
      { name: "AWS", color: "#ff9900", orbitRadius: 1.3, speed: 0.7, size: 0.11 },
      { name: "Docker", color: "#2496ed", orbitRadius: 1.6, speed: 0.55, size: 0.1 },
      { name: "K8s", color: "#326ce5", orbitRadius: 1.9, speed: 0.45, size: 0.1 },
      { name: "Terraform", color: "#7b42bc", orbitRadius: 2.2, speed: 0.38, size: 0.09 },
    ],
  },
  {
    name: "Data Science",
    color: "#f97316",
    emissive: "#ea580c",
    size: 0.55,
    orbitRadius: 11.0,
    speed: 0.045,
    tilt: 0.25,
    description: "Analytics, visualization, and statistical modeling to extract insights from data.",
    moons: [
      { name: "Python", color: "#3776ab", orbitRadius: 1.2, speed: 0.75, size: 0.12 },
      { name: "R", color: "#276dc3", orbitRadius: 1.5, speed: 0.6, size: 0.09 },
      { name: "Pandas", color: "#150458", orbitRadius: 1.8, speed: 0.5, size: 0.1 },
      { name: "Spark", color: "#e25a1c", orbitRadius: 2.1, speed: 0.42, size: 0.09 },
    ],
  },
  {
    name: "Mobile Development",
    color: "#eab308",
    emissive: "#ca8a04",
    size: 0.5,
    orbitRadius: 12.5,
    speed: 0.038,
    tilt: -0.35,
    description: "Native and cross-platform mobile apps for iOS, Android, and beyond.",
    moons: [
      { name: "Swift", color: "#f05138", orbitRadius: 1.2, speed: 0.7, size: 0.1 },
      { name: "Kotlin", color: "#7f52ff", orbitRadius: 1.5, speed: 0.55, size: 0.1 },
      { name: "Flutter", color: "#02569b", orbitRadius: 1.8, speed: 0.48, size: 0.09 },
      { name: "React Native", color: "#61dafb", orbitRadius: 2.1, speed: 0.4, size: 0.09 },
    ],
  },
];

const ANALYTICS: Record<string, PlanetAnalytics> = {
  "Frontend Development": { developers: "12.4M", growth: "+18%", avgSalary: "$95K", topRegion: "North America" },
  "Backend Development": { developers: "10.8M", growth: "+14%", avgSalary: "$105K", topRegion: "Europe" },
  "Artificial Intelligence": { developers: "4.2M", growth: "+42%", avgSalary: "$130K", topRegion: "Asia Pacific" },
  "Cloud Infrastructure": { developers: "6.1M", growth: "+25%", avgSalary: "$120K", topRegion: "North America" },
  "Data Science": { developers: "5.3M", growth: "+30%", avgSalary: "$115K", topRegion: "Europe" },
  "Mobile Development": { developers: "7.6M", growth: "+12%", avgSalary: "$98K", topRegion: "Asia Pacific" },
};

/* ─── Mouse tracker (shared across scene) ─── */
function useMousePosition() {
  const mouse = useRef(new THREE.Vector3(0, 0, 0));
  const raycaster = useRef(new THREE.Raycaster());
  const plane = useRef(new THREE.Plane(new THREE.Vector3(0, 1, 0), 0));

  const { camera, gl } = useThree();

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      const rect = gl.domElement.getBoundingClientRect();
      const ndc = new THREE.Vector2(
        ((e.clientX - rect.left) / rect.width) * 2 - 1,
        -((e.clientY - rect.top) / rect.height) * 2 + 1
      );
      raycaster.current.setFromCamera(ndc, camera);
      const target = new THREE.Vector3();
      raycaster.current.ray.intersectPlane(plane.current, target);
      if (target) mouse.current.copy(target);
    };
    gl.domElement.addEventListener("mousemove", onMove);
    return () => gl.domElement.removeEventListener("mousemove", onMove);
  }, [camera, gl]);

  return mouse;
}

/* ─── Procedural planet texture ─── */
function createPlanetTexture(baseColor: string, seed: number): THREE.CanvasTexture {
  const size = 256;
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d")!;

  // Base color
  ctx.fillStyle = baseColor;
  ctx.fillRect(0, 0, size, size);

  // Procedural noise bands
  const base = new THREE.Color(baseColor);
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const n1 = Math.sin(y * 0.05 + seed) * 0.15;
      const n2 = Math.sin(x * 0.08 + y * 0.03 + seed * 2) * 0.1;
      const n3 = Math.sin((x + y) * 0.02 + seed * 3) * 0.08;
      const variation = n1 + n2 + n3;

      const r = Math.min(255, Math.max(0, (base.r + variation) * 255));
      const g = Math.min(255, Math.max(0, (base.g + variation * 0.8) * 255));
      const b = Math.min(255, Math.max(0, (base.b + variation * 0.6) * 255));

      ctx.fillStyle = `rgb(${r},${g},${b})`;
      ctx.fillRect(x, y, 1, 1);
    }
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  return texture;
}

/* ─── Atmosphere glow shell ─── */
function AtmosphereGlow({ color, size }: { color: string; size: number }) {
  const ref = useRef<THREE.Mesh>(null);

  useFrame(({ clock }) => {
    if (ref.current) {
      const mat = ref.current.material as THREE.MeshBasicMaterial;
      mat.opacity = 0.12 + Math.sin(clock.getElapsedTime() * 1.5) * 0.04;
    }
  });

  return (
    <>
      <mesh ref={ref}>
        <sphereGeometry args={[size * 1.25, 32, 32]} />
        <meshBasicMaterial color={color} transparent opacity={0.12} side={THREE.BackSide} />
      </mesh>
      <mesh>
        <sphereGeometry args={[size * 1.5, 32, 32]} />
        <meshBasicMaterial color={color} transparent opacity={0.04} side={THREE.BackSide} />
      </mesh>
    </>
  );
}

/* ─── Moon component ─── */
function MoonMesh({ moon, index, parentPos }: { moon: Moon; index: number; parentPos: THREE.Vector3 }) {
  const ref = useRef<THREE.Mesh>(null);
  const offset = (index * Math.PI * 2) / 4;

  useFrame(({ clock }) => {
    if (!ref.current) return;
    const t = clock.getElapsedTime() * moon.speed + offset;
    ref.current.position.x = parentPos.x + Math.cos(t) * moon.orbitRadius;
    ref.current.position.z = parentPos.z + Math.sin(t) * moon.orbitRadius;
    ref.current.position.y = parentPos.y + Math.sin(t * 0.5) * 0.15;
    ref.current.rotation.y += 0.02;
  });

  return (
    <mesh ref={ref}>
      <sphereGeometry args={[moon.size, 16, 16]} />
      <meshStandardMaterial
        color={moon.color}
        emissive={moon.color}
        emissiveIntensity={0.4}
        roughness={0.5}
        metalness={0.5}
      />
      <pointLight color={moon.color} intensity={0.2} distance={2} />
    </mesh>
  );
}

/* ─── Moon orbit ring ─── */
function MoonOrbitRing({ radius, parentPos, color }: { radius: number; parentPos: THREE.Vector3; color: string }) {
  const geometry = useMemo(() => {
    const pts: THREE.Vector3[] = [];
    for (let i = 0; i <= 64; i++) {
      const angle = (i / 64) * Math.PI * 2;
      pts.push(new THREE.Vector3(Math.cos(angle) * radius, 0, Math.sin(angle) * radius));
    }
    return new THREE.BufferGeometry().setFromPoints(pts);
  }, [radius]);

  const material = useMemo(() => new THREE.LineBasicMaterial({ color, transparent: true, opacity: 0.08 }), [color]);
  const lineObj = useMemo(() => new THREE.Line(geometry, material), [geometry, material]);

  const ref = useRef<THREE.Line>(null);
  useFrame(() => {
    if (ref.current) {
      ref.current.position.copy(parentPos);
    }
  });

  return <primitive ref={ref} object={lineObj} />;
}

/* ─── Realistic planet ─── */
function RealisticPlanet({
  planet,
  index,
  total,
  mousePos,
  onSelect,
  isSelected,
}: {
  planet: PlanetData;
  index: number;
  total: number;
  mousePos: React.RefObject<THREE.Vector3>;
  onSelect: (name: string | null) => void;
  isSelected: boolean;
}) {
  const groupRef = useRef<THREE.Group>(null);
  const meshRef = useRef<THREE.Mesh>(null);
  const posRef = useRef(new THREE.Vector3());
  const displaceRef = useRef(new THREE.Vector3());
  const scaleRef = useRef(1);
  const hoveredRef = useRef(false);
  const offset = (index * Math.PI * 2) / total;

  const texture = useMemo(() => createPlanetTexture(planet.color, index * 7.3), [planet.color, index]);

  useFrame(({ clock }) => {
    if (!groupRef.current || !meshRef.current) return;
    const t = clock.getElapsedTime() * planet.speed + offset;

    // Orbital position
    const orbX = Math.cos(t) * planet.orbitRadius;
    const orbZ = Math.sin(t) * planet.orbitRadius;
    const orbY = Math.sin(t * 0.3 + index) * planet.tilt;

    // Repulsion from cursor
    const mp = mousePos.current;
    if (mp) {
      const dx = orbX - mp.x;
      const dz = orbZ - mp.z;
      const dist = Math.sqrt(dx * dx + dz * dz);
      const repulsionRadius = 3.5;
      const repulsionStrength = 1.8;

      if (dist < repulsionRadius && dist > 0.01) {
        const force = (1 - dist / repulsionRadius) * repulsionStrength;
        const nx = dx / dist;
        const nz = dz / dist;
        displaceRef.current.x += (nx * force - displaceRef.current.x) * 0.08;
        displaceRef.current.z += (nz * force - displaceRef.current.z) * 0.08;
        hoveredRef.current = dist < 2.0;
      } else {
        displaceRef.current.x *= 0.92;
        displaceRef.current.z *= 0.92;
        hoveredRef.current = false;
      }
    }

    const finalX = orbX + displaceRef.current.x;
    const finalZ = orbZ + displaceRef.current.z;

    groupRef.current.position.set(finalX, orbY, finalZ);
    posRef.current.set(finalX, orbY, finalZ);

    // Axis rotation
    meshRef.current.rotation.y += 0.003;
    meshRef.current.rotation.x = planet.tilt * 0.3;

    // Hover scale
    const targetScale = hoveredRef.current ? 1.3 : 1;
    scaleRef.current += (targetScale - scaleRef.current) * 0.1;
    meshRef.current.scale.setScalar(scaleRef.current);
  });

  return (
    <>
      <group ref={groupRef} onClick={() => onSelect(isSelected ? null : planet.name)}>
        {/* Planet mesh */}
        <mesh ref={meshRef} castShadow>
          <sphereGeometry args={[planet.size, 48, 48]} />
          <meshStandardMaterial
            map={texture}
            emissive={planet.emissive}
            emissiveIntensity={hoveredRef.current ? 0.8 : 0.3}
            roughness={0.4}
            metalness={0.6}
          />
        </mesh>

        {/* Atmosphere */}
        <AtmosphereGlow color={planet.color} size={planet.size} />

        {/* Point light */}
        <pointLight color={planet.color} intensity={1.5} distance={8} />
      </group>

      {/* Moons */}
      {planet.moons.map((moon, mi) => (
        <MoonMesh key={moon.name} moon={moon} index={mi} parentPos={posRef.current} />
      ))}

      {/* Moon orbit rings */}
      {planet.moons.map((moon) => (
        <MoonOrbitRing key={`orbit-${moon.name}`} radius={moon.orbitRadius} parentPos={posRef.current} color={planet.color} />
      ))}
    </>
  );
}

/* ─── Orbit ring ─── */
function OrbitRing({ radius, color }: { radius: number; color: string }) {
  const geometry = useMemo(() => {
    const pts: THREE.Vector3[] = [];
    for (let i = 0; i <= 128; i++) {
      const angle = (i / 128) * Math.PI * 2;
      pts.push(new THREE.Vector3(Math.cos(angle) * radius, 0, Math.sin(angle) * radius));
    }
    return new THREE.BufferGeometry().setFromPoints(pts);
  }, [radius]);

  const material = useMemo(() => new THREE.LineBasicMaterial({ color, transparent: true, opacity: 0.06 }), [color]);

  return <primitive object={new THREE.Line(geometry, material)} />;
}

/* ─── Central star ─── */
function CentralStar() {
  const meshRef = useRef<THREE.Mesh>(null);
  const glowRef = useRef<THREE.Mesh>(null);

  useFrame(({ clock }) => {
    if (meshRef.current) meshRef.current.rotation.y = clock.getElapsedTime() * 0.15;
    if (glowRef.current) {
      const s = 1 + Math.sin(clock.getElapsedTime() * 0.8) * 0.05;
      glowRef.current.scale.setScalar(s);
    }
  });

  return (
    <group>
      <mesh ref={meshRef}>
        <icosahedronGeometry args={[1.2, 3]} />
        <meshStandardMaterial
          color="#3b82f6"
          emissive="#3b82f6"
          emissiveIntensity={1.2}
          wireframe
          transparent
          opacity={0.5}
        />
      </mesh>
      <mesh ref={glowRef}>
        <sphereGeometry args={[0.8, 32, 32]} />
        <meshStandardMaterial
          color="#8b5cf6"
          emissive="#8b5cf6"
          emissiveIntensity={1.5}
          transparent
          opacity={0.5}
        />
      </mesh>
      {/* Inner glow shells */}
      <mesh>
        <sphereGeometry args={[1.8, 32, 32]} />
        <meshBasicMaterial color="#3b82f6" transparent opacity={0.03} side={THREE.BackSide} />
      </mesh>
      <mesh>
        <sphereGeometry args={[2.5, 32, 32]} />
        <meshBasicMaterial color="#8b5cf6" transparent opacity={0.015} side={THREE.BackSide} />
      </mesh>
      <pointLight color="#3b82f6" intensity={8} distance={30} />
      <pointLight color="#8b5cf6" intensity={4} distance={20} />
    </group>
  );
}

/* ─── Star field ─── */
function StarField() {
  const ref = useRef<THREE.Points>(null);
  const [positions] = useState(() => {
    const pos = new Float32Array(4000 * 3);
    for (let i = 0; i < 4000; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 250;
      pos[i * 3 + 1] = (Math.random() - 0.5) * 250;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 250;
    }
    return pos;
  });

  useFrame(({ clock }) => {
    if (ref.current) ref.current.rotation.y = clock.getElapsedTime() * 0.005;
  });

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial color="#ffffff" size={0.25} transparent opacity={0.6} sizeAttenuation />
    </points>
  );
}

/* ─── Camera controller for zoom ─── */
function CameraController({ selectedPlanet, planets }: { selectedPlanet: string | null; planets: PlanetData[] }) {
  const { camera } = useThree();
  const targetPos = useRef(new THREE.Vector3(0, 8, 18));
  const targetLookAt = useRef(new THREE.Vector3(0, 0, 0));

  useFrame(() => {
    // Smooth lerp to target
    camera.position.lerp(targetPos.current, 0.03);
    const currentLookAt = new THREE.Vector3();
    camera.getWorldDirection(currentLookAt);

    // Smooth look-at by updating a temporary target
    const lerpedLookAt = new THREE.Vector3().lerpVectors(
      new THREE.Vector3().addVectors(camera.position, currentLookAt.multiplyScalar(10)),
      targetLookAt.current,
      0.03
    );
    camera.lookAt(lerpedLookAt);
  });

  useEffect(() => {
    if (!selectedPlanet) {
      targetPos.current.set(0, 8, 18);
      targetLookAt.current.set(0, 0, 0);
    } else {
      const planet = planets.find((p) => p.name === selectedPlanet);
      if (planet) {
        // Position camera closer to orbit radius of selected planet
        const angle = Math.PI / 4;
        targetPos.current.set(
          Math.cos(angle) * (planet.orbitRadius + 3),
          4,
          Math.sin(angle) * (planet.orbitRadius + 3)
        );
        targetLookAt.current.set(
          Math.cos(angle) * planet.orbitRadius,
          0,
          Math.sin(angle) * planet.orbitRadius
        );
      }
    }
  }, [selectedPlanet, planets]);

  return null;
}

/* ─── Scene ─── */
function SolarSystemScene({ selectedPlanet, onSelectPlanet }: { selectedPlanet: string | null; onSelectPlanet: (name: string | null) => void }) {
  const mousePos = useMousePosition();

  return (
    <>
      <ambientLight intensity={0.1} />
      <directionalLight position={[10, 10, 5]} intensity={0.3} />
      <StarField />
      <CentralStar />
      <CameraController selectedPlanet={selectedPlanet} planets={PLANETS} />

      {PLANETS.map((p, i) => (
        <RealisticPlanet
          key={p.name}
          planet={p}
          index={i}
          total={PLANETS.length}
          mousePos={mousePos}
          onSelect={onSelectPlanet}
          isSelected={selectedPlanet === p.name}
        />
      ))}

      {PLANETS.map((p) => (
        <OrbitRing key={`orbit-${p.name}`} radius={p.orbitRadius} color={p.color} />
      ))}
    </>
  );
}

/* ─── Analytics overlay ─── */
function AnalyticsOverlay({ planet, onClose }: { planet: string; onClose: () => void }) {
  const data = ANALYTICS[planet];
  const planetData = PLANETS.find((p) => p.name === planet);
  if (!data || !planetData) return null;

  return (
    <div className="absolute inset-0 pointer-events-none flex items-center justify-end p-8 z-20">
      <div
        className="pointer-events-auto glass rounded-2xl p-6 max-w-sm w-full border border-border/40 animate-fade-in"
        style={{ borderColor: `${planetData.color}30` }}
      >
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-4 h-4 rounded-full" style={{ backgroundColor: planetData.color, boxShadow: `0 0 12px ${planetData.color}` }} />
            <h3 className="text-lg font-bold text-foreground">{planet}</h3>
          </div>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground text-sm">✕</button>
        </div>

        <p className="text-sm text-muted-foreground mb-4">{planetData.description}</p>

        <div className="grid grid-cols-2 gap-3 mb-4">
          {[
            { label: "Developers", value: data.developers },
            { label: "Growth", value: data.growth },
            { label: "Avg Salary", value: data.avgSalary },
            { label: "Top Region", value: data.topRegion },
          ].map((stat) => (
            <div key={stat.label} className="rounded-lg p-2" style={{ backgroundColor: `${planetData.color}10` }}>
              <div className="text-xs text-muted-foreground">{stat.label}</div>
              <div className="text-sm font-bold text-foreground">{stat.value}</div>
            </div>
          ))}
        </div>

        <div>
          <div className="text-xs text-muted-foreground mb-2">Ecosystem Tools</div>
          <div className="flex flex-wrap gap-1.5">
            {planetData.moons.map((moon) => (
              <span
                key={moon.name}
                className="text-xs px-2 py-0.5 rounded-full font-medium"
                style={{ backgroundColor: `${moon.color}20`, color: moon.color }}
              >
                {moon.name}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── Legend ─── */
function PlanetLegend({ selectedPlanet, onSelect }: { selectedPlanet: string | null; onSelect: (name: string | null) => void }) {
  return (
    <div className="absolute bottom-4 left-4 z-20 flex flex-wrap gap-2 max-w-md">
      {PLANETS.map((p) => (
        <button
          key={p.name}
          onClick={() => onSelect(selectedPlanet === p.name ? null : p.name)}
          className="flex items-center gap-1.5 text-xs px-2.5 py-1.5 rounded-full glass glass-hover transition-all cursor-pointer"
          style={{
            borderColor: selectedPlanet === p.name ? p.color : undefined,
            borderWidth: selectedPlanet === p.name ? 1 : undefined,
          }}
        >
          <div className="w-2 h-2 rounded-full" style={{ backgroundColor: p.color, boxShadow: `0 0 6px ${p.color}` }} />
          <span className="text-foreground/80">{p.name.split(" ")[0]}</span>
        </button>
      ))}
    </div>
  );
}

/* ─── Export ─── */
export default function TechSolarSystem() {
  const [selectedPlanet, setSelectedPlanet] = useState<string | null>(null);

  return (
    <SolarSystemErrorBoundary
      fallback={
        <div className="w-full h-full flex items-center justify-center">
          <div className="text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-primary/10 flex items-center justify-center">
              <div className="w-8 h-8 rounded-full bg-primary/30 animate-pulse" />
            </div>
            <p className="text-sm text-muted-foreground">Loading solar system...</p>
          </div>
        </div>
      }
    >
      <div className="w-full h-full relative">
        <Canvas
          camera={{ position: [0, 8, 18], fov: 55 }}
          gl={{ antialias: true, alpha: true }}
          style={{ background: "transparent" }}
        >
          <SolarSystemScene selectedPlanet={selectedPlanet} onSelectPlanet={setSelectedPlanet} />
        </Canvas>

        <PlanetLegend selectedPlanet={selectedPlanet} onSelect={setSelectedPlanet} />

        {selectedPlanet && (
          <AnalyticsOverlay planet={selectedPlanet} onClose={() => setSelectedPlanet(null)} />
        )}
      </div>
    </SolarSystemErrorBoundary>
  );
}
