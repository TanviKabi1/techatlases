import React from "react";
import { useTheme } from "@/contexts/ThemeContext";
import { THEMES } from "@/lib/themes";
import { motion, AnimatePresence } from "framer-motion";
import { Palette, Check, Sparkles } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";

const ThemeSelector = () => {
  const { theme, setTheme } = useTheme();
  if (!theme || !theme.colors) return null;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative hover:bg-primary/10 transition-colors">
          <Palette className="h-5 w-5" />
          <span className="sr-only">Toggle theme</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-80 glass border-primary/20 backdrop-blur-xl" align="end">
        <DropdownMenuLabel className="flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-primary" />
          Appearance & Themes
        </DropdownMenuLabel>
        <DropdownMenuSeparator className="bg-primary/10" />
        <ScrollArea className="h-[400px] pr-4">
          <div className="p-2">
            <DropdownMenuGroup>
              <div className="mb-4">
                <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground/80 mb-2 px-2">Modern Collections</p>
                <div className="grid grid-cols-1 gap-2">
                  {THEMES.filter(t => t.category === "Modern").map((t) => (
                    <DropdownMenuItem
                      key={t.id}
                      onClick={() => setTheme(t.id)}
                      className={`flex flex-col items-start p-3 cursor-pointer rounded-xl transition-all border ${
                        theme.id === t.id 
                          ? "bg-primary/20 border-primary/40 shadow-sm" 
                          : "hover:bg-muted/50 border-transparent hover:border-primary/10"
                      }`}
                    >
                      <div className="flex items-center justify-between w-full mb-2">
                        <span className="font-bold text-sm text-foreground">{t.name}</span>
                        {theme.id === t.id && <Check className="h-4 w-4 text-primary" />}
                      </div>
                      <div className="flex gap-1 w-full h-2 rounded-full overflow-hidden bg-muted/20">
                        <div className="flex-1" style={{ backgroundColor: `hsl(${t.colors.primary})` }} />
                        <div className="flex-1" style={{ backgroundColor: `hsl(${t.colors.secondary})` }} />
                        <div className="flex-1" style={{ backgroundColor: `hsl(${t.colors.accent})` }} />
                      </div>
                    </DropdownMenuItem>
                  ))}
                </div>
              </div>

              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground/80 mb-2 px-2">Pastel Collection</p>
                <div className="grid grid-cols-1 gap-2">
                  {THEMES.filter(t => t.category === "Pastel").map((t) => (
                    <DropdownMenuItem
                      key={t.id}
                      onClick={() => setTheme(t.id)}
                      className={`flex flex-col items-start p-3 cursor-pointer rounded-xl transition-all border ${
                        theme.id === t.id 
                          ? "bg-primary/20 border-primary/40 shadow-sm" 
                          : "hover:bg-muted/50 border-transparent hover:border-primary/10"
                      }`}
                    >
                      <div className="flex items-center justify-between w-full mb-2">
                        <span className="font-bold text-sm text-foreground">{t.name}</span>
                        {theme.id === t.id && <Check className="h-4 w-4 text-primary" />}
                      </div>
                      <div className="flex gap-1 w-full h-2 rounded-full overflow-hidden bg-muted/20">
                        <div className="flex-1" style={{ backgroundColor: `hsl(${t.colors.primary})` }} />
                        <div className="flex-1" style={{ backgroundColor: `hsl(${t.colors.secondary})` }} />
                        <div className="flex-1" style={{ backgroundColor: `hsl(${t.colors.accent})` }} />
                      </div>
                    </DropdownMenuItem>
                  ))}
                </div>
              </div>
            </DropdownMenuGroup>
          </div>
        </ScrollArea>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default ThemeSelector;
