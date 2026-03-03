import { Link, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { BarChart3, LogOut, TrendingUp, List } from "lucide-react";

const AppLayout = ({ children }: { children: React.ReactNode }) => {
  const { logout } = useAuth();
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <header className="sticky top-0 z-50 bg-header text-header-foreground shadow-sm">
        <div className="container mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 opacity-80" />
            <span className="font-semibold text-sm tracking-wide">Trade Bot Dashboard</span>
          </div>
          <nav className="flex items-center gap-1">
            <Link
              to="/"
              className={`px-3 py-1.5 rounded-md text-sm transition-colors ${
                isActive("/")
                  ? "bg-primary/20 text-header-foreground"
                  : "text-header-foreground/70 hover:text-header-foreground hover:bg-primary/10"
              }`}
            >
              <span className="flex items-center gap-1.5">
                <BarChart3 className="h-3.5 w-3.5" />
                Painel
              </span>
            </Link>
            <Link
              to="/operacoes"
              className={`px-3 py-1.5 rounded-md text-sm transition-colors ${
                isActive("/operacoes")
                  ? "bg-primary/20 text-header-foreground"
                  : "text-header-foreground/70 hover:text-header-foreground hover:bg-primary/10"
              }`}
            >
              <span className="flex items-center gap-1.5">
                <List className="h-3.5 w-3.5" />
                Operações
              </span>
            </Link>
            <Link
              to="/lucros"
              className={`px-3 py-1.5 rounded-md text-sm transition-colors ${
                isActive("/lucros")
                  ? "bg-primary/20 text-header-foreground"
                  : "text-header-foreground/70 hover:text-header-foreground hover:bg-primary/10"
              }`}
            >
              <span className="flex items-center gap-1.5">
                <TrendingUp className="h-3.5 w-3.5" />
                Lucros
              </span>
            </Link>
            <button
              onClick={logout}
              className="px-3 py-1.5 rounded-md text-sm text-header-foreground/70 hover:text-header-foreground hover:bg-primary/10 transition-colors ml-2"
            >
              <span className="flex items-center gap-1.5">
                <LogOut className="h-3.5 w-3.5" />
                Sair
              </span>
            </button>
          </nav>
        </div>
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
