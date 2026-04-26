export type ThreatLevel = "safe" | "low" | "medium" | "high" | "critical";

export const threatStyle = (level: ThreatLevel) => {
  switch (level) {
    case "safe":
      return {
        label: "SAFE",
        badge: "bg-safe text-safe-foreground",
        ring: "border-safe",
        glow: "glow-primary",
      };
    case "low":
      return {
        label: "LOW",
        badge: "bg-primary/20 text-primary border border-primary/40",
        ring: "border-primary",
        glow: "",
      };
    case "medium":
      return {
        label: "MEDIUM",
        badge: "bg-warning/20 text-warning border border-warning/40",
        ring: "border-warning",
        glow: "",
      };
    case "high":
      return {
        label: "HIGH",
        badge: "bg-destructive/20 text-destructive border border-destructive/40",
        ring: "border-destructive",
        glow: "glow-danger",
      };
    case "critical":
      return {
        label: "CRITICAL",
        badge: "gradient-danger text-destructive-foreground",
        ring: "border-destructive",
        glow: "glow-danger animate-pulse-glow",
      };
  }
};

export const formatCategory = (c: string) =>
  c.replace(/_/g, " ").replace(/\b\w/g, (m) => m.toUpperCase());