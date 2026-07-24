import { Logo } from "@/components/Logo";
import { SideNav } from "@/components/SideNav";
import { BottomNav } from "@/components/BottomNav";
import { UserMenu } from "@/components/UserMenu";
import type { SessionUser } from "@/lib/auth";

export function AppShell({
  user,
  children,
}: {
  user: SessionUser;
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen md:flex">
      <aside className="no-print hidden w-64 shrink-0 border-r border-[var(--border)] bg-white/70 p-5 md:flex md:flex-col">
        <div className="mb-8 px-1">
          <Logo size={44} />
        </div>
        <SideNav role={user.role} />
        <div className="mt-auto pt-6">
          <UserMenu user={user} variant="sidebar" />
        </div>
      </aside>

      <div className="flex min-h-screen flex-1 flex-col">
        <header className="no-print sticky top-0 z-20 flex items-center justify-between border-b border-[var(--border)] bg-[var(--background)]/90 px-4 py-3 backdrop-blur md:px-8">
          <div className="md:hidden">
            <Logo size={34} />
          </div>
          <div className="hidden md:block" />
          <UserMenu user={user} variant="header" />
        </header>

        <main className="flex-1 px-4 pb-24 pt-4 md:px-8 md:pb-10 md:pt-6">
          {children}
        </main>

        <BottomNav role={user.role} />
      </div>
    </div>
  );
}
