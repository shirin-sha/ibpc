'use client';
import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import ProfileDropdown from "./ProfileDropdown"; // Assuming this is your component
import { BellIcon, Bars3Icon, XMarkIcon } from '@heroicons/react/24/outline';
import { useSession } from "next-auth/react";


export default function Header() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const pathname = usePathname();
  const { data: session, status } = useSession(); 
  const isAdmin = session?.user?.role === 'admin';

const navigationLinks = [
  {   href: isAdmin ? "/dashboard/admin" : "/dashboard", label: "Dashboard" }, // Visible to all
  { href: "/dashboard/members", label: "Members" }, // Visible to all (or adjust if needed)
  { href: "/dashboard/admin/registrations", label: "Registrations", role: "admin" }, // Admin-only
  { href: "/dashboard/members", label: "Contact Admin", role: "member" }, 
  // { href: "/dashboard/events", label: "Events" }, // Example: Add role: "admin" if admin-only
  // Add more links here, with optional 'role: "admin"'
];
  // Filter links based on role
  const filteredLinks = navigationLinks.filter(link => {
    if (!link.role) return true; // Show if no role specified (visible to all)
    return link.role === 'admin' && isAdmin; // Show admin links only to admins
  });

  return (
    <nav className="bg-gradient-to-br from-red-700 to-slate-900 text-white sticky top-0 z-50 shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo Section */}
          <div className="flex-shrink-0">
            <Link href="/dashboard" className="flex items-center space-x-3">
              <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-gray-50 ">
                {/* Replace with actual image path if needed */}
                <img src="/logo.png" alt="IBPC Logo" className="w-12 h-12" />
              </div>
              <span className="text-xl font-semibold text-white hidden sm:block">
                {isAdmin ? 'IBPC Connect' : 'IBPC Connect'} 
              </span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-4">
            {filteredLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                scroll={false} // Prevent scrolling to top on navigation
                className={`px-3 py-2 text-sm font-medium transition-colors
                  ${pathname === link.href 
                    ? 'text-white font-semibold' 
                    : 'text-gray-300 hover:text-white'
                  }`}
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Right Section */}
          <div className="flex items-center space-x-4">
            <button 
              className="p-2 text-white hover:text-blue-200 rounded-full relative"
              aria-label="Notifications"
            >
              <BellIcon className="w-6 h-6" />
              <span className="absolute top-0 right-0 h-2 w-2 bg-red-500 rounded-full"></span>
            </button>
            
            <ProfileDropdown />

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden inline-flex items-center justify-center p-2 rounded-md text-white hover:text-blue-200"
              aria-label="Toggle Menu"
            >
              {isMobileMenuOpen ? (
                <XMarkIcon className="h-6 w-6" />
              ) : (
                <Bars3Icon className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden bg-gradient-to-br from-red-700 to-slate-900 border-t border-red-800">
            <div className="px-2 pt-2 pb-3 space-y-1">
              {filteredLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  scroll={false} // Prevent scrolling to top on navigation
                  className={`block px-3 py-2 text-base font-medium transition-colors
                    ${pathname === link.href 
                      ? 'text-white font-semibold' 
                      : 'text-gray-300 hover:text-white'
                    }`}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}