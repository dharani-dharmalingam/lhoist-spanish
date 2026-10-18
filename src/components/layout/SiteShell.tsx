import type { ReactNode } from "react";
import { NavProvider } from "@/components/layout/NavContext";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { NavDrawer } from "@/components/layout/NavDrawer";
import { SearchPalette } from "@/components/layout/SearchPalette";
import { FloatingGuideButton } from "@/components/layout/FloatingGuideButton";

export function SiteShell({ children }: { children: ReactNode }) {
  return (
    <NavProvider>
      <div className="flex min-h-screen w-full flex-col">
        <SiteHeader />
        <main className="flex-1">{children}</main>
        <SiteFooter />
        <NavDrawer />
        <SearchPalette />
        <FloatingGuideButton />
      </div>
    </NavProvider>
  );
}
