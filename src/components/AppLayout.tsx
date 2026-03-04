import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { BarChart3, LogOut, TrendingUp, List, Settings, Menu, X } from "lucide-react";

const navItems = [
  { to: "/", label: "Painel", icon: BarChart3 },
  { to: "/operacoes", label: "Operações", icon: List },
  { to: "/lucros", label: "Lucros", icon: TrendingUp },
  { to: "/configuracao", label: "Configuração", icon: Settings },
];

const AppLayout = ({ children }: { children: React.ReactNode }) => {
  const { logout } = useAuth();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);

  const isActive = (path: string) => location.pathname === path;

  const linkClass = (path: string) =>
    `px-3 py-2 rounded-md text-sm transition-colors flex items-center gap-1.5 ${
      isActive(path)
        ? "bg-primary/20 text-header-foreground"
        : "text-header-foreground/70 hover:text-header-foreground hover:bg-primary/10"
    }`;

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <header className="sticky top-0 z-50 bg-header text-header-foreground shadow-sm">
        <div className="container mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 opacity-80" />
            <span className="font-semibold text-sm tracking-wide">Trade Bot Dashboard</span>
          </div>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-1">
            {navItems.map((item) => (
              <Link key={item.to} to={item.to} className={linkClass(item.to)}>
                <item.icon className="h-3.5 w-3.5" />
                {item.label}
              </Link>
            ))}
            <button
              onClick={logout}
              className="px-3 py-1.5 rounded-md text-sm text-header-foreground/70 hover:text-header-foreground hover:bg-primary/10 transition-colors ml-2 flex items-center gap-1.5"
            >
              <LogOut className="h-3.5 w-3.5" />
              Sair
            </button>
          </nav>

          {/* Mobile hamburger */}
          <button
            className="md:hidden p-2 rounded-md hover:bg-primary/10 transition-colors"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Menu"
          >
            {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>

        {/* Mobile nav dropdown */}
        {menuOpen && (
          <nav className="md:hidden border-t border-primary/20 px-4 py-2 space-y-1 animate-fade-in">
            {navItems.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                className={linkClass(item.to) + " w-full"}
                onClick={() => setMenuOpen(false)}
              >
                <item.icon className="h-4 w-4" />
                {item.label}
              </Link>
            ))}
            <button
              onClick={() => { setMenuOpen(false); logout(); }}
              className="px-3 py-2 rounded-md text-sm text-header-foreground/70 hover:text-header-foreground hover:bg-primary/10 transition-colors flex items-center gap-1.5 w-full"
            >
              <LogOut className="h-4 w-4" />
              Sair
            </button>
          </nav>
        )}
      </header>
      <main className="flex-1 container mx-auto px-4 py-6 animate-fade-in">
        {children}
      </main>
      <footer className="border-t border-border py-3 text-center text-xs text-muted-foreground">
        Trade Bot © {new Date().getFullYear()}
      </footer>
    </div>
  );
};

export default AppLayout;
