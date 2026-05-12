import React from "react";
export default function Settings() {
  return (
    <div>
      <p className="text-sm font-semibold uppercase tracking-wide text-blue-300">Configuración</p>
      <h1 className="mt-2 text-3xl font-bold text-white">Preferencias</h1>
      <p className="mt-2 text-slate-400">
        Pantalla simple para perfil, tema y futuras configuraciones de IA.
      </p>

      <div className="mt-8 max-w-2xl rounded-2xl border border-slate-800 bg-slate-900/70 p-6">
        <div className="space-y-5">
          <label className="block">
            <span className="text-sm font-semibold text-slate-300">Nombre</span>
            <input
              className="mt-2 w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm outline-none"
              defaultValue="Pablo Gonzalez"
            />
          </label>

          <label className="block">
            <span className="text-sm font-semibold text-slate-300">Email</span>
            <input
              className="mt-2 w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm outline-none"
              defaultValue="pablo@mail.com"
            />
          </label>

          <label className="block">
            <span className="text-sm font-semibold text-slate-300">Tema</span>
            <select className="mt-2 w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm outline-none">
              <option>Oscuro</option>
              <option>Claro</option>
            </select>
          </label>

          <button className="rounded-xl bg-blue-500 px-6 py-3 text-sm font-bold text-white hover:bg-blue-400">
            Guardar cambios
          </button>
        </div>
      </div>
    </div>
  );
}
