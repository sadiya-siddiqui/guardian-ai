import { useEffect, useState } from "react";
import { History as HistoryIcon, Shield } from "lucide-react";
import Navbar from "@/components/Navbar";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { threatStyle, formatCategory, type ThreatLevel } from "@/lib/threat";

type Scan = {
  id: string;
  message: string;
  threat_level: ThreatLevel;
  threat_categories: string[];
  confidence: number;
  blocked: boolean;
  ai_analysis: string | null;
  created_at: string;
};

const HistoryPage = () => {
  const { user } = useAuth();
  const [scans, setScans] = useState<Scan[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | ThreatLevel>("all");

  useEffect(() => {
    if (!user) return;
    supabase
      .from("threat_scans")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(200)
      .then(({ data }) => {
        setScans((data as Scan[]) ?? []);
        setLoading(false);
      });
  }, [user]);

  const filtered =
    filter === "all" ? scans : scans.filter((s) => s.threat_level === filter);

  const filters: Array<"all" | ThreatLevel> = ["all", "safe", "low", "medium", "high", "critical"];

  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="container py-10">
        <div className="mb-6">
          <div className="text-xs text-primary uppercase tracking-widest mb-2">// AUDIT_LOG</div>
          <h1 className="text-3xl md:text-4xl font-bold flex items-center gap-3">
            <HistoryIcon className="h-8 w-8 text-primary" />
            Scan History
          </h1>
        </div>

        <div className="flex flex-wrap gap-2 mb-6">
          {filters.map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1.5 rounded-md text-xs uppercase font-bold border transition-smooth ${
                filter === f
                  ? "bg-primary text-primary-foreground border-primary glow-primary"
                  : "border-border text-muted-foreground hover:text-primary hover:border-primary/40"
              }`}
            >
              {f}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="p-10 text-center text-muted-foreground">Loading...</div>
        ) : filtered.length === 0 ? (
          <div className="p-10 text-center rounded-xl border border-border bg-card">
            <Shield className="h-12 w-12 text-primary/40 mx-auto mb-3" />
            <p className="text-muted-foreground">No scans match this filter</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map((s) => {
              const st = threatStyle(s.threat_level);
              return (
                <div
                  key={s.id}
                  className="rounded-xl border border-border bg-card p-5 hover:border-primary/40 transition-smooth"
                >
                  <div className="flex items-start justify-between gap-4 flex-wrap mb-3">
                    <div className="flex items-center gap-3">
                      <span className={`px-2 py-1 rounded text-xs font-bold ${st.badge}`}>
                        {st.label}
                      </span>
                      {s.blocked && (
                        <span className="px-2 py-1 rounded text-xs font-bold border border-destructive/40 text-destructive">
                          ● BLOCKED
                        </span>
                      )}
                      <span className="text-xs text-muted-foreground">
                        {new Date(s.created_at).toLocaleString()}
                      </span>
                    </div>
                    <span className="text-sm text-primary font-bold">
                      {Number(s.confidence).toFixed(0)}%
                    </span>
                  </div>
                  <p className="text-sm mb-3 p-3 rounded bg-background border border-border font-mono">
                    {s.message}
                  </p>
                  {s.ai_analysis && (
                    <p className="text-sm text-muted-foreground italic">"{s.ai_analysis}"</p>
                  )}
                  {s.threat_categories.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-3">
                      {s.threat_categories.map((c) => (
                        <span
                          key={c}
                          className="px-2 py-0.5 rounded text-[10px] font-bold border border-warning/40 bg-warning/10 text-warning uppercase"
                        >
                          {formatCategory(c)}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
};

export default HistoryPage;