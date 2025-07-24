'use client';
import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import ProfileDropdown from "./ProfileDropdown";
import { BellIcon, Bars3Icon, XMarkIcon, HomeIcon, UserGroupIcon, ClipboardDocumentListIcon } from '@heroicons/react/24/outline';
import { useSession } from "next-auth/react";
import Button from "./ui/Button";

export default function Header() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const pathname = usePathname();
  const { data: session, status } = useSession(); 
  const isAdmin = session?.user?.role === 'admin';

  const navigationLinks = [
    { 
      href: isAdmin ? "/dashboard/admin" : "/dashboard", 
      label: "Dashboard",
      icon: <HomeIcon className="w-5 h-5" />
    },
    { 
      href: "/dashboard/members", 
      label: "Members",
      icon: <UserGroupIcon className="w-5 h-5" />
    },
    { 
      href: "/dashboard/admin/registrations", 
      label: "Registrations", 
      role: "admin",
      icon: <ClipboardDocumentListIcon className="w-5 h-5" />
    },
  ];

  // Filter links based on role
  const filteredLinks = navigationLinks.filter(link => {
    if (!link.role) return true;
    return link.role === 'admin' && isAdmin;
  });

  const isActivePath = (href) => {
    if (href === '/dashboard' || href === '/dashboard/admin') {
      return pathname === href;
    }
    return pathname.startsWith(href);
  };

  return (
    <nav className="bg-gradient-to-r from-primary-700 via-primary-600 to-secondary-800 text-white sticky top-0 z-50 shadow-lg backdrop-blur-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo Section */}
          <div className="flex-shrink-0">
            <Link href="/dashboard" className="flex items-center space-x-3 group">
              <div className="relative">
                <div className="w-10 h-10 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center group-hover:bg-white/20 transition-all duration-200">
                  <img 
                    src="/logo.png" 
                    alt="IBPC Logo" 
                    className="w-8 h-8 object-contain"
                    onError={(e) => {
                      e.target.style.display = 'none';
                      e.target.nextSibling.style.display = 'flex';
                    }}
                  />
                  <div className="w-8 h-8 bg-primary-500 rounded-full flex items-center justify-center text-white font-bold text-sm hidden">
                    IBPC
                  </div>
                </div>
                <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-success-400 rounded-full border-2 border-white animate-pulse"></div>
              </div>
              <div className="hidden sm:block">
                <div className="text-lg font-bold text-white group-hover:text-primary-100 transition-colors">
                  IBPC Connect
                </div>
                <div className="text-xs text-primary-200 font-medium">
                  {isAdmin ? 'Admin Portal' : 'Member Portal'}
                </div>
              </div>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-1">
            {filteredLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                  isActivePath(link.href)
                    ? 'bg-white/20 text-white shadow-soft backdrop-blur-sm'
                    : 'text-primary-100 hover:bg-white/10 hover:text-white'
                }`}
              >
                {link.icon}
                <span>{link.label}</span>
              </Link>
            ))}
          </div>

          {/* Right Side - Desktop */}
          <div className="hidden md:flex items-center space-x-4">
            {/* Notifications */}
            <button className="relative p-2 rounded-lg text-primary-100 hover:text-white hover:bg-white/10 transition-all duration-200 group">
              <BellIcon className="w-6 h-6" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-warning-400 rounded-full animate-pulse"></span>
              <span className="sr-only">Notifications</span>
            </button>

            {/* Profile Dropdown */}
            <div className="relative">
              <ProfileDropdown />
            </div>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center space-x-2">
            {/* Mobile Notifications */}
            <button className="relative p-2 rounded-lg text-primary-100 hover:text-white hover:bg-white/10 transition-all duration-200">
              <BellIcon className="w-5 h-5" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-warning-400 rounded-full animate-pulse"></span>
              <span className="sr-only">Notifications</span>
            </button>

            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="text-white hover:bg-white/10"
              leftIcon={isMobileMenuOpen ? <XMarkIcon className="w-5 h-5" /> : <Bars3Icon className="w-5 h-5" />}
            />
          </div>
        </div>

        {/* Mobile Navigation Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-t border-white/10 animate-slide-down">
            <div className="px-2 pt-2 pb-3 space-y-1 bg-black/10 backdrop-blur-sm rounded-b-lg">
              {filteredLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`flex items-center space-x-3 px-3 py-3 rounded-lg text-base font-medium transition-all duration-200 ${
                    isActivePath(link.href)
                      ? 'bg-white/20 text-white shadow-soft'
                      : 'text-primary-100 hover:bg-white/10 hover:text-white'
                  }`}
                >
                  {link.icon}
                  <span>{link.label}</span>
                </Link>
              ))}
              
              {/* Mobile Profile Section */}
              <div className="pt-4 mt-4 border-t border-white/10">
                <div className="flex items-center space-x-3 px-3 py-2">
                  <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
                    <span className="text-sm font-bold text-white">
                      {session?.user?.name?.charAt(0)?.toUpperCase() || 'U'}
                    </span>
                  </div>
                  <div className="flex-1">
                    <div className="text-sm font-medium text-white">
                      {session?.user?.name || 'User'}
                    </div>
                    <div className="text-xs text-primary-200">
                      {session?.user?.email}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}