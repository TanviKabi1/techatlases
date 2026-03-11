// @ts-nocheck
import { useRef, useMemo, useState, Component, ReactNode } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import * as THREE from "three";

// Error boundary to prevent 3D crashes from breaking the page
class Galaxy3DErrorBoundary extends Component<{children: ReactNode;fallback?: ReactNode;}, {hasError: boolean;}> {
  state = { hasError: false };
  static getDerivedStateFromError() {return { hasError: true };}
  render() {
    if (this.state.hasError) return this.props.fallback || null;
    return this.props.children;
  }
}

interface TechPlanet {
  name: string;
  color: string;
  size: number;
  orbitRadius: number;
  speed: number;
  description: string;
  category: string;
}

const TECH_PLANETS: TechPlanet[] = [
{ name: "Python", color: "#3b82f6", size: 0.45, orbitRadius: 3.5, speed: 0.15, description: "General-purpose language powering AI & data science", category: "Language" },
{ name: "JavaScript", color: "#eab308", size: 0.5, orbitRadius: 4.5, speed: 0.12, description: "The language of the web ecosystem", category: "Language" },
{ name: "React", color: "#06b6d4", size: 0.35, orbitRadius: 5.2, speed: 0.18, description: "Component-based UI library", category: "Framework" },
{ name: "TensorFlow", color: "#f97316", size: 0.3, orbitRadius: 3.8, speed: 0.1, description: "Machine learning framework", category: "AI/ML" },
{ name: "Node.js", color: "#22c55e", size: 0.35, orbitRadius: 5.8, speed: 0.14, description: "Server-side JavaScript runtime", category: "Runtime" },
{ name: "TypeScript", color: "#3b82f6", size: 0.38, orbitRadius: 6.5, speed: 0.09, description: "Typed superset of JavaScript", category: "Language" },
{ name: "Docker", color: "#06b6d4", size: 0.3, orbitRadius: 7.2, speed: 0.07, description: "Containerization platform", category: "Cloud" },
{ name: "Rust", color: "#ef4444", size: 0.28, orbitRadius: 8, speed: 0.06, description: "Systems programming language", category: "Language" },
{ name: "Go", color: "#06b6d4", size: 0.3, orbitRadius: 6.8, speed: 0.11, description: "Cloud infrastructure language", category: "Language" },
{ name: "AWS", color: "#f97316", size: 0.4, orbitRadius: 7.5, speed: 0.05, description: "Leading cloud platform", category: "Cloud" },
{ name: "PyTorch", color: "#ef4444", size: 0.32, orbitRadius: 4.0, speed: 0.13, description: "Deep learning framework", category: "AI/ML" },
{ name: "Kubernetes", color: "#8b5cf6", size: 0.33, orbitRadius: 7.8, speed: 0.08, description: "Container orchestration", category: "Cloud" }];


const AI_TOOLS = [
{ name: "ChatGPT", color: "#10b981", size: 0.35, orbitRadius: 2.5, speed: 0.2 },
{ name: "Copilot", color: "#8b5cf6", size: 0.3, orbitRadius: 3.2, speed: 0.16 },
{ name: "Claude", color: "#f59e0b", size: 0.28, orbitRadius: 3.8, speed: 0.14 },
{ name: "Gemini", color: "#3b82f6", size: 0.32, orbitRadius: 4.2, speed: 0.12 }];


function Planet({ planet, index, total }: {planet: TechPlanet;index: number;total: number;}) {
  const meshRef = useRef<THREE.Mesh>(null);
  const offset = index * Math.PI * 2 / total;

  useFrame(({ clock }) => {
    if (!meshRef.current) return;
    const t = clock.getElapsedTime() * planet.speed + offset;
    meshRef.current.position.x = Math.cos(t) * planet.orbitRadius;
    meshRef.current.position.z = Math.sin(t) * planet.orbitRadius;
    meshRef.current.position.y = Math.sin(t * 0.5) * 0.5;
  });

  return (
    <mesh ref={meshRef}>
      <sphereGeometry args={[planet.size, 24, 24]} />
      <meshStandardMaterial
        color={planet.color}
        emissive={planet.color}
        emissiveIntensity={0.5}
        roughness={0.3}
        metalness={0.7} />
      
      <pointLight color={planet.color} intensity={0.5} distance={4} />
    </mesh>);

}

function OrbitRing({ radius }: {radius: number;}) {
  const lineRef = useRef<THREE.Line>(null);
  const geometry = useMemo(() => {
    const pts: THREE.Vector3[] = [];
    for (let i = 0; i <= 128; i++) {
      const angle = i / 128 * Math.PI * 2;
      pts.push(new THREE.Vector3(Math.cos(angle) * radius, 0, Math.sin(angle) * radius));
    }
    return new THREE.BufferGeometry().setFromPoints(pts);
  }, [radius]);

  const material = useMemo(() => new THREE.LineBasicMaterial({ color: "#3b82f6", transparent: true, opacity: 0.08 }), []);

  return <primitive ref={lineRef} object={new THREE.Line(geometry, material)} />;
}

