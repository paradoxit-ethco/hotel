import { useAuth } from "@/_core/hooks/useAuth";
import { useLanguage } from "@/contexts/LanguageContext";
import { useIsMobile } from "@/hooks/useMobile";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader, SidebarInset, SidebarMenu, SidebarMenuButton, SidebarMenuItem, SidebarProvider, SidebarTrigger, useSidebar } from "@/components/ui/sidebar";
import { startLogin } from "@/const";
import { BedDouble, CalendarDays, Code2, Compass, LayoutDashboard, LogOut, PanelLeft, PencilLine, type LucideIcon } from "lucide-react";
import { type CSSProperties, useEffect, useRef, useState } from "react";
import { useLocation } from "wouter";
import { DashboardLayoutSkeleton } from "./DashboardLayoutSkeleton";

type MenuItem = { icon: LucideIcon; label: string; path: string };
const SIDEBAR_WIDTH_KEY = "sidebar-width";
const DEFAULT_WIDTH = 280;
const MIN_WIDTH = 200;
const MAX_WIDTH = 480;

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [sidebarWidth, setSidebarWidth] = useState(() => Number(localStorage.getItem(SIDEBAR_WIDTH_KEY)) || DEFAULT_WIDTH);
  const { loading, user } = useAuth();
  const { language } = useLanguage();
  useEffect(() => { localStorage.setItem(SIDEBAR_WIDTH_KEY, String(sidebarWidth)); }, [sidebarWidth]);
  if (loading) return <DashboardLayoutSkeleton />;
  if (!user) return <div className="grid min-h-screen place-items-center bg-background p-6"><div className="max-w-md rounded-3xl border border-foreground/10 bg-card p-8 text-center shadow-xl"><p className="section-kicker">Habesha Haven</p><h1 className="mt-3 font-serif text-3xl">{language === "en" ? "Sign in to continue" : "ለመቀጠል ይግቡ"}</h1><p className="mt-3 text-sm text-muted-foreground">{language === "en" ? "Your hotel workspace is protected." : "የሆቴል የሥራ ቦታዎ የተጠበቀ ነው።"}</p><Button onClick={startLogin} size="lg" className="mt-6 w-full bg-coffee text-white hover:bg-coffee-light">{language === "en" ? "Sign in securely" : "በደህና ይግቡ"}</Button></div></div>;
  return <SidebarProvider style={{ "--sidebar-width": `${sidebarWidth}px` } as CSSProperties}><DashboardLayoutContent setSidebarWidth={setSidebarWidth}>{children}</DashboardLayoutContent></SidebarProvider>;
}

function getMenu(role: string, language: "en" | "am"): MenuItem[] {
  if (role === "admin") return [
    { icon: LayoutDashboard, label: language === "en" ? "Hotel overview" : "የሆቴል አጠቃላይ", path: "/admin" },
    { icon: BedDouble, label: language === "en" ? "Room management" : "የክፍል አስተዳደር", path: "/admin" },
    { icon: PencilLine, label: language === "en" ? "Content management" : "የይዘት አስተዳደር", path: "/admin/content" },
  ];
  if (role === "developer") return [
    { icon: LayoutDashboard, label: language === "en" ? "Developer workspace" : "የገንቢ የሥራ ቦታ", path: "/developer/dashboard" },
    { icon: Code2, label: language === "en" ? "Developer profile" : "የገንቢ መገለጫ", path: "/developer" },
    { icon: Compass, label: language === "en" ? "Public experience" : "የሕዝብ ተሞክሮ", path: "/" },
  ];
  return [
    { icon: LayoutDashboard, label: language === "en" ? "My stay" : "ቆይታዬ", path: "/dashboard" },
    { icon: CalendarDays, label: language === "en" ? "Reserve a stay" : "ቆይታ ያስይዙ", path: "/reserve" },
    { icon: Compass, label: language === "en" ? "Discover rooms" : "ክፍሎችን ያግኙ", path: "/rooms" },
  ];
}

