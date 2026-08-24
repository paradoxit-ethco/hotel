import { useAuth } from "@/_core/hooks/useAuth";
import DashboardLayout from "@/components/DashboardLayout";
import { Link } from "wouter";
import { startLogin } from "@/const";

type Role = "user" | "guest" | "admin" | "developer";

export function HotelDashboardLayout({ children, allowedRoles }: { children: React.ReactNode; allowedRoles: Role[] }) {
  const { loading, user } = useAuth();
  if (loading) return <div className="grid min-h-screen place-items-center bg-background"><span className="text-sm text-muted-foreground">Preparing your stay…</span></div>;
  if (!user) return <div className="grid min-h-screen place-items-center bg-background p-6"><div className="max-w-md rounded-3xl border border-foreground/10 bg-card p-8 text-center shadow-xl"><p className="mb-2 text-xs font-bold uppercase tracking-[0.2em] text-gold">Habesha Haven</p><h1 className="font-serif text-3xl">Sign in to continue</h1><p className="mt-3 text-sm text-muted-foreground">Your reservations and hotel operations are protected.</p><button onClick={startLogin} className="mt-6 rounded-full bg-gold px-6 py-3 font-bold text-coffee">Sign in securely</button></div></div>;
  if (!allowedRoles.includes(user.role as Role)) return <div className="grid min-h-screen place-items-center bg-background p-6"><div className="max-w-md rounded-3xl border border-foreground/10 bg-card p-8 text-center shadow-xl"><p className="text-xs font-bold uppercase tracking-[0.2em] text-gold">Protected workspace</p><h1 className="mt-3 font-serif text-3xl">This workspace is not assigned to your account.</h1><p className="mt-3 text-sm text-muted-foreground">Please use the dashboard associated with your role, or contact your hotel administrator.</p><Link href="/" className="mt-6 inline-flex rounded-full bg-coffee px-6 py-3 font-bold text-white">Return to discovery</Link></div></div>;
  return <DashboardLayout>{children}</DashboardLayout>;
}
