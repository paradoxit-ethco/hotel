import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import AdminDashboard from "@/pages/AdminDashboard";
import AdminContent from "@/pages/AdminContent";
import AdminGuests from "@/pages/AdminGuests";
import Dashboard from "@/pages/Dashboard";
import Developer from "@/pages/Developer";
import DeveloperDashboard from "@/pages/DeveloperDashboard";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import Home from "./pages/Home";
import Reserve from "./pages/Reserve";
import RoomDetail from "@/pages/RoomDetail";
import Rooms from "./pages/Rooms";
import { LanguageProvider } from "./contexts/LanguageContext";

function Router() {
  // make sure to consider if you need authentication for certain routes
  return (
    <Switch>
      <Route path={"/"} component={Home} />
      <Route path={"/rooms"} component={Rooms} />
      <Route path={"/rooms/:id"} component={RoomDetail} />
      <Route path={"/reserve"} component={Reserve} />
      <Route path={"/dashboard"} component={Dashboard} />
      <Route path={"/admin"} component={AdminDashboard} />
      <Route path={"/admin/content"} component={AdminContent} />
      <Route path={"/admin/guests"} component={AdminGuests} />
      <Route path={"/developer"} component={Developer} />
      <Route path={"/developer/dashboard"} component={DeveloperDashboard} />
      <Route path={"/404"} component={NotFound} />
      {/* Final fallback route */}
      <Route component={NotFound} />
    </Switch>
  );
}

// NOTE: About Theme
// - First choose a default theme according to your design style (dark or light bg), than change color palette in index.css
//   to keep consistent foreground/background color across components
// - If you want to make theme switchable, pass `switchable` ThemeProvider and use `useTheme` hook

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider
        defaultTheme="light"
        switchable
      >
        <LanguageProvider>
          <TooltipProvider>
            <Toaster />
            <Router />
          </TooltipProvider>
        </LanguageProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
