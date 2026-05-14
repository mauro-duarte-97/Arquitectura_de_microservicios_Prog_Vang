import React from "react";
import { LogOut } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function formatRole(role) {
  if (!role) return "USER";
  return role.replace(/^ROLE_/, "");
}

export default function Settings() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate("/login", { replace: true });
  }

  return (
    <div>
      <p className="text-sm font-semibold uppercase tracking-wide text-blue-300">Configuración</p>
      <h1 className="mt-2 text-3xl font-bold text-white">Mi cuenta</h1>
      <p className="mt-2 text-slate-400">
        Datos del usuario autenticado. La edición del perfil queda fuera del alcance del TP.
      </p>

      <div className="mt-8 max-w-2xl rounded-2xl border border-slate-800 bg-slate-900/70 p-6">
        <div className="space-y-5">
          <ReadOnlyField label="Nombre de usuario" value={user?.username ?? "—"} />
          <ReadOnlyField label="Email" value={user?.email ?? "—"} />
          <ReadOnlyField label="Rol" value={formatRole(user?.role)} />

          <button
            type="button"
            onClick={handleLogout}
            className="mt-2 inline-flex items-center gap-2 rounded-xl bg-red-500/20 px-6 py-3 text-sm font-bold text-red-200 hover:bg-red-500/30"
          >
            <LogOut size={16} />
            Cerrar sesión
          </button>
        </div>
      </div>
    </div>
  );
}

function ReadOnlyField({ label, value }) {
  return (
    <label className="block">
      <span className="text-sm font-semibold text-slate-300">{label}</span>
      <input
        readOnly
        value={value}
        className="mt-2 w-full cursor-not-allowed rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-slate-300 outline-none"
      />
    </label>
  );
}
