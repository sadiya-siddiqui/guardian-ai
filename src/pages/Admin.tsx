import { useEffect, useState } from "react";
import { Lock, Users, AlertTriangle, Ban, Shield } from "lucide-react";
import Navbar from "@/components/Navbar";
import { supabase } from "@/integrations/supabase/client";
import { threatStyle, type ThreatLevel } from "@/lib/threat";

type Scan = {
  id: string;
  user_id: string;
  message: string;
  threat_level: ThreatLevel;
  threat_categories: string[];
  confidence: number;
  blocked: boolean;
  ai_analysis: string | null;
  ip_address: string | null;
  created_at: string;
};

const Admin = () => {
  const [scans, setScans] = useState<Scan[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase
      .from("threat_scans")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(500)
      .then(({ data }) => {
        setScans((data as Scan[]) ?? []);
        setLoading(false);
      });
  }, []);

  const total = scans.length;
  const blocked = scans.filter((s) => s.blocked).length;
  const threats = scans.filter((s) => s.threat_level === "high" || s.threat_level === "critical").length;
  const uniqueUsers = new Set(scans.map((s) => s.user_id)).size;

  const stats = [
    { icon: Shield, label: "Total Scans", value: total, color: "text-primary" },
    { icon: Users, label: "Unique Users", value: uniqueUsers, color: "text-accent" },
    { icon: AlertTriangle, label: "High/Critical", value: threats, color: "text-warning" },
    { icon: Ban, label: "Blocked", value: blocked, color: "text-destructive" },
  ];

  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="container py-10">
        <div className="mb-8">
          <div className="text-xs text-destructive uppercase tracking-widest mb-2">// CLASSIFIED // ADMIN_ONLY</div>
          <h1 className="text-3xl md:text-4xl font-bold flex items-center gap-3">
            <Lock className="h-8 w-8 text-destructive" />
            Admin Console
          </h1>
          <p className="text-muted-foreground mt-2">
            Forensic view of all threat scans across all users.
          </p>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {stats.map((s) => (
            <div key={s.label} className="rounded-xl border border-destructive/30 bg-card p-5">
              <s.icon className={`h-5 w-5 ${s.color} mb-3`} />
              <div className={`text-3xl font-bold ${s.color}`}>{s.value}</div>
              <div className="text-xs text-muted-foreground uppercase mt-1">{s.label}</div>
            </div>
          ))}
        </div>

        <div className="rounded-xl border border-border bg-card overflow-hidden">
          <div className="p-5 border-b border-border">
            <h2 className="font-bold flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-warning" />
              All Scans (latest 500)
            </h2>
          </div>
          {loading ? (
            <div className="p-10 text-center text-muted-foreground">Loading...</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-secondary/50 text-xs uppercase text-muted-foreground">
                  <tr>
                    <th className="text-left p-3">Time</th>
                    <th className="text-left p-3">Level</th>
                    <th className="text-left p-3">Message</th>
                    <th className="text-left p-3">User</th>
                    <th className="text-left p-3">IP</th>
                    <th className="text-right p-3">Conf.</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {scans.map((s) => {
                    const st = threatStyle(s.threat_level);
                    return (
                      <tr key={s.id} className="hover:bg-secondary/30">
                        <td className="p-3 text-muted-foreground whitespace-nowrap text-xs">
                          {new Date(s.created_at).toLocaleString()}
                        </td>
                        <td className="p-3">
                          <span className={`px-2 py-1 rounded text-xs font-bold ${st.badge}`}>
                            {st.label}
                          </span>
                          {s.blocked && (
                            <span className="ml-2 text-destructive text-xs">●</span>
                          )}
                        </td>
                        <td className="p-3 max-w-md truncate font-mono text-xs">{s.message}</td>
                        <td className="p-3 text-xs text-muted-foreground font-mono">
                          {s.user_id.slice(0, 8)}…
                        </td>
                        <td className="p-3 text-xs text-muted-foreground font-mono">
                          {s.ip_address ?? "—"}
                        </td>
                        <td className="p-3 text-right text-primary font-bold">
                          {Number(s.confidence).toFixed(0)}%
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default Admin;