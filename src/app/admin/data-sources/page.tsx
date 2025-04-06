"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import CustomSelect from "@/app/components/CustomSelect";

// Mock data for data sources
const dataSources = [
  { 
    id: 1, 
    name: "SharePoint", 
    type: "Document Repository", 
    documents: 1248, 
    lastSync: "2 hours ago",
    status: "Connected", 
    owner: "IT Department"
  },
  { 
    id: 2, 
    name: "Google Drive", 
    type: "Document Repository", 
    documents: 873, 
    lastSync: "Just now",
    status: "Connected", 
    owner: "Marketing Team"
  },
  { 
    id: 3, 
    name: "Notion", 
    type: "Knowledge Base", 
    documents: 512, 
    lastSync: "1 day ago",
    status: "Connected", 
    owner: "Product Team"
  },
  { 
    id: 4, 
    name: "Confluence", 
    type: "Knowledge Base", 
    documents: 325, 
    lastSync: "3 days ago",
    status: "Disconnected", 
    owner: "Engineering"
  },
  { 
    id: 5, 
    name: "Company Database", 
    type: "SQL Database", 
    documents: 2157, 
    lastSync: "1 hour ago",
    status: "Connected", 
    owner: "Data Team"
  },
  { 
    id: 6, 
    name: "Salesforce", 
    type: "CRM", 
    documents: 1632, 
    lastSync: "6 hours ago",
    status: "Connected", 
    owner: "Sales Team"
  },
  { 
    id: 7, 
    name: "Customer Support Tickets", 
    type: "Ticketing System", 
    documents: 897, 
    lastSync: "4 hours ago",
    status: "Connected", 
    owner: "Support Team"
  }
];

// Types for filter dropdown
const sourceTypes = ["All Types", "Document Repository", "Knowledge Base", "SQL Database", "CRM", "Ticketing System"];

// Statuses for dropdown
const statuses = ["All Statuses", "Connected", "Disconnected"];

