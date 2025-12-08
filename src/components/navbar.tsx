"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signIn, signOut, useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";

const navLinks = [
  { href: "/", label: "Home" },
  
];

function AuthButton() {
  const { data: session, status } = useSession();

  if (status === "loading") {
    return (
      <Button variant="outline" disabled>
        Checking session...
      </Button>
    );
  }

  if (session?.user) {
    return (
      <div className="flex items-center gap-3">
        <div className="text-sm text-muted-foreground">
          {session.user.email ?? "Signed in"}
        </div>
        <Button variant="secondary" onClick={() => signOut({ callbackUrl: "/" })}>
          Logout
        </Button>
      </div>
    );
  }

  return (
    <Button onClick={() => signIn(undefined, { callbackUrl: "/dashboard" })}>
      Login / Sign up
    </Button>
  );
}

export function Navbar() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-30 w-full border-b bg-white/90 backdrop-blur">
      <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between px-4 sm:px-6 lg:px-10">
        <Link href="/" className="flex items-center gap-2 font-semibold">
          <span className="rounded-md bg-primary px-2 py-1 text-sm text-primary-foreground">
            AI
          </span>
          <span className="text-lg">Image Upscaler</span>
        </Link>

        <nav className="hidden items-center gap-6 text-sm font-medium text-muted-foreground sm:flex">
          {navLinks.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={isActive ? "text-foreground" : "hover:text-foreground"}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        <AuthButton />
      </div>
    </header>
  );
}


