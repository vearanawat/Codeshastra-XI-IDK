"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";

// Mock data for the dashboard
const mockChartData = [
  { month: 'Jan', queries: 56, responses: 52 },
  { month: 'Feb', queries: 78, responses: 73 },
  { month: 'Mar', queries: 84, responses: 80 },
  { month: 'Apr', queries: 63, responses: 60 },
  { month: 'May', queries: 92, responses: 88 },
  { month: 'Jun', queries: 105, responses: 100 },
];

const mockRecentQueries = [
  { id: 1, query: "What's the status of Project X?", timestamp: "10:42 AM", success: true },
  { id: 2, query: "When is the next company meeting?", timestamp: "Yesterday", success: true },
  { id: 3, query: "Upload Q2 financials", timestamp: "Yesterday", success: false },
  { id: 4, query: "What was our revenue last month?", timestamp: "Monday", success: true },
];

const mockNotifications = [
  { id: 1, message: "New data source added: Customer Feedback", time: "Just now" },
  { id: 2, message: "System maintenance scheduled for tonight at 2 AM", time: "2 hours ago" },
  { id: 3, message: "3 new documents require your review", time: "Yesterday" },
];

const quickActions = [
  { id: 1, name: "Ask a Question", icon: "🤔", color: "bg-blue-500", href: "/employee/chat" },
  { id: 2, name: "Upload Document", icon: "📤", color: "bg-green-500", href: "/employee/upload" },
  { id: 3, name: "Recent Queries", icon: "🔍", color: "bg-purple-500", href: "/employee/history" },
  { id: 4, name: "Data Insights", icon: "📊", color: "bg-yellow-500", href: "/employee/analytics" },
];

