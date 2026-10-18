import { createContext, useContext, useMemo, useState, type ReactNode } from "react";

interface NavState {
  drawerOpen: boolean;
  searchOpen: boolean;
  openDrawer: () => void;
  closeDrawer: () => void;
  openSearch: () => void;
  closeSearch: () => void;
}

const NavCtx = createContext<NavState | null>(null);

export function NavProvider({ children }: { children: ReactNode }) {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);

  const value = useMemo<NavState>(
    () => ({
      drawerOpen,
      searchOpen,
      openDrawer: () => setDrawerOpen(true),
      closeDrawer: () => setDrawerOpen(false),
      openSearch: () => setSearchOpen(true),
      closeSearch: () => setSearchOpen(false),
    }),
    [drawerOpen, searchOpen],
  );

  return <NavCtx.Provider value={value}>{children}</NavCtx.Provider>;
}

export function useNav(): NavState {
  const ctx = useContext(NavCtx);
  if (!ctx) throw new Error("useNav must be used inside NavProvider");
  return ctx;
}
