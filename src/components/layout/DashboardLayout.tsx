import { type ReactNode } from "react";
import { Sidebar } from "./Sidebar";
import { ParticleBackground } from "@/components/ui/ParticleBackground";

type ParticleVariant = "default" | "water" | "leaf" | "air";

interface DashboardLayoutProps {
  children: ReactNode;
  particles?: ParticleVariant;
}

export function DashboardLayout({ children, particles = "default" }: DashboardLayoutProps) {
  return (
    <div className="flex min-h-screen bg-surface-0">
      <ParticleBackground variant={particles} />
      <Sidebar />
      <main className="flex-1 relative z-10 overflow-y-auto">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 lg:pl-4">
          {children}
        </div>
      </main>
    </div>
  );
}
