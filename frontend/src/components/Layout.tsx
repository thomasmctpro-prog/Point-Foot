import { NavLink, Outlet } from "react-router-dom";

const navItems = [
  { to: "/", label: "Résultats", icon: "sensors" },
  { to: "/ligue", label: "Ligue entre Amis", icon: "emoji_events" },
  { to: "/actus", label: "Actu & Mercato", icon: "newspaper" },
];

function navLinkClass({ isActive }: { isActive: boolean }) {
  return [
    "flex items-center gap-2 px-3 py-2 rounded-xl font-label text-sm font-semibold transition-colors",
    isActive
      ? "text-primary bg-primary-container/20"
      : "text-on-surface-variant hover:text-on-surface hover:bg-surface-container",
  ].join(" ");
}

export default function Layout() {
  return (
    <div className="min-h-screen flex flex-col bg-background text-on-surface font-body">
      <header className="sticky top-0 z-50 flex items-center justify-between gap-4 px-4 sm:px-8 h-16 sm:h-20 bg-surface/80 backdrop-blur-md border-b border-surface-container-highest">
        <span className="font-headline text-xl sm:text-2xl font-bold text-primary tracking-tight">
          Footy Predict
        </span>
        <nav className="flex items-center gap-1 sm:gap-2">
          {navItems.map((item) => (
            <NavLink key={item.to} to={item.to} end={item.to === "/"} className={navLinkClass}>
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>
      </header>
      <main className="flex-1 w-full max-w-[1200px] mx-auto p-4 sm:p-8">
        <Outlet />
      </main>
      <footer className="w-full py-6 px-4 sm:px-8 mt-auto border-t border-surface-container-highest text-center font-label text-xs text-on-surface-variant">
        Footy Predict — jeu de pronostics entre amis, sans argent réel.
      </footer>
    </div>
  );
}
