import SeverityBadge from "./SeverityBadge";
import React from "react";

export default function IssueCard({ issue }) {
  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h3 className="text-lg font-semibold text-white">{issue.title}</h3>
          <p className="mt-1 text-sm text-slate-400">
            Tipo: {issue.type} {issue.line ? `• Línea ${issue.line}` : ""}
          </p>
        </div>
        <SeverityBadge severity={issue.severity} />
      </div>

      <div className="mt-4 space-y-3 text-sm leading-6">
        <p className="text-slate-300">{issue.description}</p>
        <div className="rounded-xl border border-slate-800 bg-slate-950/70 p-4">
          <p className="font-semibold text-slate-200">Recomendación</p>
          <p className="mt-1 text-slate-400">{issue.recommendation}</p>
        </div>
      </div>
    </div>
  );
}
