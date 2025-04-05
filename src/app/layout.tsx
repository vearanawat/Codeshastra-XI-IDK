'use client';

import './globals.css';
import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';

function Sidebar() {
  const pathname = usePathname();
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  
  useEffect(() => {
    if (typeof window !== 'undefined') {
      // Get user info from localStorage
      const email = localStorage.getItem("userEmail");
      setUserEmail(email);
      
      // Check if user is admin (this would be from your auth system)
      const userRole = localStorage.getItem("userRole") || "employee";
      setIsAdmin(userRole === "admin");
    }
  }, [pathname]);
  
  // Check if the route is in auth section (login, etc.)
  const isAuthRoute = pathname?.startsWith('/auth');
  
  // If on auth pages, don't show sidebar
  if (isAuthRoute) {
    return null;
  }
  
  const isActive = (path: string) => {
    // Special case for admin dashboard to avoid matching all admin routes
    if (path === '/admin') {
      return pathname === '/admin' || pathname === '/admin/dashboard';
    }
    // For other routes, check if the pathname starts with the given path
    return pathname?.startsWith(path);
  };
  
  // Sidebar link component
  function SidebarLink({ href, children, current = false }: { href: string; children: React.ReactNode; current?: boolean }) {
    return (
      <Link 
        href={href}
        className={`flex items-center w-full p-3 rounded-lg transition-colors duration-200 ${
          current 
            ? 'bg-blue-50 text-blue-700' 
            : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
        }`}
      >
        {children}
      </Link>
    );
  }

  return (
    <motion.div 
      className="w-64 bg-white shadow-md z-10 fixed left-0 top-0 bottom-0 hidden md:flex flex-col"
      initial={{ x: -100, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
    >
      <div className="p-4 flex flex-col">
        {/* Logo and Brand */}
        <div className="flex items-center justify-start mb-8 py-2">
          <div className="h-10 w-10 relative mr-2">
            {/* Simplified penguin logo */}
            <div className="absolute inset-0 rounded-full bg-gray-900"></div>
            <div className="absolute h-6 w-6 top-1 left-1 rounded-full bg-white"></div>
            <div className="absolute h-1.5 w-1.5 top-3 left-2.5 rounded-full bg-black"></div>
            <div className="absolute h-1.5 w-1.5 top-3 left-4.5 rounded-full bg-black"></div>
            <div className="absolute h-1 w-2 top-4.5 left-3 rounded-b bg-yellow-500"></div>
          </div>
          <h1 className="text-2xl font-bold text-gray-900">
            Penguin<span className="text-blue-600">AI</span>
          </h1>
          {isAdmin && (
            <div className="ml-2 px-2 py-1 bg-yellow-100 rounded-md text-xs font-semibold text-yellow-800">
              Admin
            </div>
          )}
        </div>
      </div>
      
      {/* Navigation Links */}
      <nav className="px-4 py-2 h-[calc(100%-180px)] overflow-y-auto">
        <div className="space-y-2">
          {isAdmin ? (
            <>
              <SidebarLink href="/admin/dashboard" current={isActive('/admin')}>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
                Dashboard
              </SidebarLink>
              <SidebarLink href="/admin/users" current={isActive('/admin/users')}>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
                User Management
              </SidebarLink>
              <SidebarLink href="/admin/data-sources" current={isActive('/admin/data-sources')}>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4" />
                </svg>
                Data Sources
              </SidebarLink>
              <SidebarLink href="/admin/resource-requests" current={isActive('/admin/resource-requests')}>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                </svg>
                Resource Requests
              </SidebarLink>
              <SidebarLink href="/admin/settings" current={isActive('/admin/settings')}>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                Settings
              </SidebarLink>
              <SidebarLink href="/admin/knowledge" current={isActive('/admin/knowledge')}>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
                Knowledge Base
              </SidebarLink>
            </>
          ) : (
            <>
              <SidebarLink href="/employee/dashboard" current={isActive('/employee/dashboard')}>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
                Dashboard
              </SidebarLink>
              <SidebarLink href="/employee/chat" current={isActive('/employee/chat')}>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                </svg>
                Chat
              </SidebarLink>
              <SidebarLink href="/employee/documents" current={isActive('/employee/documents')}>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Upload Documents
              </SidebarLink>
            </>
          )}
        </div>
      </nav>
      
      {/* Footer items in sidebar */}
      <div className="fixed bottom-0 left-0 w-64 p-4 border-t border-gray-200 bg-white">
        {/* Notification bell */}
        <div className="flex items-center justify-between px-3 py-2 mb-3">
          <span className="text-sm font-medium text-gray-700">Notifications</span>
          <motion.button 
            className="p-2 text-gray-400 hover:text-gray-500 rounded-full hover:bg-gray-100"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <span className="sr-only">Notifications</span>
            <div className="relative">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0h-6" />
              </svg>
              <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full"></span>
            </div>
          </motion.button>
        </div>
        
        {/* User profile button */}
        <motion.button 
          className="flex items-center w-full p-2 rounded-lg hover:bg-blue-50 transition-colors duration-200"
          whileHover={{ x: 5 }}
        >
          <div className="h-8 w-8 rounded-full bg-blue-500 flex items-center justify-center text-white font-medium mr-2">
            {userEmail ? userEmail.charAt(0).toUpperCase() : 'U'}
          </div>
          <div className="flex-1 truncate">
            <p className="text-sm font-medium text-gray-700">{userEmail || 'User'}</p>
            <p className="text-xs text-gray-500">View profile</p>
          </div>
        </motion.button>
        
        {/* Logout link */}
        <SidebarLink href="/auth/logout">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
          Logout
        </SidebarLink>
      </div>
    </motion.div>
  );
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname();
  const isAuthRoute = pathname?.startsWith('/auth');
  
  return (
    <html lang="en">
      <body className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100">
        <Sidebar />
        <main className={`min-h-screen ${isAuthRoute ? '' : 'md:ml-64'}`}>
        {children}
        </main>
      </body>
    </html>
  )
}
