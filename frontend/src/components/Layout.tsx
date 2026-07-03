import { NavLink, Outlet } from "react-router-dom";
import { useAuth } from "../lib/AuthContext";

const navItems = [
  { to: "/", label: "Résultats", icon: "sensors" },
  { to: "/ligue", label: "Ligue entre Amis", icon: "emoji_events" },
  { to: "/actus", label: "Actu & Mercato", icon: "newspaper" },
];

function topNavLinkClass({ isActive }: { isActive: boolean }) {
  return [
    "px-3 py-2 rounded-full font-label text-sm font-semibold transition-colors",
    isActive
      ? "text-primary bg-primary-container/10"
      : "text-on-surface-variant hover:text-on-surface hover:bg-surface-container",
  ].join(" ");
}

function sideNavLinkClass({ isActive }: { isActive: boolean }) {
  return [
    "flex items-center gap-3 px-4 py-3 rounded-2xl font-label text-sm font-medium transition-colors",
    isActive
      ? "bg-primary text-on-primary shadow-sm shadow-primary/20"
      : "text-on-surface-variant hover:bg-surface-container hover:text-on-surface",
  ].join(" ");
}

export default function Layout() {
  const { user, loading, signOut } = useAuth();

  return (
    <div className="min-h-screen flex flex-col bg-background text-on-surface font-body">
      <header className="sticky top-0 z-50 flex items-center justify-between gap-4 px-4 sm:px-8 h-16 sm:h-20 bg-surface/80 backdrop-blur-md border-b border-surface-container-highest">
        <span className="font-headline text-xl sm:text-2xl font-bold text-primary tracking-tight">
          Footy Predict
        </span>
        <nav className="hidden md:flex items-center gap-1">
          {navItems.map((item) => (
            <NavLink key={item.to} to={item.to} end={item.to === "/"} className={topNavLinkClass}>
              {item.label}
            </NavLink>
          ))}
        </nav>
        {!loading && user ? (
          <div className="flex items-center gap-3">
            <span className="hidden sm:inline font-label text-sm text-on-surface-variant truncate max-w-[140px]">
              {user.displayName ?? user.email}
            </span>
            <button
              type="button"
              onClick={() => signOut()}
              className="flex items-center gap-2 px-4 py-2 rounded-full border border-surface-container-highest text-on-surface-variant font-label text-sm font-semibold hover:text-on-surface hover:bg-surface-container transition-colors"
            >
              <span className="material-symbols-outlined text-[20px]">logout</span>
              <span className="hidden sm:inline">Déconnexion</span>
            </button>
          </div>
        ) : (
          <NavLink
            to="/connexion"
            className="flex items-center gap-2 px-4 py-2 rounded-full border border-surface-container-highest text-on-surface-variant font-label text-sm font-semibold hover:text-on-surface hover:bg-surface-container transition-colors"
          >
            <span className="material-symbols-outlined text-[20px]">account_circle</span>
            <span className="hidden sm:inline">Connexion</span>
          </NavLink>
        )}
      </header>

      <div className="flex flex-1 w-full max-w-[1400px] mx-auto">
        <aside className="hidden lg:flex flex-col w-64 shrink-0 gap-1 p-6 sticky top-20 self-start">
          {navItems.map((item) => (
            <NavLink key={item.to} to={item.to} end={item.to === "/"} className={sideNavLinkClass}>
              <span className="material-symbols-outlined text-[22px]">{item.icon}</span>
              <span>{item.label}</span>
            </NavLink>
          ))}
          <div className="mt-6 pt-6 border-t border-surface-container-highest font-label text-xs text-on-surface-variant leading-relaxed">
            Jeu de pronostics entre amis. Aucun argent réel, aucune mise — uniquement des points à gagner.
          </div>
        </aside>

        <main className="flex-1 min-w-0 p-4 sm:p-8">
          <Outlet />
        </main>
      </div>

      <nav className="md:hidden sticky bottom-0 z-50 flex items-center justify-around bg-surface/95 backdrop-blur-md border-t border-surface-container-highest px-2 py-2">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === "/"}
            className={({ isActive }) =>
              [
                "flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-xl font-label text-[11px] font-medium",
                isActive ? "text-primary" : "text-on-surface-variant",
              ].join(" ")
            }
          >
            <span className="material-symbols-outlined text-[22px]">{item.icon}</span>
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>

      <footer className="w-full py-6 px-4 sm:px-8 mt-auto border-t border-surface-container-highest text-center font-label text-xs text-on-surface-variant">
        Footy Predict — jeu de pronostics entre amis, sans argent réel.
      </footer>
    </div>
  );
}
