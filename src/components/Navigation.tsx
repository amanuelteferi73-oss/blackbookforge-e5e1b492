import { NavLink } from 'react-router-dom';
import { Home, CheckSquare, Lock, Image, BarChart3 } from 'lucide-react';

const NAV_ITEMS = [
  { to: '/', icon: Home, label: 'Dashboard' },
  { to: '/check-in', icon: CheckSquare, label: 'Check-In' },
  { to: '/vault', icon: Lock, label: 'Vault' },
  { to: '/reality', icon: Image, label: 'Reality' },
  { to: '/progress', icon: BarChart3, label: 'Progress' },
];

export function Navigation() {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-background/95 backdrop-blur border-t border-border md:top-[73px] md:bottom-auto md:border-t-0 md:border-b">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-around md:justify-center md:gap-8 py-2">
          {NAV_ITEMS.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `flex flex-col md:flex-row items-center gap-1 md:gap-2 px-3 py-2 rounded transition-colors ${
                  isActive
                    ? 'text-foreground bg-muted'
                    : 'text-muted-foreground hover:text-foreground'
                }`
              }
            >
              <Icon className="w-5 h-5" />
              <span className="text-[10px] md:text-sm">{label}</span>
            </NavLink>
          ))}
        </div>
      </div>
    </nav>
  );
}
