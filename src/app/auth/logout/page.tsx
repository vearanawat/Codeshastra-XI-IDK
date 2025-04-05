"use client";

import { useEffect } from "react";
import { motion } from "framer-motion";

export default function LogoutPage() {
  useEffect(() => {
    // Clear authentication data from localStorage
    localStorage.removeItem("isAuthenticated");
    localStorage.removeItem("userRole");
    localStorage.removeItem("user");
    localStorage.removeItem("userEmail");
    
    // Redirect to login page after a short delay with a full page refresh
    const redirectTimer = setTimeout(() => {
      window.location.href = "/auth/login";
    }, 1500);

    return () => clearTimeout(redirectTimer);
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-blue-100">
      <motion.div 
        className="max-w-md w-full bg-white shadow-lg rounded-lg p-8 text-center"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="mx-auto w-16 h-16 flex items-center justify-center bg-blue-100 rounded-full text-blue-600 mb-6"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
        </motion.div>
        
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Logging Out</h1>
        <p className="text-gray-600 mb-6">You have been successfully logged out.</p>
        
        <motion.div
          className="w-full max-w-xs mx-auto"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          <div className="relative pt-1">
            <div className="overflow-hidden h-2 mb-4 text-xs flex rounded bg-blue-100">
              <motion.div 
                className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-blue-500"
                initial={{ width: 0 }}
                animate={{ width: "100%" }}
                transition={{ duration: 1.2 }}
              ></motion.div>
            </div>
          </div>
          <p className="text-sm text-gray-500">Redirecting to login page...</p>
        </motion.div>
      </motion.div>
    </div>
  );
} 