export default function EmployeeDashboard() {
  const router = useRouter();
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [greeting, setGreeting] = useState("Good day");
  const [systemStatus, setSystemStatus] = useState("System Online");
  const [query, setQuery] = useState("");
  const [showResponse, setShowResponse] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { 
        staggerChildren: 0.1,
        delayChildren: 0.2,
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

  // Auth check - redirect if not logged in
  useEffect(() => {
    const isAuthenticated = localStorage.getItem("isAuthenticated") === "true";
    const email = localStorage.getItem("userEmail");
    
    if (!isAuthenticated) {
      router.push("/auth/login");
      return;
    }
    
    setUserEmail(email);
    
    // Set appropriate greeting based on time of day
    const hour = new Date().getHours();
    if (hour < 12) setGreeting("Good morning");
    else if (hour < 18) setGreeting("Good afternoon");
    else setGreeting("Good evening");
  }, [router]);
  
  const handleSubmitQuery = (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    
    setIsLoading(true);
    
    // Simulate loading time
    setTimeout(() => {
      setIsLoading(false);
      setShowResponse(true);
    }, 1500);
  };
  
  // Chart component
  const BarChart = ({ data }: { data: typeof mockChartData }) => (
    <div className="h-40 flex items-end justify-between space-x-2 mb-2">
      {data.map((item, i) => (
        <div key={i} className="flex flex-col items-center">
          <div className="flex space-x-1">
            <motion.div 
              className="w-6 bg-blue-500 rounded-t"
              initial={{ height: 0 }}
              animate={{ height: item.queries / 2 }}
              transition={{ duration: 0.7, delay: i * 0.1, type: "spring" }}
            />
            <motion.div 
              className="w-6 bg-green-500 rounded-t"
              initial={{ height: 0 }}
              animate={{ height: item.responses / 2 }}
              transition={{ duration: 0.7, delay: i * 0.1 + 0.1, type: "spring" }}
            />
          </div>
          <span className="text-xs mt-1 text-gray-500">{item.month}</span>
        </div>
      ))}
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 flex flex-col md:flex-row">
      {/* Main Content */}
      <div className="flex-1 px-4 pt-6 pb-20 md:px-8">
        <motion.div
          className="max-w-7xl mx-auto"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <motion.div 
            className="grid grid-cols-1 lg:grid-cols-3 gap-6"
          >
            {/* Welcome & Status Banner */}
            <motion.div 
              className="lg:col-span-3 bg-gradient-to-r from-blue-400 to-blue-500 rounded-xl shadow-lg p-6 text-white relative overflow-hidden"
              variants={itemVariants}
            >
              <div className="absolute right-0 top-0 h-full">
                <motion.div 
                  animate={{ y: [0, -10, 0], rotate: [0, 5, 0] }}
                  transition={{ repeat: Infinity, duration: 5, ease: "easeInOut" }}
                  className="w-24 h-24 relative mt-6 mr-6 hidden md:block"
                >
                  {/* Animated penguin */}
                  <div className="absolute bottom-0 w-24 h-24 bg-gray-900 rounded-full"></div>
                  <div className="absolute bottom-8 left-3 w-18 h-18 bg-white rounded-full transform -rotate-12"></div>
                  <div className="absolute bottom-14 left-7 w-3 h-3 bg-black rounded-full z-10"></div>
                  <div className="absolute bottom-14 left-14 w-3 h-3 bg-black rounded-full z-10"></div>
                  <div className="absolute bottom-12 left-10 w-4 h-2 bg-yellow-500 rounded-b transform rotate-12"></div>
                  <motion.div 
                    className="absolute bottom-8 left-0 w-6 h-10 bg-gray-900 rounded-l-full transform -rotate-12"
                    animate={{ rotate: [-20, -5, -20] }}
                    transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                  ></motion.div>
                  <motion.div 
                    className="absolute bottom-8 right-0 w-6 h-10 bg-gray-900 rounded-r-full transform rotate-12"
                    animate={{ rotate: [20, 5, 20] }}
                    transition={{ duration: 2, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
                  ></motion.div>
                </motion.div>
              </div>
              
              <div className="relative z-10">
                <h2 className="text-2xl font-bold mb-2">{greeting}, {userEmail?.split('@')[0] || 'Employee'}</h2>
                <p className="text-blue-50">Welcome to your personal dashboard</p>
                <div className="flex items-center mt-4 space-x-4">
                  <div className="flex items-center">
                    <div className="w-3 h-3 bg-green-400 rounded-full mr-2"></div>
                    <span className="text-sm">{systemStatus}</span>
                  </div>
                  <Link href="/auth/logout">
                    <motion.button 
                      className="flex items-center px-4 py-1.5 bg-white bg-opacity-20 rounded-lg text-sm font-medium hover:bg-opacity-30 transition-colors"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                      </svg>
                      Logout
                    </motion.button>
                  </Link>
                </div>
              </div>
              
              <div className="absolute -bottom-4 -left-4 w-64 h-64 bg-blue-300 rounded-full opacity-20"></div>
              <div className="absolute -top-12 -right-12 w-64 h-64 bg-blue-300 rounded-full opacity-20"></div>
            </motion.div>

            {/* Left Column */}
            <div className="space-y-6">
              {/* Quick Action Buttons */}
              <motion.div className="bg-white rounded-xl shadow-md p-6" variants={itemVariants}>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
                <div className="grid grid-cols-2 gap-4">
                  {quickActions.map((action) => (
                    <motion.div 
                      key={action.id}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <Link href={action.href} className="block">
                        <div className="flex flex-col items-center justify-center p-4 rounded-lg hover:bg-gray-50 transition-colors">
                          <div className={`w-12 h-12 ${action.color} rounded-full flex items-center justify-center text-white text-2xl mb-2`}>
                            {action.icon}
                          </div>
                          <span className="text-sm text-gray-700 text-center">{action.name}</span>
                        </div>
                      </Link>
                    </motion.div>
                  ))}
                </div>
              </motion.div>

              {/* Activity & Notifications Feed */}
              <motion.div className="bg-white rounded-xl shadow-md p-6" variants={itemVariants}>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Notifications</h3>
                <div className="space-y-4">
                  {mockNotifications.map((notification) => (
                    <motion.div 
                      key={notification.id}
                      className="p-3 border-l-4 border-blue-500 bg-blue-50 rounded-r-lg"
                      whileHover={{ x: 5 }}
                    >
                      <p className="text-sm text-gray-800">{notification.message}</p>
                      <p className="text-xs text-gray-500 mt-1">{notification.time}</p>
                    </motion.div>
                  ))}
                </div>
                <motion.button 
                  className="mt-4 text-sm text-blue-600 hover:text-blue-800 flex items-center"
                  whileHover={{ x: 5 }}
                >
                  View all notifications
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </motion.button>
              </motion.div>
            </div>

            {/* Middle Column */}
            <div className="space-y-6 lg:col-span-2">
              {/* Interactive Query & Response Section */}
              <motion.div 
                className="bg-white rounded-xl shadow-md p-6"
                variants={itemVariants}
              >
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Ask PenguinAI</h3>
                <form onSubmit={handleSubmitQuery}>
                  <div className="relative">
                    <input
                      type="text"
                      className="w-full rounded-lg border border-gray-200 pl-4 pr-12 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-gray-900"
                      placeholder="Ask a question about your data..."
                      value={query}
                      onChange={(e) => setQuery(e.target.value)}
                    />
                    <motion.button
                      type="submit"
                      className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-blue-500 text-white w-8 h-8 rounded-full flex items-center justify-center"
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                      ) : (
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h14m-7-7l7 7-7 7" />
                        </svg>
                      )}
                    </motion.button>
                  </div>
                </form>

                {/* Response Area */}
                <AnimatePresence>
                  {showResponse && (
                    <motion.div 
                      className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-100"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ type: "spring", stiffness: 500, damping: 30 }}
                    >
                      <div className="flex items-start">
                        <div className="h-8 w-8 rounded-full bg-blue-500 flex items-center justify-center text-white flex-shrink-0 mr-3">
                          <span className="text-sm">AI</span>
                        </div>
                        <div>
                          <p className="text-gray-800">
                            Based on the project documentation, Project X is currently in the testing phase. The development team has completed 85% of the planned features, and QA is actively testing the core functionality.
                          </p>
                          <div className="mt-3 bg-white p-3 rounded border border-gray-200">
                            <h4 className="text-sm font-semibold text-gray-700">Project X Timeline</h4>
                            <div className="mt-2 h-4 bg-gray-200 rounded overflow-hidden">
                              <div className="h-full bg-green-500 rounded" style={{ width: '62%' }}></div>
                            </div>
                            <div className="mt-1 flex justify-between text-xs text-gray-500">
                              <span>Started: Apr 10</span>
                              <span>62% Complete</span>
                              <span>Due: Aug 15</span>
                            </div>
                          </div>
                          <div className="mt-3 flex space-x-2">
                            <motion.button 
                              className="text-xs bg-blue-100 text-blue-700 px-3 py-1 rounded"
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                            >
                              View Full Report
                            </motion.button>
                            <motion.button 
                              className="text-xs bg-gray-100 text-gray-700 px-3 py-1 rounded"
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                            >
                              Schedule Meeting
                            </motion.button>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>

              {/* Recent Activity */}
              <motion.div 
                className="bg-white rounded-xl shadow-md p-6"
                variants={itemVariants}
              >
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
                <div className="space-y-3">
                  {mockRecentQueries.map((item) => (
                    <motion.div 
                      key={item.id}
                      className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50"
                      whileHover={{ x: 5 }}
                    >
                      <div className="flex items-start">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${item.success ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'} mr-3`}>
                          {item.success ? (
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                          ) : (
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          )}
                        </div>
                        <div>
                          <p className="text-sm text-gray-800">{item.query}</p>
                          <p className="text-xs text-gray-500">{item.timestamp}</p>
                        </div>
                      </div>
                      <motion.button
                        className="text-gray-400 hover:text-gray-500"
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                        </svg>
                      </motion.button>
                    </motion.div>
                  ))}
                </div>
                <motion.button 
                  className="mt-4 text-sm text-blue-600 hover:text-blue-800 flex items-center"
                  whileHover={{ x: 5 }}
                >
                  View all activity
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </motion.button>
              </motion.div>
              
              {/* Data Insights & Analytics Snapshot */}
              <motion.div 
                className="bg-white rounded-xl shadow-md p-6"
                variants={itemVariants}
              >
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Data Insights</h3>
                
                <div className="space-y-4">
                  <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-2">Query Performance (Last 6 Months)</h4>
                    <BarChart data={mockChartData} />
                    <div className="flex justify-center mt-2 space-x-4">
                      <div className="flex items-center">
                        <div className="w-3 h-3 bg-blue-500 rounded mr-1"></div>
                        <span className="text-xs text-gray-600">Queries</span>
                      </div>
                      <div className="flex items-center">
                        <div className="w-3 h-3 bg-green-500 rounded mr-1"></div>
                        <span className="text-xs text-gray-600">Responses</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="pt-4 border-t border-gray-200">
                    <h4 className="text-sm font-medium text-gray-700 mb-2">Document Source Distribution</h4>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="flex justify-between items-center">
                        <div className="flex items-center">
                          <div className="w-3 h-3 bg-blue-500 rounded-full mr-2"></div>
                          <span className="text-xs text-gray-700">Notion</span>
                        </div>
                        <span className="text-xs font-medium">42%</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <div className="flex items-center">
                          <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
                          <span className="text-xs text-gray-700">Google Drive</span>
                        </div>
                        <span className="text-xs font-medium">28%</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <div className="flex items-center">
                          <div className="w-3 h-3 bg-yellow-500 rounded-full mr-2"></div>
                          <span className="text-xs text-gray-700">Dropbox</span>
                        </div>
                        <span className="text-xs font-medium">18%</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <div className="flex items-center">
                          <div className="w-3 h-3 bg-purple-500 rounded-full mr-2"></div>
                          <span className="text-xs text-gray-700">Others</span>
                        </div>
                        <span className="text-xs font-medium">12%</span>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
} 