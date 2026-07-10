export default function MapLegend() {
  const steps = [
    { color: "#334155", label: "0% — Unexplored" },
    { color: "#1D4ED8", label: "25% — Getting started" },
    { color: "#D97706", label: "50% — Halfway there" },
    { color: "#16A34A", label: "75% — Well explored" },
    { color: "#15803D", label: "100% — Fully explored" },
  ];

  return (
    <div className="absolute bottom-8 left-4 z-[1000] bg-slate-900/90 backdrop-blur-sm border border-white/10 rounded-xl p-4 shadow-2xl">
      <p className="text-xs font-semibold text-white/60 uppercase tracking-widest mb-3">
        Exploration Level
      </p>
      <div className="space-y-1.5">
        {steps.map(({ color, label }) => (
          <div key={color} className="flex items-center gap-2.5">
            <div
              className="w-4 h-4 rounded-sm flex-shrink-0"
              style={{ backgroundColor: color }}
            />
            <span className="text-xs text-white/70">{label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
