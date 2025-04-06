"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";

// Mock data for the admin dashboard
const userStatistics = [
  { id: 1, label: "Total Users", value: "1,284", change: "+12%", icon: "👥" },
  { id: 2, label: "Active Today", value: "847", change: "+5%", icon: "🔆" },
  { id: 3, label: "New This Week", value: "32", change: "+18%", icon: "🆕" },
  { id: 4, label: "Premium Users", value: "215", change: "+8%", icon: "💎" }
];

const systemStatistics = [
  { id: 1, label: "System Uptime", value: "99.98%", status: "optimal" },
  { id: 2, label: "Response Time", value: "245ms", status: "good" },
  { id: 3, label: "Query Success", value: "98.3%", status: "good" },
  { id: 4, label: "Error Rate", value: "1.7%", status: "warning" }
];

const recentActivities = [
  { id: 1, user: "john.doe@example.com", action: "Updated knowledge base", time: "Just now", icon: "📚" },
  { id: 2, user: "mary.smith@example.com", action: "Added new document sources", time: "2 hours ago", icon: "📋" },
  { id: 3, user: "david.wu@example.com", action: "Created new team", time: "Yesterday", icon: "👥" },
  { id: 4, user: "sarah.johnson@example.com", action: "Modified user permissions", time: "2 days ago", icon: "🔒" }
];

const dataSources = [
  { id: 1, name: "SharePoint", documents: 1248, status: "Connected" },
  { id: 2, name: "Google Drive", documents: 873, status: "Connected" },
  { id: 3, name: "Notion", documents: 512, status: "Connected" },
  { id: 4, name: "Confluence", documents: 325, status: "Disconnected" }
];

const userGrowthData = [
  { month: 'Aug', users: 980 },
  { month: 'Sep', users: 1050 },
  { month: 'Oct', users: 1120 },
  { month: 'Nov', users: 1167 },
  { month: 'Dec', users: 1208 },
  { month: 'Jan', users: 1284 }
];

