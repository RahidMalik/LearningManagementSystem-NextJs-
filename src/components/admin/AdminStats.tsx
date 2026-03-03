import {
  Users,
  DollarSign,
  PlayCircle,
  TrendingUp,
  TrendingDown,
} from "lucide-react";

const stats = [
  {
    label: "Total Students",
    value: "1,240",
    change: "+12%",
    up: true,
    icon: Users,
    gradient: "from-blue-500 to-blue-600",
    bg: "bg-blue-50 dark:bg-blue-500/10",
    iconColor: "text-blue-600 dark:text-blue-400",
    border: "border-blue-100 dark:border-blue-500/20",
    shadow: "shadow-blue-100 dark:shadow-blue-900/20",
  },
  {
    label: "Total Revenue",
    value: "PKR 1,24,500",
    change: "+8.2%",
    up: true,
    icon: DollarSign,
    gradient: "from-emerald-500 to-green-600",
    bg: "bg-emerald-50 dark:bg-emerald-500/10",
    iconColor: "text-emerald-600 dark:text-emerald-400",
    border: "border-emerald-100 dark:border-emerald-500/20",
    shadow: "shadow-emerald-100 dark:shadow-emerald-900/20",
  },
  {
    label: "Active Courses",
    value: "24",
    change: "-2",
    up: false,
    icon: PlayCircle,
    gradient: "from-violet-500 to-purple-600",
    bg: "bg-violet-50 dark:bg-violet-500/10",
    iconColor: "text-violet-600 dark:text-violet-400",
    border: "border-violet-100 dark:border-violet-500/20",
    shadow: "shadow-violet-100 dark:shadow-violet-900/20",
  },
];

export default function AdminStats() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
      {stats.map((stat, i) => {
        const Icon = stat.icon;
        const Trend = stat.up ? TrendingUp : TrendingDown;
        return (
          <div
            key={i}
            className={`relative bg-white dark:bg-zinc-900 border ${stat.border} rounded-3xl p-6 shadow-sm ${stat.shadow} overflow-hidden group hover:-translate-y-1 transition-all duration-300`}
          >
            {/* Background gradient blob */}
            <div
              className={`absolute -top-6 -right-6 w-24 h-24 rounded-full bg-linear-to-br ${stat.gradient} opacity-[0.07] group-hover:opacity-[0.12] transition-opacity duration-300`}
            />

            <div className="relative">
              <div className="flex items-start justify-between mb-4">
                {/* Icon */}
                <div
                  className={`p-3 rounded-2xl ${stat.bg} border ${stat.border}`}
                >
                  <Icon size={22} className={stat.iconColor} />
                </div>

                {/* Trend badge */}
                <div
                  className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-black ${
                    stat.up
                      ? "bg-green-50 dark:bg-green-500/10 text-green-600 dark:text-green-400"
                      : "bg-red-50 dark:bg-red-500/10 text-red-500 dark:text-red-400"
                  }`}
                >
                  <Trend size={10} />
                  {stat.change}
                </div>
              </div>

              {/* Value */}
              <h3 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                {stat.value}
              </h3>
              <p className="text-slate-400 dark:text-zinc-500 text-xs font-semibold mt-1 uppercase tracking-wider">
                {stat.label}
              </p>

              {/* Mini progress bar */}
              <div className="mt-4 h-1 bg-slate-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                <div
                  className={`h-full bg-linear-to-r ${stat.gradient} rounded-full`}
                  style={{ width: i === 0 ? "72%" : i === 1 ? "58%" : "45%" }}
                />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
