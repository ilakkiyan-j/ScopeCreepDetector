'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import {
  Search,
  FolderPlus,
  FolderKanban,
  Cloud,
  Sun,
  Moon,
  Settings,
  LayoutDashboard,
  Activity,
  ShieldAlert,
  ArrowRight,
  X,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { api, getLocalProjects } from '@/lib/api';
import { Project } from '@scope-creep-ledger/shared';
import { cn } from '@/lib/utils';

export function CommandPalette({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const router = useRouter();
  const { user, isDarkMode, toggleTheme } = useAuth();
  const [query, setQuery] = React.useState('');
  const [projects, setProjects] = React.useState<Project[]>([]);
  const [selectedIndex, setSelectedIndex] = React.useState(0);
  const inputRef = React.useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    if (open) {
      setQuery('');
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
      const loaded = getLocalProjects(user?.userId);
      setProjects(loaded);
      api.listProjects(user?.userId).then((res) => setProjects(res.projects)).catch(() => {});
    }
  }, [open, user?.userId]);

  React.useEffect(() => {
    if (!open) return;

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
        e.preventDefault();
      }
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [open, onClose]);

  if (!open) return null;

  const filteredProjects = projects.filter((p) =>
    `${p.name} ${p.clientName}`.toLowerCase().includes(query.toLowerCase())
  );

  const pages = [
    { label: 'Dashboard', href: '/app/dashboard', icon: LayoutDashboard },
    { label: 'All Projects', href: '/app/projects', icon: FolderKanban },
    { label: 'New Analysis', href: '/app/projects/new', icon: FolderPlus },
    { label: 'Activity Feed', href: '/app/activity', icon: Activity },
    { label: 'Profile Settings', href: '/app/settings/profile', icon: Settings },
  ];

  const filteredPages = pages.filter((p) => p.label.toLowerCase().includes(query.toLowerCase()));

  const actions = [
    {
      label: 'Push Local Projects to AWS Cloud',
      icon: Cloud,
      action: async () => {
        await api.syncLocalProjectsToCloud(user?.userId);
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new Event('scope-creep-project-updated'));
        }
        onClose();
      },
    },
    {
      label: isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode',
      icon: isDarkMode ? Sun : Moon,
      action: () => {
        toggleTheme();
        onClose();
      },
    },
  ];

  const filteredActions = actions.filter((a) => a.label.toLowerCase().includes(query.toLowerCase()));

  const navigate = (href: string) => {
    router.push(href);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 p-4 sm:pt-28">
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-md animate-fade-in"
        onClick={onClose}
      />
      <div className="relative w-full max-w-xl rounded-2xl border border-border/80 bg-popover/95 text-popover-foreground shadow-2xl backdrop-blur-xl animate-fade-up overflow-hidden">
        <div className="flex items-center border-b border-border/50 px-4 py-3">
          <Search className="h-4 w-4 shrink-0 text-muted-foreground mr-3" />
          <input
            ref={inputRef}
            type="text"
            placeholder="Type a command or search projects…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground focus:outline-none"
          />
          <button
            type="button"
            onClick={onClose}
            className="rounded-md p-1 text-muted-foreground hover:bg-muted hover:text-foreground"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="max-h-96 overflow-y-auto p-2 space-y-4 text-xs">
          {filteredActions.length > 0 && (
            <div>
              <p className="px-2 py-1 font-bold text-[10px] uppercase tracking-wider text-muted-foreground">
                Quick Actions
              </p>
              <div className="space-y-0.5">
                {filteredActions.map((act, i) => {
                  const Icon = act.icon;
                  return (
                    <button
                      key={i}
                      type="button"
                      onClick={act.action}
                      className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-left text-sm text-foreground transition-colors hover:bg-muted focus:outline-none"
                    >
                      <Icon className="h-4 w-4 text-primary" />
                      <span className="flex-1 font-medium">{act.label}</span>
                      <ArrowRight className="h-3.5 w-3.5 text-muted-foreground" />
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {filteredProjects.length > 0 && (
            <div>
              <p className="px-2 py-1 font-bold text-[10px] uppercase tracking-wider text-muted-foreground">
                Projects ({filteredProjects.length})
              </p>
              <div className="space-y-0.5">
                {filteredProjects.map((p) => (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => navigate(`/app/projects/${p.id}/overview`)}
                    className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-left text-sm text-foreground transition-colors hover:bg-muted focus:outline-none"
                  >
                    <FolderKanban className="h-4 w-4 text-info" />
                    <div className="flex-1 min-w-0">
                      <p className="truncate font-semibold text-foreground">{p.name}</p>
                      <p className="truncate text-xs text-muted-foreground">{p.clientName}</p>
                    </div>
                    {p.isLocalOnly ? (
                      <span className="text-[10px] text-warning bg-warning/10 px-1.5 py-0.5 rounded border border-warning/20">
                        Local
                      </span>
                    ) : (
                      <span className="text-[10px] text-success bg-success/10 px-1.5 py-0.5 rounded border border-success/20">
                        Cloud
                      </span>
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}

          {filteredPages.length > 0 && (
            <div>
              <p className="px-2 py-1 font-bold text-[10px] uppercase tracking-wider text-muted-foreground">
                Navigation
              </p>
              <div className="space-y-0.5">
                {filteredPages.map((pg, i) => {
                  const Icon = pg.icon;
                  return (
                    <button
                      key={i}
                      type="button"
                      onClick={() => navigate(pg.href)}
                      className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-left text-sm text-foreground transition-colors hover:bg-muted focus:outline-none"
                    >
                      <Icon className="h-4 w-4 text-muted-foreground" />
                      <span className="flex-1 font-medium">{pg.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {filteredActions.length === 0 && filteredProjects.length === 0 && filteredPages.length === 0 && (
            <div className="py-8 text-center text-sm text-muted-foreground">
              No matching commands or projects found.
            </div>
          )}
        </div>

        <div className="border-t border-border/40 bg-muted/20 px-4 py-2 flex items-center justify-between text-[11px] text-muted-foreground">
          <span>Navigate with mouse or keyboard</span>
          <div className="flex items-center gap-1.5">
            <kbd className="rounded border border-border bg-muted px-1.5 py-0.5 text-[10px]">Esc</kbd> to close
          </div>
        </div>
      </div>
    </div>
  );
}
