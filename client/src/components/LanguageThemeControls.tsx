import { Moon, Sun } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useTheme } from "@/contexts/ThemeContext";
import { Button } from "@/components/ui/button";

export function LanguageThemeControls({ compact = false }: { compact?: boolean }) {
  const { language, setLanguage } = useLanguage();
  const { theme, toggleTheme } = useTheme();
  return (
    <div className="flex items-center gap-1.5">
      <Button variant="ghost" size="icon" onClick={toggleTheme} aria-label="Toggle theme" className="rounded-full text-foreground hover:bg-foreground/8">
        {theme === "dark" ? <Sun className="size-4" /> : <Moon className="size-4" />}
      </Button>
      <button onClick={() => setLanguage(language === "en" ? "am" : "en")} className="min-w-11 rounded-full border border-foreground/12 bg-background/50 px-2.5 py-1.5 text-xs font-semibold tracking-wide transition hover:border-gold/50 hover:text-gold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold">
        {compact ? (language === "en" ? "አማ" : "EN") : (language === "en" ? "አማ" : "EN")}
      </button>
    </div>
  );
}
