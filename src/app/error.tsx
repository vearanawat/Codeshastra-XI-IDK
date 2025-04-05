'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error(error);
  }, [error]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 flex flex-col items-center justify-center p-4">
      <motion.div
        className="bg-white rounded-xl shadow-lg p-8 max-w-md w-full"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex items-center justify-center mb-6">
          <div className="h-12 w-12 relative mr-2">
            {/* Simplified penguin logo */}
            <div className="absolute inset-0 rounded-full bg-gray-900"></div>
            <div className="absolute h-7 w-7 top-1 left-1 rounded-full bg-white"></div>
            <div className="absolute h-1.5 w-1.5 top-3.5 left-3 rounded-full bg-black"></div>
            <div className="absolute h-1.5 w-1.5 top-3.5 left-5.5 rounded-full bg-black"></div>
            <div className="absolute h-1 w-2 top-5 left-3.5 rounded-b bg-yellow-500"></div>
          </div>
          <h2 className="text-2xl font-bold text-gray-900">
            Penguin<span className="text-blue-600">AI</span>
          </h2>
        </div>
        
        <div className="text-center mb-6">
          <h1 className="text-xl font-semibold text-gray-900 mb-2">Something went wrong</h1>
          <p className="text-gray-600">We apologize for the inconvenience. An error has occurred.</p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <motion.button
            onClick={reset}
            className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg shadow hover:bg-blue-600 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-400"
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.98 }}
          >
            Try again
          </motion.button>
          
          <motion.div
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.98 }}
            className="flex-1"
          >
            <Link href="/" className="block w-full px-4 py-2 bg-gray-100 text-gray-700 rounded-lg shadow hover:bg-gray-200 transition-colors text-center focus:outline-none focus:ring-2 focus:ring-gray-300">
              Go back home
            </Link>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
} 