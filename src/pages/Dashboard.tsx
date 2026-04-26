import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  Shield,
  ScanLine,
  AlertTriangle,
  Ban,
  Activity,
  TrendingUp,
  ArrowRight,
} from "lucide-react";
import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { threatStyle, type ThreatLevel } from "@/lib/threat";

type Scan = {
  id: string;
  message: string;
  threat_level: ThreatLevel;
  threat_categories: string[];
  confidence: number;
  blocked: boolean;
  created_at: string;
};

const Dashboard = () => {
  const { user } = useAuth();
  const [scans, setScans] = useState<Scan[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    supabase
      .from("threat_scans")
      .select("id, message, threat_level, threat_categories, confidence, blocked, created_at")
      .order("created_at", { ascending: false })
      .limit(20)
      .then(({ data }) => {
        setScans((data as Scan[]) ?? []);
        setLoading(false);
      });
  }, [user]);

  const total = scans.length;
  const blocked = scans.filter((s) => s.blocked).length;
  const threats = scans.filter((s) => s.threat_level !== "safe").length;
  const safe = total - threats;

  const stats = [
    { icon: Activity, label: "Recent Scans", value: total, color: "text-primary" },
    { icon: AlertTriangle, label: "Threats Detected", value: threats, color: "text-warning" },
    { icon: Ban, label: "Blocked", value: blocked, color: "text-destructive" },
    { icon: Shield, label: "Safe Messages", value: safe, color: "text-safe" },
  ];

  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="container py-10">
        <div className="flex items-start justify-between flex-wrap gap-4 mb-8">
          <div>
            <div className="text-xs text-primary uppercase tracking-widest mb-2">// COMMAND_CENTER</div>
            <h1 className="text-3xl md:text-4xl font-bold">Dashboard</h1>
            <p className="text-muted-foreground mt-2">
              Welcome back, agent. Guardian_AI is monitoring your channels.
            </p>
          </div>
          <Button
            asChild
            className="bg-primary text-primary-foreground hover:bg-primary/90 glow-primary"
          >
            <Link to="/scan">
              <ScanLine className="mr-2 h-4 w-4" />
              New Scan
            </Link>
          </Button>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {stats.map((s) => (
            <div
              key={s.label}
              className="rounded-xl border border-border bg-card p-5 hover:border-primary/40 transition-smooth"
            >
              <div className="flex items-start justify-between mb-3">
                <s.icon className={`h-5 w-5 ${s.color}`} />
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </div>
              <div className={`text-3xl font-bold ${s.color}`}>{s.value}</div>
              <div className="text-xs text-muted-foreground uppercase tracking-wider mt-1">
                {s.label}
              </div>
            </div>
          ))}
        </div>

        <div className="rounded-xl border border-border bg-card overflow-hidden">
          <div className="flex items-center justify-between p-5 border-b border-border">
            <h2 className="font-bold flex items-center gap-2">
              <Activity className="h-4 w-4 text-primary" />
              Recent Activity
            </h2>
            <Button asChild variant="ghost" size="sm">
              <Link to="/history">
                View all <ArrowRight className="ml-1 h-3 w-3" />
              </Link>
            </Button>
          </div>

          {loading ? (
            <div className="p-10 text-center text-muted-foreground">Loading...</div>
          ) : scans.length === 0 ? (
            <div className="p-10 text-center">
              <Shield className="h-12 w-12 text-primary/40 mx-auto mb-3" />
              <p className="text-muted-foreground">No scans yet</p>
              <Button asChild className="mt-4 bg-primary text-primary-foreground">
                <Link to="/scan">Run your first scan</Link>
              </Button>
            </div>
          ) : (
            <ul className="divide-y divide-border">
              {scans.slice(0, 8).map((s) => {
                const st = threatStyle(s.threat_level);
                return (
                  <li key={s.id} className="p-4 hover:bg-secondary/40 transition-smooth">
                    <div className="flex items-start gap-3">
                      <span className={`shrink-0 px-2 py-1 rounded text-xs font-bold ${st.badge}`}>
                        {st.label}
                      </span>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm truncate">{s.message}</p>
                        <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                          <span>{new Date(s.created_at).toLocaleString()}</span>
                          <span>{Number(s.confidence).toFixed(0)}% confidence</span>
                          {s.blocked && (
                            <span className="text-destructive font-bold">● BLOCKED</span>
                          )}
                        </div>
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </main>
    </div>
  );
};

export default Dashboard;