export default function AdminDashboard() {
  const router = useRouter();
  const [greeting, setGreeting] = useState("Good day");
  const [adminEmail, setAdminEmail] = useState<string | null>(null);
  const [showAlert, setShowAlert] = useState(false);
  
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

  // Auth check and setup
  useEffect(() => {
    const isAuthenticated = localStorage.getItem("isAuthenticated") === "true";
    const userRole = localStorage.getItem("userRole");
    const email = localStorage.getItem("userEmail");
    
    // Check for both "Admin" (from database) and "admin" (legacy format) for backward compatibility
    const isAdminUser = userRole === "Admin" || userRole === "admin";
    
    if (!isAuthenticated || !isAdminUser) {
      router.push("/auth/login");
      return;
    }
    
    setAdminEmail(email);
    
    // Set appropriate greeting based on time of day
    const hour = new Date().getHours();
    if (hour < 12) setGreeting("Good morning");
    else if (hour < 18) setGreeting("Good afternoon");
    else setGreeting("Good evening");
    
    // Show alert after a delay
    const timer = setTimeout(() => {
      setShowAlert(true);
    }, 2000);
    
    return () => clearTimeout(timer);
  }, [router]);

  // Chart component for user growth
  const UserGrowthChart = () => (
    <div className="h-40 flex items-end justify-between space-x-2 mb-4">
      {userGrowthData.map((item, i) => (
        <div key={i} className="flex flex-col items-center">
          <motion.div 
            className="w-12 bg-blue-500 rounded-t-lg"
            initial={{ height: 0 }}
            animate={{ height: (item.users / 1500) * 150 }}
            transition={{ duration: 0.8, delay: i * 0.1, type: "spring" }}
          />
          <span className="text-xs mt-1 text-gray-500">{item.month}</span>
        </div>
      ))}
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 overflow-x-hidden">
      {/* Main Content */}
      <div className="px-4 md:px-8 py-6 w-full max-w-full">
        <motion.div
          className="mx-auto"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <AnimatePresence>
            {showAlert && (
              <motion.div 
                className="mb-6 p-4 border-l-4 border-yellow-500 bg-yellow-50 rounded-r-lg flex items-start"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
              >
                <div className="text-yellow-500 mr-3">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                </div>
                <div className="flex-1">
                  <div className="flex justify-between items-center">
                    <h3 className="text-sm font-medium text-yellow-800">System Alert</h3>
                    <button 
                      onClick={() => setShowAlert(false)}
                      className="text-yellow-500 hover:text-yellow-700"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                  <p className="text-sm text-yellow-700 mt-1">Scheduled maintenance is planned for tomorrow at 2:00 AM UTC. System may experience brief downtime.</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
          
          {/* Welcome Banner */}
          <motion.div 
            className="bg-gradient-to-r from-blue-400 to-blue-500 rounded-xl shadow-lg p-6 text-white relative overflow-hidden mb-6"
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
              <h2 className="text-2xl font-bold mb-2">{greeting}, {adminEmail?.split('@')[0] || 'Admin'}</h2>
              <p className="text-blue-50">Welcome to your admin control center</p>
              <div className="mt-4 flex flex-wrap gap-4">
                <motion.button 
                  className="px-4 py-2 bg-white bg-opacity-20 rounded-lg text-sm font-medium hover:bg-opacity-30 transition-colors flex items-center"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  View Reports
                </motion.button>
                <motion.button 
                  className="px-4 py-2 bg-white bg-opacity-20 rounded-lg text-sm font-medium hover:bg-opacity-30 transition-colors flex items-center"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  System Settings
                </motion.button>
                <Link href="/auth/logout">
                  <motion.button 
                    className="flex items-center px-4 py-2 bg-white bg-opacity-20 rounded-lg text-sm font-medium hover:bg-opacity-30 transition-colors"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
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
          
          {/* Statistics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            {userStatistics.map((stat) => (
              <motion.div 
                key={stat.id}
                className="bg-white rounded-xl shadow-md p-4"
                variants={itemVariants}
              >
                <div className="flex justify-between items-center">
                  <h3 className="text-sm font-medium text-gray-500">{stat.label}</h3>
                  <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 text-lg">
                    {stat.icon}
                  </div>
                </div>
                <p className="mt-2 text-2xl font-bold text-gray-800">{stat.value}</p>
                <p className="mt-1 text-xs text-green-600">{stat.change} from last month</p>
              </motion.div>
            ))}
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
            {/* System Performance Card */}
            <motion.div 
              className="bg-white rounded-xl shadow-md p-4"
              variants={itemVariants}
            >
              <h3 className="text-lg font-semibold text-gray-900 mb-4">System Performance</h3>
              <div className="space-y-4">
                {systemStatistics.map((stat) => (
                  <div key={stat.id} className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">{stat.label}</span>
                    <div className="flex items-center">
                      <span className="text-sm font-medium text-gray-800 mr-2">{stat.value}</span>
                      <span className={`h-2 w-2 rounded-full ${
                        stat.status === 'optimal' ? 'bg-green-500' : 
                        stat.status === 'good' ? 'bg-blue-500' : 'bg-yellow-500'
                      }`}></span>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
            
            {/* Quick Actions Card */}
            <motion.div 
              className="bg-white rounded-xl shadow-md p-4"
              variants={itemVariants}
            >
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
              <div className="grid grid-cols-2 gap-3">
                <motion.button 
                  className="p-3 bg-blue-50 text-blue-700 rounded-lg text-sm font-medium hover:bg-blue-100 transition-colors flex items-center justify-center"
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  Add User
                </motion.button>
                
                <motion.button 
                  className="p-3 bg-green-50 text-green-700 rounded-lg text-sm font-medium hover:bg-green-100 transition-colors flex items-center justify-center"
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  Analytics
                </motion.button>
                
                <motion.button 
                  className="p-3 bg-purple-50 text-purple-700 rounded-lg text-sm font-medium hover:bg-purple-100 transition-colors flex items-center justify-center"
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7v8a2 2 0 002 2h6M8 7V5a2 2 0 012-2h4.586a1 1 0 01.707.293l4.414 4.414a1 1 0 01.293.707V15a2 2 0 01-2 2h-2M8 7H6a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2v-2" />
                  </svg>
                  Knowledge Base
                </motion.button>
                
                <motion.button 
                  className="p-3 bg-yellow-50 text-yellow-700 rounded-lg text-sm font-medium hover:bg-yellow-100 transition-colors flex items-center justify-center"
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  Settings
                </motion.button>
              </div>
            </motion.div>
            
            {/* User Growth Card */}
            <motion.div 
              className="bg-white rounded-xl shadow-md p-4"
              variants={itemVariants}
            >
              <h3 className="text-lg font-semibold text-gray-900 mb-4">User Growth</h3>
              <UserGrowthChart />
              <div className="text-center">
                <p className="text-sm text-gray-500">Last 6 months</p>
                <p className="text-green-600 text-sm font-medium mt-1">+31% overall growth</p>
              </div>
            </motion.div>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Recent Activity Feed */}
            <motion.div 
              className="bg-white rounded-xl shadow-md p-4"
              variants={itemVariants}
            >
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
              <div className="space-y-4">
                {recentActivities.map((activity) => (
                  <motion.div 
                    key={activity.id}
                    className="flex items-start p-3 rounded-lg hover:bg-gray-50"
                    whileHover={{ x: 5 }}
                  >
                    <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 flex-shrink-0 mr-3">
                      {activity.icon}
                    </div>
                    <div>
                      <p className="text-sm text-gray-800">
                        <span className="font-medium">{activity.user.split('@')[0]}</span> {activity.action}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">{activity.time}</p>
                    </div>
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
            
            {/* Data Sources Card */}
            <motion.div 
              className="bg-white rounded-xl shadow-md p-4 overflow-hidden"
              variants={itemVariants}
            >
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Data Sources</h3>
                <motion.button 
                  className="text-sm text-blue-600 hover:text-blue-800 flex items-center"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  Add New
                </motion.button>
              </div>
              
              <div className="overflow-x-auto w-full">
                <table className="min-w-full divide-y divide-gray-200 table-fixed">
                  <thead>
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/4">Source</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/4">Documents</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/4">Status</th>
                      <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider w-1/4">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {dataSources.map((source) => (
                      <tr key={source.id} className="hover:bg-gray-50">
                        <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-800">{source.name}</td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600">{source.documents}</td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            source.status === 'Connected' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                          }`}>
                            {source.status}
                          </span>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-right text-sm font-medium">
                          <motion.button className="flex items-center px-2.5 py-1.5 rounded-md bg-blue-50 text-blue-600 hover:bg-blue-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 transition-all duration-200 mr-2"
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                            Edit
                          </motion.button>
                          <motion.button className="flex items-center px-2.5 py-1.5 rounded-md bg-red-50 text-red-600 hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-1 transition-all duration-200"
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m5-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                            Remove
                          </motion.button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </div>
  );
} 