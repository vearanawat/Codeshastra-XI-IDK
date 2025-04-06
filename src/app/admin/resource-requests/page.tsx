"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import CustomSelect from "@/app/components/CustomSelect";

// Mock data for resource access requests
const mockRequests = [
  {
    id: 1,
    userId: 3,
    userName: "Alex Rodriguez",
    userEmail: "alex.r@example.com",
    resourceType: "Document",
    resourceName: "Q4 Financial Report 2023",
    requestDate: "2023-12-15T10:30:00Z",
    explanation: "I need to analyze our financial performance for my department's budget planning for next year.",
    status: "pending",
    denyReason: ""
  },
  {
    id: 2,
    userId: 6,
    userName: "Emily Chen",
    userEmail: "emily.chen@example.com",
    resourceType: "Database",
    resourceName: "Customer Information Database",
    requestDate: "2023-12-14T16:45:00Z",
    explanation: "I'm working on a customer satisfaction analysis project and need to access demographic data.",
    status: "approved",
    denyReason: ""
  },
  {
    id: 3,
    userId: 7,
    userName: "Robert Taylor",
    userEmail: "robert.t@example.com",
    resourceType: "API Access",
    resourceName: "Marketing Analytics API",
    requestDate: "2023-12-13T09:15:00Z",
    explanation: "Need to integrate marketing analytics data with our product development roadmap.",
    status: "denied",
    denyReason: "This API is currently under maintenance and not available for integration."
  },
  {
    id: 4,
    userId: 8,
    userName: "Lisa Wang",
    userEmail: "lisa.wang@example.com",
    resourceType: "Document",
    resourceName: "HR Policy Manual 2023",
    requestDate: "2023-12-16T11:20:00Z",
    explanation: "I'm helping update our team's onboarding procedures and need to reference the latest policies.",
    status: "pending",
    denyReason: ""
  },
  {
    id: 5,
    userId: 3,
    userName: "Alex Rodriguez",
    userEmail: "alex.r@example.com",
    resourceType: "Application",
    resourceName: "Advanced Analytics Tool",
    requestDate: "2023-12-17T14:05:00Z",
    explanation: "Need to perform complex data analysis for our upcoming product launch metrics.",
    status: "pending",
    denyReason: ""
  }
];

// Filter options
const statusOptions = [
  { value: "all", label: "All Statuses" },
  { value: "pending", label: "Pending" },
  { value: "approved", label: "Approved" },
  { value: "denied", label: "Denied" }
];

const resourceTypeOptions = [
  { value: "all", label: "All Types" },
  { value: "Document", label: "Document" },
  { value: "Database", label: "Database" },
  { value: "API Access", label: "API Access" },
  { value: "Application", label: "Application" }
];

