'use client';
import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
  { href: "/dashboard", label: "Dashboard", icon: "🏠" },
  { href: "/dashboard/registration-requests", label: "Registration Requests", icon: "📝" },
  // Add more links as needed
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 bg-white dark:bg-gray-800 h-screen p-6 shadow-lg hidden md:block">
      <nav className="flex flex-col gap-2">
        {links.map(link => (
          <Link key={link.href} href={link.href}>
            <span className={`flex items-center gap-3 px-4 py-2 rounded-lg cursor-pointer
              ${pathname === link.href
                ? "bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300 font-semibold"
                : "hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200"
              }`}>
              <span>{link.icon}</span>
              {link.label}
            </span>
          </Link>
        ))}
      </nav>
    </aside>
  );
}