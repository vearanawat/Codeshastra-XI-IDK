"use client";

import { useRouter } from "next/navigation";

export default function AccessDenied() {
  const router = useRouter();
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="max-w-md w-full text-center">
        <div className="text-red-500 mb-4">
          <svg className="h-16 w-16 mx-auto" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
          </svg>
        </div>
        
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h1>
        <p className="text-gray-600 mb-8">
          Sorry, you don't have permission to access this page.
          If you believe this is an error, please contact your administrator.
        </p>
        
        <div className="space-x-4">
          <button 
            onClick={() => router.back()}
            className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition-colors"
          >
            Go Back
          </button>
          <button 
            onClick={() => router.push("/auth/login")}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            Return to Login
          </button>
        </div>
      </div>
    </div>
  );
} 