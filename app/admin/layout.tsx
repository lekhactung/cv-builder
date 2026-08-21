import { auth } from "@/auth";
import { redirect } from "next/navigation";
import Link from "next/link";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();

  if (!session?.user) {
    redirect("/auth");
  }

  if (session.user.role !== "ADMIN") {
    redirect("/");
  }

  return (
    <div className="admin-layout">
      {/* Admin Sidebar */}
      <aside className="admin-sidebar">
        <div className="admin-sidebar-header">
          <span className="admin-sidebar-title">
            Admin<span className="admin-sidebar-title-highlight">Panel</span>
          </span>
        </div>

        <nav className="admin-sidebar-nav">
          {[
            { href: "/admin",               label: "Dashboard",     },
            { href: "/admin/users",          label: "Users",         },
            { href: "/admin/payments",       label: "Payments",      },
            // { href: "/admin/subscriptions",  label: "Subscriptions", },
            { href: "/admin/credits",        label: "Credits",       },
            { href: "/admin/plans",          label: "Plans",         },
          ].map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="admin-nav-item"
            >
              <span>{item.label}</span>
            </Link>
          ))}
        </nav>

        <div className="admin-sidebar-footer">
          <div className="admin-logged-in">
            Logged in as
          </div>
          <div className="admin-user-email">
            {session.user.email}
          </div>
          <Link
            href="/dashboard"
            className="admin-back-link"
          >
            ← Về Dashboard
          </Link>
        </div>
      </aside>

      {/* Main Content */}
      <main className="admin-main">
        {children}
      </main>
    </div>
  );
}