export default function ResourceRequests() {
  const router = useRouter();
  const [requests, setRequests] = useState(mockRequests);
  const [filteredRequests, setFilteredRequests] = useState(mockRequests);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [selectedType, setSelectedType] = useState("all");
  const [selectedRequest, setSelectedRequest] = useState<number | null>(null);
  const [requestModalType, setRequestModalType] = useState<"view" | "approve" | "deny">("view");
  const [denyReason, setDenyReason] = useState("");
  
  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { 
        staggerChildren: 0.05,
        delayChildren: 0.2
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

  // Auth check
  useEffect(() => {
    // Check authentication
    const isAuthenticated = localStorage.getItem("isAuthenticated") === "true";
    const userRole = localStorage.getItem("userRole");
    
    // Check for both "Admin" (from database) and "admin" (legacy format) for backward compatibility
    const isAdminUser = userRole === "Admin" || userRole === "admin";
    
    if (!isAuthenticated || !isAdminUser) {
      router.push("/auth/login");
    }
  }, [router]);
  
  // Filter requests based on search term, status, and type
  useEffect(() => {
    let result = requests;
    
    if (searchTerm) {
      result = result.filter(request => 
        request.userName.toLowerCase().includes(searchTerm.toLowerCase()) || 
        request.userEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
        request.resourceName.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    if (selectedStatus !== "all") {
      result = result.filter(request => request.status === selectedStatus);
    }
    
    if (selectedType !== "all") {
      result = result.filter(request => request.resourceType === selectedType);
    }
    
    setFilteredRequests(result);
  }, [searchTerm, selectedStatus, selectedType, requests]);
  
  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };
  
  // Handle request approval
  const handleApprove = (id: number) => {
    setRequests(requests.map(request => 
      request.id === id 
        ? { ...request, status: "approved" }
        : request
    ));
    setSelectedRequest(null);
  };
  
  // Handle request denial
  const handleDeny = (id: number, reason: string) => {
    setRequests(requests.map(request => 
      request.id === id 
        ? { ...request, status: "denied", denyReason: reason }
        : request
    ));
    setSelectedRequest(null);
    setDenyReason("");
  };
  
  // Get status badge color
  const getStatusBadgeColor = (status: string) => {
    switch(status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "approved":
        return "bg-green-100 text-green-800 border-green-200";
      case "denied":
        return "bg-red-100 text-red-800 border-red-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };
  
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
          {/* Page Header */}
          <motion.div className="mb-6 flex flex-col md:flex-row md:items-center md:justify-between" variants={itemVariants}>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Resource Access Requests</h1>
              <p className="mt-1 text-sm text-gray-500">Review and manage user requests for accessing resources</p>
            </div>
          </motion.div>
          
          {/* Statistics Overview */}
          <motion.div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6" variants={itemVariants}>
            <div className="bg-white rounded-xl shadow-md p-4">
              <div className="flex justify-between items-center">
                <h3 className="text-sm font-semibold text-gray-500">Total Requests</h3>
                <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
              </div>
              <p className="mt-2 text-2xl font-bold text-gray-800">{requests.length}</p>
            </div>
            
            <div className="bg-white rounded-xl shadow-md p-4">
              <div className="flex justify-between items-center">
                <h3 className="text-sm font-semibold text-gray-500">Pending</h3>
                <div className="w-8 h-8 rounded-full bg-yellow-100 flex items-center justify-center text-yellow-600">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
              <p className="mt-2 text-2xl font-bold text-gray-800">{requests.filter(r => r.status === "pending").length}</p>
            </div>
            
            <div className="bg-white rounded-xl shadow-md p-4">
              <div className="flex justify-between items-center">
                <h3 className="text-sm font-semibold text-gray-500">Approved</h3>
                <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center text-green-600">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
              </div>
              <p className="mt-2 text-2xl font-bold text-gray-800">{requests.filter(r => r.status === "approved").length}</p>
            </div>
            
            <div className="bg-white rounded-xl shadow-md p-4">
              <div className="flex justify-between items-center">
                <h3 className="text-sm font-semibold text-gray-500">Denied</h3>
                <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center text-red-600">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </div>
              </div>
              <p className="mt-2 text-2xl font-bold text-gray-800">{requests.filter(r => r.status === "denied").length}</p>
            </div>
          </motion.div>
          
          {/* Filters */}
          <motion.div className="bg-white rounded-xl shadow-md p-4 mb-6" variants={itemVariants}>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Search */}
              <div>
                <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-1">Search</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </div>
                  <input
                    type="text"
                    name="search"
                    id="search"
                    className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    placeholder="Search by user or resource"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>
              
              {/* Status Filter */}
              <div>
                <CustomSelect
                  id="status"
                  name="status"
                  label="Status"
                  options={statusOptions}
                  value={selectedStatus}
                  onChange={(value) => setSelectedStatus(value)}
                />
              </div>
              
              {/* Resource Type Filter */}
              <div>
                <CustomSelect
                  id="type"
                  name="type"
                  label="Resource Type"
                  options={resourceTypeOptions}
                  value={selectedType}
                  onChange={(value) => setSelectedType(value)}
                />
              </div>
            </div>
          </motion.div>
          
          {/* Requests Table */}
          <motion.div className="bg-white rounded-xl shadow-md overflow-hidden" variants={itemVariants}>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Resource</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Request Date</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredRequests.map((request) => (
                    <motion.tr 
                      key={request.id}
                      whileHover={{ backgroundColor: "rgba(243, 244, 246, 0.5)" }}
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-600 font-medium">
                            {request.userName.split(' ').map(n => n[0]).join('')}
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">{request.userName}</div>
                            <div className="text-xs text-gray-500">{request.userEmail}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900 font-medium">{request.resourceName}</div>
                        <div className="text-xs text-gray-500">{request.resourceType}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatDate(request.requestDate)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusBadgeColor(request.status)}`}>
                          {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex justify-end space-x-2">
                          <motion.button 
                            className="flex items-center px-2.5 py-1.5 rounded-md bg-blue-50 text-blue-600 hover:bg-blue-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 transition-all duration-200"
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => {
                              setSelectedRequest(request.id);
                              setRequestModalType("view");
                            }}
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                            </svg>
                            View
                          </motion.button>
                          
                          {request.status === "pending" && (
                            <>
                              <motion.button 
                                className="flex items-center px-2.5 py-1.5 rounded-md bg-green-50 text-green-600 hover:bg-green-100 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-1 transition-all duration-200"
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => {
                                  setSelectedRequest(request.id);
                                  setRequestModalType("approve");
                                }}
                              >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                                Approve
                              </motion.button>
                              <motion.button 
                                className="flex items-center px-2.5 py-1.5 rounded-md bg-red-50 text-red-600 hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-1 transition-all duration-200"
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => {
                                  setSelectedRequest(request.id);
                                  setRequestModalType("deny");
                                }}
                              >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                                Deny
                              </motion.button>
                            </>
                          )}
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            {/* Empty state */}
            {filteredRequests.length === 0 && (
              <div className="py-8 flex flex-col items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-gray-400 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <h3 className="text-lg font-medium text-gray-900">No requests found</h3>
                <p className="mt-1 text-sm text-gray-500">Try adjusting your search or filter to find what you're looking for.</p>
                <button 
                  className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors flex items-center"
                  onClick={() => {
                    setSearchTerm("");
                    setSelectedStatus("all");
                    setSelectedType("all");
                  }}
                >
                  Clear filters
                </button>
              </div>
            )}
          </motion.div>
        </motion.div>
      </div>
      
      {/* View Request Modal */}
      <AnimatePresence>
        {selectedRequest !== null && requestModalType === "view" && (
          <div 
            className="fixed inset-0 z-50 overflow-y-auto" 
            aria-labelledby="view-request-modal-title" 
            role="dialog" 
            aria-modal="true"
          >
            <div className="flex items-center justify-center min-h-screen p-4">
              <div 
                className="fixed inset-0 bg-black bg-opacity-50 transition-opacity" 
                onClick={() => setSelectedRequest(null)}
                aria-hidden="true"
              ></div>
              
              <motion.div 
                className="bg-white rounded-xl shadow-xl w-full max-w-lg overflow-hidden relative z-10"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                onClick={(e) => e.stopPropagation()}
              >
                {(() => {
                  const request = requests.find(r => r.id === selectedRequest);
                  if (!request) return null;
                  
                  return (
                    <>
                      <div className="px-6 py-4 bg-gradient-to-r from-blue-600 to-blue-500 text-white">
                        <h3 className="text-lg font-medium" id="view-request-modal-title">Resource Access Request</h3>
                      </div>
                      
                      <div className="p-6">
                        <div className="space-y-4">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-12 w-12 rounded-full bg-gray-200 flex items-center justify-center text-gray-600 font-medium text-lg">
                              {request.userName.split(' ').map(n => n[0]).join('')}
                            </div>
                            <div className="ml-4">
                              <h4 className="text-lg font-semibold text-gray-900">{request.userName}</h4>
                              <p className="text-sm text-gray-500">{request.userEmail}</p>
                            </div>
                            <span className={`ml-auto inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusBadgeColor(request.status)}`}>
                              {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                            </span>
                          </div>
                          
                          <div className="border-t border-gray-200 pt-4">
                            <h5 className="text-sm font-medium text-gray-500 mb-1">Resource Requested</h5>
                            <p className="text-sm font-medium text-gray-900">{request.resourceName}</p>
                            <p className="text-xs text-gray-500 mt-1">Type: {request.resourceType}</p>
                          </div>
                          
                          <div className="border-t border-gray-200 pt-4">
                            <h5 className="text-sm font-medium text-gray-500 mb-2">Explanation</h5>
                            <div className="bg-gray-50 p-3 rounded-lg text-sm text-gray-800">
                              {request.explanation}
                            </div>
                          </div>
                          
                          <div className="border-t border-gray-200 pt-4">
                            <h5 className="text-sm font-medium text-gray-500 mb-1">Request Details</h5>
                            <p className="text-xs text-gray-500">Requested on {formatDate(request.requestDate)}</p>
                            
                            {request.status === "denied" && request.denyReason && (
                              <div className="mt-2">
                                <h5 className="text-sm font-medium text-red-500 mb-1">Reason for Denial</h5>
                                <div className="bg-red-50 p-3 rounded-lg text-sm text-red-800">
                                  {request.denyReason}
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                        
                        <div className="mt-6 flex justify-end space-x-3">
                          <motion.button
                            type="button"
                            className="flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200"
                            whileHover={{ scale: 1.03 }}
                            whileTap={{ scale: 0.97 }}
                            onClick={() => setSelectedRequest(null)}
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                            Close
                          </motion.button>
                          
                          {request.status === "pending" && (
                            <>
                              <motion.button
                                type="button"
                                className="flex items-center px-4 py-2 bg-green-600 shadow-sm text-white rounded-md text-sm font-medium hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-all duration-200"
                                whileHover={{ scale: 1.03 }}
                                whileTap={{ scale: 0.97 }}
                                onClick={() => {
                                  setRequestModalType("approve");
                                }}
                              >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                                Approve
                              </motion.button>
                              <motion.button
                                type="button"
                                className="flex items-center px-4 py-2 bg-red-600 shadow-sm text-white rounded-md text-sm font-medium hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-all duration-200"
                                whileHover={{ scale: 1.03 }}
                                whileTap={{ scale: 0.97 }}
                                onClick={() => {
                                  setRequestModalType("deny");
                                }}
                              >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                                Deny
                              </motion.button>
                            </>
                          )}
                        </div>
                      </div>
                    </>
                  );
                })()}
              </motion.div>
            </div>
          </div>
        )}
      </AnimatePresence>
      
      {/* Approve Request Modal */}
      <AnimatePresence>
        {selectedRequest !== null && requestModalType === "approve" && (
          <div 
            className="fixed inset-0 z-50 overflow-y-auto" 
            aria-labelledby="approve-request-modal-title" 
            role="dialog" 
            aria-modal="true"
          >
            <div className="flex items-center justify-center min-h-screen p-4">
              <div 
                className="fixed inset-0 bg-black bg-opacity-50 transition-opacity" 
                onClick={() => setRequestModalType("view")}
                aria-hidden="true"
              ></div>
              
              <motion.div 
                className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden relative z-10"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                onClick={(e) => e.stopPropagation()}
              >
                {(() => {
                  const request = requests.find(r => r.id === selectedRequest);
                  if (!request) return null;
                  
                  return (
                    <>
                      <div className="px-6 py-4 bg-green-500 text-white">
                        <h3 className="text-lg font-medium" id="approve-request-modal-title">Approve Access Request</h3>
                      </div>
                      
                      <div className="p-6">
                        <div className="mb-4 text-center">
                          <div className="mx-auto w-12 h-12 rounded-full bg-green-100 flex items-center justify-center text-green-600 mb-4">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                          </div>
                          <h3 className="text-lg font-medium text-gray-900 mb-1">
                            Approve Access Request
                          </h3>
                          <p className="text-sm text-gray-500">
                            You are about to grant <span className="font-medium">{request.userName}</span> access to <span className="font-medium">{request.resourceName}</span>.
                          </p>
                        </div>
                        
                        <div className="mt-6 flex justify-end space-x-3">
                          <motion.button
                            type="button"
                            className="flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none transition-all duration-200"
                            whileHover={{ scale: 1.03 }}
                            whileTap={{ scale: 0.97 }}
                            onClick={() => {
                              setRequestModalType("view");
                            }}
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                            Cancel
                          </motion.button>
                          <motion.button
                            type="button"
                            className="flex items-center px-4 py-2 bg-green-600 shadow-sm text-white rounded-md text-sm font-medium hover:bg-green-700 focus:outline-none transition-all duration-200"
                            whileHover={{ scale: 1.03 }}
                            whileTap={{ scale: 0.97 }}
                            onClick={() => handleApprove(request.id)}
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                            Confirm Approval
                          </motion.button>
                        </div>
                      </div>
                    </>
                  );
                })()}
              </motion.div>
            </div>
          </div>
        )}
      </AnimatePresence>
      
      {/* Deny Request Modal */}
      <AnimatePresence>
        {selectedRequest !== null && requestModalType === "deny" && (
          <div 
            className="fixed inset-0 z-50 overflow-y-auto" 
            aria-labelledby="deny-request-modal-title" 
            role="dialog" 
            aria-modal="true"
          >
            <div className="flex items-center justify-center min-h-screen p-4">
              <div 
                className="fixed inset-0 bg-black bg-opacity-50 transition-opacity" 
                onClick={() => {
                  setRequestModalType("view");
                  setDenyReason("");
                }}
                aria-hidden="true"
              ></div>
              
              <motion.div 
                className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden relative z-10"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                onClick={(e) => e.stopPropagation()}
              >
                {(() => {
                  const request = requests.find(r => r.id === selectedRequest);
                  if (!request) return null;
                  
                  return (
                    <>
                      <div className="px-6 py-4 bg-red-500 text-white">
                        <h3 className="text-lg font-medium" id="deny-request-modal-title">Deny Access Request</h3>
                      </div>
                      
                      <div className="p-6">
                        <div className="mb-4 text-center">
                          <div className="mx-auto w-12 h-12 rounded-full bg-red-100 flex items-center justify-center text-red-600 mb-4">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </div>
                          <h3 className="text-lg font-medium text-gray-900 mb-1">
                            Deny Access Request
                          </h3>
                          <p className="text-sm text-gray-500 mb-4">
                            You are about to deny <span className="font-medium">{request.userName}</span> access to <span className="font-medium">{request.resourceName}</span>.
                          </p>
                        </div>
                        
                        <div className="mb-4">
                          <label htmlFor="denyReason" className="block text-sm font-medium text-gray-700 mb-1">
                            Reason for Denial <span className="text-red-500">*</span>
                          </label>
                          <textarea
                            id="denyReason"
                            name="denyReason"
                            rows={3}
                            className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-red-500 focus:border-red-500 sm:text-sm"
                            placeholder="Provide a reason why this request is being denied"
                            value={denyReason}
                            onChange={(e) => setDenyReason(e.target.value)}
                            required
                          />
                        </div>
                        
                        <div className="mt-6 flex justify-end space-x-3">
                          <motion.button
                            type="button"
                            className="flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none transition-all duration-200"
                            whileHover={{ scale: 1.03 }}
                            whileTap={{ scale: 0.97 }}
                            onClick={() => {
                              setRequestModalType("view");
                              setDenyReason("");
                            }}
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                            Cancel
                          </motion.button>
                          <motion.button
                            type="button"
                            className="flex items-center px-4 py-2 bg-red-600 shadow-sm text-white rounded-md text-sm font-medium hover:bg-red-700 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                            whileHover={{ scale: denyReason.trim() !== "" ? 1.03 : 1 }}
                            whileTap={{ scale: denyReason.trim() !== "" ? 0.97 : 1 }}
                            onClick={() => {
                              if (denyReason.trim() !== "") {
                                handleDeny(request.id, denyReason);
                              }
                            }}
                            disabled={denyReason.trim() === ""}
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                            Confirm Denial
                          </motion.button>
                        </div>
                      </div>
                    </>
                  );
                })()}
              </motion.div>
            </div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
} 