function CentralCore() {
  const meshRef = useRef<THREE.Mesh>(null);
  useFrame(({ clock }) => {
    if (meshRef.current) meshRef.current.rotation.y = clock.getElapsedTime() * 0.2;
  });
  return (
    <group>
      <mesh ref={meshRef}>
        <icosahedronGeometry args={[1, 2]} />
        <meshStandardMaterial color="#3b82f6" emissive="#3b82f6" emissiveIntensity={0.6} wireframe transparent opacity={0.6} />
      </mesh>
      <mesh>
        <sphereGeometry args={[0.6, 32, 32]} />
        <meshStandardMaterial color="#8b5cf6" emissive="#8b5cf6" emissiveIntensity={0.8} transparent opacity={0.4} />
      </mesh>
      <pointLight color="#3b82f6" intensity={5} distance={20} />
      <pointLight color="#8b5cf6" intensity={3} distance={15} />
    </group>);

}

function AINode({ tool, index, total }: {tool: typeof AI_TOOLS[0];index: number;total: number;}) {
  const ref = useRef<THREE.Mesh>(null);
  const offset = index * Math.PI * 2 / total;

  useFrame(({ clock }) => {
    if (!ref.current) return;
    const t = clock.getElapsedTime() * tool.speed + offset;
    ref.current.position.x = Math.cos(t) * tool.orbitRadius;
    ref.current.position.z = Math.sin(t) * tool.orbitRadius;
    ref.current.position.y = Math.cos(t * 0.7) * 0.3;
    const scale = 1 + Math.sin(clock.getElapsedTime() * 2 + index) * 0.1;
    ref.current.scale.setScalar(scale);
  });

  return (
    <mesh ref={ref}>
      <dodecahedronGeometry args={[tool.size, 0]} />
      <meshStandardMaterial color={tool.color} emissive={tool.color} emissiveIntensity={0.8} roughness={0.2} metalness={0.8} />
      <pointLight color={tool.color} intensity={1} distance={4} />
    </mesh>);

}

function StarField() {
  const starsRef = useRef<THREE.Points>(null);
  const [positions] = useState(() => {
    const pos = new Float32Array(3000 * 3);
    for (let i = 0; i < 3000; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 200;
      pos[i * 3 + 1] = (Math.random() - 0.5) * 200;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 200;
    }
    return pos;
  });

  useFrame(({ clock }) => {
    if (starsRef.current) starsRef.current.rotation.y = clock.getElapsedTime() * 0.01;
  });

  return (
    <points ref={starsRef}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial color="#ffffff" size={0.3} transparent opacity={0.6} sizeAttenuation />
    </points>);

}

function GalaxyScene({ mode }: {mode: "tech" | "ai";}) {
  return (
    <>
      <ambientLight intensity={0.15} />
      <StarField />
      <CentralCore />
      {mode === "tech" ?
      <>
          {TECH_PLANETS.map((p, i) =>
        <Planet key={p.name} planet={p} index={i} total={TECH_PLANETS.length} />
        )}
          {[3.5, 4.5, 5.2, 5.8, 6.5, 7.2, 7.5, 8].map((r) =>
        <OrbitRing key={r} radius={r} />
        )}
        </> :

      <>
          {AI_TOOLS.map((t, i) =>
        <AINode key={t.name} tool={t} index={i} total={AI_TOOLS.length} />
        )}
          {[2.5, 3.2, 3.8, 4.2].map((r) =>
        <OrbitRing key={r} radius={r} />
        )}
        </>
      }
    </>);

}

export default function TechGalaxy3D({ mode = "tech" }: {mode?: "tech" | "ai";}) {
  return (
    <Galaxy3DErrorBoundary fallback={
    <div className="w-full h-full flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-primary/10 flex items-center justify-center">
            <div className="w-8 h-8 rounded-full bg-primary/30 animate-pulse" />
          </div>
          <p className="text-sm text-muted-foreground">Loading galaxy...</p>
        </div>
      </div>
    }>
      <div className="w-full h-full absolute inset-0 overflow-hidden">
        <video
          autoPlay
          loop
          muted
          playsInline
          className="w-full h-full object-cover opacity-40"
          style={{ filter: "hue-rotate(200deg) saturate(1.4) brightness(0.5)" }}
        >
          <source src="https://cdn.pixabay.com/video/2020/08/09/46906-449149364_large.mp4" type="video/mp4" />
        </video>
        {/* Gradient overlay for blending */}
        <div className="absolute inset-0 bg-gradient-to-b from-background/70 via-background/30 to-background/70 pointer-events-none" />
      </div>
    </Galaxy3DErrorBoundary>
  );

}