"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";

export default function LoginPage() {
  const [userId, setUserId] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [currentMessageIndex, setCurrentMessageIndex] = useState(0);
  
  const penguinMessages = [
    "Welcome to Penguin AI!",
    "Ready to manage your documents?",
    "I'm here to help you organize!",
    "Let's get you signed in!",
    "Your documents are waiting for you!"
  ];
  
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentMessageIndex((prevIndex) => 
        prevIndex === penguinMessages.length - 1 ? 0 : prevIndex + 1
      );
    }, 3000);
    
    return () => clearInterval(interval);
  }, []);
  
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    
    try {
      // In a real app, this would be connected to an authentication service
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Simple role determination based on user ID format
      // In a real app, this would validate against a database
      const isAdmin = userId.startsWith("ADM");
      
      if (!userId || userId.length < 5) {
        throw new Error("Invalid user ID format");
      }
      
      // Set authentication state in localStorage for demo purposes
      // In a real app, you would use secure cookies and/or JWT tokens
      localStorage.setItem("isAuthenticated", "true");
      localStorage.setItem("userRole", isAdmin ? "admin" : "employee");
      localStorage.setItem("userId", userId);
      localStorage.setItem("userEmail", userId + "@example.com"); // Adding a mock email for UI display
      
      // Role-based redirection with full page refresh
      if (isAdmin) {
        window.location.href = '/admin/dashboard';
      } else {
        window.location.href = '/employee/dashboard';
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred during login');
    } finally {
      setIsLoading(false);
    }
  };

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { 
        staggerChildren: 0.1,
        delayChildren: 0.3,
      }
    }
  };
  
  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { 
      y: 0, 
      opacity: 1,
      transition: { type: "spring", stiffness: 300, damping: 24 }
    }
  };
  
  const bubbleVariants = {
    hidden: { scale: 0, opacity: 0 },
    visible: (i: number) => ({
      scale: 1,
      opacity: 0.8,
      transition: { 
        delay: i * 0.2,
        type: "spring",
        stiffness: 200,
        damping: 10
      }
    })
  };

  return (
    <div className="relative min-h-screen overflow-hidden flex flex-col md:flex-row">
      {/* Left side - animated background with penguin theme */}
      <div className="hidden md:flex md:w-1/2 bg-gradient-to-br from-blue-100 via-blue-200 to-blue-300 relative overflow-hidden">
        <div className="absolute inset-0 overflow-hidden">
          {/* Floating bubbles */}
          <motion.div
            initial="hidden"
            animate="visible"
            variants={containerVariants}
            className="absolute inset-0"
          >
            {Array.from({ length: 15 }).map((_, i) => (
              <motion.div
                key={i}
                custom={i}
                variants={bubbleVariants}
                className="absolute rounded-full bg-white bg-opacity-70 backdrop-blur-sm shadow-sm"
                style={{
                  top: `${20 + (i * 5) % 60}%`,
                  left: `${10 + (i * 7) % 80}%`,
                  width: `${20 + (i % 6) * 10}px`,
                  height: `${20 + (i % 6) * 10}px`,
                }}
                animate={{
                  y: ["0%", `${(i % 3 - 1) * 10}%`, "0%"],
                }}
                transition={{
                  duration: 4 + i % 4,
                  repeat: Infinity,
                  repeatType: "reverse",
                  ease: "easeInOut",
                }}
              />
            ))}
          </motion.div>
          
          {/* Ice floes */}
          <motion.div
            className="absolute bottom-0 left-0 w-40 h-16 bg-white shadow-md rounded-tr-full rounded-tl-full"
            animate={{ y: [0, -20, 0] }}
            transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
          />
          <motion.div
            className="absolute bottom-10 left-1/3 w-56 h-20 bg-white shadow-md rounded-tr-full rounded-tl-full"
            animate={{ y: [0, -15, 0] }}
            transition={{ duration: 7, repeat: Infinity, ease: "easeInOut", delay: 1 }}
          />
          <motion.div
            className="absolute bottom-5 right-10 w-48 h-14 bg-white shadow-md rounded-tr-full rounded-tl-full"
            animate={{ y: [0, -25, 0] }}
            transition={{ duration: 8, repeat: Infinity, ease: "easeInOut", delay: 2 }}
          />
          
          {/* Snowflakes */}
          <div id="snowflakes" aria-hidden="true">
            {Array.from({ length: 20 }).map((_, i) => (
              <motion.div
                key={i}
                className="text-blue-300 text-2xl absolute opacity-60"
                style={{
                  left: `${i * 5}%`,
                  top: '-10%',
                  textShadow: '0 0 5px rgba(219, 234, 254, 0.7)',
                  fontSize: '1.5em',
                }}
                animate={{
                  y: ['0vh', '200vh'],
                  rotate: [0, 720],
                }}
                transition={{
                  duration: 15 + (i % 5),
                  repeat: Infinity,
                  delay: i % 3,
                  ease: "linear"
                }}
              >
                ❄
              </motion.div>
            ))}
          </div>
        </div>
        
        {/* Penguin Logo and Brand */}
        <motion.div 
          className="relative z-10 flex flex-col items-center justify-center w-full p-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1.5 }}
        >
          <motion.div 
            className="mb-6"
            animate={{ y: [0, -15, 0] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
          >
            <div className="w-40 h-48 relative">
              {/* Penguin body */}
              <div className="absolute bottom-0 w-40 h-40 bg-gray-900 rounded-full"></div>
              {/* Penguin face */}
              <div className="absolute bottom-12 left-5 w-30 h-30 bg-white rounded-full 
                              transform -rotate-12"></div>
              {/* Eyes */}
              <motion.div 
                className="absolute bottom-24 left-12 w-5 h-5 bg-black rounded-full z-30 border-2 border-white"
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ duration: 2, repeat: Infinity, repeatType: "reverse", delay: 1 }}
              ></motion.div>
              <motion.div 
                className="absolute bottom-24 left-24 w-5 h-5 bg-black rounded-full z-30 border-2 border-white"
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ duration: 2, repeat: Infinity, repeatType: "reverse", delay: 1.5 }}
              ></motion.div>
              
              {/* Improved Speech bubble */}
              <div className="absolute -top-20 -right-10 w-48 z-20">
                <motion.div
                  className="bg-white px-4 py-3 rounded-xl shadow-lg relative"
                  initial={{ opacity: 1 }}
                  animate={{ 
                    scale: [1, 1.03, 1],
                  }}
                  transition={{ 
                    duration: 2,
                    repeat: Infinity,
                    repeatType: "reverse" 
                  }}
                >
                  <AnimatePresence mode="wait">
                    <motion.p 
                      key={currentMessageIndex}
                      className="text-gray-800 text-sm font-medium text-center"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.3 }}
                    >
                      {penguinMessages[currentMessageIndex]}
                    </motion.p>
                  </AnimatePresence>
                  <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 rotate-45 w-4 h-4 bg-white"></div>
                </motion.div>
              </div>
              
              {/* Beak */}
              <div className="absolute bottom-20 left-16 w-8 h-4 bg-yellow-500 
                              rounded-b-lg transform rotate-12"></div>
              {/* Flippers */}
              <motion.div 
                className="absolute bottom-14 left-0 w-10 h-16 bg-gray-900 
                rounded-l-full transform -rotate-12"
                animate={{ rotate: [-15, -5, -15] }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
              ></motion.div>
              <motion.div 
                className="absolute bottom-14 right-0 w-10 h-16 bg-gray-900 
                rounded-r-full transform rotate-12"
                animate={{ rotate: [15, 5, 15] }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
              ></motion.div>
              {/* Feet */}
              <div className="absolute bottom-0 left-8 w-8 h-4 bg-yellow-500 
                              rounded-b-lg transform rotate-12"></div>
              <div className="absolute bottom-0 right-8 w-8 h-4 bg-yellow-500 
                              rounded-b-lg transform -rotate-12"></div>
            </div>
          </motion.div>
          <motion.h1 
            className="text-5xl font-bold text-gray-800 mb-4"
            animate={{ opacity: [1, 0.8, 1] }}
            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
          >
            Penguin AI
          </motion.h1>
          <motion.p 
            className="text-xl text-blue-600 text-center max-w-sm"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.5 }}
          >
            Document Intelligence Platform
          </motion.p>
        </motion.div>
      </div>
      
      {/* Right side - Login form */}
      <div className="w-full md:w-1/2 bg-white flex items-center justify-center p-6">
        <motion.div
          className="w-full max-w-md space-y-8"
          initial="hidden"
          animate="visible"
          variants={containerVariants}
        >
          {/* Mobile logo - only visible on small screens */}
          <motion.div 
            className="md:hidden flex flex-col items-center justify-center"
            variants={itemVariants}
          >
            <div className="w-24 h-28 relative mb-4">
              {/* Simplified penguin for mobile */}
              <div className="w-24 h-24 bg-gray-900 rounded-full"></div>
              <div className="absolute top-3 left-3 w-18 h-18 bg-white rounded-full"></div>
              <div className="absolute top-8 left-8 w-2 h-2 bg-gray-900 rounded-full"></div>
              <div className="absolute top-8 left-14 w-2 h-2 bg-gray-900 rounded-full"></div>
              <div className="absolute top-10 left-10 w-4 h-2 bg-yellow-500 rounded-b-lg"></div>
            </div>
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Penguin AI</h2>
            <p className="text-sm text-gray-600 dark:text-gray-300">Sign in to your account</p>
          </motion.div>

          {/* Error message */}
          {error && (
            <motion.div 
              className="rounded-md bg-red-50 dark:bg-red-900/20 p-4"
              initial={{ x: -10, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -10, opacity: 0 }}
              transition={{ type: "spring", stiffness: 500, damping: 30 }}
            >
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-red-800 dark:text-red-300">{error}</h3>
                </div>
              </div>
            </motion.div>
          )}

          {/* Login Form */}
          <motion.form 
            className="mt-8 space-y-6" 
            onSubmit={handleSubmit}
            variants={itemVariants}
          >
            <div className="space-y-4">
              <motion.div 
                className="group"
                variants={itemVariants}
              >
                <label htmlFor="userId" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  User ID
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none z-10">
                    <svg className="h-5 w-5 text-gray-400 group-focus-within:text-blue-500 transition-colors duration-200" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                    </svg>
                  </div>
                  <motion.input
                    whileFocus={{ boxShadow: "0 0 0 3px rgba(59, 130, 246, 0.3)" }}
                    whileHover={{ borderColor: "rgba(59, 130, 246, 0.5)" }}
                    transition={{ type: "tween", duration: 0.2 }}
                    id="userId"
                    name="userId"
                    type="text"
                    autoComplete="userId"
                    required
                    className="pl-10 w-full px-4 py-3 border border-gray-200 rounded-lg 
                              text-gray-900 bg-white 
                              focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
                              transition-colors duration-200"
                    placeholder="User ID"
                    value={userId}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setUserId(e.target.value)}
                  />
                </div>
              </motion.div>
              
              <motion.div 
                className="group"
                variants={itemVariants}
              >
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none z-10">
                    <svg className="h-5 w-5 text-gray-400 group-focus-within:text-blue-500 transition-colors duration-200" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                  </div>
                  <motion.input
                    whileFocus={{ boxShadow: "0 0 0 3px rgba(59, 130, 246, 0.3)" }}
                    whileHover={{ borderColor: "rgba(59, 130, 246, 0.5)" }}
                    transition={{ type: "tween", duration: 0.2 }}
                    id="password"
                    name="password"
                    type="password"
                    autoComplete="current-password"
                    required
                    className="pl-10 w-full px-4 py-3 border border-gray-200 rounded-lg 
                              text-gray-900 bg-white 
                              focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
                              transition-colors duration-200"
                    placeholder="Password"
                    value={password}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)}
                  />
                </div>
              </motion.div>
            </div>

            <motion.div 
              className="flex items-center justify-between"
              variants={itemVariants}
            >
              <div className="flex items-center">
                <input
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  checked={rememberMe}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setRememberMe(e.target.checked)}
                />
                <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
                  Remember me
                </label>
              </div>

              <div className="text-sm">
                <Link href="/auth/forgot-password" className="font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300 transition-colors">
                  Forgot your password?
                </Link>
              </div>
            </motion.div>

            <motion.div variants={itemVariants}>
              <motion.button
                type="submit"
                disabled={isLoading}
                className={`group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-semibold rounded-lg 
                          text-white bg-blue-600 ${isLoading ? '' : 'hover:bg-blue-700'}
                          focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500
                          transition-all duration-200 shadow-lg`}
                whileHover={isLoading ? {} : { y: -2, boxShadow: "0 6px 20px rgba(0, 0, 0, 0.15)" }}
                whileTap={isLoading ? {} : { y: -1, boxShadow: "0 4px 10px rgba(0, 0, 0, 0.15)" }}
              >
                <span className="absolute left-0 inset-y-0 flex items-center pl-3">
                  <svg className="h-5 w-5 text-blue-400 group-hover:text-blue-300 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                  </svg>
                </span>
                {isLoading ? (
                  <div className="flex items-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span>Signing in...</span>
                  </div>
                ) : 'Sign in'}
              </motion.button>
            </motion.div>
            
            <motion.div 
              className="text-sm text-center text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 p-3 rounded-lg"
              animate={{ opacity: [0.9, 1, 0.9] }}
              transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
              variants={itemVariants}
            >
              <p className="font-semibold">Demo instructions:</p>
              <p>Use "ADM12345" for admin access</p>
              <p>Use any other user ID for employee access</p>
            </motion.div>
          </motion.form>
        </motion.div>
      </div>
    </div>
  );
} 