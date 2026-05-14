import { Loader2, ShieldCheck } from "lucide-react";
import React from "react";

export default function LoadingAudit() {
  return (
    <div className="rounded-2xl border border-blue-500/20 bg-blue-500/10 p-6">
      <div className="flex items-center gap-4">
        <div className="rounded-2xl bg-blue-500/20 p-3 text-blue-200">
          <ShieldCheck size={28} />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-white">Analizando código con IA</h3>
          <p className="text-sm text-slate-400">
            Buscando vulnerabilidades, errores lógicos y oportunidades de refactorización.
          </p>
        </div>
        <Loader2 className="ml-auto animate-spin text-blue-300" size={24} />
      </div>
      <div className="mt-5 h-2 overflow-hidden rounded-full bg-slate-800">
        <div className="h-full w-2/3 animate-pulse rounded-full bg-blue-400" />
      </div>
    </div>
  );
}
