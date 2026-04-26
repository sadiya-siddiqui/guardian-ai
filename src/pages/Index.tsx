import { Link } from "react-router-dom";
import {
  Shield,
  Zap,
  Database,
  AlertTriangle,
  Brain,
  Lock,
  Activity,
  ArrowRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import Navbar from "@/components/Navbar";
import { useAuth } from "@/hooks/useAuth";
import heroImage from "@/assets/hero-shield.jpg";

const features = [
  {
    icon: Brain,
    title: "AI Threat Classifier",
    desc: "Multi-category neural analysis detects hate speech, threats and harassment in milliseconds.",
  },
  {
    icon: Zap,
    title: "Real-Time Detection",
    desc: "Sub-second response. Messages are scanned the moment they're typed.",
  },
  {
    icon: AlertTriangle,
    title: "Instant Alerts",
    desc: "Critical threats trigger visual alerts and can auto-block harmful content.",
  },
  {
    icon: Database,
    title: "Encrypted Storage",
    desc: "Every scan is logged in a hardened database with row-level security.",
  },
  {
    icon: Lock,
    title: "Role-Based Access",
    desc: "Users see their own scans. Admins get full forensic visibility.",
  },
  {
    icon: Activity,
    title: "Live Dashboard",
    desc: "Track threats, history, and live attack patterns from a single console.",
  },
];

const stats = [
  { value: "<300ms", label: "Avg Response" },
  { value: "8+", label: "Threat Vectors" },
  { value: "99.9%", label: "Uptime" },
  { value: "256-bit", label: "Encryption" },
];

const Index = () => {
  const { user } = useAuth();

  return (
    <div className="min-h-screen">
      <Navbar />

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div
          className="absolute inset-0 -z-10 opacity-30"
          style={{ background: "var(--gradient-radial)" }}
        />
        <div className="container py-20 lg:py-28 grid lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-primary/40 bg-primary/5 text-xs text-primary">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-primary" />
              </span>
              SYSTEM ONLINE — REAL-TIME PROTECTION ACTIVE
            </div>
            <h1 className="text-4xl md:text-6xl font-bold leading-tight">
              <span className="gradient-text">Guardian_AI</span>
              <br />
              <span className="text-foreground">Detects Harm.</span>
              <br />
              <span className="text-foreground">Before It Spreads.</span>
            </h1>
            <p className="text-lg text-muted-foreground max-w-xl">
              An AI-powered defense layer that analyzes every message in real time,
              classifies threat severity, and shields users from harmful content
              instantly.
            </p>
            <div className="flex flex-wrap gap-4">
              <Button
                asChild
                size="lg"
                className="bg-primary text-primary-foreground hover:bg-primary/90 glow-primary text-base"
              >
                <Link to={user ? "/scan" : "/auth"}>
                  {user ? "Run a Scan" : "Activate Defense"}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button
                asChild
                size="lg"
                variant="outline"
                className="border-primary/40 hover:bg-primary/10 text-base"
              >
                <Link to={user ? "/dashboard" : "/auth"}>
                  {user ? "Open Dashboard" : "Sign in"}
                </Link>
              </Button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-6">
              {stats.map((s) => (
                <div key={s.label} className="border-l-2 border-primary/40 pl-3">
                  <div className="text-xl font-bold text-primary text-glow">
                    {s.value}
                  </div>
                  <div className="text-xs text-muted-foreground uppercase tracking-wider">
                    {s.label}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="relative scanline rounded-2xl overflow-hidden border border-primary/30 glow-strong">
            <img
              src={heroImage}
              alt="Guardian_AI cyber shield protecting against threats"
              width={1536}
              height={1024}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent" />
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="container py-20">
        <div className="text-center mb-12 space-y-3">
          <div className="text-xs text-primary uppercase tracking-widest">
            // CORE_MODULES
          </div>
          <h2 className="text-3xl md:text-4xl font-bold">
            A Full-Stack <span className="gradient-text">Threat Engine</span>
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Six interlocking modules form an end-to-end shield around every message.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((f) => (
            <div
              key={f.title}
              className="group relative p-6 rounded-xl border border-border bg-card hover:border-primary/60 transition-smooth hover:glow-primary"
            >
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-smooth rounded-xl pointer-events-none"
                style={{ background: "var(--gradient-radial)" }}
              />
              <div className="relative">
                <div className="inline-flex p-3 rounded-lg bg-primary/10 border border-primary/30 mb-4">
                  <f.icon className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-lg font-bold mb-2">{f.title}</h3>
                <p className="text-sm text-muted-foreground">{f.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Architecture */}
      <section className="container py-20">
        <div className="rounded-2xl border border-primary/30 bg-card/50 p-8 md:p-12 backdrop-blur">
          <div className="text-xs text-primary uppercase tracking-widest mb-2">
            // ARCHITECTURE
          </div>
          <h2 className="text-2xl md:text-3xl font-bold mb-8">
            How the pipeline works
          </h2>
          <div className="grid md:grid-cols-4 gap-4">
            {[
              { step: "01", title: "Input", desc: "User submits a message" },
              { step: "02", title: "AI Analysis", desc: "LLM classifies threat severity & categories" },
              { step: "03", title: "Verdict", desc: "Block, warn, or allow + alert" },
              { step: "04", title: "Storage", desc: "Encrypted log with RLS protection" },
            ].map((s, i) => (
              <div key={s.step} className="relative">
                <div className="text-3xl font-bold gradient-text mb-2">{s.step}</div>
                <div className="font-bold mb-1">{s.title}</div>
                <div className="text-sm text-muted-foreground">{s.desc}</div>
                {i < 3 && (
                  <ArrowRight className="hidden md:block absolute top-2 -right-3 h-5 w-5 text-primary/40" />
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      <footer className="border-t border-border mt-12">
        <div className="container py-8 flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Shield className="h-4 w-4 text-primary" />
            <span>Guardian_AI © {new Date().getFullYear()} — Defending conversations.</span>
          </div>
          <div className="text-xs text-muted-foreground">
            Status: <span className="text-primary">● ALL SYSTEMS OPERATIONAL</span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
