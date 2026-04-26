import { Link, NavLink } from "react-router-dom";
import { Shield, ScanLine, Home } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const Navbar = () => {
  const linkClass = ({ isActive }: { isActive: boolean }) =>
    cn(
      "flex items-center gap-2 px-3 py-2 rounded-md text-sm transition-smooth",
      isActive
        ? "bg-primary/10 text-primary text-glow"
        : "text-muted-foreground hover:text-primary hover:bg-primary/5"
    );

  return (
    <nav className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur-xl">
      <div className="container flex items-center justify-between h-16">
        <Link to="/" className="flex items-center gap-2 font-bold text-lg">
          <div className="relative">
            <Shield className="h-7 w-7 text-primary" />
            <div className="absolute inset-0 blur-md bg-primary/40 -z-10" />
          </div>
          <span className="gradient-text">GUARDIAN_AI</span>
        </Link>

        <div className="flex items-center gap-1">
          <NavLink to="/" end className={linkClass}>
            <Home className="h-4 w-4" />
            <span className="hidden sm:inline">Home</span>
          </NavLink>
          <NavLink to="/scan" className={linkClass}>
            <ScanLine className="h-4 w-4" />
            <span className="hidden sm:inline">Scan</span>
          </NavLink>
          <Button
            asChild
            size="sm"
            className="ml-2 bg-primary text-primary-foreground hover:bg-primary/90 glow-primary"
          >
            <Link to="/scan">Run Scan</Link>
          </Button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;