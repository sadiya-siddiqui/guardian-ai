import { useState } from "react";
import { z } from "zod";
import {
  Shield,
  ScanLine,
  AlertTriangle,
  CheckCircle2,
  Ban,
  Loader2,
  Send,
} from "lucide-react";
import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { threatStyle, formatCategory, type ThreatLevel } from "@/lib/threat";

const inputSchema = z.string().trim().min(1, "Type a message").max(5000, "Max 5000 characters");

type Result = {
  threat_level: ThreatLevel;
  threat_categories: string[];
  confidence: number;
  analysis: string;
  recommended_action: "allow" | "warn" | "block";
  blocked: boolean;
};

const Scan = () => {
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<Result | null>(null);

  const runScan = async () => {
    const parsed = inputSchema.safeParse(message);
    if (!parsed.success) {
      toast({ title: "Invalid input", description: parsed.error.issues[0].message, variant: "destructive" });
      return;
    }
    setLoading(true);
    setResult(null);
    try {
      const { data, error } = await supabase.functions.invoke("analyze-threat", {
        body: { message: parsed.data },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      setResult(data as Result);
      if (data.blocked) {
        toast({
          title: "🚨 MESSAGE BLOCKED",
          description: "Critical threat detected and quarantined.",
          variant: "destructive",
        });
      } else if (data.threat_level === "safe") {
        toast({ title: "✓ Message safe", description: "No threats detected." });
      } else {
        toast({
          title: `⚠ ${data.threat_level.toUpperCase()} threat`,
          description: "Review the analysis below.",
        });
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Scan failed";
      toast({ title: "Scan error", description: msg, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const style = result ? threatStyle(result.threat_level) : null;

  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="container py-10 max-w-4xl">
        <div className="mb-8">
          <div className="text-xs text-primary uppercase tracking-widest mb-2">// LIVE_SCANNER</div>
          <h1 className="text-3xl md:text-4xl font-bold flex items-center gap-3">
            <ScanLine className="h-8 w-8 text-primary" />
            Threat Scanner
          </h1>
          <p className="text-muted-foreground mt-2">
            Submit any message — Guardian_AI will classify the threat in real time.
          </p>
        </div>

        <div className="rounded-xl border border-primary/30 bg-card p-6 scanline">
          <label htmlFor="msg" className="text-sm text-muted-foreground uppercase tracking-wider">
            Message to analyze
          </label>
          <Textarea
            id="msg"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Paste or type the message you want to scan..."
            rows={6}
            maxLength={5000}
            className="mt-2 font-mono bg-background border-border focus-visible:ring-primary"
            disabled={loading}
          />
          <div className="flex items-center justify-between mt-3">
            <span className="text-xs text-muted-foreground">
              {message.length} / 5000
            </span>
            <Button
              onClick={runScan}
              disabled={loading || !message.trim()}
              className="bg-primary text-primary-foreground hover:bg-primary/90 glow-primary"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Analyzing...
                </>
              ) : (
                <>
                  <Send className="mr-2 h-4 w-4" />
                  Run Threat Scan
                </>
              )}
            </Button>
          </div>
        </div>

        {result && style && (
          <div className={`mt-8 rounded-xl border-2 ${style.ring} bg-card p-6 ${style.glow} animate-in fade-in slide-in-from-bottom-4 duration-500`}>
            <div className="flex items-start justify-between flex-wrap gap-4 mb-6">
              <div className="flex items-center gap-3">
                {result.blocked ? (
                  <Ban className="h-10 w-10 text-destructive" />
                ) : result.threat_level === "safe" ? (
                  <CheckCircle2 className="h-10 w-10 text-safe" />
                ) : (
                  <AlertTriangle className="h-10 w-10 text-warning" />
                )}
                <div>
                  <div className="text-xs text-muted-foreground uppercase">Verdict</div>
                  <div className={`px-3 py-1 rounded-md text-lg font-bold ${style.badge}`}>
                    {style.label}
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-xs text-muted-foreground uppercase">Confidence</div>
                <div className="text-3xl font-bold gradient-text">
                  {Number(result.confidence).toFixed(0)}%
                </div>
              </div>
            </div>

            {result.blocked && (
              <div className="mb-4 p-3 rounded-md border border-destructive/40 bg-destructive/10 text-destructive text-sm font-bold flex items-center gap-2">
                <Shield className="h-4 w-4" />
                MESSAGE BLOCKED — content quarantined before delivery
              </div>
            )}

            <div className="space-y-4">
              <div>
                <div className="text-xs text-muted-foreground uppercase mb-2">
                  AI Analysis
                </div>
                <p className="text-foreground leading-relaxed">{result.analysis}</p>
              </div>

              {result.threat_categories.length > 0 && (
                <div>
                  <div className="text-xs text-muted-foreground uppercase mb-2">
                    Detected Categories
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {result.threat_categories.map((c) => (
                      <span
                        key={c}
                        className="px-3 py-1 rounded-md text-xs font-bold border border-warning/40 bg-warning/10 text-warning uppercase"
                      >
                        {formatCategory(c)}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <div>
                <div className="text-xs text-muted-foreground uppercase mb-2">
                  Recommended Action
                </div>
                <span className="font-bold text-primary uppercase">
                  {result.recommended_action}
                </span>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default Scan;