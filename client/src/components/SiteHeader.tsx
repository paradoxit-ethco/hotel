import { Menu, X } from "lucide-react";
import { useState } from "react";
import { Link, useLocation } from "wouter";
import { startLogin } from "@/const";
import { useAuth } from "@/_core/hooks/useAuth";
import { content, useLanguage } from "@/contexts/LanguageContext";
import { LanguageThemeControls } from "./LanguageThemeControls";

export function SiteHeader({ overlay = false }: { overlay?: boolean }) {
  const [open, setOpen] = useState(false);
  const [, setLocation] = useLocation();
  const { t } = useLanguage();
  const { user } = useAuth();
  const nav = [
    ["/", t(content.nav.home)],
    ["/rooms", t(content.nav.rooms)],
    ["/developer", t(content.nav.developer)],
  ] as const;
  const goDashboard = () => {
    if (!user) { startLogin(); return; }
    setLocation(user.role === "admin" ? "/admin" : user.role === "developer" ? "/developer/dashboard" : "/dashboard");
  };
  return (
    <header className={`relative z-30 ${overlay ? "text-white" : "border-b border-foreground/8 bg-background/90 backdrop-blur-xl"}`}>
      <div className="container flex h-20 items-center justify-between gap-6">
        <Link href="/" className="group flex items-center gap-3" aria-label="Habesha Haven home">
          <span className="relative grid size-10 place-items-center rounded-2xl bg-coffee text-gold shadow-lg shadow-coffee/25"><span className="font-serif text-xl leading-none">ሀ</span></span>
          <span className="hidden sm:block"><strong className="block font-serif text-lg leading-none tracking-tight">Habesha Haven</strong><small className="mt-1 block text-[10px] font-semibold uppercase tracking-[0.28em] opacity-65">Hotel collective</small></span>
        </Link>
        <nav className="hidden items-center gap-7 lg:flex" aria-label="Primary navigation">
          {nav.map(([href, label]) => <Link key={href} href={href} className="text-sm font-medium opacity-80 transition hover:text-gold hover:opacity-100">{label}</Link>)}
        </nav>
        <div className="hidden items-center gap-3 lg:flex">
          <LanguageThemeControls />
          <button onClick={goDashboard} className="rounded-full bg-gold px-5 py-2.5 text-sm font-bold text-coffee shadow-lg shadow-gold/15 transition hover:-translate-y-0.5 hover:bg-gold-light active:translate-y-0">{user ? t(content.nav.dashboard) : t(content.common.signIn)}</button>
        </div>
        <div className="flex items-center gap-2 lg:hidden"><LanguageThemeControls compact /><button onClick={() => setOpen(!open)} className="grid size-10 place-items-center rounded-full border border-foreground/15" aria-label="Open menu">{open ? <X className="size-5" /> : <Menu className="size-5" />}</button></div>
      </div>
      {open && <div className="absolute left-0 right-0 top-full border-b border-foreground/10 bg-background p-5 shadow-2xl lg:hidden"><nav className="mx-auto flex max-w-xl flex-col gap-2">{nav.map(([href, label]) => <Link key={href} href={href} onClick={() => setOpen(false)} className="rounded-xl px-4 py-3 text-base font-semibold hover:bg-accent">{label}</Link>)}<button onClick={goDashboard} className="mt-3 rounded-xl bg-gold px-4 py-3 text-left font-bold text-coffee">{user ? t(content.nav.dashboard) : t(content.common.signIn)}</button></nav></div>}
    </header>
  );
}