export default function DataSources() {
  const router = useRouter();
  const [sources, setSources] = useState(dataSources);
  const [filteredSources, setFilteredSources] = useState(dataSources);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedType, setSelectedType] = useState("All Types");
  const [selectedStatus, setSelectedStatus] = useState("All Statuses");
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedSource, setSelectedSource] = useState<number | null>(null);
  
  // Form state for new data source
  const [newSource, setNewSource] = useState({
    name: "",
    type: "Document Repository",
    owner: ""
  });
  
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
  
  // Filter sources based on search term, type, and status
  useEffect(() => {
    let result = sources;
    
    if (searchTerm) {
      result = result.filter(source => 
        source.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
        source.owner.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    if (selectedType !== "All Types") {
      result = result.filter(source => source.type === selectedType);
    }
    
    if (selectedStatus !== "All Statuses") {
      result = result.filter(source => source.status === selectedStatus);
    }
    
    setFilteredSources(result);
  }, [searchTerm, selectedType, selectedStatus, sources]);
  
  // Delete data source
  const handleDelete = (id: number) => {
    setSources(sources.filter(source => source.id !== id));
  };
  
  // Toggle connection status
  const toggleConnection = (id: number) => {
    setSources(sources.map(source => 
      source.id === id 
        ? { ...source, status: source.status === "Connected" ? "Disconnected" : "Connected" }
        : source
    ));
  };
  
  // Handle form input change
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setNewSource({ ...newSource, [name]: value });
  };
  
  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Create new data source with mock values
    const newDataSource = {
      id: sources.length + 1,
      name: newSource.name,
      type: newSource.type,
      documents: 0,
      lastSync: "Just now",
      status: "Connected",
      owner: newSource.owner
    };
    
    setSources([...sources, newDataSource]);
    setShowAddModal(false);
    
    // Reset form
    setNewSource({
      name: "",
      type: "Document Repository",
      owner: ""
    });
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
              <h1 className="text-2xl font-bold text-gray-900">Data Sources</h1>
              <p className="mt-1 text-sm text-gray-500">Manage connected data repositories and knowledge bases</p>
            </div>
            <div className="mt-4 md:mt-0">
              <motion.button 
                className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors flex items-center"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowAddModal(true)}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Add Data Source
              </motion.button>
            </div>
          </motion.div>
          
          {/* Statistics Overview */}
          <motion.div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6" variants={itemVariants}>
            <div className="bg-white rounded-xl shadow-md p-6">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold text-gray-900">Total Sources</h3>
                <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4" />
                  </svg>
                </div>
              </div>
              <p className="mt-2 text-3xl font-bold text-gray-800">{sources.length}</p>
            </div>
            
            <div className="bg-white rounded-xl shadow-md p-6">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold text-gray-900">Connected</h3>
                <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center text-green-600">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h.01M12 12h.01M19 12h.01M6 12a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0z" />
                  </svg>
                </div>
              </div>
              <p className="mt-2 text-3xl font-bold text-gray-800">{sources.filter(s => s.status === "Connected").length}</p>
            </div>
            
            <div className="bg-white rounded-xl shadow-md p-6">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold text-gray-900">Total Documents</h3>
                <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center text-purple-600">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
              </div>
              <p className="mt-2 text-3xl font-bold text-gray-800">
                {sources.reduce((sum, source) => sum + source.documents, 0).toLocaleString()}
              </p>
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
                    placeholder="Search by name or owner"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>
              
              {/* Type Filter */}
              <div>
                <CustomSelect
                  id="type"
                  name="type"
                  label="Type"
                  options={sourceTypes.map(type => ({ value: type, label: type }))}
                  value={selectedType}
                  onChange={(value) => setSelectedType(value)}
                />
              </div>
              
              {/* Status Filter */}
              <div>
                <CustomSelect
                  id="status"
                  name="status"
                  label="Status"
                  options={statuses.map(status => ({ value: status, label: status }))}
                  value={selectedStatus}
                  onChange={(value) => setSelectedStatus(value)}
                />
              </div>
            </div>
          </motion.div>
          
          {/* Data Sources Table */}
          <motion.div className="bg-white rounded-xl shadow-md overflow-hidden" variants={itemVariants}>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Source</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Documents</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Last Sync</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredSources.map((source) => (
                    <motion.tr 
                      key={source.id}
                      whileHover={{ backgroundColor: "rgba(243, 244, 246, 0.5)" }}
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4" />
                            </svg>
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">{source.name}</div>
                            <div className="text-xs text-gray-500">Owner: {source.owner}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{source.type}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{source.documents.toLocaleString()}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{source.lastSync}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          source.status === 'Connected' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                        }`}>
                          <span className={`h-2 w-2 rounded-full mr-1 ${
                            source.status === 'Connected' ? 'bg-green-400' : 'bg-gray-400'
                          }`}></span>
                          {source.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <motion.button 
                          className={`flex items-center px-2.5 py-1.5 rounded-md ${
                            source.status === 'Connected' ? 'bg-red-50 text-red-600 hover:bg-red-100' : 'bg-green-50 text-green-600 hover:bg-green-100'
                          } focus:outline-none focus:ring-2 focus:ring-offset-1 ${
                            source.status === 'Connected' ? 'focus:ring-red-500' : 'focus:ring-green-500'
                          } transition-all duration-200 mr-2`}
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => toggleConnection(source.id)}
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            {source.status === 'Connected' ? (
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                            ) : (
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                            )}
                          </svg>
                          {source.status === 'Connected' ? 'Disconnect' : 'Connect'}
                        </motion.button>
                        <motion.button 
                          className="flex items-center px-2.5 py-1.5 rounded-md bg-blue-50 text-blue-600 hover:bg-blue-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 transition-all duration-200 mr-2"
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => setSelectedSource(source.id)}
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                          </svg>
                          Sync
                        </motion.button>
                        <motion.button 
                          className="flex items-center px-2.5 py-1.5 rounded-md bg-red-50 text-red-600 hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-1 transition-all duration-200"
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => handleDelete(source.id)}
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m5-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                          Delete
                        </motion.button>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            {/* Empty state */}
            {filteredSources.length === 0 && (
              <div className="py-8 flex flex-col items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-gray-400 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                </svg>
                <h3 className="text-lg font-medium text-gray-900">No data sources found</h3>
                <p className="mt-1 text-sm text-gray-500">Try adjusting your search or filter to find what you're looking for.</p>
                <button 
                  className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors flex items-center"
                  onClick={() => {
                    setSearchTerm("");
                    setSelectedType("All Types");
                    setSelectedStatus("All Statuses");
                  }}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                  Clear filters
                </button>
              </div>
            )}
          </motion.div>
        </motion.div>
      </div>
      
      {/* Add Data Source Modal */}
      <AnimatePresence>
        {showAddModal && (
          <div 
            className="fixed inset-0 z-50 overflow-y-auto"
            aria-labelledby="add-datasource-modal-title"
            role="dialog"
            aria-modal="true"
          >
            <div className="flex items-center justify-center min-h-screen p-4">
              <div 
                className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
                onClick={() => setShowAddModal(false)}
                aria-hidden="true"
              ></div>
              
              <motion.div 
                className="bg-white rounded-xl shadow-xl w-full max-w-lg overflow-hidden relative z-10"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                onClick={(e) => e.stopPropagation()}
              >
                <div className="px-6 py-4 bg-gradient-to-r from-blue-600 to-blue-500 text-white">
                  <h3 className="text-lg font-medium" id="add-datasource-modal-title">
                    Add New Data Source
                  </h3>
                </div>
                
                <form onSubmit={handleSubmit}>
                  <div className="p-6">
                    <div className="mb-4">
                      <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">Source Name</label>
                      <input
                        type="text"
                        name="name"
                        id="name"
                        required
                        className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                        value={newSource.name}
                        onChange={handleInputChange}
                      />
                    </div>
                    
                    <div className="mb-4">
                      <CustomSelect
                        id="sourceType"
                        name="type"
                        label="Source Type"
                        options={sourceTypes.filter(type => type !== "All Types").map(type => ({ value: type, label: type }))}
                        value={newSource.type}
                        onChange={(value) => handleInputChange({ target: { name: 'type', value } } as React.ChangeEvent<HTMLSelectElement>)}
                      />
                    </div>
                    
                    <div className="mb-6">
                      <label htmlFor="owner" className="block text-sm font-medium text-gray-700 mb-1">Owner</label>
                      <input
                        type="text"
                        name="owner"
                        id="owner"
                        required
                        className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                        value={newSource.owner}
                        onChange={handleInputChange}
                      />
                    </div>
                    
                    <div className="flex justify-end space-x-3">
                      <motion.button
                        type="button"
                        className="flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none transition-all duration-200"
                        whileHover={{ scale: 1.03 }}
                        whileTap={{ scale: 0.97 }}
                        onClick={() => setShowAddModal(false)}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                        Cancel
                      </motion.button>
                      <motion.button
                        type="submit"
                        className="flex items-center px-4 py-2 bg-blue-600 rounded-md shadow-sm text-sm font-medium text-white hover:bg-blue-700 focus:outline-none transition-all duration-200"
                        whileHover={{ scale: 1.03 }}
                        whileTap={{ scale: 0.97 }}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                        </svg>
                        Add Data Source
                      </motion.button>
                    </div>
                  </div>
                </form>
              </motion.div>
            </div>
          </div>
        )}
      </AnimatePresence>
      
      {/* Sync Data Source Modal */}
      <AnimatePresence>
        {selectedSource !== null && (
          <div 
            className="fixed inset-0 z-50 overflow-y-auto"
            aria-labelledby="sync-datasource-modal-title"
            role="dialog"
            aria-modal="true"
          >
            <div className="flex items-center justify-center min-h-screen p-4">
              <div 
                className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
                onClick={() => setSelectedSource(null)}
                aria-hidden="true"
              ></div>
              
              <motion.div 
                className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden relative z-10"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                onClick={(e) => e.stopPropagation()}
              >
                <div className="px-6 py-4 bg-blue-500 text-white">
                  <h3 className="text-lg font-medium" id="sync-datasource-modal-title">Sync Data Source</h3>
                </div>
                
                <div className="p-6">
                  <div className="mb-6 text-center">
                    <div className="mx-auto w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 mb-4">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                      </svg>
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 mb-1">
                      Sync {sources.find(s => s.id === selectedSource)?.name}
                    </h3>
                    <p className="text-sm text-gray-500">
                      This will pull the latest documents from the data source. This may take a few minutes.
                    </p>
                  </div>
                  
                  <div className="flex justify-end space-x-3">
                    <motion.button
                      type="button"
                      className="flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none transition-all duration-200"
                      whileHover={{ scale: 1.03 }}
                      whileTap={{ scale: 0.97 }}
                      onClick={() => setSelectedSource(null)}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                      Cancel
                    </motion.button>
                    <motion.button
                      type="button"
                      className="flex items-center px-4 py-2 bg-blue-600 rounded-md shadow-sm text-sm font-medium text-white hover:bg-blue-700 focus:outline-none transition-all duration-200"
                      whileHover={{ scale: 1.03 }}
                      whileTap={{ scale: 0.97 }}
                      onClick={() => {
                        // Mock syncing action
                        setTimeout(() => {
                          setSelectedSource(null);
                        }, 2000);
                      }}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                      </svg>
                      Start Sync
                    </motion.button>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
} 