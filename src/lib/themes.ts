export interface Theme {
  id: string;
  name: string;
  category: "Modern" | "Pastel";
  colors: {
    background: string;
    foreground: string;
    card: string;
    cardForeground: string;
    primary: string;
    primaryForeground: string;
    secondary: string;
    secondaryForeground: string;
    accent: string;
    accentForeground: string;
    border: string;
    muted: string;
    mutedForeground: string;
    ring: string;
    gradient: string;
    glow: string;
  };
  isDark: boolean;
}

export const THEMES: Theme[] = [
  {
    id: "cyber-neon",
    name: "Aurora Fusion",
    category: "Modern",
    isDark: true,
    colors: {
      background: "230 25% 7%",
      foreground: "210 40% 95%",
      card: "230 20% 10%",
      cardForeground: "210 40% 95%",
      primary: "280 80% 60%", // Purple
      primaryForeground: "210 40% 98%",
      secondary: "320 80% 60%", // Pink
      secondaryForeground: "210 40% 98%",
      accent: "185 80% 50%", // Teal/Cyan
      accentForeground: "230 25% 7%",
      border: "230 15% 20%",
      muted: "230 15% 18%",
      mutedForeground: "215 20% 55%",
      ring: "280 80% 60%",
      gradient: "linear-gradient(135deg, hsl(280 80% 60% / 0.15), hsl(320 80% 60% / 0.15), hsl(185 80% 50% / 0.15))",
      glow: "hsl(280 80% 60% / 0.5)",
    },
  },
  {
    id: "solar-flare",
    name: "Solar Flare",
    category: "Modern",
    isDark: true,
    colors: {
      background: "20 15% 5%",
      foreground: "40 40% 95%",
      card: "20 15% 8%",
      cardForeground: "40 40% 95%",
      primary: "15 90% 55%", // Crimson
      primaryForeground: "40 40% 98%",
      secondary: "35 90% 60%", // Gold
      secondaryForeground: "20 15% 5%",
      accent: "5 90% 60%", // Orange-Red
      accentForeground: "40 40% 98%",
      border: "20 15% 15%",
      muted: "20 15% 12%",
      mutedForeground: "30 20% 55%",
      ring: "15 90% 55%",
      gradient: "linear-gradient(135deg, hsl(15 90% 55% / 0.15), hsl(35 90% 60% / 0.15), hsl(5 90% 60% / 0.15))",
      glow: "hsl(15 90% 55% / 0.5)",
    },
  },
  {
    id: "ocean-pulse",
    name: "Ocean Pulse",
    category: "Modern",
    isDark: true,
    colors: {
      background: "220 20% 7%",
      foreground: "190 40% 95%",
      card: "220 20% 10%",
      cardForeground: "190 40% 95%",
      primary: "210 100% 56%", // Blue
      primaryForeground: "220 20% 7%",
      secondary: "185 80% 50%", // Cyan/Aqua
      secondaryForeground: "220 20% 7%",
      accent: "200 80% 45%", // Slate/Deep Blue
      accentForeground: "190 40% 95%",
      border: "220 15% 20%",
      muted: "220 15% 18%",
      mutedForeground: "200 20% 55%",
      ring: "210 100% 56%",
      gradient: "linear-gradient(135deg, hsl(210 100% 56% / 0.15), hsl(185 80% 50% / 0.15), hsl(200 80% 45% / 0.15))",
      glow: "hsl(210 100% 56% / 0.5)",
    },
  },
  {
    id: "velvet-bloom",
    name: "Velvet Bloom",
    category: "Modern",
    isDark: true,
    colors: {
      background: "270 25% 6%",
      foreground: "280 40% 95%",
      card: "270 20% 9%",
      cardForeground: "280 40% 95%",
      primary: "290 70% 60%", // Lavender/Magenta
      primaryForeground: "270 25% 6%",
      secondary: "330 80% 65%", // Peach/Soft Pink
      secondaryForeground: "270 25% 6%",
      accent: "260 70% 50%", // Midnight Purple
      accentForeground: "280 40% 95%",
      border: "270 15% 15%",
      muted: "270 15% 12%",
      mutedForeground: "270 20% 55%",
      ring: "290 70% 60%",
      gradient: "linear-gradient(135deg, hsl(290 70% 60% / 0.15), hsl(330 80% 65% / 0.15), hsl(260 70% 50% / 0.15))",
      glow: "hsl(290 70% 60% / 0.5)",
    },
  },
  {
    id: "cotton-candy",
    name: "Cotton Candy Dream",
    category: "Pastel",
    isDark: false,
    colors: {
      background: "230 40% 98%",
      foreground: "230 40% 20%",
      card: "0 0% 100%",
      cardForeground: "230 40% 20%",
      primary: "330 80% 85%", // Blush Pink
      primaryForeground: "330 40% 20%",
      secondary: "200 80% 85%", // Baby Blue
      secondaryForeground: "200 40% 20%",
      accent: "260 80% 85%", // Lavender
      accentForeground: "260 40% 20%",
      border: "230 40% 85%",
      muted: "230 30% 94%",
      mutedForeground: "230 40% 35%",
      ring: "330 80% 85%",
      gradient: "linear-gradient(135deg, hsl(330 100% 85% / 0.6), hsl(200 100% 85% / 0.6), hsl(260 100% 85% / 0.6))",
      glow: "hsl(330 100% 85% / 0.8)",
    },
  },
  {
    id: "matcha-milk",
    name: "Matcha Milk",
    category: "Pastel",
    isDark: false,
    colors: {
      background: "60 40% 98%",
      foreground: "120 40% 15%",
      card: "0 0% 100%",
      cardForeground: "120 40% 15%",
      primary: "120 50% 80%", // Pastel Sage
      primaryForeground: "120 40% 20%",
      secondary: "45 80% 90%", // Cream/Beige
      secondaryForeground: "45 40% 20%",
      accent: "150 50% 80%", // Muted Mint
      accentForeground: "150 40% 20%",
      border: "120 30% 80%",
      muted: "120 20% 94%",
      mutedForeground: "120 40% 30%",
      ring: "120 50% 80%",
      gradient: "linear-gradient(135deg, hsl(120 40% 80% / 0.6), hsl(45 60% 90% / 0.6), hsl(150 40% 80% / 0.6))",
      glow: "hsl(120 40% 80% / 0.8)",
    },
  },
  {
    id: "peach-sorbet",
    name: "Peach Sorbet",
    category: "Pastel",
    isDark: false,
    colors: {
      background: "25 60% 98%",
      foreground: "25 50% 15%",
      card: "0 0% 100%",
      cardForeground: "25 50% 15%",
      primary: "25 100% 85%", // Pastel Peach
      primaryForeground: "25 50% 20%",
      secondary: "350 100% 85%", // Coral Pink
      secondaryForeground: "350 50% 20%",
      accent: "45 100% 85%", // Pale Yellow
      accentForeground: "45 50% 20%",
      border: "25 60% 85%",
      muted: "25 30% 94%",
      mutedForeground: "25 40% 30%",
      ring: "25 100% 85%",
      gradient: "linear-gradient(135deg, hsl(25 100% 85% / 0.6), hsl(350 100% 85% / 0.6), hsl(45 100% 85% / 0.6))",
      glow: "hsl(25 100% 85% / 0.8)",
    },
  },
  {
    id: "lilac-mist",
    name: "Lilac Mist",
    category: "Pastel",
    isDark: true,
    colors: {
      background: "260 25% 10%",
      foreground: "260 40% 95%",
      card: "260 20% 15%",
      cardForeground: "260 40% 95%",
      primary: "260 60% 80%", // Dusty Lavender
      primaryForeground: "260 20% 10%",
      secondary: "280 60% 80%", // Pastel Violet
      secondaryForeground: "260 20% 10%",
      accent: "240 20% 80%", // Pale Silver
      accentForeground: "260 20% 10%",
      border: "260 20% 25%",
      muted: "260 20% 20%",
      mutedForeground: "260 10% 60%",
      ring: "260 60% 80%",
      gradient: "linear-gradient(135deg, hsl(260 60% 80% / 0.15), hsl(280 60% 80% / 0.15), hsl(240 20% 80% / 0.15))",
      glow: "hsl(260 60% 80% / 0.5)",
    },
  },
  {
    id: "sky-bloom",
    name: "Sky Bloom",
    category: "Pastel",
    isDark: false,
    colors: {
      background: "210 60% 98%",
      foreground: "210 50% 15%",
      card: "0 0% 100%",
      cardForeground: "210 50% 15%",
      primary: "210 100% 90%", // Powder Blue
      primaryForeground: "210 50% 20%",
      secondary: "190 100% 90%", // Pastel Cyan
      secondaryForeground: "190 50% 20%",
      accent: "270 100% 90%", // Soft Lilac
      accentForeground: "270 50% 20%",
      border: "210 60% 85%",
      muted: "210 30% 94%",
      mutedForeground: "210 40% 35%",
      ring: "210 100% 90%",
      gradient: "linear-gradient(135deg, hsl(210 100% 90% / 0.6), hsl(190 100% 90% / 0.6), hsl(270 100% 90% / 0.6))",
      glow: "hsl(210 100% 90% / 0.8)",
    },
  },
];
