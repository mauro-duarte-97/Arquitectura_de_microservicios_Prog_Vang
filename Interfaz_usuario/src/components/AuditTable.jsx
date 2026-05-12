import { Link } from "react-router-dom";
import SeverityBadge from "./SeverityBadge";
import React from "react";

export default function AuditTable({ audits }) {
  return (
    <div className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/70">
      <table className="w-full min-w-[720px] text-left text-sm">
        <thead className="border-b border-slate-800 bg-slate-950/50 text-slate-400">
          <tr>
            <th className="px-5 py-4 font-medium">Fecha</th>
            <th className="px-5 py-4 font-medium">Título</th>
            <th className="px-5 py-4 font-medium">Lenguaje</th>
            <th className="px-5 py-4 font-medium">Severidad</th>
            <th className="px-5 py-4 font-medium">Acción</th>
          </tr>
        </thead>
        <tbody>
          {audits.map((audit) => (
            <tr key={audit.id} className="border-b border-slate-800/70 last:border-0">
              <td className="px-5 py-4 text-slate-400">{audit.date}</td>
              <td className="px-5 py-4 text-white">{audit.title}</td>
              <td className="px-5 py-4 uppercase text-slate-300">{audit.language}</td>
              <td className="px-5 py-4">
                <SeverityBadge severity={audit.globalSeverity} />
              </td>
              <td className="px-5 py-4">
                <Link
                  to={`/audit/result/${audit.id}`}
                  className="rounded-lg border border-slate-700 px-3 py-2 text-xs font-semibold text-slate-200 hover:bg-slate-800"
                >
                  Ver detalle
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
