import type { ReactNode } from "react";
import { Separator } from "@/components/ui/separator";
import { Navbar } from "./navbar";
import { Footer } from "./footer";

export function AppShell({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-slate-100">
      <Navbar />
      <Separator className="bg-slate-200" />
      <main className="mx-auto flex w-full max-w-6xl flex-col gap-10 px-4 pb-12 pt-10 sm:px-6 lg:px-10">
        {children}
      </main>
      <Footer />
    </div>
  );
}


