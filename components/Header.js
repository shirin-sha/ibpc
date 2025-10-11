'use client';
import { useState, useMemo } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import ProfileDropdown from "./ProfileDropdown";
import { BellIcon, Bars3Icon, XMarkIcon } from '@heroicons/react/24/outline';

export default function Header({ session }) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const pathname = usePathname();
  const isAdmin = session?.user?.role === 'admin';

  // Memoize navigation links to prevent unnecessary re-renders
  const navigationLinks = useMemo(() => [
    { href: isAdmin ? "/admin" : "/member", label: "DASHBOARD" },
    { href: isAdmin ? "/admin/members" : "/member/directory", label: "MEMBERS" },
    { href: "/admin/registrations", label: "REGISTRATIONS", role: "admin" },
    { href: "/member/directory", label: "CONTACT ADMIN", role: "member" },
  ], [isAdmin]);

  // Memoize filtered links
  const filteredLinks = useMemo(() => 
    navigationLinks.filter(link => {
      if (!link.role) return true;
      return link.role === 'admin' && isAdmin;
    }), [navigationLinks, isAdmin]
  );

  return (
    <nav className="text-white sticky top-0 z-50 shadow-md" style={{ background: '#061E3E' }}>
      <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo Section */}
          <div className="flex-shrink-0">
            <Link href={isAdmin ? "/admin" : "/member"} className="flex items-center space-x-3" onClick={()=>{console.log(isAdmin)}}>
              <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-gray-50">
                <img 
                  src="/logo.png" 
                  alt="IBPC Logo" 
                  className="w-12 h-12"
                  loading="eager"
                  priority="high"
                />
              </div>
              <span className="text-xl font-semibold text-white hidden sm:block">
                IBPC Connect
              </span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-4">
            {filteredLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                prefetch={true}
                scroll={false}
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
              <span className="absolute top-0 right-0 h-2 w-2 rounded-full" style={{ backgroundColor: '#e74c3c' }}></span>
            </button>
            
            <ProfileDropdown session={session} />

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
          <div className="md:hidden border-t" style={{ background: '#061E3E', borderTopColor: '#0a2f5e' }}>
            <div className="px-2 pt-2 pb-3 space-y-1">
              {filteredLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  scroll={false}
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