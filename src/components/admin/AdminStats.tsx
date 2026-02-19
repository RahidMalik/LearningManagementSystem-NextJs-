import { Users, DollarSign, PlayCircle } from "lucide-react";

export default function AdminStats() {
  const stats = [
    {
      label: "Total Students",
      value: "1,240",
      icon: <Users />,
      color: "bg-blue-50 text-blue-600",
    },
    {
      label: "Total Revenue",
      value: "$12,450",
      icon: <DollarSign />,
      color: "bg-green-50 text-green-600",
    },
    {
      label: "Active Courses",
      value: "24",
      icon: <PlayCircle />,
      color: "bg-purple-50 text-purple-600",
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {stats.map((stat, i) => (
        <div
          key={i}
          className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm flex items-center gap-5"
        >
          <div className={`p-4 rounded-2xl ${stat.color}`}>{stat.icon}</div>
          <div>
            <p className="text-slate-500 text-sm font-medium">{stat.label}</p>
            <h3 className="text-2xl font-black text-slate-800">{stat.value}</h3>
          </div>
        </div>
      ))}
    </div>
  );
}