function DashboardLayoutContent({ children, setSidebarWidth }: { children: React.ReactNode; setSidebarWidth: (width: number) => void }) {
  const { user, logout } = useAuth();
  const { language } = useLanguage();
  const [location, setLocation] = useLocation();
  const { state, toggleSidebar } = useSidebar();
  const isCollapsed = state === "collapsed";
  const [isResizing, setIsResizing] = useState(false);
  const sidebarRef = useRef<HTMLDivElement>(null);
  const isMobile = useIsMobile();
  const menuItems = getMenu(user?.role ?? "guest", language);
  const activeMenuItem = menuItems.find((item) => item.path === location);
  useEffect(() => { if (isCollapsed) setIsResizing(false); }, [isCollapsed]);
  useEffect(() => {
    const handleMouseMove = (event: MouseEvent) => {
      if (!isResizing) return;
      const sidebarLeft = sidebarRef.current?.getBoundingClientRect().left ?? 0;
      const nextWidth = event.clientX - sidebarLeft;
      if (nextWidth >= MIN_WIDTH && nextWidth <= MAX_WIDTH) setSidebarWidth(nextWidth);
    };
    const handleMouseUp = () => setIsResizing(false);
    if (isResizing) { document.addEventListener("mousemove", handleMouseMove); document.addEventListener("mouseup", handleMouseUp); document.body.style.cursor = "col-resize"; document.body.style.userSelect = "none"; }
    return () => { document.removeEventListener("mousemove", handleMouseMove); document.removeEventListener("mouseup", handleMouseUp); document.body.style.cursor = ""; document.body.style.userSelect = ""; };
  }, [isResizing, setSidebarWidth]);
  return <><div className="relative" ref={sidebarRef}><Sidebar collapsible="icon" className="border-r border-sidebar-border" disableTransition={isResizing}><SidebarHeader className="h-20 justify-center"><div className="flex items-center gap-3 px-3"><button onClick={toggleSidebar} className="grid size-9 place-items-center rounded-xl hover:bg-sidebar-accent focus-visible:ring-2 focus-visible:ring-gold" aria-label="Toggle navigation"><PanelLeft className="size-4" /></button>{!isCollapsed && <div className="min-w-0"><p className="font-serif text-lg leading-none">Habesha Haven</p><p className="mt-1 text-[9px] font-bold uppercase tracking-[0.22em] text-gold">{user?.role}</p></div>}</div></SidebarHeader><SidebarContent><SidebarMenu className="px-2 py-2">{menuItems.map((item, index) => { const isActive = location === item.path && (index === 0 || roleIsNotAdminRepeating(item.path, menuItems, index)); return <SidebarMenuItem key={`${item.path}-${item.label}`}><SidebarMenuButton isActive={isActive} onClick={() => setLocation(item.path)} tooltip={item.label} className="h-11 rounded-xl"><item.icon className={`size-4 ${isActive ? "text-gold" : ""}`} /><span>{item.label}</span></SidebarMenuButton></SidebarMenuItem>; })}</SidebarMenu></SidebarContent><SidebarFooter className="p-3"><DropdownMenu><DropdownMenuTrigger asChild><button className="flex w-full items-center gap-3 rounded-xl p-2 text-left hover:bg-sidebar-accent focus-visible:ring-2 focus-visible:ring-gold"><Avatar className="size-9 border border-sidebar-border"><AvatarFallback className="bg-gold/15 text-xs font-bold text-coffee dark:text-gold">{user?.name?.charAt(0).toUpperCase() ?? "H"}</AvatarFallback></Avatar><div className="min-w-0 flex-1 group-data-[collapsible=icon]:hidden"><p className="truncate text-sm font-semibold">{user?.name || "Guest"}</p><p className="truncate text-xs text-muted-foreground">{user?.email || ""}</p></div></button></DropdownMenuTrigger><DropdownMenuContent align="end" className="w-48"><DropdownMenuItem onClick={logout} className="cursor-pointer text-destructive focus:text-destructive"><LogOut className="mr-2 size-4" /><span>{language === "en" ? "Sign out" : "ይውጡ"}</span></DropdownMenuItem></DropdownMenuContent></DropdownMenu></SidebarFooter></Sidebar><div className={`absolute right-0 top-0 h-full w-1 cursor-col-resize transition-colors hover:bg-gold/30 ${isCollapsed ? "hidden" : ""}`} onMouseDown={() => !isCollapsed && setIsResizing(true)} style={{ zIndex: 50 }} /></div><SidebarInset>{isMobile && <div className="sticky top-0 z-40 flex h-14 items-center gap-2 border-b bg-background/95 px-3 backdrop-blur"><SidebarTrigger className="rounded-lg" /><span className="text-sm font-medium">{activeMenuItem?.label ?? (language === "en" ? "Menu" : "ምናሌ")}</span></div>}<main className="flex-1 p-4">{children}</main></SidebarInset></>;
}

function roleIsNotAdminRepeating(path: string, items: MenuItem[], index: number) { return items.findIndex((item) => item.path === path) === index; }
