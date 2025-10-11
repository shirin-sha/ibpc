'use client';
import { useState, useRef, useEffect } from "react";
import { signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function ProfileDropdown({ session }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const router = useRouter();
  const isAdmin = session?.user?.role === 'admin';
  
  useEffect(() => {
    function handleClickOutside(event) {
      if (ref.current && !ref.current.contains(event.target)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = () => {
    // Fast logout - let NextAuth handle the redirect automatically
    signOut({ callbackUrl: "/login", redirect: true });
  };

  return (
    <div className="relative" ref={ref}>
      {/* Trigger Button */}
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 p-1.5 rounded-full hover:bg-opacity-20 hover:bg-gray-200 transition duration-200"
      >
        <span className="w-9 h-9 rounded-full flex items-center justify-center text-white font-semibold shadow-lg" style={{ background: '#061E3E' }}>
          {session?.user?.name?.charAt(0).toUpperCase()}
        </span>
        <svg 
          className={`w-4 h-4 text-white transform transition-transform ${open ? "rotate-180" : "rotate-0"}`}
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Dropdown Menu */}
      {open && (
        <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-xl z-50 overflow-hidden border border-gray-100">
          <div className="py-2 px-4 text-white" style={{ background: '#061E3E' }}>
            <p className="font-medium">{session?.user?.name}</p>
            <p className="text-xs opacity-80">{session?.user?.email}</p>
          </div>
          
          <div className="py-1">
            {!isAdmin && (
             <div> <Link href={`/member/profile/${session?.user?.id}`}>
                <span className="flex items-center gap-3 px-4 py-2.5 text-gray-700 hover:bg-gray-50 cursor-pointer transition duration-150">
                  <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  <span>VIEW PROFILE</span>
                </span>
              </Link>
              <Link href={`/member/profile/edit/${session?.user?.id}`}>
                <span className="flex items-center gap-3 px-4 py-2.5 text-gray-700 hover:bg-gray-50 cursor-pointer transition duration-150">
                  <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15.828a2 2 0 01-2.828 0l-1.414-1.414a2 2 0 010-2.828l8.586-8.586z" />
                    </svg>
                  <span>EDIT PROFILE</span>
                </span>
              </Link>
              </div>
            )}
            
            <button
              onClick={() => router.push('/member/change-password')}
              className="w-full flex items-center gap-3 px-4 py-2.5 text-gray-700 hover:bg-gray-50 cursor-pointer transition duration-150"
            >
              <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
              </svg>
              <span>CHANGE PASSWORD</span>
            </button>
            
            <div className="border-t border-gray-100 my-1"></div>
            
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-4 py-2.5 cursor-pointer transition duration-150"
              style={{ color: '#061E3E' }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f0f9ff'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color: '#061E3E' }}>
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              <span>LOGOUT</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}