import { Outlet, NavLink, useNavigate } from "react-router-dom";
import { BarChart3, Code2, History, LogOut, Settings, ShieldCheck } from "lucide-react";
import React from "react";
import { useAuth } from "../context/AuthContext";

const navItems = [
  { to: "/dashboard", label: "Dashboard", icon: BarChart3 },
  { to: "/audit/new", label: "Nueva auditoría", icon: Code2 },
  { to: "/history", label: "Historial", icon: History },
  { to: "/settings", label: "Configuración", icon: Settings },
];

export default function AppLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate("/login", { replace: true });
  }

  const displayName = user?.username || user?.email || "Usuario";
  const displayRole = user?.role ? user.role.toLowerCase() : "alumno";

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <aside className="fixed inset-y-0 left-0 hidden w-72 border-r border-slate-800 bg-slate-950/95 p-5 lg:block">
        <div className="flex items-center gap-3">
          <div className="rounded-2xl bg-blue-500/20 p-3 text-blue-300">
            <ShieldCheck size={26} />
          </div>
          <div>
            <p className="text-lg font-bold text-white">Code Audit AI</p>
            <p className="text-xs text-slate-500">Microservicios + IA</p>
          </div>
        </div>

        <nav className="mt-10 space-y-2">
          {navItems.map((item) => {
            const Icon = item.icon;

            return (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  `flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition ${
                    isActive
                      ? "bg-blue-500/15 text-blue-200"
                      : "text-slate-400 hover:bg-slate-900 hover:text-white"
                  }`
                }
              >
                <Icon size={18} />
                {item.label}
              </NavLink>
            );
          })}
        </nav>

        <div className="absolute bottom-5 left-5 right-5 rounded-2xl border border-slate-800 bg-slate-900 p-4">
          <p className="font-semibold text-white">{displayName}</p>
          <p className="text-xs capitalize text-slate-500">{displayRole}</p>
          <button
            type="button"
            onClick={handleLogout}
            className="mt-4 flex items-center gap-2 text-sm text-slate-400 hover:text-white"
          >
            <LogOut size={16} />
            Cerrar sesión
          </button>
        </div>
      </aside>

      <main className="lg:pl-72">
        <div className="mx-auto max-w-7xl p-5 md:p-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
