import React from "react";
export default function MetricCard({ title, value, description, icon: Icon }) {
  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5 shadow-xl shadow-slate-950/20">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-slate-400">{title}</p>
          <p className="mt-2 text-3xl font-bold text-white">{value}</p>
        </div>
        {Icon && (
          <div className="rounded-xl bg-slate-800 p-3 text-blue-300">
            <Icon size={22} />
          </div>
        )}
      </div>
      <p className="mt-4 text-sm text-slate-500">{description}</p>
    </div>
  );
}
