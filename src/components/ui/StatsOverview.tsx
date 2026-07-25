import { Coins, HelpCircle, Award, ShieldCheck } from "lucide-react";

export function StatsOverview() {
  const stats = [
    {
      title: "Total Escrowed Bounties",
      value: "14,850 XLM",
      subtitle: "~$1,633 USD Distributed",
      icon: Coins,
      color: "text-amber-600",
      bg: "bg-amber-50 border-amber-200",
    },
    {
      title: "AI Knowledge Answers",
      value: "1,420+",
      subtitle: "Verified RAG Citations",
      icon: HelpCircle,
      color: "text-blue-600",
      bg: "bg-blue-50 border-blue-200",
    },
    {
      title: "Active Contributors",
      value: "380+",
      subtitle: "Tiered Reputation Profiles",
      icon: Award,
      color: "text-purple-600",
      bg: "bg-purple-50 border-purple-200",
    },
    {
      title: "Inter-Contract Calls",
      value: "100% Soroban",
      subtitle: "2 Core Rust Contracts",
      icon: ShieldCheck,
      color: "text-emerald-600",
      bg: "bg-emerald-50 border-emerald-200",
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat, i) => {
        const Icon = stat.icon;
        return (
          <div
            key={i}
            className="rounded-xl bg-white border border-slate-200 p-4 hover:border-slate-300 transition-all shadow-sm"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-slate-500 uppercase">{stat.title}</span>
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center border ${stat.bg}`}>
                <Icon className={`w-4 h-4 ${stat.color}`} />
              </div>
            </div>
            <p className="text-xl font-bold font-mono text-slate-900">
              {stat.value}
            </p>
            <p className="text-[11px] text-slate-500 mt-0.5">{stat.subtitle}</p>
          </div>
        );
      })}
    </div>
  );
}
